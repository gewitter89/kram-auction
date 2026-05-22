"use client";

// KRAM Sound Engine - Синтез звуков в реальном времени с помощью Web Audio API
// Не требует скачивания внешних mp3-файлов, работает мгновенно и без задержек.

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("kram_muted") === "true";
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      // Инициализируем аудио-контекст по требованию (после жеста пользователя)
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    // Возобновляем контекст, если он приостановлен браузером
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("kram_muted", this.isMuted ? "true" : "false");
    }
    return this.isMuted;
  }

  getMuteState(): boolean {
    return this.isMuted;
  }

  // Мягкий щелчок наведения (Hover)
  playHover() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Четкий цифровой клик (Click)
  playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Победный праздничный перелив при ставке/выкупе (Success)
  playSuccess() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const playNote = (freq: number, startOffset: number, duration: number) => {
      if (!this.ctx) return;
      const t = now + startOffset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      // Небольшое вибрато
      osc.frequency.linearRampToValueAtTime(freq + 5, t + duration * 0.5);

      gain.gain.setValueAtTime(0.0, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    };

    // Мажорный аккорд: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    playNote(523.25, 0.0, 0.4);
    playNote(659.25, 0.08, 0.4);
    playNote(783.99, 0.16, 0.4);
    playNote(1046.50, 0.24, 0.6);
  }

  // Тревожный предупреждающий тон при ошибках или спаме (Warning)
  playWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.linearRampToValueAtTime(120, now + 0.35);

    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(143, now); // Небольшая расстройка для биения
    osc2.frequency.linearRampToValueAtTime(123, now + 0.35);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  // Звук удара молотка аукциона (Gavel)
  playGavel() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Двойной удар молотком
    const hit = (time: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.12);
    };

    hit(now);
    hit(now + 0.15);
  }
}

export const soundService = new SoundService();
