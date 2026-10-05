export type ScoreTrack = {
  melody: number[];
  bass: number[];
  step: number;
  wave: OscillatorType;
  pad: number;
  tone: number;
};

function midi(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}

function track(
  melody: number[],
  bass: number[],
  step: number,
  wave: OscillatorType,
  pad: number,
  tone: number,
): ScoreTrack {
  return {
    melody: melody.map(midi),
    bass: bass.map(midi),
    step,
    wave,
    pad: midi(pad),
    tone,
  };
}

const home = track(
  [62, 67, 69, 74, 72, 69, 67, 65, 64, 69, 72, 67],
  [38, 43, 41, 36],
  0.36,
  "triangle",
  50,
  1500,
);

const bySlug: Record<string, ScoreTrack> = {
  marvel: track([64, 71, 76, 74, 71, 67, 72, 69], [40, 47, 45, 40], 0.3, "square", 52, 980),
  dceu: track([63, 68, 75, 70, 68, 63, 70, 75], [39, 46, 44, 39], 0.34, "triangle", 51, 1200),
  "batman-nolan": track([58, 61, 65, 63, 58, 56, 61, 53], [34, 37, 41, 34], 0.42, "sawtooth", 46, 700),
  velozes: track([67, 70, 74, 77, 74, 70, 79, 74], [43, 46, 50, 43], 0.22, "square", 55, 1600),
  "missao-impossivel": track([64, 67, 71, 74, 71, 76, 74, 67, 64, 71], [40, 45, 47, 40], 0.24, "triangle", 52, 1400),
  "john-wick": track([59, 62, 66, 62, 59, 54, 57, 62], [35, 38, 42, 35], 0.26, "square", 47, 860),
  "007-craig": track([60, 64, 67, 72, 70, 67, 64, 67], [36, 43, 40, 36], 0.32, "triangle", 48, 1100),
  "mad-max": track([55, 58, 62, 67, 62, 58, 65, 60], [31, 36, 38, 31], 0.25, "sawtooth", 43, 780),
  "harry-potter": track([71, 74, 78, 76, 74, 71, 69, 74, 78, 81], [50, 54, 57, 50], 0.3, "triangle", 62, 1700),
  "terra-media": track([60, 64, 67, 72, 76, 72, 67, 64, 69, 65], [36, 41, 43, 36], 0.4, "triangle", 48, 1000),
  piratas: track([66, 69, 73, 76, 73, 78, 76, 69, 66, 73], [42, 45, 49, 42], 0.28, "square", 54, 1300),
  "star-wars": track([60, 67, 72, 70, 65, 72, 77, 72, 67, 64], [36, 43, 41, 36], 0.38, "sawtooth", 48, 900),
  jurassic: track([56, 63, 68, 70, 68, 63, 61, 68, 73, 68], [32, 39, 37, 32], 0.44, "triangle", 44, 850),
  matrix: track([64, 66, 69, 73, 69, 66, 76, 73, 69, 64], [40, 42, 45, 40], 0.27, "square", 52, 1100),
  "planeta-dos-macacos": track([57, 60, 64, 69, 67, 64, 60, 65], [33, 36, 40, 33], 0.36, "triangle", 45, 900),
  duna: track([53, 60, 65, 68, 65, 60, 58, 65, 72, 65], [29, 36, 34, 29], 0.48, "sine", 41, 700),
  avatar: track([68, 72, 75, 80, 77, 75, 72, 75, 82, 77], [44, 49, 51, 44], 0.34, "triangle", 56, 1400),
  alien: track([54, 57, 61, 54, 49, 54, 58, 61, 58, 52], [30, 33, 37, 30], 0.46, "sawtooth", 42, 620),
  monsterverse: track([48, 55, 60, 63, 60, 55, 51, 58, 63, 55], [24, 31, 29, 24], 0.4, "sawtooth", 36, 560),
  "indiana-jones": track([64, 69, 72, 76, 74, 72, 69, 67, 72, 76, 79, 76], [40, 45, 43, 40], 0.3, "triangle", 52, 1500),
  "jogos-vorazes": track([65, 69, 72, 77, 74, 72, 69, 65, 70, 74], [41, 46, 48, 41], 0.33, "triangle", 53, 1200),
};

export function scoreFor(slug: string | null): ScoreTrack {
  if (!slug) return home;
  return bySlug[slug] ?? home;
}
