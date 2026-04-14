// Core AudioContext singleton to avoid creating multiple contexts
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  // Resume context if suspended (browser autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playFeedbackSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // A soft, pleasing click
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.07);
    
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.07);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

// Global button sound listener hook
export function initGlobalButtonSounds() {
  const handleClick = (e: MouseEvent) => {
    let target = e.target as HTMLElement | null;
    while (target && target !== document.body) {
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.getAttribute('role') === 'button'
      ) {
        playFeedbackSound();
        break;
      }
      target = target.parentElement;
    }
  };
  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}

// For BreathePage phases
export function playBreathePhaseSound(phaseKey: string) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    const now = ctx.currentTime;
    
    // Default duration and gain
    let duration = 0.5;
    gainNode.gain.setValueAtTime(0, now);
    
    if (phaseKey === 'inhale') {
      // Rising pitch, gradual increase in volume
      duration = 4;
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(400, now + duration);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 1);
      gainNode.gain.setValueAtTime(0.05, now + duration - 0.5);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } else if (phaseKey === 'hold-in') {
      // Steady gentle high tone
      duration = 4;
      oscillator.frequency.setValueAtTime(400, now);
      gainNode.gain.linearRampToValueAtTime(0.03, now + 0.5);
      gainNode.gain.setValueAtTime(0.03, now + duration - 0.5);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } else if (phaseKey === 'exhale') {
      // Falling pitch, gradual decrease
      duration = 5;
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + duration);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.5);
      gainNode.gain.setValueAtTime(0.05, now + duration - 1);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    } else if (phaseKey === 'rest') {
      // Very low background tone
      duration = 4; // Updated rest duration
      oscillator.frequency.setValueAtTime(150, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
      gainNode.gain.setValueAtTime(0.01, now + duration - 0.5);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}

// Completed rep / Completed set
export function playCompletionSound(type: 'rep' | 'set') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    
    const playNote = (freq: number, startOff: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + startOff);
      
      gain.gain.setValueAtTime(0, now + startOff);
      gain.gain.linearRampToValueAtTime(0.06, now + startOff + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startOff + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOff);
      osc.stop(now + startOff + dur);
    };
    
    if (type === 'rep') {
      // Simple two-note chime
      playNote(440, 0, 0.4); // A4
      playNote(659.25, 0.3, 0.6); // E5
    } else if (type === 'set') {
      // Longer celebratory sequence
      playNote(523.25, 0, 0.4); // C5
      playNote(659.25, 0.2, 0.4); // E5
      playNote(783.99, 0.4, 0.4); // G5
      playNote(1046.50, 0.6, 1.0); // C6
    }
  } catch (e) {
    console.error('Audio playback failed', e);
  }
}
