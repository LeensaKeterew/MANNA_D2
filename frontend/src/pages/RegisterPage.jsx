import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [fields, setFields] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const update = (key) => (e) => setFields({ ...fields, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Spec: registering automatically logs the user in.
      await signUp(fields);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page auth-page-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Manna logo" />
        </div>
        <h1>CREATE AN ACCOUNT</h1>
        <p className="auth-subtitle">Join Manna today and grow in faith and fullness to the tummy and soul</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" value={fields.username} onChange={update("username")} required />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={fields.email} onChange={update("email")} required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={fields.password} onChange={update("password")} required />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={fields.confirmPassword}
              onChange={update("confirmPassword")}
              required
            />
          </div>

          <button type="submit" className="btn-primary">Register</button>
        </form>

        <p className="auth-link-row">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
