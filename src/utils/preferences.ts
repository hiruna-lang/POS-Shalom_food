import { useSyncExternalStore } from 'react';

export const defaultPreferences = { cartLeft: false, animations: true, reducedMotion: false, compact: false, cashierHome: 'pos' as 'pos' | 'dashboard' };
const key = 'shalom-pos-interface';
const eventName = 'shalom-interface-change';
const subscribe = (notify: () => void) => {
  window.addEventListener(eventName, notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener(eventName, notify);
    window.removeEventListener('storage', notify);
  };
};
const snapshot = () => localStorage.getItem(key) || '{}';

export function usePreferences(): typeof defaultPreferences {
  const stored = useSyncExternalStore(subscribe, snapshot);
  try { return { ...defaultPreferences, ...JSON.parse(stored) }; }
  catch { return defaultPreferences; }
}

export function savePreferences(value: typeof defaultPreferences) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}
