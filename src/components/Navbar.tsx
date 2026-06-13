import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun, User, LogOut } from "lucide-react";
import AuthModal from "./AuthModal";
import { supabase } from "../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useDispatch } from "react-redux";
import { setFavorites } from "../store/favoritesSlice";
import { setReadingList } from "../store/readingListSlice";
import { setQuery, setPage } from "../store/BookSlice";

export default function Navbar() {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch favorites
      supabase.from("favorites").select("book_id").eq("user_id", user.id)
        .then(({ data }) => {
          if (data) {
            dispatch(setFavorites(data.map(d => d.book_id)));
          }
        });
      
      // Fetch reading list
      supabase.from("reading_list").select("book_data, status, created_at").eq("user_id", user.id)
        .then(({ data }) => {
          if (data) {
            const items = data.map(d => ({
              book: d.book_data,
              status: d.status,
              addedAt: d.created_at,
            }));
            dispatch(setReadingList(items));
          }
        });
    }
  }, [user, dispatch]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleHomeClick = () => {
    dispatch(setQuery("programming"));
    dispatch(setPage({ offset: 0, limit: 20 }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl" onClick={handleHomeClick}>
          📚 BookFinder
        </Link>
      </div>

      <div className="flex-none gap-2">
        <NavLink
          to="/"
          onClick={handleHomeClick}
          className={({ isActive }) =>
            `btn btn-ghost ${isActive ? "btn-active" : ""}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/reading-list"
          className={({ isActive }) =>
            `btn btn-ghost ${isActive ? "btn-active" : ""}`
          }
        >
          Reading List
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `btn btn-ghost ${isActive ? "btn-active" : ""}`
          }
        >
          Favorites
        </NavLink>

        {/* ปุ่ม Login / Logout */}
        {user ? (
          <button
            className="btn btn-ghost gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        ) : (
          <button
            className="btn btn-primary gap-2"
            onClick={() => setIsAuthModalOpen(true)}
          >
            <User className="w-5 h-5" /> Login
          </button>
        )}

        {/* ปุ่มสลับธีม */}
        <button
          className="btn btn-ghost"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
