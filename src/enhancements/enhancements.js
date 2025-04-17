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

export const textToSpeak = async (text) => {
    const success = await textToSpeakAPI(text);
    if (!success) textToSpeakNormal(text);
  };
  
  // 🔊 Web Speech API fallback (browser-native)
  const textToSpeakNormal = (text) => {
    if (!window.speechSynthesis) return;
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; // Customize as needed
    utterance.rate = 0.9;
    utterance.volume = 1;
    utterance.pitch = 1;
  
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || voices[0];
      utterance.voice = preferredVoice;
      window.speechSynthesis.cancel(); // prevent overlapping
      window.speechSynthesis.speak(utterance);
    };
  
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
      setVoiceAndSpeak();
    }
  };
  
  // 🔁 VoiceRSS API (Fumi voice simulation)
  const textToSpeakAPI = async (text) => {
    if (!text) return false;
  
    const params = new URLSearchParams({
      key: process.env.REACT_APP_VOICE_API_KEY,
      hl: 'ja-jp',
      src: text,
      c: 'MP3',
      f: '44khz_16bit_stereo',
      r: '-3',
      v: 'Fumi' // Note: VoiceRSS doesn't support named voices, this has no effect
    });
  
    try {
      const response = await fetch(`https://api.voicerss.org/?${params.toString()}`);
      const blob = await response.blob();
  
      if (blob.type !== 'audio/mpeg') {
        console.warn('VoiceRSS error response:', await blob.text());
        return false;
      }
  
      const audio = new Audio(URL.createObjectURL(blob));
      await audio.play();
      return true;
    } catch (err) {
      console.error('API speak failed:', err);
      return false;
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