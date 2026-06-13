// src/store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import booksReducer from "./BookSlice";
import favoritesReducer from "./favoritesSlice";
import readingListReducer from "./readingListSlice";
import { syncMiddleware } from "./syncMiddleware";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["favorites", "readingList"], // Only persist favorites and reading list
};

const rootReducer = combineReducers({
  books: booksReducer,
  favorites: favoritesReducer,
  readingList: readingListReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER", "persist/PURGE", "persist/FLUSH", "persist/PAUSE"],
      },
    }).prepend(syncMiddleware.middleware),
});

export const persistor = persistStore(store);

// Export Type สำหรับ TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;