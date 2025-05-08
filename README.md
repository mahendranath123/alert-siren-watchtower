
# Alert Siren Watchtower

A real-time log monitoring system that alerts you instantly when critical issues are detected in log files. The system continuously monitors log files for keywords like "host down" and sends alerts directly to your browser with visual and audio notifications.

## Features

- **Real-time Log Monitoring**: Continuously watches specified log files
- **Instant Alerts**: Visual and audio notifications when critical issues are detected
- **Live Dashboard**: See all events in real-time without refreshing
- **Modern UI**: Clean, professional interface with animations
- **WebSocket Technology**: For true real-time communication

## Project Structure

- `src/` - React frontend components
- `backend/` - Python FastAPI backend
- `public/` - Static assets including alert sounds

## Prerequisites

- Node.js (v14 or newer)
- Python 3.8+
- npm or yarn

## Installation

### Frontend Setup

```bash
# Install dependencies
npm install

# Build the frontend
npm run build
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

## Running the Application

### Start the Backend Server

```bash
cd backend
python app.py
```

The server will start on http://localhost:5000

### Start the Frontend Development Server (for development)

```bash
npm run dev
```

For development, the frontend will be available at http://localhost:8080

### Using the Application

1. Open your browser and navigate to http://localhost:5000
2. The dashboard will connect to the backend and start displaying logs
3. When a log line contains "host down" or other error patterns, an alert will appear with sound

### Testing Alerts

To test the alert system without modifying actual log files:

```bash
# Add a normal log entry
curl "http://localhost:5000/add-log?message=System%20running%20normally"

# Add an error log entry that will trigger an alert
curl "http://localhost:5000/add-log?message=Server%20123%20is&error=true"
```

## Customization

### Modifying the Log File Path

Edit `backend/app.py` and change the `LOG_FILE` variable to your desired log file path:

```python
LOG_FILE = "/path/to/your/logfile.log"
```

### Changing Alert Patterns

Edit `backend/app.py` and modify the `ERROR_PATTERNS` list:

```python
ERROR_PATTERNS = ["host down", "error", "critical", "your_pattern_here"]
```

### Changing the Alert Sound

Replace the `alert.mp3` file in the `public` directory with your preferred sound.

## Deployment

For production deployment:

1. Build the React frontend: `npm run build`
2. Configure the Python backend to serve the built files
3. Set up a proper process manager (like systemd, PM2, or supervisor)
4. Consider using Nginx as a reverse proxy

## Notes

- For production use, consider implementing proper authentication and security measures
- Log rotation should be handled by the OS or a dedicated tool
- This application requires appropriate permissions to read the monitored log files
