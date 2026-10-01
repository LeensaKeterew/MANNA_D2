import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import ProfilePreview from "../components/ProfilePreview";
import CreatePost from "../components/CreatePost";
import AlbumForm from "../components/AlbumForm";
import useFetch from "../hooks/useFetch";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const isOwnProfile = id === me.id;
  const isAdmin = me.role === "admin";

  const profile = useFetch(`/api/users/${id}`);
  const postsReq = useFetch(`/api/users/${id}/posts`);
  const albumsReq = useFetch(`/api/users/${id}/albums`);
  const friendsReq = useFetch(`/api/users/${id}/friends`);
  const requestsReq = useFetch(isOwnProfile ? "/api/friends/requests" : null);

  const [panel, setPanel] = useState(null); // "post" | "album" | null
  const [actionError, setActionError] = useState("");

  if (profile.loading) {
    return (
      <div className="app-shell">
        <NavBar />
        <div className="app-body"><p className="status-message">Loading profile&hellip;</p></div>
      </div>
    );
  }
  if (profile.error || !profile.data) {
    return (
      <div className="app-shell">
        <NavBar />
        <div className="app-body"><p className="status-message">{profile.error || "User not found."}</p></div>
      </div>
    );
  }

  const { user, friendship } = profile.data;
  const posts = postsReq.data?.posts || [];
  const albums = albumsReq.data?.albums || [];
  const friends = friendsReq.data?.friends || [];
  const incoming = requestsReq.data?.incoming || [];
  const outgoing = requestsReq.data?.outgoing || [];

  const refreshSocial = () => {
    profile.reload();
    friendsReq.reload();
    requestsReq.reload();
  };

  const act = async (fn) => {
    setActionError("");
    try {
      await fn();
      refreshSocial();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const addFriend = () => act(() => api.post(`/api/friends/request/${user.id}`));
  const cancelOrUnfriend = () => act(() => api.del(`/api/friends/${user.id}`));
  const accept = (uid) => act(() => api.post(`/api/friends/accept/${uid}`));
  const decline = (uid) => act(() => api.post(`/api/friends/decline/${uid}`));

  const deleteUser = async () => {
    if (!window.confirm(`Delete ${user.name}'s account and everything they posted?`)) return;
    setActionError("");
    try {
      await api.del(`/api/admin/users/${user.id}`);
      navigate("/home");
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <NavBar />
      <div className="app-body">
        <main className="profile-main">
          <div className="profile-header">
            <img src={user.avatar} alt={user.name} className="profile-avatar" />
            <div className="profile-info">
              <div className="profile-name-row">
                <h1>{user.name}</h1>
                {isOwnProfile && <Link to="/settings" className="btn-secondary">Edit Profile</Link>}
                {isOwnProfile && (
                  <button type="button" className="btn-secondary" onClick={() => setPanel(panel === "post" ? null : "post")}>
                    {panel === "post" ? "Close" : "Create Post"}
                  </button>
                )}
                {isOwnProfile && (
                  <button type="button" className="btn-secondary" onClick={() => setPanel(panel === "album" ? null : "album")}>
                    {panel === "album" ? "Close" : "Create Album"}
                  </button>
                )}
                {friendship === "none" && <button type="button" className="btn-secondary" onClick={addFriend}>Add Friend</button>}
                {friendship === "outgoing" && (
                  <button type="button" className="btn-secondary" onClick={cancelOrUnfriend}>Cancel Request</button>
                )}
                {friendship === "incoming" && (
                  <>
                    <button type="button" className="btn-secondary" onClick={() => accept(user.id)}>Accept Request</button>
                    <button type="button" className="btn-secondary" onClick={() => decline(user.id)}>Decline</button>
                  </>
                )}
                {friendship === "friends" && (
                  <button type="button" className="btn-secondary" onClick={cancelOrUnfriend}>Unfriend</button>
                )}
                {isAdmin && !isOwnProfile && (
                  <button type="button" className="btn-secondary" onClick={deleteUser}>Delete User</button>
                )}
              </div>
              <div className="profile-stats">
                <span><strong>{user.postCount}</strong> posts</span>
                <span><strong>{user.friendCount}</strong> friends</span>
              </div>
              <p className="profile-bio">{user.bio}</p>
            </div>
          </div>

          {actionError && <div className="auth-error">{actionError}</div>}

          {isOwnProfile && panel === "post" && (
            <div className="create-post-panel">
              <CreatePost
                onCreated={() => {
                  setPanel(null);
                  postsReq.reload();
                  profile.reload();
                }}
                onCancel={() => setPanel(null)}
              />
            </div>
          )}

          {isOwnProfile && panel === "album" && (
            <div className="create-post-panel">
              <AlbumForm
                onSaved={() => {
                  setPanel(null);
                  albumsReq.reload();
                }}
                onCancel={() => setPanel(null)}
              />
            </div>
          )}

          {isOwnProfile && (incoming.length > 0 || outgoing.length > 0) && (
            <div className="profile-followers">
              <h4>Friend Requests</h4>
              {incoming.map((r) => (
                <div className="request-row" key={r.user.id}>
                  <img src={r.user.avatar} alt={r.user.name} />
                  <Link to={`/profile/${r.user.id}`}><strong>{r.user.name}</strong></Link>
                  <button type="button" className="btn-secondary" onClick={() => accept(r.user.id)}>Accept</button>
                  <button type="button" className="btn-secondary" onClick={() => decline(r.user.id)}>Decline</button>
                </div>
              ))}
              {outgoing.map((r) => (
                <div className="request-row" key={r.user.id}>
                  <img src={r.user.avatar} alt={r.user.name} />
                  <Link to={`/profile/${r.user.id}`}><strong>{r.user.name}</strong></Link>
                  <span>Request sent</span>
                  <button type="button" className="btn-secondary" onClick={() => act(() => api.del(`/api/friends/${r.user.id}`))}>
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="profile-followers">
            <h4>Friends</h4>
            {friendsReq.loading && <p className="status-message">Loading friends&hellip;</p>}
            {friendsReq.error && <div className="auth-error">{friendsReq.error}</div>}
            {friendsReq.data && friends.length === 0 && <p className="empty-state">No friends yet.</p>}
            <div className="followers-row">
              {friends.map((u) => (
                <ProfilePreview key={u.id} user={u} />
              ))}
            </div>
          </div>

          <div className="profile-albums">
            <h4>Albums</h4>
            {albumsReq.loading && <p className="status-message">Loading albums&hellip;</p>}
            {albumsReq.error && <div className="auth-error">{albumsReq.error}</div>}
            {albumsReq.data && albums.length === 0 && <p className="empty-state">No albums yet.</p>}
            <div className="posts-grid">
              {albums.map((album) => (
                <Link to={`/album/${album.id}`} key={album.id} className="posts-grid-item album-grid-item">
                  <img src={album.cover} alt={album.name} />
                  <span className="album-grid-title">{album.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="profile-posts">
            <h4>Posts</h4>
            {postsReq.loading && <p className="status-message">Loading posts&hellip;</p>}
            {postsReq.error && <div className="auth-error">{postsReq.error}</div>}
            {postsReq.data && posts.length === 0 && <p className="empty-state">No posts yet.</p>}
            <div className="posts-grid">
              {posts.map((post) => (
                <Link to={`/post/${post.id}`} key={post.id} className="posts-grid-item">
                  <img src={post.image} alt={post.title} />
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
