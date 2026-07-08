export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number, volume = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(880, now, 0.12, 0.22);
    playTone(1320, now + 0.1, 0.18, 0.25);
  } catch {
    // Silently ignore if audio is unavailable or blocked
  }
}
