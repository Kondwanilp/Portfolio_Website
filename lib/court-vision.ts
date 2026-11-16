export const COURT_VIDEO_BUCKET = "hoops_bucket";

export type HoopSession = {
  id: string;
  played_on: string;
  location: string;
};

export type PublishedCourtVideo = {
  id: string;
  title: string;
  description: string | null;
  played_on: string;
  location: string;
  storage_path: string;
};

export type CourtVideo = PublishedCourtVideo & {
  is_published: boolean;
  created_at: string;
};

/** Database dates are calendar dates, independent of the viewer's timezone. */
export function formatCourtDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
