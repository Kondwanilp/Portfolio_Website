"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import type { WarriorsNewsItem } from "@/lib/warriors-news";
import "./warriors-news.css";

export default function WarriorsNews() {
  const [items, setItems] = useState<WarriorsNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("/api/warriors-news", {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.items) || !data.items.length)
          throw new Error("News unavailable");
        if (mounted) setItems(data.items);
      } catch {
        if (mounted) setError(true);
      } finally {
        window.clearTimeout(timeout);
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [reload]);

  return (
    <section
      className="cv-section warriors-news"
      aria-labelledby="warriors-news-title"
    >
      <header>
        <h3 id="warriors-news-title">News 4 Dubs fans</h3>
        <a
          href="https://www.nba.com/warriors/category/news"
          target="_blank"
          rel="noopener noreferrer"
        >
          Warriors.com ↗
        </a>
      </header>
      {loading ? (
        <p role="status">Loading Warriors news…</p>
      ) : error ? (
        <div role="status">
          <p>Warriors news is unavailable right now.</p>
          <button type="button" onClick={() => setReload((value) => value + 1)}>
            Try again
          </button>
        </div>
      ) : (
        <div className="warriors-news-viewport">
          <div
            className="warriors-news-track"
            style={
              { "--news-duration": `${items.length * 12}s` } as CSSProperties
            }
          >
            {[false, true].map((copy) => (
              <div
                className={
                  copy
                    ? "warriors-news-set warriors-news-copy"
                    : "warriors-news-set"
                }
                key={String(copy)}
                aria-hidden={copy || undefined}
              >
                {items.map((item) => (
                  <a
                    className="warriors-news-card"
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={copy ? -1 : undefined}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        width={320}
                        height={180}
                        unoptimized
                        title={item.imageCredit}
                      />
                    )}
                    <div>
                      <time dateTime={item.publishedAt}>
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "America/Chicago",
                        }).format(new Date(item.publishedAt))}
                      </time>
                      <h4>{item.title}</h4>
                      {item.imageCredit && <small>{item.imageCredit}</small>}
                    </div>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
