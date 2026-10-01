import { Link } from "react-router-dom";
import Image from "./Image";
import LikeButton from "./LikeButton";
import "./PostCard.css";

export default function PostCard({ post }) {
  const author = post.author;

  return (
    <article className="post-card">
      <Link to={`/post/${post.id}`}>
        <Image src={post.image} alt={post.title} className="post-card-image" />
      </Link>
      <div className="post-card-body">
        <div className="post-card-author">
          <img src={author.avatar} alt={author.name} />
          <div>
            <strong>{author.name}</strong>
            <span>{post.date}</span>
          </div>
        </div>

        <Link to={`/post/${post.id}`} className="post-card-title">
          <h3>{post.title}</h3>
        </Link>
        <p className="post-card-text">{post.text}</p>

        {post.verse.reference && (
          <div className="post-card-verse">
            &ldquo;{post.verse.text}&rdquo; &mdash; {post.verse.reference}
          </div>
        )}

        {post.hashtags?.length > 0 && (
          <div className="post-card-hashtags">
            {post.hashtags.map((tag) => (
              <span key={tag} className="hashtag-pill">{tag}</span>
            ))}
          </div>
        )}

        <div className="post-card-footer">
          <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likes} />
          <span>{"\ud83d\udcac"} {post.commentCount} comments</span>
        </div>
      </div>
    </article>
  );
}
