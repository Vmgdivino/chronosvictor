export type SceneMotion = "rush" | "warp" | "orbit" | "drift";

const rush = new Set(["velozes", "jurassic", "missao-impossivel", "john-wick", "mad-max"]);
const warp = new Set(["star-wars", "duna", "avatar", "alien"]);
const orbit = new Set(["marvel", "dceu", "harry-potter", "matrix", "planeta-dos-macacos", "monsterverse"]);

export function motionFor(slug: string | null): SceneMotion {
  if (!slug) return "drift";
  if (rush.has(slug)) return "rush";
  if (warp.has(slug)) return "warp";
  if (orbit.has(slug)) return "orbit";
  return "drift";
}
