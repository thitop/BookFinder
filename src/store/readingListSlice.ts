// src/store/readingListSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Book } from "../types/book";

export type ReadingStatus = "want-to-read" | "reading" | "finished";

export type ReadingItem = {
  book: Book;
  status: ReadingStatus;
  addedAt: string;
  progress?: number;
  notes?: string;
};

interface ReadingListState {
  items: ReadingItem[];
}

const initialState: ReadingListState = {
  items: [],
};

const readingListSlice = createSlice({
  name: "readingList",
  initialState,
  reducers: {
    addToReadingList: (
      state,
      action: PayloadAction<{ book: Book; status: ReadingStatus }>
    ) => {
      const { book, status } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.book.id === book.id
      );

      if (existingIndex !== -1) {
        state.items[existingIndex].status = status;
      } else {
        state.items.push({
          book,
          status,
          addedAt: new Date().toISOString(),
          progress: status === "reading" ? 0 : undefined,
        });
      }
    },

    removeFromReadingList: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.book.id !== action.payload
      );
    },

    updateProgress: (
      state,
      action: PayloadAction<{ bookId: string; progress: number }>
    ) => {
      const item = state.items.find(
        (i) => i.book.id === action.payload.bookId
      );
      if (item) {
        item.progress = action.payload.progress;
      }
    },

    updateNotes: (
      state,
      action: PayloadAction<{ bookId: string; notes: string }>
    ) => {
      const item = state.items.find(
        (i) => i.book.id === action.payload.bookId
      );
      if (item) {
        item.notes = action.payload.notes;
      }
    },

    updateStatus: (
      state,
      action: PayloadAction<{ bookId: string; status: ReadingStatus }>
    ) => {
      const item = state.items.find(
        (i) => i.book.id === action.payload.bookId
      );
      if (item) {
        item.status = action.payload.status;
        if (action.payload.status === "finished") {
          item.progress = 100;
        }
      }
    },
    setReadingList: (state, action: PayloadAction<ReadingItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToReadingList,
  removeFromReadingList,
  updateProgress,
  updateNotes,
  updateStatus,
  setReadingList,
} = readingListSlice.actions;

export default readingListSlice.reducer;