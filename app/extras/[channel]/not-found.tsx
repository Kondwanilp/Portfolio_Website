import Link from "next/link";
import Feedback from "../../components/Feedback";

export default function ChannelNotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="extras-page">
      <div className="extras-main-content">
        <h1>Channel not found.</h1>
        <Feedback kind="empty" action={<Link href="/extras">Explore the channels</Link>}>Choose a channel from the Extras directory.</Feedback>
      </div>
    </main>
  );
}
