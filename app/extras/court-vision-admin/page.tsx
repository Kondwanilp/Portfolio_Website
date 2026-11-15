"use client";

import { FormEvent, useEffect, useState } from "react";

import * as tus from "tus-js-client";

import { supabase } from "../../../lib/supabase/client";

import "./court-vision-admin.css";

const ADMIN_ID = "a78f637f-4bf2-4927-886e-2421af084f4a";

const MAX_FILE_SIZE = 45 * 1024 * 1024;

const BUCKET_NAME = "hoops_bucket";

type HoopSession = {

  id: string;

  played_on: string;

  location: string;

};

type CourtVideo = {

  id: string;

  title: string;

  description: string | null;

  played_on: string;

  location: string;

  storage_path: string;

  is_published: boolean;

  created_at: string;

};

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {

  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-US", {

    month: "short",

    day: "numeric",

    year: "numeric",

  });

}

function formatSize(bytes: number) {

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}

export default function CourtVisionAdmin() {

  const [userId, setUserId] = useState<string | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);

  const [sessions, setSessions] = useState<HoopSession[]>([]);

  const [videos, setVideos] = useState<CourtVideo[]>([]);

  const [loadingData, setLoadingData] = useState(false);

  const [playedOn, setPlayedOn] = useState("");

  const [location, setLocation] = useState("");

  const [savingSession, setSavingSession] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [videoTitle, setVideoTitle] = useState("");

  const [videoDescription, setVideoDescription] = useState("");

  const [videoDate, setVideoDate] = useState("");

  const [videoLocation, setVideoLocation] = useState("");

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadMessage, setUploadMessage] = useState("");

  const [uploadError, setUploadError] = useState("");

  const [dashboardError, setDashboardError] = useState("");

  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const currentDate = today();
    setPlayedOn((current) => current || currentDate);
    setVideoDate((current) => current || currentDate);
  }, []);

  const isAdmin = userId === ADMIN_ID;

  async function loadDashboardData() {

    setLoadingData(true);

    setDashboardError("");

    const [sessionResult, videoResult] = await Promise.all([

      supabase

        .from("hoop_sessions")

        .select("id, played_on, location")

        .order("played_on", { ascending: false }),

      supabase

        .from("court_videos")

        .select(

          "id, title, description, played_on, location, storage_path, is_published, created_at"

        )

        .order("created_at", { ascending: false }),

    ]);

    if (sessionResult.error) {

      setDashboardError(

        `Couldn't load sessions: ${sessionResult.error.message}`

      );

    } else {

      setSessions(sessionResult.data ?? []);

    }

    if (videoResult.error) {

      setDashboardError((current) =>

        current

          ? `${current} | Couldn't load videos: ${videoResult.error.message}`

          : `Couldn't load videos: ${videoResult.error.message}`

      );

    } else {

      setVideos(videoResult.data ?? []);

    }

    setLoadingData(false);

  }

  useEffect(() => {

    let mounted = true;

    async function initialize() {

      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {

        setLoginError(error.message);

      }

      setUserId(data.session?.user.id ?? null);

      setCheckingAuth(false);

    }

    initialize();

    const {

      data: { subscription },

    } = supabase.auth.onAuthStateChange((_event, session) => {

      if (mounted) {

        setUserId(session?.user.id ?? null);

      }

    });

    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);

  useEffect(() => {

    if (isAdmin) {

      loadDashboardData();

    }

  }, [isAdmin]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoginError("");

    setLoginLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({

      email,

      password,

    });

    if (error) {

      setLoginError(error.message);

      setLoginLoading(false);

      return;

    }

    if (data.user.id !== ADMIN_ID) {

      await supabase.auth.signOut();

      setLoginError("This account is not authorized to manage Court Vision.");

      setLoginLoading(false);

      return;

    }

    setEmail("");

    setPassword("");

    setLoginLoading(false);

  }

  async function handleLogout() {

    const { error } = await supabase.auth.signOut();

    if (error) {

      setDashboardError(error.message);

    }

  }

  async function handleAddSession(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    if (!isAdmin) return;

    if (!playedOn || !location.trim()) {

      setDashboardError("Please enter a date and location.");

      return;

    }

    setSavingSession(true);

    setDashboardError("");

    setActionMessage("");

    const { error } = await supabase.from("hoop_sessions").insert({

      played_on: playedOn,

      location: location.trim(),

    });

    if (error) {

      setDashboardError(`Couldn't save session: ${error.message}`);

    } else {

      setLocation("");

      setActionMessage("Pickup session added.");

      await loadDashboardData();

    }

    setSavingSession(false);

  }

  async function uploadWithTus(

    file: File,

    storagePath: string,

    accessToken: string

  ) {

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const publishableKey =

      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {

      throw new Error("Supabase environment variables are missing.");

    }

    const projectId = new URL(supabaseUrl).hostname.split(".")[0];

    if (!projectId) {

      throw new Error("Couldn't identify your Supabase project.");

    }

    const endpoint = `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`;

    await new Promise<void>((resolve, reject) => {

      const upload = new tus.Upload(file, {

        endpoint,

        chunkSize: 6 * 1024 * 1024,

        retryDelays: [0, 3000, 5000, 10000, 20000],

        uploadDataDuringCreation: true,

        removeFingerprintOnSuccess: true,

        headers: {

          authorization: `Bearer ${accessToken}`,

          apikey: publishableKey,

        },

        metadata: {

          bucketName: BUCKET_NAME,

          objectName: storagePath,

          contentType: file.type,

          cacheControl: "3600",

        },

        onError(error) {

          reject(error);

        },

        onProgress(bytesUploaded, bytesTotal) {

          const percentage = Math.round(

            (bytesUploaded / bytesTotal) * 100

          );

          setUploadProgress(percentage);

        },

        onSuccess() {

          resolve();

        },

      });

      upload

        .findPreviousUploads()

        .then((previousUploads) => {

          if (previousUploads.length > 0) {

            upload.resumeFromPreviousUpload(previousUploads[0]);

          }

          upload.start();

        })

        .catch(reject);

    });

  }

  async function handleVideoUpload(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    if (!isAdmin) return;

    setUploadError("");

    setUploadMessage("");

    setDashboardError("");

    setActionMessage("");

    if (!videoFile) {

      setUploadError("Choose a video file first.");

      return;

    }

    if (!videoTitle.trim() || !videoDate || !videoLocation.trim()) {

      setUploadError("Please complete the title, date, and location.");

      return;

    }

    const extension = videoFile.name.split(".").pop()?.toLowerCase();

    const validExtension = ["mp4", "mov"].includes(extension ?? "");

    if (!validExtension) {

      setUploadError("Please choose an MP4 or MOV video.");

      return;

    }

    if (videoFile.size > MAX_FILE_SIZE) {

      setUploadError("Your video is too large. The maximum size is 45 MB.");

      return;

    }

    const { data: sessionData, error: sessionError } =

      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {

      setUploadError("Your login session has expired. Please log in again.");

      return;

    }

    const safeExtension = extension === "mov" ? "mov" : "mp4";

    const storagePath = `court-videos/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;

    setUploading(true);

    setUploadProgress(0);

    setUploadMessage("Preparing your upload...");

    let fileUploaded = false;

    try {

      await uploadWithTus(

        videoFile,

        storagePath,

        sessionData.session.access_token

      );

      fileUploaded = true;

      setUploadMessage("Saving video details...");

      const { error: insertError } = await supabase

        .from("court_videos")

        .insert({

          title: videoTitle.trim(),

          description: videoDescription.trim() || null,

          played_on: videoDate,

          location: videoLocation.trim(),

          storage_path: storagePath,

          is_published: false,

        });

      if (insertError) {

        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);

        fileUploaded = false;

        throw new Error(insertError.message);

      }

      setUploadMessage("Upload complete! Your video is saved as a draft.");

      setVideoFile(null);

      setVideoTitle("");

      setVideoDescription("");

      setVideoDate(today());

      setVideoLocation("");

      const input = document.getElementById(

        "court-video-file"

      ) as HTMLInputElement | null;

      if (input) input.value = "";

      await loadDashboardData();

    } catch (error) {

      console.error("Court Vision upload error:", error);

      if (fileUploaded) {

        setUploadError(

          "The video uploaded, but its details could not be saved. Check Supabase before trying again."

        );

      } else {

        setUploadError(

          error instanceof Error ? error.message : "Video upload failed."

        );

      }

      setUploadMessage("");

    } finally {

      setUploading(false);

    }

  }

  async function togglePublished(video: CourtVideo) {

    if (!isAdmin) return;

    setDashboardError("");

    setActionMessage("");

    const nextPublishedState = !video.is_published;

    const { error } = await supabase

      .from("court_videos")

      .update({ is_published: nextPublishedState })

      .eq("id", video.id);

    if (error) {

      setDashboardError(`Couldn't update video: ${error.message}`);

      return;

    }

    setActionMessage(

      nextPublishedState ? "Video published." : "Video unpublished."

    );

    await loadDashboardData();

  }

  async function deleteVideo(video: CourtVideo) {

    if (!isAdmin) return;

    const confirmed = window.confirm(

      `Delete "${video.title}" permanently? This cannot be undone.`

    );

    if (!confirmed) return;

    setDashboardError("");

    setActionMessage("");

    const { error: storageError } = await supabase.storage

      .from(BUCKET_NAME)

      .remove([video.storage_path]);

    if (storageError) {

      setDashboardError(

        `Couldn't delete the video file: ${storageError.message}`

      );

      return;

    }

    const { error: databaseError } = await supabase

      .from("court_videos")

      .delete()

      .eq("id", video.id);

    if (databaseError) {

      setDashboardError(

        `The file was deleted, but its database record remains: ${databaseError.message}`

      );

      return;

    }

    setActionMessage("Video deleted.");

    await loadDashboardData();

  }

  if (checkingAuth) {

    return (

      <main className="cv-admin-page">

        <p className="cv-admin-muted">Checking admin access...</p>

      </main>

    );

  }

  if (!isAdmin) {

    return (

      <main className="cv-admin-page">

        <div className="cv-admin-topline">

          <span>COURT VISION / PRIVATE AREA</span>

          <a href="/extras">← Back to Extras</a>

        </div>

        <section className="cv-admin-login">

          <p className="cv-admin-eyebrow">ADMINISTRATOR ACCESS</p>

          <h1>Court Vision.</h1>

          <p className="cv-admin-muted">

            Sign in to manage pickup sessions and basketball videos.

          </p>

          <form onSubmit={handleLogin}>

            <label>

              Email

              <input

                type="email"

                value={email}

                onChange={(event) => setEmail(event.target.value)}

                autoComplete="username"

                required

              />

            </label>

            <label>

              Password

              <input

                type="password"

                value={password}

                onChange={(event) => setPassword(event.target.value)}

                autoComplete="current-password"

                required

              />

            </label>

            {loginError && (

              <p className="cv-admin-error">{loginError}</p>

            )}

            <button type="submit" disabled={loginLoading}>

              {loginLoading ? "Signing in..." : "Log in"}

            </button>

          </form>

        </section>

      </main>

    );

  }

  return (

    <main className="cv-admin-page">

      <div className="cv-admin-topline">

        <span>COURT VISION / ADMIN DASHBOARD</span>

        <a href="/extras">← View public page</a>

      </div>

      <header className="cv-admin-header">

        <div>

          <p className="cv-admin-eyebrow">YOUR PERSONAL COURTSIDE</p>

          <h1>Dashboard<span>.</span></h1>

          <p className="cv-admin-muted">

            Manage the runs, upload the highlights, and keep the memories.

          </p>

        </div>

        <button

          className="cv-admin-logout"

          type="button"

          onClick={handleLogout}

        >

          Log out

        </button>

      </header>

      {dashboardError && (

        <p className="cv-admin-error">{dashboardError}</p>

      )}

      {actionMessage && (

        <p className="cv-admin-success">{actionMessage}</p>

      )}

      <section className="cv-admin-section">

        <div className="cv-admin-section-heading">

          <div>

            <p className="cv-admin-eyebrow">01 / THE HIGHLIGHTS</p>

            <h2>Upload a video.</h2>

            <p className="cv-admin-muted">

              Add a pickup clip. Videos are saved as drafts until you publish them.

            </p>

          </div>

        </div>

        <form className="cv-admin-form" onSubmit={handleVideoUpload}>

          <label className="cv-admin-full">

            Video file

            <input

              id="court-video-file"

              type="file"

              accept="video/mp4,video/quicktime,.mp4,.mov"

              disabled={uploading}

              onChange={(event) => {

                const file = event.target.files?.[0] ?? null;

                setVideoFile(file);

                setUploadError("");

              }}

            />

            <small>MP4 or MOV · Maximum 45 MB</small>

          </label>

          {videoFile && (

            <p className="cv-admin-file-info">

              Selected: {videoFile.name} ({formatSize(videoFile.size)})

            </p>

          )}

          <label>

            Video title

            <input

              type="text"

              value={videoTitle}

              onChange={(event) => setVideoTitle(event.target.value)}

              placeholder="e.g. Friday night runs"

              disabled={uploading}

              required

            />

          </label>

          <label>

            Date played

            <input

              type="date"

              value={videoDate}

              onChange={(event) => setVideoDate(event.target.value)}

              disabled={uploading}

              required

            />

          </label>

          <label>

            Location

            <input

              type="text"

              value={videoLocation}

              onChange={(event) => setVideoLocation(event.target.value)}

              placeholder="e.g. GSU Recreation Center"

              disabled={uploading}

              required

            />

          </label>

          <label className="cv-admin-full">

            Description <span>(optional)</span>

            <textarea

              value={videoDescription}

              onChange={(event) => setVideoDescription(event.target.value)}

              placeholder="A little context about this game..."

              rows={3}

              disabled={uploading}

            />

          </label>

          {uploading && (

            <div className="cv-admin-progress cv-admin-full">

              <div className="cv-admin-progress-label">

                <span>{uploadMessage || "Uploading..."}</span>

                <span>{uploadProgress}%</span>

              </div>

              <div className="cv-admin-progress-track">

                <div

                  className="cv-admin-progress-fill"

                  style={{ width: `${uploadProgress}%` }}

                />

              </div>

            </div>

          )}

          {uploadError && (

            <p className="cv-admin-error cv-admin-full">{uploadError}</p>

          )}

          {uploadMessage && !uploading && (

            <p className="cv-admin-success cv-admin-full">

              {uploadMessage}

            </p>

          )}

          <button

            className="cv-admin-primary cv-admin-full"

            type="submit"

            disabled={uploading}

          >

            {uploading ? "Uploading video..." : "Upload video"}

          </button>

        </form>

      </section>

      <section className="cv-admin-section">

        <div className="cv-admin-section-heading">

          <div>

            <p className="cv-admin-eyebrow">02 / YOUR LIBRARY</p>

            <h2>Video manager.</h2>

            <p className="cv-admin-muted">

              Review drafts and control which videos visitors can see.

            </p>

          </div>

        </div>

        {loadingData ? (

          <p className="cv-admin-muted">Loading your videos...</p>

        ) : videos.length === 0 ? (

          <div className="cv-admin-empty">

            <span>🏀</span>

            <h3>No videos yet.</h3>

            <p>Your first highlight is waiting to be uploaded.</p>

          </div>

        ) : (

          <div className="cv-admin-video-list">

            {videos.map((video) => {

              const videoUrl = supabase.storage

                .from(BUCKET_NAME)

                .getPublicUrl(video.storage_path).data.publicUrl;

              return (

                <article className="cv-admin-video" key={video.id}>

                  <video src={videoUrl} controls preload="metadata" />

                  <div className="cv-admin-video-info">

                    <div className="cv-admin-video-heading">

                      <div>

                        <h3>{video.title}</h3>

                        <p>

                          {formatDate(video.played_on)} · {video.location}

                        </p>

                      </div>

                      <span

                        className={

                          video.is_published

                            ? "cv-admin-status is-published"

                            : "cv-admin-status is-draft"

                        }

                      >

                        {video.is_published ? "PUBLISHED" : "DRAFT"}

                      </span>

                    </div>

                    {video.description && (

                      <p className="cv-admin-video-description">

                        {video.description}

                      </p>

                    )}

                    <div className="cv-admin-video-actions">

                      <button

                        type="button"

                        onClick={() => togglePublished(video)}

                      >

                        {video.is_published ? "Unpublish" : "Publish"}

                      </button>

                      <button

                        className="is-delete"

                        type="button"

                        onClick={() => deleteVideo(video)}

                      >

                        Delete

                      </button>

                    </div>

                  </div>

                </article>

              );

            })}

          </div>

        )}

      </section>

      <section className="cv-admin-section">

        <div className="cv-admin-section-heading">

          <div>

            <p className="cv-admin-eyebrow">03 / THE RUNS</p>

            <h2>Pickup sessions.</h2>

            <p className="cv-admin-muted">

              Keep a record of when and where you played.

            </p>

          </div>

        </div>

        <form className="cv-admin-form cv-admin-session-form" onSubmit={handleAddSession}>

          <label>

            Date

            <input

              type="date"

              value={playedOn}

              onChange={(event) => setPlayedOn(event.target.value)}

              required

            />

          </label>

          <label>

            Location

            <input

              type="text"

              value={location}

              onChange={(event) => setLocation(event.target.value)}

              placeholder="e.g. GSU Recreation Center"

              required

            />

          </label>

          <button

            className="cv-admin-primary"

            type="submit"

            disabled={savingSession}

          >

            {savingSession ? "Saving..." : "＋ Add session"}

          </button>

        </form>

        {sessions.length === 0 ? (

          <div className="cv-admin-empty">

            <p>No pickup sessions have been logged yet.</p>

          </div>

        ) : (

          <div className="cv-admin-session-list">

            {sessions.map((session) => (

              <div className="cv-admin-session" key={session.id}>

                <span>{formatDate(session.played_on)}</span>

                <strong>{session.location}</strong>

              </div>

            ))}

          </div>

        )}

      </section>

      <footer className="cv-admin-footer">

        COURT VISION / END OF THE RUN.

      </footer>

    </main>

  );

}
