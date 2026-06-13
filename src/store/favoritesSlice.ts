// src/store/favoritesSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface FavoritesState {
  ids: string[];
}

const initialState: FavoritesState = {
  ids: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // Reducer สำหรับการเพิ่ม/ลบ หนังสือโปรด
    toggleFavorite: (state, action: PayloadAction<string | number>) => {
      const id = String(action.payload);
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((favId) => favId !== id);
      } else {
        state.ids.push(id);
      }
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.ids = action.payload;
    },
  },
});

// Export action และ reducer
export const { toggleFavorite, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;