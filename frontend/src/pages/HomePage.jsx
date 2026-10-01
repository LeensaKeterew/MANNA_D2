import { useMemo, useState } from "react";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import Feed from "../components/Feed";
import useFetch from "../hooks/useFetch";
import "./HomePage.css";

// Local feed = you + your friends. Global feed = everyone. Both newest first,
// computed by the backend (GET /api/feed?scope=local|global).
export default function HomePage() {
  const [feedMode, setFeedMode] = useState("local");
  const feed = useFetch(`/api/feed?scope=${feedMode}`);
  const trending = useFetch(`/api/hashtags/trending?scope=${feedMode}`);

  const posts = feed.data?.posts || [];
  const trendingTags = useMemo(() => (trending.data?.hashtags || []).map((h) => h.tag), [trending.data]);

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-body home-body">
        <Sidebar feedMode={feedMode} onFeedModeChange={setFeedMode} hashtags={trendingTags} />
        <main className="home-feed">
          <h1>Home</h1>
          <p className="home-subtitle">Discover and share recipes with food that feeds the soul and body</p>

          {feed.loading && <p className="status-message">Loading your feed&hellip;</p>}
          {feed.error && <div className="auth-error">{feed.error}</div>}
          {!feed.loading && !feed.error && (
            <Feed
              posts={posts}
              emptyText={
                feedMode === "local"
                  ? "No posts from you or your friends yet. Add some friends or share a recipe!"
                  : "No posts have been shared yet."
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
