// src/App.tsx
import React, { useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";

export default function App() {
  const location = useLocation();
  const element = useOutlet();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div data-theme="cupcake" className="min-h-screen bg-base-200">
      <Navbar />

      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {element && React.cloneElement(element, { key: location.pathname })}
        </AnimatePresence>
      </main>

      <footer className="footer footer-center p-6 bg-white border-t border-gray-200 text-gray-700 mt-10">
        <aside>
          <p className="font-bold text-lg text-gray-900">
            © {new Date().getFullYear()} BookFinder — Powered by Google Books API
          </p>
        </aside>
      </footer>
    </div>
  );
}