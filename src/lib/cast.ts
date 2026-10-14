import { getFranchise } from "@/lib/franchises";

export type Figure = {
  id: string;
  label: string;
  src: string;
};

const figure = (id: string, label: string): Figure => ({
  id,
  label,
  src: `/models/cast/${id}.glb`,
});

export const figures = {
  steve: figure("steve", "Steve"),
  shaun: figure("shaun", "Shaun"),
  henry: figure("henry", "Henry"),
  sam: figure("sam", "Sam"),
  punk: figure("punk", "Punk"),
  farmer: figure("farmer", "Fazendeiro"),
  casual: figure("casual", "Casual"),
  adventurer: figure("adventurer", "Aventureiro"),
  hoodie: figure("hoodie", "Moletom"),
  man: figure("man", "Homem"),
  platformer: figure("platformer", "Corredor"),
  trex: figure("trex", "T-Rex"),
  triceratops: figure("triceratops", "Tricerátops"),
  spino: figure("spino", "Espinossauro"),
  pterodactyl: figure("pterodactyl", "Pterodáctilo"),
  shark: figure("shark", "Tubarão"),
  eagle: figure("eagle", "Águia"),
  fox: figure("fox", "Raposa"),
  lion: figure("lion", "Leão"),
} satisfies Record<string, Figure>;

const castByFranchise: Record<string, (keyof typeof figures)[]> = {
  marvel: ["steve", "henry", "sam", "casual"],
  velozes: ["punk", "hoodie", "man"],
  "star-wars": ["adventurer", "platformer", "eagle"],
  dceu: ["henry", "casual", "steve", "sam"],
  "harry-potter": ["shaun", "casual", "farmer"],
  "terra-media": ["adventurer", "eagle", "fox"],
  jurassic: ["trex", "triceratops", "pterodactyl", "spino"],
  "indiana-jones": ["adventurer", "farmer", "man"],
  "missao-impossivel": ["sam", "hoodie", "man"],
  "john-wick": ["punk", "man", "hoodie"],
  "007-craig": ["henry", "man", "sam"],
  matrix: ["hoodie", "punk", "platformer"],
  "planeta-dos-macacos": ["lion", "fox", "eagle"],
  piratas: ["adventurer", "shark", "eagle"],
  "mad-max": ["punk", "farmer", "lion"],
  "jogos-vorazes": ["casual", "farmer", "fox"],
  monsterverse: ["spino", "trex", "pterodactyl", "shark"],
  duna: ["adventurer", "fox", "farmer"],
  avatar: ["fox", "eagle", "pterodactyl", "lion"],
  "batman-nolan": ["hoodie", "man", "punk"],
  alien: ["shark", "pterodactyl", "spino"],
};

export function figureFor(slug: string, movieId: string) {
  const pool = castByFranchise[slug] ?? ["adventurer"];
  const movies = getFranchise(slug)?.movies ?? [];
  const index = movies.findIndex((movie) => movie.id === movieId);
  const id = pool[(index < 0 ? 0 : index) % pool.length];
  return figures[id];
}
