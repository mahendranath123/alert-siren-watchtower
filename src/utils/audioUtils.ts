
let audioContext: AudioContext | null = null;
let alertBuffer: AudioBuffer | null = null;

export const initializeAudio = async () => {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      const response = await fetch('/alert.mp3');
      const arrayBuffer = await response.arrayBuffer();
      // Use the correct method name decodeAudioData
      alertBuffer = await audioContext.decodeAudioData(arrayBuffer);
    }
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
};

export const playAlertSound = () => {
  if (audioContext && alertBuffer) {
    const source = audioContext.createBufferSource();
    source.buffer = alertBuffer;
    source.connect(audioContext.destination);
    source.start();
  } else {
    console.warn('Audio not initialized. Call initializeAudio first.');
  }
};
