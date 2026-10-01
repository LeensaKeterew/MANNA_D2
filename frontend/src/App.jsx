import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import CreatePostPage from "./pages/CreatePostPage";
import ProfilePage from "./pages/ProfilePage";
import AlbumDetailPage from "./pages/AlbumDetailPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";

// Session state comes from the server (/api/auth/me), never from localStorage.
function RequireAuth({ admin = false, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-status">Loading&hellip;</div>;
  if (!user) return <Navigate to="/" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/post/:id" element={<RequireAuth><PostDetailPage /></RequireAuth>} />
          <Route path="/create" element={<RequireAuth><CreatePostPage /></RequireAuth>} />
          <Route path="/profile/:id" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/album/:id" element={<RequireAuth><AlbumDetailPage /></RequireAuth>} />
          <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
