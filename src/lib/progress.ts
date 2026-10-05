import type { Achievement, Franchise } from "@/lib/types";
import { franchises } from "@/lib/franchises";

export function countWatched(movies: { id: string }[], watched: Set<string>) {
  return movies.filter((movie) => watched.has(movie.id)).length;
}

export function franchiseProgress(franchise: Franchise, watched: Set<string>) {
  const total = franchise.movies.length;
  const done = countWatched(franchise.movies, watched);
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function catalogProgress(list: Franchise[], watched: Set<string>) {
  const movies = list.flatMap((franchise) => franchise.movies);
  const total = movies.length;
  const done = countWatched(movies, watched);
  const minutes = movies
    .filter((movie) => watched.has(movie.id))
    .reduce((sum, movie) => sum + movie.runtime, 0);
  const completed = list.filter(
    (franchise) => franchiseProgress(franchise, watched).percent === 100,
  ).length;
  return { done, total, minutes, completed, percent: total ? Math.round((done / total) * 100) : 0 };
}

function hasAll(ids: string[], watched: Set<string>) {
  return ids.length > 0 && ids.every((id) => watched.has(id));
}

function countTagged(tag: string, watched: Set<string>) {
  const movies = franchises.flatMap((franchise) =>
    franchise.movies.filter((movie) => movie.tags.includes(tag)),
  );
  return {
    ids: movies.map((movie) => movie.id),
    current: movies.filter((movie) => watched.has(movie.id)).length,
    target: movies.length,
  };
}

export function getAchievements(watched: Set<string>): Achievement[] {
  const completed = franchises.filter(
    (franchise) => franchiseProgress(franchise, watched).percent === 100,
  );
  const catalog = catalogProgress(franchises, watched);
  const infinity = countTagged("infinity", watched);
  const skywalker = countTagged("skywalker", watched);
  const fastMain = countTagged("fast-main", watched);
  const crossoverIds = ["mcu-nwh", "mcu-mom", "mcu-deadpool", "dceu-flash"];

  const bySlug = (slug: string) =>
    franchises.find((franchise) => franchise.slug === slug);

  const franchiseDone = (slug: string) => {
    const franchise = bySlug(slug);
    if (!franchise) return { current: 0, target: 1 };
    const progress = franchiseProgress(franchise, watched);
    return { current: progress.done, target: progress.total };
  };

  const seniorFranchise = (id: string, slug: string, title: string, description: string) => {
    const progress = franchiseDone(slug);
    return {
      id,
      tier: "senior" as const,
      title,
      description,
      current: progress.current,
      target: progress.target,
      unlocked: progress.target > 0 && progress.current >= progress.target,
    };
  };

  return [
    {
      id: "senior-first",
      tier: "senior",
      title: "Primeira saga",
      description: "Conclua uma cronologia inteira, do primeiro ao último título, incluindo as séries.",
      current: Math.min(completed.length, 1),
      target: 1,
      unlocked: completed.length >= 1,
    },
    {
      id: "senior-two",
      tier: "senior",
      title: "Arquivista",
      description: "Feche duas franquias completas e prove que a maratona virou hábito.",
      current: Math.min(completed.length, 2),
      target: 2,
      unlocked: completed.length >= 2,
    },
    {
      id: "senior-all",
      tier: "senior",
      title: "Lenda da sala escura",
      description: `Conclua as ${franchises.length} cronologias do catálogo ChronosVictor.`,
      current: completed.length,
      target: franchises.length,
      unlocked: completed.length >= franchises.length,
    },
    seniorFranchise(
      "senior-mcu",
      "marvel",
      "Vingador supremo",
      "Assista todos os filmes do Universo Cinematográfico Marvel na ordem da história.",
    ),
    seniorFranchise(
      "senior-fast",
      "velozes",
      "Família Toretto",
      "Complete a cronologia de Velozes e Furiosos, incluindo Tóquio e o spin-off.",
    ),
    seniorFranchise(
      "senior-starwars",
      "star-wars",
      "Ordem da Força",
      "Percorra Star Wars do Episódio I ao IX, com Solo e Rogue One no lugar certo.",
    ),
    seniorFranchise(
      "senior-dceu",
      "dceu",
      "Liga reunida",
      "Feche o Universo Estendido da DC, de Mulher-Maravilha ao Reino Perdido.",
    ),
    seniorFranchise(
      "senior-potter",
      "harry-potter",
      "Bruxo formado",
      "Percorra o mundo bruxo, dos Anos 20 de Grindelwald até a batalha de Hogwarts.",
    ),
    seniorFranchise(
      "senior-middle",
      "terra-media",
      "Portador do Anel",
      "Veja O Hobbit e O Senhor dos Anéis na ordem da Terra-média.",
    ),
    seniorFranchise(
      "senior-jurassic",
      "jurassic",
      "Parque aberto",
      "Feche a cronologia de Jurassic Park e Jurassic World.",
    ),
    seniorFranchise(
      "senior-indy",
      "indiana-jones",
      "O chapéu de feltro",
      "Acompanhe Indiana Jones de 1935 até 1969, na ordem da vida dele.",
    ),
    seniorFranchise("senior-mi", "missao-impossivel", "Protocolo IMF", "Complete Missão: Impossível, do primeiro disfarce ao acerto final."),
    seniorFranchise("senior-wick", "john-wick", "Excomungado", "Feche John Wick, com Bailarina entre Parabellum e o Capítulo 4."),
    seniorFranchise("senior-craig", "007-craig", "00 encerrado", "Percorra a era Daniel Craig, de Cassino Royale a Sem Tempo para Morrer."),
    seniorFranchise("senior-matrix", "matrix", "Pílula vermelha", "Assista à cronologia Matrix, do despertar à ressurreição."),
    seniorFranchise("senior-apes", "planeta-dos-macacos", "O reinado", "Feche o planeta dos macacos, da origem de César ao reinado."),
    seniorFranchise("senior-pirates", "piratas", "Pérola Negra", "Complete Piratas do Caribe, da maldição do Pérola à vingança de Salazar."),
    seniorFranchise("senior-max", "mad-max", "Estrada da fúria", "Veja Mad Max na ordem da história, com Furiosa antes de Estrada da Fúria."),
    seniorFranchise("senior-hunger", "jogos-vorazes", "Que os jogos comecem", "Percorra Jogos Vorazes, da cantiga de Snow ao final da esperança."),
    seniorFranchise("senior-titan", "monsterverse", "Titãs despertos", "Assista ao MonsterVerse, da Ilha da Caveira ao Novo Império."),
    seniorFranchise("senior-dune", "duna", "O caminho", "Feche a cronologia de Duna, da casa Atreides à guerra santa."),
    seniorFranchise("senior-avatar", "avatar", "Eu vejo você", "Complete Avatar, de Pandora ao caminho da água."),
    seniorFranchise("senior-nolan", "batman-nolan", "Cavaleiro", "Assista à trilogia de Nolan, do início à queda de Gotham."),
    seniorFranchise("senior-alien", "alien", "Oitavo passageiro", "Percorra Alien na ordem da história, de Prometheus à ressurreição."),
    {
      id: "pro-infinity",
      tier: "professional",
      title: "Maratona do Infinito",
      description: "Assista aos 23 filmes oficiais da Saga do Infinito, da Fase 1 ao Longe de Casa.",
      current: infinity.current,
      target: infinity.target,
      unlocked: hasAll(infinity.ids, watched),
    },
    {
      id: "pro-skywalker",
      tier: "professional",
      title: "Saga Skywalker",
      description: "Complete os nove episódios da família Skywalker, na ordem da história.",
      current: skywalker.current,
      target: skywalker.target,
      unlocked: hasAll(skywalker.ids, watched),
    },
    {
      id: "pro-fast",
      tier: "professional",
      title: "Corrida sem freio",
      description: "Veja a linha principal de Velozes e Furiosos, de Brian e Dom até o Fast X.",
      current: fastMain.current,
      target: fastMain.target,
      unlocked: hasAll(fastMain.ids, watched),
    },
    {
      id: "pro-potter",
      tier: "professional",
      title: "Oito anos em Hogwarts",
      description: "Assista aos oito filmes de Harry Potter, da Pedra Filosofal às Relíquias da Morte.",
      current: countTagged("potter", watched).current,
      target: countTagged("potter", watched).target,
      unlocked: hasAll(countTagged("potter", watched).ids, watched),
    },
    {
      id: "pro-ring",
      tier: "professional",
      title: "A jornada do Anel",
      description: "Complete O Hobbit e a trilogia de O Senhor dos Anéis, na ordem da história.",
      current: countTagged("ring", watched).current,
      target: countTagged("ring", watched).target,
      unlocked: hasAll(countTagged("ring", watched).ids, watched),
    },
    {
      id: "pro-crossover",
      tier: "professional",
      title: "Noite de multiverso",
      description: "Uma maratona cruzada: Sem Volta para Casa, Multiverso da Loucura, Deadpool & Wolverine e The Flash.",
      current: crossoverIds.filter((id) => watched.has(id)).length,
      target: crossoverIds.length,
      unlocked: hasAll(crossoverIds, watched),
    },
    {
      id: "pro-half",
      tier: "professional",
      title: "Meio catálogo",
      description: "Assista a metade de todos os títulos cadastrados no ChronosVictor, filmes e séries.",
      current: catalog.done,
      target: Math.ceil(catalog.total * 0.5),
      unlocked: catalog.total > 0 && catalog.done >= Math.ceil(catalog.total * 0.5),
    },
    {
      id: "pro-most",
      tier: "professional",
      title: "Maratonista",
      description: "Alcance 75% do catálogo global — uma meta de quem trata cinema como ofício.",
      current: catalog.done,
      target: Math.ceil(catalog.total * 0.75),
      unlocked: catalog.total > 0 && catalog.done >= Math.ceil(catalog.total * 0.75),
    },
    {
      id: "pro-all",
      tier: "professional",
      title: "Sem intervalo",
      description: "Assista a cada filme e série do catálogo. Nada fica para a sessão seguinte.",
      current: catalog.done,
      target: catalog.total,
      unlocked: catalog.total > 0 && catalog.done >= catalog.total,
    },
  ];
}
