import { useState } from "react";
import { api } from "../api";
import "../pages/CreatePostPage.css";

// Edit an existing post. Same field set and class names as CreatePost so the
// form looks identical — only the heading copy and the values differ.
export default function EditPost({ post, onSave, onCancel }) {
  const [fields, setFields] = useState({
    title: post.title || "",
    image: post.image || "",
    text: post.text || "",
    verseText: post.verse?.text || "",
    verseReference: post.verse?.reference || "",
    hashtags: (post.hashtags || []).join(" "),
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setFields({ ...fields, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fields.title.trim() || !fields.text.trim()) {
      setError("Give your post a title and a bit of text.");
      return;
    }

    setBusy(true);
    try {
      const image = file ? await api.upload(file) : fields.image.trim() || post.image;
      await onSave?.({
        title: fields.title,
        image,
        text: fields.text,
        verse: { text: fields.verseText, reference: fields.verseReference },
        hashtags: fields.hashtags,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {error && <div className="auth-error">{error}</div>}

      <form className="create-post-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="edit-title">Title</label>
          <input
            id="edit-title"
            type="text"
            placeholder="e.g. Honey & Herb Roasted Chicken"
            value={fields.title}
            onChange={update("title")}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="edit-imageFile">Replace image (optional)</label>
          <input
            id="edit-imageFile"
            className="file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="field">
          <label htmlFor="edit-image">Image link</label>
          <input
            id="edit-image"
            type="url"
            placeholder="https://..."
            value={fields.image}
            onChange={update("image")}
          />
        </div>

        <div className="field">
          <label htmlFor="edit-text">Description</label>
          <textarea
            id="edit-text"
            rows={4}
            placeholder="Tell the story behind the dish..."
            value={fields.text}
            onChange={update("text")}
            required
          />
        </div>

        <div className="create-post-row">
          <div className="field">
            <label htmlFor="edit-verseText">Verse (optional)</label>
            <input
              id="edit-verseText"
              type="text"
              placeholder="Taste and see that the Lord is good..."
              value={fields.verseText}
              onChange={update("verseText")}
            />
          </div>

          <div className="field">
            <label htmlFor="edit-verseReference">Reference</label>
            <input
              id="edit-verseReference"
              type="text"
              placeholder="Psalm 34:8"
              value={fields.verseReference}
              onChange={update("verseReference")}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="edit-hashtags">Hashtags</label>
          <input
            id="edit-hashtags"
            type="text"
            placeholder="#FaithFood #GardenHarvest"
            value={fields.hashtags}
            onChange={update("hashtags")}
          />
        </div>

        <div className="create-post-actions">
          <button type="button" className="btn-secondary" onClick={() => onCancel?.()}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            Save
          </button>
        </div>
      </form>
    </>
  );
}
