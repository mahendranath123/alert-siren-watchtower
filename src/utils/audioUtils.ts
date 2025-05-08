
let audioContext: AudioContext | null = null;
let alertBuffer: AudioBuffer | null = null;
let gainNode: GainNode | null = null;

export const initializeAudio = async () => {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      
      // Create a gain node for volume control
      gainNode = audioContext.createGain();
      gainNode.gain.value = 1.5; // Increased gain for louder sound
      gainNode.connect(audioContext.destination);
      
      // Use a try-catch specifically for fetching and decoding the audio
      try {
        const response = await fetch('/alert.mp3');
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        alertBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log('Audio system initialized successfully');
      } catch (decodeError) {
        console.error('Failed to decode audio data:', decodeError);
        
        // Create a fallback audio - a simple beep sound
        alertBuffer = createFallbackBeepSound(audioContext);
        console.log('Using fallback audio sound');
      }
    }
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
};

// Create a fallback beep sound if we can't load the MP3
function createFallbackBeepSound(context: AudioContext): AudioBuffer {
  // Create a 1-second buffer at the sample rate of the AudioContext
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, sampleRate, sampleRate);
  
  // Fill the buffer with a simple beep waveform
  const data = buffer.getChannelData(0);
  const frequency = 880; // A high-pitched beep
  
  for (let i = 0; i < sampleRate; i++) {
    // Create a sine wave
    data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    
    // Apply an envelope to avoid clicks
    if (i < sampleRate * 0.05) {
      // Fade in
      data[i] *= (i / (sampleRate * 0.05));
    } else if (i > sampleRate * 0.9) {
      // Fade out
      data[i] *= (1 - (i - sampleRate * 0.9) / (sampleRate * 0.1));
    }
  }
  
  return buffer;
}

export const playAlertSound = (volume = 1.5) => {
  if (audioContext && alertBuffer && gainNode) {
    try {
      // Resume the AudioContext if it's suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Create a sound source
      const source = audioContext.createBufferSource();
      source.buffer = alertBuffer;
      
      // Set the gain to the specified volume
      gainNode.gain.value = volume;
      
      // Connect the source to the gain node
      source.connect(gainNode);
      
      // Add a slight stereo panning effect to make the sound more attention-grabbing
      const panNode = audioContext.createStereoPanner();
      panNode.pan.value = 0.2; // Slight right panning
      source.connect(panNode);
      panNode.connect(gainNode);
      
      // Add a bit of dynamic effect by starting with a lower volume and quickly increasing
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.2);
      
      // Play the sound
      source.start();
      
      // Play the sound twice with a slight delay to create a more urgent effect
      setTimeout(() => {
        if (audioContext && alertBuffer && gainNode) {
          const secondSource = audioContext.createBufferSource();
          secondSource.buffer = alertBuffer;
          secondSource.connect(gainNode);
          secondSource.start();
        }
      }, 500);
      
      // For Nagios critical alerts (high volume), play a third time for extra urgency
      if (volume >= 2.0) {
        setTimeout(() => {
          if (audioContext && alertBuffer && gainNode) {
            const thirdSource = audioContext.createBufferSource();
            thirdSource.buffer = alertBuffer;
            thirdSource.connect(gainNode);
            thirdSource.start();
          }
        }, 1000);
      }
      
      console.log('Alert sound played with volume:', volume);
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  } else {
    console.warn('Audio not initialized. Call initializeAudio first.');
  }
};
