import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getPageAnnouncement } from '../constants/pageGuides';
import {
  findHoverTarget,
  getAccessibleName,
  getActivationMessage,
  getHoverMessage,
} from '../utilities/accessibility';
import { speak } from '../utilities/speech';

const FOCUS_DELAY_MS = 250;
const HOVER_DELAY_MS = 1000;

const AssistAnnouncer = () => {
  const { state } = useApp();
  const location = useLocation();
  const liveRef = useRef(null);
  const lastPathRef = useRef(location.pathname);
  const lastFocusRef = useRef(null);
  const focusTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const hoverTargetRef = useRef(null);
  const lastHoverSpokenRef = useRef(null);
  const bootRef = useRef(true);

  const postLiveMessage = (message) => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
    }
  };

  const announce = (message, options = {}) => {
    postLiveMessage(message);
    speak(message, options);
  };

  useEffect(() => {
    if (!state.assistEnabled) {
      bootRef.current = true;
      lastHoverSpokenRef.current = null;
      hoverTargetRef.current = null;
      clearTimeout(hoverTimerRef.current);
      return;
    }

    if (bootRef.current) {
      bootRef.current = false;
      lastPathRef.current = location.pathname;
      return;
    }

    if (location.pathname === lastPathRef.current) return;

    lastPathRef.current = location.pathname;
    lastHoverSpokenRef.current = null;
    lastFocusRef.current = null;
    announce(getPageAnnouncement(location.pathname));
  }, [location.pathname, state.assistEnabled]);

  useEffect(() => {
    if (!state.assistEnabled) return undefined;

    const handleFocus = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('.assist-toggle, .sr-only, [aria-live]')) return;

      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = setTimeout(() => {
        if (document.activeElement !== target) return;
        if (lastFocusRef.current === target) return;

        lastFocusRef.current = target;
        const name = getAccessibleName(target);
        if (!name) return;

        postLiveMessage(name);
        speak(name, { interrupt: false });
      }, FOCUS_DELAY_MS);
    };

    const handleClick = (event) => {
      const target = event.target.closest('a, button, [role="button"], input[type="submit"]');
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('.assist-toggle')) return;

      const message = getActivationMessage(target);
      if (!message) return;

      announce(message, { interrupt: true });
    };

    const clearHoverTimer = () => {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    };

    const handleMouseOver = (event) => {
      const target = findHoverTarget(event.target);
      if (!target) return;

      if (hoverTargetRef.current === target) return;

      clearHoverTimer();
      hoverTargetRef.current = target;

      hoverTimerRef.current = setTimeout(() => {
        if (hoverTargetRef.current !== target) return;
        if (lastHoverSpokenRef.current === target) return;

        const message = getHoverMessage(target);
        if (!message) return;

        lastHoverSpokenRef.current = target;
        postLiveMessage(message);
        speak(message, { interrupt: false });
      }, HOVER_DELAY_MS);
    };

    const handleMouseOut = (event) => {
      const target = findHoverTarget(event.target);
      if (!target || hoverTargetRef.current !== target) return;

      const related = event.relatedTarget;
      if (related instanceof Node && target.contains(related)) return;

      clearHoverTimer();
      hoverTargetRef.current = null;
      lastHoverSpokenRef.current = null;
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      clearTimeout(focusTimerRef.current);
      clearHoverTimer();
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [state.assistEnabled]);

  return (
    <div
      ref={liveRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    />
  );
};

export default AssistAnnouncer;
