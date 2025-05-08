
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
      
      const response = await fetch('/alert.mp3');
      const arrayBuffer = await response.arrayBuffer();
      // Use the correct method name decodeAudioData
      alertBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      console.log('Audio system initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
};

export const playAlertSound = (volume = 1.5) => {
  if (audioContext && alertBuffer && gainNode) {
    try {
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
      
      console.log('Alert sound played with increased volume');
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  } else {
    console.warn('Audio not initialized. Call initializeAudio first.');
  }
};
