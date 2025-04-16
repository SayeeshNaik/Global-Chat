let currentAudio = null;

export const notificationSound = (audioPath) => {
  try {
    // Stop and reset any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Play new audio
    currentAudio = new Audio(audioPath);
    currentAudio.play().catch((e) => {});
  } catch (err) {
    console.error("Error in notificationSound:", err);
  }
};

export const textToSpeak = (text) => {
    if (!window.speechSynthesis) return;
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; // Indian English for better regional pronunciation
    utterance.rate = 0.9;    // Control speed (default is 1)
    utterance.volume = 1;
    utterance.pitch = 1;
  
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =  voices[10];
  
      utterance.voice = preferredVoice;
  
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };
  
    // Handle async voice loading in some browsers
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
       setVoiceAndSpeak()
    }
  };
  




  const getDeviceConfig = () => {
    // Device & Browser Info
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const devicePixelRatio = window.devicePixelRatio;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  };