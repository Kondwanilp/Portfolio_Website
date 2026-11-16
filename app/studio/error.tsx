"use client";

import Feedback from "../components/Feedback";

export default function StudioErrorPage({ reset }: { reset: () => void }) {
  return <main id="main-content" className="studio-access"><Feedback kind="error" title="The Studio could not open this page." action={<button type="button" onClick={reset}>Try again</button>}>Your saved drafts are retained. Retry when the connection is available.</Feedback></main>;
}
