
#!/usr/bin/env python3
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import asyncio
import json
import datetime
import os
import re
from pathlib import Path
from typing import List, Dict, Set, Optional
import uuid
import uvicorn

app = FastAPI()

# Mount the React build folder
app.mount("/assets", StaticFiles(directory="../dist/assets"), name="static")

# Class to manage WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass  # Handle any connection errors

manager = ConnectionManager()

# Path to the log file to monitor
LOG_FILE = "/var/log/mylog.log"  # Change this to your actual log file
ERROR_PATTERNS = ["host down", "error", "critical", "failure", "exception"]

# Function to tail a file (similar to Unix tail -f)
async def tail_file(file_path: str, interval: float = 1.0):
    try:
        # If the file doesn't exist, create it for demo purposes
        if not os.path.exists(file_path):
            Path(file_path).parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, 'w') as f:
                f.write("Initial log entry\n")
                
        with open(file_path, 'r') as file:
            # Go to the end of file
            file.seek(0, 2)
            
            while True:
                line = file.readline()
                if not line:
                    await asyncio.sleep(interval)  # Wait before trying again
                    continue
                
                line = line.strip()
                if line:
                    yield line
    except Exception as e:
        print(f"Error in tail_file: {e}")
        # For demo, simulate log data if file can't be accessed
        while True:
            await asyncio.sleep(interval * 5)
            yield f"Simulated log entry: {datetime.datetime.now()}"

# Function to check if a line contains any error patterns
def contains_error(line: str) -> bool:
    return any(pattern.lower() in line.lower() for pattern in ERROR_PATTERNS)

# Function to create a log entry
def create_log_entry(line: str):
    now = datetime.datetime.now().isoformat()
    is_error = contains_error(line)
    
    return {
        "timestamp": now,
        "message": line,
        "level": "critical" if is_error else "info",
        "id": str(uuid.uuid4())
    }

# WebSocket endpoint for log monitoring
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial connection message
        connection_msg = {
            "type": "connection_status",
            "status": "connected",
            "timestamp": datetime.datetime.now().isoformat()
        }
        await manager.send_personal_message(json.dumps(connection_msg), websocket)
        
        # Start monitoring the log file
        async for line in tail_file(LOG_FILE):
            log_entry = create_log_entry(line)
            message = {
                "type": "log_entry",
                "data": log_entry
            }
            
            # If it's an error, mark it as an alert too
            if log_entry["level"] == "critical":
                message["type"] = "alert"
                
            await manager.broadcast(json.dumps(message))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        
    except Exception as e:
        print(f"Error in websocket connection: {e}")
        if websocket in manager.active_connections:
            manager.disconnect(websocket)

# Route for the main HTML page
@app.get("/", response_class=HTMLResponse)
async def get_index():
    with open("../dist/index.html", "r") as file:
        return file.read()

# For demo purposes: an endpoint to manually add log entries
@app.get("/add-log")
async def add_log(message: str, error: bool = False):
    try:
        with open(LOG_FILE, "a") as file:
            if error:
                file.write(f"{message} host down\n")
            else:
                file.write(f"{message}\n")
        return {"success": True, "message": "Log entry added"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Nagios integration endpoint
@app.post("/nagios-webhook")
async def nagios_webhook(request: Request):
    try:
        data = await request.json()
        
        # Extract relevant information from Nagios notification
        host_name = data.get("host_name", "Unknown Host")
        service_name = data.get("service_name", "Unknown Service")
        state = data.get("state", "UNKNOWN")
        output = data.get("output", "No details available")
        
        # Create alert message
        message = f"NAGIOS ALERT: {host_name}/{service_name} is {state} - {output}"
        
        # Create log entry for the alert
        log_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "message": message,
            "level": "critical" if state in ["DOWN", "CRITICAL", "WARNING"] else "info",
            "id": str(uuid.uuid4()),
            "source": "nagios"
        }
        
        # Broadcast the alert to all connected clients
        alert_message = {
            "type": "alert",
            "data": log_entry
        }
        
        await manager.broadcast(json.dumps(alert_message))
        
        # Also add it to the logs collection
        log_message = {
            "type": "log_entry",
            "data": log_entry
        }
        await manager.broadcast(json.dumps(log_message))
        
        return JSONResponse(content={"status": "success", "message": "Alert processed"})
    except Exception as e:
        print(f"Error processing Nagios webhook: {e}")
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
