const getPreferredVoice = () => {
  if (!window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.name.includes('Google US English'))
    || voices.find(v => v.lang === 'en-US' && v.name.includes('Samantha'))
    || voices.find(v => v.lang === 'en-US')
    || null;
};

export function speak(text, { interrupt = true } = {}) {
  if (!window.speechSynthesis || !text?.trim()) return;

  if (interrupt) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text.trim());
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;

  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = 'en-US';

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
