export type AnimeReview = {
  id: string;
  title: string;
  rating: number | null;
  status: "watched" | "watching" | "planned";
  review: string;
};

const suppliedReviews: AnimeReview[] = [
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    rating: 5,
    status: "watched",
    review:
      "the show is not what you think at any point, leave you wondering if you’re an idiot or the writer is just that good. My at most favorite anime and an absolutely amazing cinematic masterpiece",
  },
  {
    id: "naruto",
    title: "Naruto / Naruto Shippuden",
    rating: 4.5,
    status: "watched",
    review:
      "amazing nostalgic show and a great Shonen anime, only fault I have with it is the numerous flashbacks and filler episodes",
  },
  {
    id: "steins-gate",
    title: "Steins;Gate",
    rating: 4.5,
    status: "watched",
    review:
      "holy cow this was good. Kept me enthralled with the science but caring a lot more about if my favorite character survives",
  },
  {
    id: "gurren-lagann",
    title: "Gurren Lagann",
    rating: 4.5,
    status: "watched",
    review:
      "first anime I ever watched and as you can tell I haven’t stopped since, might seem like a kids show at first but the philosophy and character arcs are really good. To this day I still randomly shout “yours is the drill that will pierce the heavens!”",
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer",
    rating: 4,
    status: "watched",
    review:
      "really good animation style and fights, the character arcs feel a little rushed for my liking but I love the lore",
  },
  {
    id: "death-note",
    title: "Death Note",
    rating: 5,
    status: "watched",
    review:
      "absolute thriller and psychological anime, you can’t predict the plot and the protagonist and antagonist keep you on your toes",
  },
  {
    id: "death-parade",
    title: "Death Parade",
    rating: 3.5,
    status: "watched",
    review:
      "initially watched thing because of some online chatter about it being connected to death note (it’s not really) but was a good watch and had a good take on the afterlife, and life & death",
  },
  {
    id: "redo-of-healer",
    title: "Redo of Healer",
    rating: 1,
    status: "watched",
    review:
      "I would not recommend this, pretty erotic, the plot is really insane to me and it’s pretty weird",
  },
  {
    id: "akame-ga-kill",
    title: "Akame ga Kill!",
    rating: 3,
    status: "watched",
    review:
      "this show had the potential to be a 5/5 till the ending, if you’re gonna watch this, be in a good mood",
  },
  {
    id: "tokyo-revengers",
    title: "Tokyo Revengers",
    rating: 3,
    status: "watched",
    review:
      "amazing show, the time travel logic gets a little weird but the show does a good job of focusing on the main characters more than the sciency parts",
  },
  {
    id: "seven-deadly-sins",
    title: "The Seven Deadly Sins",
    rating: 3,
    status: "watched",
    review:
      "first two seasons were awesome, great character building but it lost its touch along the way",
  },
  {
    id: "dragon-ball",
    title: "Dragon Ball Z / Super",
    rating: 4.5,
    status: "watched",
    review:
      "not much to say cause this is a classic and it’s pretty good for people who like intense fights but don’t expect too much story or real plot points that shock you",
  },
  {
    id: "cowboy-bebop",
    title: "Cowboy Bebop",
    rating: 4,
    status: "watched",
    review:
      "another classic, good watch for when you just wanna watch some anime to keep you feeling cozy",
  },
  {
    id: "fullmetal-alchemist",
    title: "Fullmetal Alchemist: Brotherhood",
    rating: 5,
    status: "watched",
    review:
      "might be one of the best shows I’ve ever watched. The story, the arcs, the characters are all top notch and the ending doesn’t leave you wanting for more",
  },
  {
    id: "kurokos-basketball",
    title: "Kuroko’s Basketball",
    rating: 3.5,
    status: "watched",
    review: "pretty decent sports show with great rivalries",
  },
  {
    id: "one-piece",
    title: "One Piece",
    rating: 4.5,
    status: "watching",
    review:
      "Is it good? Yes but it is longggg, I worry more for how ending will be",
  },
  {
    id: "monster",
    title: "Monster",
    rating: 5,
    status: "watched",
    review:
      "if you don’t have a definition of what evil looks like, get ready to have one. Absolutely exhilarating psychological anime with an amazing plot and the end leaves you worried about the protagonist",
  },
  {
    id: "my-hero-academia",
    title: "My Hero Academia",
    rating: 4,
    status: "watched",
    review:
      "great show if you like shonen style anime, can be a little corny sometimes but has great lessons and fights",
  },
  {
    id: "bleach",
    title: "Bleach",
    rating: 4.5,
    status: "watching",
    review: "so far so good…",
  },
  {
    id: "my-home-hero",
    title: "My Home Hero",
    rating: null,
    status: "watching",
    review: "no thoughts as of now…",
  },
  {
    id: "berserk",
    title: "Berserk",
    rating: 5,
    status: "watched",
    review:
      "I thank God I’m not the protagonist everyday. If you’re emotional do not watch this, you will feel sad so many times it’s crazy and what sucks even more is it’s not a finished anime and the writer died",
  },
  {
    id: "vinland-saga",
    title: "Vinland Saga",
    rating: 5,
    status: "watched",
    review:
      "this anime is the definition of the La Peace Kai Cenat meme. Has the best ever character building and you experience the anger and the calm of the protagonist as you watch",
  },
  {
    id: "hunter-x-hunter",
    title: "Hunter × Hunter",
    rating: null,
    status: "planned",
    review: "",
  },
  {
    id: "spirited-away",
    title: "Spirited Away",
    rating: null,
    status: "planned",
    review: "",
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    rating: 4.5,
    status: "watched",
    review:
      "awesome fights and amazing characters, the character development is not that great but I love the story so far",
  },
  {
    id: "jormungand",
    title: "Jormungand",
    rating: 3.5,
    status: "watched",
    review:
      "amazing anime, weird that it had child soldiers but the plot is pretty good",
  },
  {
    id: "black-butler",
    title: "Black Butler",
    rating: 3.5,
    status: "watched",
    review:
      "not too bad but you have to watch 4 episodes for it to get good then the third season feels out of place",
  },
  {
    id: "evangelion",
    title: "Neon Genesis Evangelion",
    rating: 3.5,
    status: "watched",
    review:
      "apart from that one scene, pretty solid anime with an old animation style",
  },
];

// Stable sorting retains the owner's order among equally rated shows.
export const animeReviews: readonly AnimeReview[] = suppliedReviews.toSorted(
  (first, second) => (second.rating ?? -1) - (first.rating ?? -1),
);

export const animeStatusLabels = {
  watched: "Watched",
  watching: "Currently watching",
  planned: "On my watchlist",
} as const;
