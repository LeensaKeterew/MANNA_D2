import { useState } from "react";
import { api } from "../api";
import "../pages/CreatePostPage.css";

// Create (no `album`) or edit (`album`) form: name, description, hashtags.
export default function AlbumForm({ album, onSaved, onCancel }) {
  const [fields, setFields] = useState({
    name: album?.name || "",
    description: album?.description || "",
    hashtags: (album?.hashtags || []).join(" "),
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setFields({ ...fields, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fields.name.trim()) {
      setError("Give your album a name.");
      return;
    }
    setBusy(true);
    try {
      const body = { name: fields.name, description: fields.description, hashtags: fields.hashtags };
      const data = album ? await api.put(`/api/albums/${album.id}`, body) : await api.post("/api/albums", body);
      onSaved?.(data.album);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>{album ? "Edit Album" : "Create an Album"}</h1>
      {error && <div className="auth-error">{error}</div>}
      <form className="create-post-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="album-name">Name</label>
          <input id="album-name" type="text" maxLength={80} value={fields.name} onChange={update("name")} required />
        </div>
        <div className="field">
          <label htmlFor="album-description">Description</label>
          <textarea id="album-description" rows={3} maxLength={500} value={fields.description} onChange={update("description")} />
        </div>
        <div className="field">
          <label htmlFor="album-hashtags">Hashtags</label>
          <input id="album-hashtags" type="text" placeholder="#FaithFood #GardenHarvest" value={fields.hashtags} onChange={update("hashtags")} />
        </div>
        <div className="create-post-actions">
          <button type="button" className="btn-secondary" onClick={() => onCancel?.()}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{album ? "Save" : "Create"}</button>
        </div>
      </form>
    </>
  );
}
