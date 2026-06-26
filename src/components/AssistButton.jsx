import React from 'react';
import { Accessibility } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAssistIntro } from '../constants/pageGuides';
import { speak, stopSpeaking, isSpeechSupported } from '../utilities/speech';

const AssistButton = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const supported = isSpeechSupported();

  const toggleAssist = () => {
    const nextValue = !state.assistEnabled;
    dispatch({ type: 'TOGGLE_ASSIST', payload: nextValue });

    if (!nextValue) {
      stopSpeaking();
      speak('Voice assist turned off.');
      return;
    }

    if (!supported) {
      speak('Voice assist is not supported in this browser.');
      return;
    }

    speak(getAssistIntro(location.pathname));
  };

  return (
    <button
      type="button"
      className={`assist-toggle ${state.assistEnabled ? 'active' : ''}`}
      onClick={toggleAssist}
      aria-label={state.assistEnabled ? 'Turn off voice assist' : 'Turn on voice assist'}
      aria-pressed={state.assistEnabled}
      title={state.assistEnabled ? 'Voice assist on' : 'Voice assist off'}
    >
      <Accessibility size={24} aria-hidden="true" className="assist-toggle-icon" />
      <span className="assist-toggle-label">Assist</span>
    </button>
  );
};

export default AssistButton;
