import { Link } from "react-router-dom";
import "./SplashPage.css";

const VERSE = {
  text: "I am the bread of life. Whoever comes to me will never go hungry, and whoever believes in me will never be thirsty.",
  reference: "John 6:35",
};

export default function SplashPage() {
  const verse = VERSE;

  return (
    <div className="splash-page">
      <div className="splash-content">
        <div className="splash-logo">
          <img src="/logo.png" alt="Manna logo" />
        </div>

        <h1 className="splash-title">MANNA</h1>
        <div className="splash-divider" />

        <blockquote className="splash-verse">
          &ldquo;{verse.text}&rdquo;
          <span className="splash-verse-ref">{verse.reference}</span>
        </blockquote>

        <Link to="/register" className="btn-primary splash-register-btn">
          Register
        </Link>

        <p className="splash-login-row">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}