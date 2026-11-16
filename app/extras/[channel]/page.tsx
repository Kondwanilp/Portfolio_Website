import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { channels, findChannel } from "../../../lib/extras";
import ExtrasView from "../ExtrasView";
import { Suspense } from "react";
import SiteNavigation from "../../components/SiteNavigation";
import Feedback from "../../components/Feedback";

export function generateStaticParams() {
  return channels.map(({ id }) => ({ channel: id }));
}

export async function generateMetadata({ params }: { params: Promise<{ channel: string }> }): Promise<Metadata> {
  const { channel } = await params;
  const entry = findChannel(channel);
  if (!entry) notFound();
  return { title: entry.title, description: entry.description };
}

async function ChannelContent({ params }: { params: Promise<{ channel: string }> }) {
  const { channel } = await params;
  if (!findChannel(channel)) notFound();
  return <ExtrasView channelId={channel} />;
}

export default function ChannelPage({ params }: { params: Promise<{ channel: string }> }) {
  return <Suspense fallback={<main id="main-content" className="extras-page"><SiteNavigation /><Feedback kind="loading">Opening this channel...</Feedback></main>}>
    <ChannelContent params={params} />
  </Suspense>;
}
