import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { supabase } from "../lib/supabase";
import { toggleFavorite } from "./favoritesSlice";
import { addToReadingList, removeFromReadingList, updateStatus } from "./readingListSlice";
import type { RootState } from "./store";

export const syncMiddleware = createListenerMiddleware();

// Helper to check if user is logged in
const getUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user;
};

// Sync Favorites
syncMiddleware.startListening({
  actionCreator: toggleFavorite,
  effect: async (action, listenerApi) => {
    const user = await getUser();
    if (!user) return;

    const bookId = String(action.payload);
    const state = listenerApi.getState() as RootState;
    const isFavorite = state.favorites.ids.includes(bookId);

    if (isFavorite) {
      // Added
      const { error } = await supabase.from("favorites").upsert({
        user_id: user.id,
        book_id: bookId,
      }, { onConflict: "user_id,book_id" });
      if (error) console.error("Supabase favorites upsert error:", error);
    } else {
      // Removed
      const { error } = await supabase.from("favorites").delete().match({
        user_id: user.id,
        book_id: bookId,
      });
      if (error) console.error("Supabase favorites delete error:", error);
    }
  },
});

// Sync Reading List - Add or Update
syncMiddleware.startListening({
  matcher: isAnyOf(addToReadingList, updateStatus),
  effect: async (action, listenerApi) => {
    const user = await getUser();
    if (!user) return;

    let bookId: string;
    if (addToReadingList.match(action)) {
      bookId = action.payload.book.id as string;
    } else {
      bookId = (action.payload as { bookId: string }).bookId;
    }

    const state = listenerApi.getState() as RootState;
    const item = state.readingList.items.find((i) => i.book.id === bookId);

    if (item) {
      const { error } = await supabase.from("reading_list").upsert({
        user_id: user.id,
        book_id: bookId,
        status: item.status,
        book_data: item.book,
      }, { onConflict: "user_id,book_id" });
      if (error) console.error("Supabase reading_list upsert error:", error);
    }
  },
});

// Sync Reading List - Remove
syncMiddleware.startListening({
  actionCreator: removeFromReadingList,
  effect: async (action) => {
    const user = await getUser();
    if (!user) return;

    const bookId = String(action.payload);
    const { error } = await supabase.from("reading_list").delete().match({
      user_id: user.id,
      book_id: bookId,
    });
    if (error) console.error("Supabase reading_list delete error:", error);
  },
});
