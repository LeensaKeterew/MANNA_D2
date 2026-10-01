import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import "./NavBar.css";

export default function NavBar() {
  const { user: currentUser, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ posts: [], users: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);

  const profilePath = `/profile/${currentUser.id}`;
  const isAdmin = currentUser.role === "admin";

  const tabs = useMemo(() => {
    const base = [
      { label: "Home", path: "/home", match: "/home" },
      { label: "Messages", path: "/messages", match: "/messages" },
      { label: "Profile", path: profilePath, match: "/profile" },
      { label: "Settings", path: "/settings", match: "/settings" },
    ];
    // Admin controls are only offered to administrators.
    if (isAdmin) base.push({ label: "Admin", path: "/admin", match: "/admin" });
    return base;
  }, [profilePath, isAdmin]);

  // Debounced server-side search over posts (title, text, hashtags, verse) and people.
  useEffect(() => {
    const q = query.trim();
    setActiveIndex(-1);
    if (!q) {
      setResults({ posts: [], users: [] });
      return undefined;
    }
    let live = true;
    const timer = setTimeout(() => {
      api
        .get(`/api/search?q=${encodeURIComponent(q)}`)
        .then((data) => live && setResults({ posts: data.posts, users: data.users }))
        .catch(() => live && setResults({ posts: [], users: [] }));
    }, 250);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const items = useMemo(
    () => [
      ...results.users.map((u) => ({
        key: `u-${u.id}`, path: `/profile/${u.id}`, image: u.avatar, round: true, title: u.name, sub: `@${u.username}`,
      })),
      ...results.posts.map((p) => ({
        key: `p-${p.id}`, path: `/post/${p.id}`, image: p.image, round: false, title: p.title, sub: `by ${p.author.name}`,
      })),
    ],
    [results]
  );

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const go = (path) => {
    navigate(path);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(items[activeIndex >= 0 ? activeIndex : 0].path);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/home" className="navbar-logo">
        <img src="/logo.png" alt="Manna logo" className="navbar-logo-img" />
        <span>MANNA</span>
      </Link>

      <div className="navbar-search" ref={searchRef}>
        <input
          type="text"
          placeholder="Search recipes, verses, people..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search recipes"
          aria-expanded={isOpen}
          role="combobox"
          aria-autocomplete="list"
        />

        {query && (
          <button
            type="button"
            className="navbar-search-clear"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
          >
            &times;
          </button>
        )}

        {isOpen && query && (
          <div className="navbar-search-results" role="listbox">
            {items.length === 0 ? (
              <div className="navbar-search-empty">No results for &ldquo;{query}&rdquo;</div>
            ) : (
              items.map((item, i) => (
                <button
                  key={item.key}
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`navbar-search-item ${i === activeIndex ? "active" : ""}`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => go(item.path)}
                >
                  <img src={item.image} alt="" className={`navbar-search-thumb ${item.round ? "round" : ""}`} />
                  <div className="navbar-search-item-text">
                    <strong>{item.title}</strong>
                    <span>{item.sub}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <nav className="navbar-tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={location.pathname.startsWith(tab.match) ? "active" : ""}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="navbar-actions">
        <Link to="/create" className="navbar-add" aria-label="Create post">+</Link>
        <Link to={profilePath}>
          <img src={currentUser.avatar} alt={currentUser.name} className="navbar-avatar" />
        </Link>
        <button type="button" className="navbar-logout" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  );
}
