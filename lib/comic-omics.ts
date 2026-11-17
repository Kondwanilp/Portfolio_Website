export type ComicReview = {
  id: string;
  title: string;
  publisher: string;
  color: "amber" | "teal" | "blue";
  cover?: string;
  edition?: string;
  review?: string;
  rating?: number;
  sourceUrl?: string;
  additionalCovers?: readonly { source: string; label: string; sourceUrl: string }[];
  placeholder: boolean;
};

// Reviews and ratings supplied by the owner. Keep their wording intact.
export const comicReviews: readonly ComicReview[] = [
  {
    id: "aliens-labyrinth",
    title: "Aliens: Labyrinth",
    publisher: "Dark Horse Comics",
    color: "teal",
    cover: "/comics/aliens-labyrinth.jpg",
    edition: "Dark Horse Comics",
    rating: 3,
    review: 'Absolutely insane doctor, staying down there with the xenomorphs really messed unc up, I get that Aliens is sort of a "slasher" franchise but this was a little bit too predictable',
    sourceUrl: "https://openlibrary.org/isbn/9781569711101",
    placeholder: false,
  },
  {
    id: "marvel-zombies",
    title: "Marvel Zombies",
    publisher: "Marvel",
    color: "amber",
    cover: "/comics/marvel-zombies.jpg",
    edition: "Marvel",
    rating: 5,
    review: "Absolutely amazing way of introducing zombies to heros and thats swist with Hank Pym and T'challa was insane. Also captures what I think Peter Parker's psych would look like after what he went through",
    sourceUrl: "https://prhcomics.com/book/?isbn=9780785120148",
    placeholder: false,
  },
  {
    id: "thor-god-of-thunder",
    title: "Thor: God of Thunder",
    publisher: "Marvel",
    color: "blue",
    cover: "/comics/thor-god-of-thunder-vol-1.jpg",
    edition: "Volumes 1 & 2 · The God Butcher / Godbomb",
    rating: 5,
    review: "Beautifully written comic and it shows how Thor matures and Gorr was absolutely terrifying, this guy really couldn't be killed",
    sourceUrl: "https://prhcomics.com/book/?isbn=9780785166979",
    additionalCovers: [{ source: "/comics/thor-god-of-thunder-vol-2.jpg", label: "Volume 2 · Godbomb cover", sourceUrl: "https://prhcomics.com/book/?isbn=9780785166986" }],
    placeholder: false,
  },
];

export function comicIndex(current: number, change: number, count: number) {
  if (!Number.isInteger(count) || count < 1) return 0;
  const index = Number.isFinite(current) ? Math.trunc(current) : 0;
  const step = Number.isFinite(change) ? Math.trunc(change) : 0;
  return ((index + step) % count + count) % count;
}

export function comicSwipeDirection(distance: number, elapsed: number): -1 | 0 | 1 {
  if (!Number.isFinite(distance) || !Number.isFinite(elapsed) || elapsed <= 0) return 0;
  const committed = Math.abs(distance) >= 55 || (Math.abs(distance) >= 12 && Math.abs(distance / elapsed) >= .5);
  if (!committed) return 0;
  return distance < 0 ? 1 : -1;
}

export type ExtrasActivity = "chess" | "basketball";

export function extrasActivityFromHash(hash: string): ExtrasActivity | null {
  if (hash === "#chess") return "chess";
  if (hash === "#basketball") return "basketball";
  return null;
}
