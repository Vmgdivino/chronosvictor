import { scoreFor, type ScoreTrack } from "@/lib/score";

class ScoreEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private pad: OscillatorNode | null = null;
  private padTwin: OscillatorNode | null = null;
  private timer = 0;
  private looping = false;
  private muted = false;
  private nextAt = 0;
  private index = 0;
  private slug: string | null = null;
  private track: ScoreTrack = scoreFor(null);

  setSlug(slug: string | null) {
    if (this.slug === slug) return;
    this.slug = slug;
    this.track = scoreFor(slug);
    this.index = 0;
    if (this.context) this.nextAt = this.context.currentTime + 0.08;
    this.retunePad();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : 1, now + 0.25);
    if (muted) this.halt();
    else void this.unlock();
  }

  async unlock() {
    const context = this.ensure();
    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return;
      }
    }
    if (this.muted || this.looping) return;
    const now = context.currentTime;
    this.master?.gain.cancelScheduledValues(now);
    this.master?.gain.linearRampToValueAtTime(1, now + 0.45);
    this.looping = true;
    this.nextAt = now + 0.06;
    this.pump();
  }

  private ensure() {
    if (this.context && this.master && this.filter) return this.context;
    const context = new AudioContext();
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = this.track.tone;
    filter.Q.value = 0.6;
    const master = context.createGain();
    master.gain.value = 0;
    filter.connect(master);
    master.connect(context.destination);
    this.context = context;
    this.filter = filter;
    this.master = master;
    this.ensurePad();
    return context;
  }

  private ensurePad() {
    if (!this.context || !this.filter || this.pad) return;
    const gain = this.context.createGain();
    gain.gain.value = 0.05;
    const pad = this.context.createOscillator();
    const twin = this.context.createOscillator();
    pad.type = "sine";
    twin.type = "sine";
    twin.detune.value = 7;
    pad.frequency.value = this.track.pad;
    twin.frequency.value = this.track.pad;
    pad.connect(gain);
    twin.connect(gain);
    gain.connect(this.filter);
    pad.start();
    twin.start();
    this.pad = pad;
    this.padTwin = twin;
  }

  private retunePad() {
    if (!this.context || !this.filter) return;
    const now = this.context.currentTime;
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.linearRampToValueAtTime(this.track.tone, now + 0.4);
    this.pad?.frequency.linearRampToValueAtTime(this.track.pad, now + 0.45);
    this.padTwin?.frequency.linearRampToValueAtTime(this.track.pad, now + 0.45);
  }

  private halt() {
    this.looping = false;
    window.clearTimeout(this.timer);
  }

  private pump() {
    if (!this.looping || this.muted || !this.context || !this.filter) return;
    const horizon = this.context.currentTime + 0.9;
    while (this.nextAt < horizon) {
      const melody = this.track.melody[this.index % this.track.melody.length];
      this.voice(melody, this.nextAt, this.track.step * 0.92, this.track.wave, 0.07);
      if (this.index % 2 === 0) {
        const bass = this.track.bass[(this.index / 2) % this.track.bass.length];
        this.voice(bass, this.nextAt, this.track.step * 1.8, "sine", 0.11);
      }
      this.nextAt += this.track.step;
      this.index += 1;
    }
    const wait = Math.max(90, (this.nextAt - this.context.currentTime - 0.35) * 1000);
    this.timer = window.setTimeout(() => this.pump(), wait);
  }

  private voice(frequency: number, when: number, length: number, wave: OscillatorType, level: number) {
    if (!this.context || !this.filter) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(level, when + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(length, 0.08));
    oscillator.connect(gain);
    gain.connect(this.filter);
    oscillator.start(when);
    oscillator.stop(when + length + 0.02);
  }
}

let engine: ScoreEngine | null = null;

export function getScoreEngine() {
  if (!engine) engine = new ScoreEngine();
  return engine;
}
