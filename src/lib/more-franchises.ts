import type { Franchise, Movie } from "@/lib/types";

function poster(imdbId: string) {
  return `https://images.metahub.space/poster/large/${imdbId}/img`;
}

function backdrop(imdbId: string) {
  return `https://images.metahub.space/background/medium/${imdbId}/img`;
}

function film(
  id: string,
  title: string,
  year: number,
  runtime: number,
  synopsis: string,
  imdbId: string,
  setting: string,
  chapter: string,
  tags: string[] = [],
  note?: string,
): Movie {
  return { id, title, year, runtime, synopsis, poster: poster(imdbId), setting, chapter, tags, note };
}

export const moreFranchises: Franchise[] = [
  {
    slug: "missao-impossivel",
    name: "Missão: Impossível",
    tagline: "Do disfarce analógico ao acerto final, na ordem em que Ethan Hunt viveu.",
    description:
      "A cronologia de Missão: Impossível acompanha a estreia porque a história de Ethan também acompanha: cada filme herda a traição, a equipe e a escolha do anterior.",
    accent: "#e23b2f",
    glow: "rgba(140, 24, 18, 0.72)",
    backdrop: backdrop("tt4912910"),
    orderNote: "A ordem da história coincide com a de lançamento, de 1996 a 2025.",
    movies: [
      film("mi-1", "Missão: Impossível", 1996, 110, "A equipe de Ethan é dizimada em Praga. Ele vira o suspeito e precisa roubar a lista que prova quem o entregou.", "tt0117060", "1996", "O disfarce", []),
      film("mi-2", "Missão: Impossível 2", 2000, 123, "Um vírus e o antídoto caem nas mãos de um agente renegado. Ethan persegue os dois entre Sydney e o deserto.", "tt0120755", "2000", "O disfarce", []),
      film("mi-3", "Missão: Impossível III", 2006, 126, "Ethan tenta uma vida comum até o traficante Owen Davian sequestrar quem ele ama. A máscara deixa de ser só um truque.", "tt0317919", "2006", "A equipe", []),
      film("mi-4", "Missão: Impossível – Protocolo Fantasma", 2011, 133, "A IMF é desautorizada. Ethan e três desconhecidos correm atrás de códigos nucleares sem quartel e sem nome.", "tt1229238", "2011", "A equipe", []),
      film("mi-5", "Missão: Impossível – Nação Secreta", 2015, 131, "Um sindicato de agentes dados como mortos caça a IMF. Ethan descobre que o inimigo foi treinado na mesma casa.", "tt2381249", "2015", "O sindicato", []),
      film("mi-6", "Missão: Impossível – Efeito Fallout", 2018, 147, "Três ogivas somem depois de uma missão falha. Ethan escolhe, de novo, uma pessoa no lugar do plano.", "tt4912910", "2018", "O sindicato", []),
      film("mi-7", "Missão: Impossível – Acerto de Contas Parte 1", 2023, 163, "Uma chave partida abre uma inteligência que ninguém deveria controlar. A primeira metade da chave custa a equipe.", "tt9603212", "2023", "A entidade", []),
      film("mi-8", "Missão: Impossível – O Acerto Final", 2025, 169, "A segunda metade da chave ainda existe. Ethan enfrenta a entidade com o que restou da IMF e do próprio nome.", "tt9603208", "2025", "A entidade", []),
    ],
  },
  {
    slug: "john-wick",
    name: "John Wick",
    tagline: "Do cachorro ao Alto Conselho, com Bailarina no intervalo certo.",
    description:
      "A cronologia de John Wick segue a guerra do submundo. Bailarina acontece depois de Parabellum e antes de Capítulo 4, mesmo tendo estreado depois.",
    accent: "#c9a227",
    glow: "rgba(80, 62, 12, 0.75)",
    backdrop: backdrop("tt2911666"),
    orderNote: "Bailarina se passa entre o Capítulo 3 e o Capítulo 4.",
    movies: [
      film("wick-1", "John Wick: De Volta ao Jogo", 2014, 101, "Aposentado, Wick perde o último vínculo com a mulher. A cidade descobre por que o chamavam de Baba Yaga.", "tt2911666", "2014", "O retorno", []),
      film("wick-2", "John Wick: Um Novo Dia para Matar", 2017, 122, "Um marcador antigo o obriga a um último serviço. Cumprir o trato o coloca contra a própria Mesa.", "tt4425200", "2017", "O contrato", []),
      film("wick-3", "John Wick: Capítulo 3 – Parabellum", 2019, 131, "Excomungado, Wick compra minutos com favores. O Alto Conselho cobra o preço em sangue e em obediência.", "tt6146588", "2019", "A excomunhão", []),
      film("wick-ballerina", "Bailarina: Do Universo de John Wick", 2025, 125, "Eve Macarro, treinada pela Ruska Roma, sai em busca de quem destruiu a família dela no mesmo submundo de Wick.", "tt7181546", "Entre o 3 e o 4", "A Ruska Roma", [], "Na história, este filme fica entre Parabellum e o Capítulo 4."),
      film("wick-4", "John Wick: Capítulo 4", 2023, 169, "Para sair da mesa, Wick precisa duelar com o marquês. Paris, Osaka e o nascer do sol entram no contrato.", "tt10366206", "Depois de Parabellum", "O duelo", []),
    ],
  },
  {
    slug: "007-craig",
    name: "007: Era Craig",
    tagline: "De Cassino Royale ao adeus, a única fase de Bond contada como uma vida.",
    description:
      "Os filmes de Daniel Craig formam uma cronologia contínua: o 007 cru, o luto, a organização por trás dos vilões e o último serviço.",
    accent: "#d4c07a",
    glow: "rgba(40, 48, 32, 0.75)",
    backdrop: backdrop("tt1074638"),
    orderNote: "A ordem da história coincide com a de lançamento, de 2006 a 2021.",
    movies: [
      film("bond-casino", "007: Cassino Royale", 2006, 144, "O recém-promovido 007 enfrenta Le Chiffre numa mesa em Montenegro e aprende o preço de confiar.", "tt0381061", "2006", "A origem", []),
      film("bond-quantum", "007: Quantum of Solace", 2008, 106, "Ainda de luto, Bond segue o rastro de Vesper até uma organização que negocia água como se fosse arma.", "tt0830515", "2008", "A origem", []),
      film("bond-skyfall", "007: Operação Skyfall", 2012, 143, "Um ataque ao MI6 expõe o passado de M. Bond volta ferido para uma casa que ele tinha deixado para trás.", "tt1074638", "2012", "O legado", []),
      film("bond-spectre", "007: Contra Spectre", 2015, 148, "Um fio antigo liga os inimigos de Bond a uma irmandade. O homem no centro conhece o nome verdadeiro dele.", "tt2379713", "2015", "A Spectre", []),
      film("bond-nttd", "007: Sem Tempo para Morrer", 2021, 163, "Aposentado outra vez, Bond é puxado de volta por uma arma que reconhece o sangue. O serviço pede o último ato.", "tt2382320", "2021", "O adeus", []),
    ],
  },
  {
    slug: "matrix",
    name: "Matrix",
    tagline: "Da pílula vermelha à ressurreição, na ordem em que a guerra foi vivida.",
    description:
      "A cronologia Matrix segue a estreia. Neo acorda, a cidade cai, a trégua se quebra e, décadas depois, o código chama de novo.",
    accent: "#3ddc84",
    glow: "rgba(8, 48, 28, 0.75)",
    backdrop: backdrop("tt0133093"),
    orderNote: "A ordem da história coincide com a de lançamento, de 1999 a 2021.",
    movies: [
      film("mx-1", "Matrix", 1999, 136, "Neo escolhe a pílula vermelha e descobre que a cidade é um programa. Morpheus aposta que ele é o Escolhido.", "tt0133093", "Por volta de 2199", "O despertar", []),
      film("mx-2", "Matrix Reloaded", 2003, 138, "As máquinas cavam em direção a Sião. Neo entra na fonte e ouve que a profecia também foi escrita.", "tt0234215", "2199", "A guerra", []),
      film("mx-3", "Matrix Revolutions", 2003, 129, "Sião enfrenta a perfuração. Neo atravessa até a cidade das máquinas para negociar o fim com o que nasceu no código.", "tt0242653", "2199", "A guerra", []),
      film("mx-4", "Matrix Resurrections", 2021, 148, "Thomas Anderson desenha a própria vida como jogo. Alguém de fora insiste que a história ainda não acabou.", "tt10838180", "Décadas depois", "O retorno", []),
    ],
  },
  {
    slug: "planeta-dos-macacos",
    name: "Planeta dos Macacos",
    tagline: "Da primeira faísca de César ao reinado, na ordem do novo mundo.",
    description:
      "Esta cronologia é a da nova série, de A Origem a O Reinado. O planeta deixa de ser humano aos poucos, e cada filme começa onde o anterior fechou.",
    accent: "#b7c4a1",
    glow: "rgba(36, 48, 24, 0.75)",
    backdrop: backdrop("tt1318514"),
    orderNote: "A ordem da história coincide com a de lançamento, de 2011 a 2024.",
    movies: [
      film("apes-1", "Planeta dos Macacos: A Origem", 2011, 105, "César ganha fala por um remédio feito para humanos. A casa que o criou vira a primeira cerca que ele derruba.", "tt1318514", "Presente próximo", "César", []),
      film("apes-2", "Planeta dos Macacos: O Confronto", 2014, 130, "Dez anos depois, humanos sobreviventes e macacos disputam a floresta. César tenta a paz até o grupo cobrar guerra.", "tt2103281", "Dez anos depois", "César", []),
      film("apes-3", "Planeta dos Macacos: A Guerra", 2017, 140, "César persegue quem matou os seus. A floresta vira trincheira, e o futuro da espécie cabe numa escolha.", "tt3450958", "Dois anos depois", "César", []),
      film("apes-4", "Planeta dos Macacos: O Reinado", 2024, 145, "Gerações depois de César, um jovem macaco encontra humanos que ainda sabem falar. O reinado pede um novo nome.", "tt11389872", "Muitas gerações depois", "O reinado", []),
    ],
  },
  {
    slug: "piratas",
    name: "Piratas do Caribe",
    tagline: "Da maldição do Pérola Negra à vingança de Salazar.",
    description:
      "A cronologia de Piratas do Caribe segue Jack, Will e Elizabeth na ordem em que o mar os cobrou. A estreia e a história caminham juntas.",
    accent: "#e0b15a",
    glow: "rgba(18, 42, 62, 0.78)",
    backdrop: backdrop("tt0325980"),
    orderNote: "A ordem da história coincide com a de lançamento, de 2003 a 2017.",
    movies: [
      film("potc-1", "Piratas do Caribe: A Maldição do Pérola Negra", 2003, 143, "Elizabeth é levada por um navio amaldiçoado. Will liberta Jack Sparrow porque só ele conhece a ilha.", "tt0325980", "Início do século XVIII", "A maldição", []),
      film("potc-2", "Piratas do Caribe: O Baú da Morte", 2006, 151, "O coração de Davy Jones vira moeda. Jack, Will e Elizabeth deixam de remar no mesmo sentido.", "tt0383574", "Logo depois", "A dívida", []),
      film("potc-3", "Piratas do Caribe: No Fim do Mundo", 2007, 169, "Jack está no armário de Davy Jones. A irmandade pirata se reúne para uma batalha que decide o além.", "tt0449088", "Logo depois", "A dívida", []),
      film("potc-4", "Piratas do Caribe: Navegando em Águas Misteriosas", 2011, 136, "Jack procura a fonte da juventude com Barba Negra no leme e uma sereia no mapa.", "tt1298650", "Anos depois", "A fonte", []),
      film("potc-5", "Piratas do Caribe: A Vingança de Salazar", 2017, 129, "Um capitão fantasma sai do Triângulo para cobrar Jack. O tridente de Poseidon é a única saída do mar.", "tt1790809", "Anos depois", "Salazar", []),
    ],
  },
  {
    slug: "mad-max",
    name: "Mad Max",
    tagline: "Do asfalto antigo à estrada da fúria, com Furiosa no lugar da história.",
    description:
      "A cronologia começa na queda do mundo de Max e só chega a Estrada da Fúria depois de Furiosa. A estreia de 2015 entra por último.",
    accent: "#e25b2a",
    glow: "rgba(90, 28, 8, 0.75)",
    backdrop: backdrop("tt1392190"),
    orderNote: "Furiosa se passa antes de Estrada da Fúria, embora tenha estreado nove anos depois.",
    movies: [
      film("max-1", "Mad Max", 1979, 93, "Max ainda é policial numa estrada que já não obedece a lei. Uma gangue leva o que restava da família dele.", "tt0079501", "Um futuro próximo", "A queda", []),
      film("max-2", "Mad Max 2: A Caçada Continua", 1981, 96, "O deserto cobra gasolina como moeda. Max escolta um comboio porque a solidão também tem tanque vazio.", "tt0082694", "Depois do colapso", "O deserto", []),
      film("max-3", "Mad Max: Além da Cúpula do Trovão", 1985, 107, "Bartertown vive de um acordo sujo. Max cai no meio de crianças que ainda guardam a história de um avião.", "tt0089530", "Anos depois", "O deserto", []),
      film("max-furiosa", "Furiosa: Uma Saga Mad Max", 2024, 148, "Furiosa é arrancada do Lugar Verde e cresce entre os senhores da guerra. A disputa pela cidadela começa no nome dela.", "tt12037194", "Antes da estrada", "Furiosa", [], "Na história, este filme vem antes de Estrada da Fúria."),
      film("max-fury", "Mad Max: Estrada da Fúria", 2015, 120, "Max é capturado como bolsa de sangue. Furiosa desvia o caminhão-tanque e a estrada inteira vai atrás.", "tt1392190", "Depois de Furiosa", "A estrada", []),
    ],
  },
  {
    slug: "jogos-vorazes",
    name: "Jogos Vorazes",
    tagline: "Da cantiga de Snow à última esperança de Panem.",
    description:
      "A cronologia começa décadas antes de Katniss, na origem dos Jogos. Os quatro filmes dela vêm em seguida, na ordem em que o distrito aprendeu a dizer não.",
    accent: "#e7c36a",
    glow: "rgba(72, 24, 28, 0.75)",
    backdrop: backdrop("tt1392170"),
    orderNote: "A Cantiga dos Pássaros e das Serpentes se passa cerca de 64 anos antes do primeiro Jogos Vorazes.",
    movies: [
      film("hg-0", "Jogos Vorazes: A Cantiga dos Pássaros e das Serpentes", 2023, 157, "O jovem Coriolanus Snow orienta Lucy Gray nos 10.os Jogos. A Capital ainda está aprendendo a transformar fome em espetáculo.", "tt10545296", "64 anos antes", "A origem", [], "Na história, este filme abre a cronologia."),
      film("hg-1", "Jogos Vorazes", 2012, 142, "Katniss ocupa o lugar da irmã nos 74.os Jogos. Uma flecha e um punhado de frutas mudam o contrato da Capital.", "tt1392170", "O 74º Jogos", "Katniss", []),
      film("hg-2", "Jogos Vorazes: Em Chamas", 2013, 146, "A turnê da vitória vira faísca nos distritos. Os 75.os Jogos recolhem os vencedores para apagar o exemplo.", "tt1951264", "O 75º Jogos", "Katniss", []),
      film("hg-3", "Jogos Vorazes: A Esperança – Parte 1", 2014, 123, "Resgatada, Katniss vira símbolo do Distrito 13. A guerra pede um rosto, e o rosto ainda quer voltar à arena por Peeta.", "tt1951265", "A guerra", "A guerra", []),
      film("hg-4", "Jogos Vorazes: A Esperança – O Final", 2015, 137, "A ofensiva chega à Capital. Katniss descobre que a paz também pode ser desenhada como um último jogo.", "tt1951266", "A guerra", "A guerra", []),
    ],
  },
  {
    slug: "monsterverse",
    name: "MonsterVerse",
    tagline: "Da Ilha da Caveira em 1973 ao império dos titãs.",
    description:
      "A cronologia do MonsterVerse começa com Kong em 1973 e só depois chega a Godzilla. Os filmes seguintes sobem o século até o novo império.",
    accent: "#5ec8d8",
    glow: "rgba(8, 40, 62, 0.78)",
    backdrop: backdrop("tt0831387"),
    orderNote: "Kong: A Ilha da Caveira se passa em 1973, décadas antes de Godzilla (2014).",
    movies: [
      film("mv-kong", "Kong: A Ilha da Caveira", 2017, 118, "Em 1973, uma expedição encontra Kong e a ilha que o esconde. O mundo ainda não tem nome para o que vive debaixo da terra.", "tt3731562", "1973", "A ilha", [], "Na história, este filme vem antes de Godzilla."),
      film("mv-godzilla", "Godzilla", 2014, 123, "Uma criatura antiga atravessa o Pacífico. Godzilla sai do mar para caçar o que os humanos acordaram.", "tt0831387", "2014", "O despertar", []),
      film("mv-kotm", "Godzilla II: Rei dos Monstros", 2019, 132, "Titãs presos em gelo e vulcão são soltos. Godzilla disputa o trono com o rei que cospe estrela.", "tt3741700", "2019", "Os titãs", []),
      film("mv-gvk", "Godzilla vs. Kong", 2021, 113, "Kong deixa a ilha. Os dois titãs se enfrentam enquanto uma empresa cava o mundo oco em busca de poder.", "tt5034838", "2021", "O confronto", []),
      film("mv-gxk", "Godzilla e Kong: O Novo Império", 2024, 115, "Kong desce ao mundo oco e acha outros da espécie. Godzilla sobe à superfície porque um império antigo acordou.", "tt14539740", "2024", "O império", []),
    ],
  },
  {
    slug: "duna",
    name: "Duna",
    tagline: "Da casa Atreides à guerra santa, na ordem de Arrakis.",
    description:
      "A cronologia de Duna segue Paul da chegada a Arrakis até a guerra que o deserto escolhe. São dois filmes, um depois do outro.",
    accent: "#d2a679",
    glow: "rgba(72, 42, 16, 0.78)",
    backdrop: backdrop("tt1160419"),
    orderNote: "A ordem da história coincide com a de lançamento. Parte Dois continua no mesmo ano da história.",
    movies: [
      film("dune-1", "Duna", 2021, 155, "A casa Atreides recebe Arrakis e a especiaria. A traição chega com a noite, e Paul entra no deserto com o nome ainda pela metade.", "tt1160419", "O ano da mudança", "Arrakis", []),
      film("dune-2", "Duna: Parte Dois", 2024, 166, "Entre os Fremen, Paul aprende o deserto e o peso de ser lenda. A guerra santa deixa de ser um medo e vira marcha.", "tt15239678", "Meses depois", "A guerra", []),
    ],
  },
  {
    slug: "avatar",
    name: "Avatar",
    tagline: "De Pandora ao caminho da água.",
    description:
      "A cronologia de Avatar segue Jake Sully da primeira ligação com os Na'vi até a fuga da família para os recifes.",
    accent: "#3dcaa5",
    glow: "rgba(6, 48, 52, 0.78)",
    backdrop: backdrop("tt0499549"),
    orderNote: "O Caminho da Água se passa mais de uma década depois do primeiro filme.",
    movies: [
      film("av-1", "Avatar", 2009, 162, "Jake chega a Pandora no corpo de um avatar. A missão era infiltrar. A floresta oferece outro lado.", "tt0499549", "2154", "A floresta", []),
      film("av-2", "Avatar: O Caminho da Água", 2022, 192, "Anos depois, a família Sully foge para os recifes. O mar guarda quem eles ainda não sabem ser.", "tt1630029", "Anos depois", "O recife", []),
    ],
  },
  {
    slug: "batman-nolan",
    name: "Batman de Nolan",
    tagline: "Do medo ao cavaleiro, a trilogia de Gotham na ordem da queda.",
    description:
      "A trilogia de Christopher Nolan é uma cronologia fechada: Bruce aprende o medo, enfrenta o coringa e volta quando a cidade já não tem símbolo.",
    accent: "#9aa4b2",
    glow: "rgba(18, 22, 32, 0.8)",
    backdrop: backdrop("tt0468569"),
    orderNote: "A ordem da história coincide com a de lançamento, de 2005 a 2012.",
    movies: [
      film("bm-1", "Batman Begins", 2005, 140, "Bruce sai da Liga das Sombras e volta a Gotham com um símbolo. O medo, que o formou, vira a ferramenta.", "tt0372784", "O início", "A origem", []),
      film("bm-2", "Batman: O Cavaleiro das Trevas", 2008, 152, "O coringa empurra Gotham a escolher entre o símbolo e o caos. Harvey Dent cai no meio da aposta.", "tt0468569", "Um ano depois", "O caos", []),
      film("bm-3", "Batman: O Cavaleiro das Trevas Ressurge", 2012, 165, "Oito anos de silêncio. Bane quebra o acordo que mantinha a cidade quieta, e Bruce desce outra vez.", "tt1345836", "Oito anos depois", "A cidade", []),
    ],
  },
  {
    slug: "alien",
    name: "Alien",
    tagline: "De Prometheus ao resgate, na ordem do espaço e não da estreia.",
    description:
      "A cronologia Alien começa com Prometheus, passa pela primeira nave e por Romulus, e só então chega aos fuzileiros. A ordem de lançamento fica de lado.",
    accent: "#d7e2c8",
    glow: "rgba(20, 36, 18, 0.8)",
    backdrop: backdrop("tt0078748"),
    orderNote: "Romulus acontece cerca de vinte anos depois de Alien, o Oitavo Passageiro, e antes de Aliens, o Resgate.",
    movies: [
      film("al-prometheus", "Prometheus", 2012, 124, "Uma expedição segue um mapa deixado por criadores. O que encontram na lua não queria ser encontrado.", "tt1446714", "2093", "Os criadores", []),
      film("al-covenant", "Alien: Covenant", 2017, 122, "A nave Covenant responde a um sinal. Um androide já reescreveu a vida naquele planeta.", "tt2316204", "2104", "Os criadores", []),
      film("al-1", "Alien, o Oitavo Passageiro", 1979, 117, "A Nostromo recolhe um sinal e um organismo sobe a bordo. O protocolo da companhia vale mais do que a tripulação.", "tt0078748", "2122", "A nave", []),
      film("al-romulus", "Alien: Romulus", 2024, 119, "Jovens de uma colônia mineradora entram numa estação à deriva, entre o desastre da Nostromo e a chegada dos fuzileiros.", "tt18412256", "Entre Alien e Aliens", "A estação", [], "Na história, este filme fica entre o Oitavo Passageiro e o Resgate."),
      film("al-2", "Aliens, o Resgate", 1986, 137, "Décadas depois, Ripley acorda do sono. A colônia já não responde, e o ninho está cheio.", "tt0090605", "2179", "A colônia", []),
      film("al-3", "Alien 3", 1992, 114, "A cápsula cai numa prisão-fundição. Ripley descobre que o organismo desceu com ela.", "tt0103644", "2179", "A prisão", []),
      film("al-4", "Alien: A Ressurreição", 1997, 109, "Duzentos anos depois, Ripley é refeita em laboratório. A companhia ainda quer a criatura, e a criatura já aprendeu o caminho.", "tt0118583", "2381", "O laboratório", []),
    ],
  },
];
