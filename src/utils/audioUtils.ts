
// Utility for playing alert sounds
let audioContext: AudioContext | null = null;
let audioBuffer: AudioBuffer | null = null;
let isAudioLoaded = false;

export const initializeAudio = async () => {
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch('/alert.mp3');
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioBuffer(arrayBuffer);
    isAudioLoaded = true;
    console.log('Audio initialized successfully');
  } catch (error) {
    console.error('Failed to initialize audio:', error);
  }
};

export const playAlertSound = () => {
  if (!isAudioLoaded || !audioContext || !audioBuffer) {
    console.warn('Audio not loaded yet');
    return;
  }

  try {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.error('Failed to play alert sound:', error);
  }
};
