// src/main.tsx
import './styles/index.css';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { store, persistor } from "./store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// Import Components
import App from "./App";
import Home from "./routes/Home";
import BookDetail from "./routes/BookDetail";
import Favorites from "./routes/Favorites";
import ReadingList from "./routes/ReadingList";

// สร้าง Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "book/:id", element: <BookDetail /> },
      { path: "book/works/:id", element: <BookDetail /> }, // รองรับ works key
      { path: "favorites", element: <Favorites /> },
      { path: "reading-list", element: <ReadingList /> },
    ],
  },
]);

// Render App
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
);