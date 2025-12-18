import { useCallback, useRef } from 'react';

export const useMysticSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Soft chime/bell sound for phase transitions
  const playTransitionChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Create oscillators for harmonic chime
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Gentle attack, slow decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 - (i * 0.02), now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + (i * 0.3));
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + (i * 0.08));
        osc.stop(now + 2 + (i * 0.3));
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Ethereal whoosh for important moments
  const playWhoosh = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // White noise with filter sweep
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(100, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      filter.Q.value = 2;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(now);
      noise.stop(now + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Deep mystical tone for revelations
  const playMysticTone = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Low fundamental with harmonics
      const fundamental = 110; // A2
      
      [1, 2, 3, 5].forEach((harmonic, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(fundamental * harmonic, now);
        
        const volume = 0.06 / (harmonic * 0.8);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 2);
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Sparkle/shimmer effect
  const playSparkle = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Multiple quick high-pitched tones
      const notes = [1318.51, 1567.98, 2093.00, 1760.00]; // E6, G6, C7, A6
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        const startTime = now + (i * 0.05);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.04, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Gentle pulse for heartbeat-like moments
  const playHeartPulse = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Two-beat pulse like a heartbeat
      [0, 0.15].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65.41, now + delay); // C2
        osc.frequency.exponentialRampToValueAtTime(40, now + delay + 0.2);
        
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(delay === 0 ? 0.12 : 0.08, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + delay);
        osc.stop(now + delay + 0.3);
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  // Completion fanfare
  const playCompletion = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Ascending arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        const startTime = now + (i * 0.12);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 1.5);
      });
    } catch (e) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return {
    playTransitionChime,
    playWhoosh,
    playMysticTone,
    playSparkle,
    playHeartPulse,
    playCompletion,
    cleanup,
  };
};
