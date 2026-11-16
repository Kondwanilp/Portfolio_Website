export const channels = [
  {
    number: "01",
    id: "listening",
    title: "The Listening Room",
    icon: "music",
    subtitle: "A record on repeat.",
    description: "My song of the week and the tracks finding their way back into rotation.",
    color: "listening",
    entries: [],
  },
  {
    number: "02",
    id: "chess",
    title: "Chess Corner",
    icon: "knight",
    subtitle: "Think three moves ahead.",
    description:
      "A little space for puzzles, opening experiments, endgames, and games worth studying twice.",
    color: "chess",
    entries: [],
  },
  {
    number: "03",
    id: "basketball",
    title: "Court Vision",
    icon: "basketball",
    subtitle: "A game of angles and instincts.",
    description:
      "Basketball conversations, memorable plays, and everything that makes the game worth watching.",
    color: "basketball",
    entries: [
      {
        title: "The Hardwood",
        description: "Basketball thoughts, observations, and conversations.",
      },
      {
        title: "Highlight Reel",
        description: "Special plays, performances, and unforgettable moments.",
      },
      {
        title: "Game Notes",
        description: "Things noticed while watching the game.",
      },
    ],
  },
  {
    number: "04",
    id: "wordplay",
    title: "Wordplay",
    icon: "letters",
    subtitle: "There is always another word.",
    description:
      "For the days when a five-letter word, a Scrabble rack, or a clever connection takes over your brain.",
    color: "wordplay",
    entries: [
      {
        title: "Wordle",
        description: "Daily guesses, patterns, and the occasional lucky start.",
      },
      {
        title: "Scrabble Table",
        description: "Vocabulary, letter combinations, and clever plays.",
      },
      {
        title: "Pyralinks",
        description: "Connections, word associations, and lateral thinking.",
      },
    ],
  },
  {
    number: "05",
    id: "archives",
    title: "The Archives",
    icon: "archive",
    subtitle: "A little bit of everything.",
    description:
      "A collection of interests, discoveries, recommendations, and random things worth keeping.",
    color: "archives",
    entries: [
      {
        title: "Currently Into",
        description: "Things catching my attention lately.",
      },
      {
        title: "The Listening Shelf",
        description: "Music, artists, and sounds worth sharing.",
      },
      {
        title: "Rabbit Holes",
        description: "Interesting discoveries that started with one question.",
      },
    ],
  },
] as const;

export type Channel = (typeof channels)[number];


export function findChannel(id: string) {
  return channels.find((channel) => channel.id === id);
}
