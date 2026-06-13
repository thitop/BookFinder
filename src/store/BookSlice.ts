// src/store/booksSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BooksResponse, Book } from '../types/book';

type BooksState = {
  items: Book[];
  total: number;
  offset: number;
  limit: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
  q: string;
};

const initialState: BooksState = {
  items: [],
  total: 0,
  offset: 0,
  limit: 20,
  status: 'idle',
  q: 'programming', // ตั้งค่าเริ่มต้นให้แสดงหนังสือทันที
};

interface GoogleBooksItem {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    averageRating?: number;
    imageLinks?: {
      extraLarge?: string;
      large?: string;
      medium?: string;
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
}

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  publish_year?: number[];
  isbn?: string[];
  edition_key?: string[];
  lending_edition_s?: string;
  ia?: string[];
  cover_i?: number;
}

/**
 * ดึงข้อมูลหนังสือจาก Google Books API
 */
export const fetchBooks = createAsyncThunk<
  BooksResponse,
  { q: string; offset?: number; limit?: number }
>('books/fetchGoogleBooks', async ({ q, offset = 0, limit = 20 }) => {
  const startIndex = offset;
  const maxResults = limit;
  
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&startIndex=${startIndex}&maxResults=${maxResults}`;
    
    const res = await fetch(url, { method: 'GET' });
    
    if (!res.ok) {
      throw new Error(`Google Books API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    const items: Book[] = (data.items || []).map((item: GoogleBooksItem) => {
      const volumeInfo = item.volumeInfo;
      
      // ใช้รูปขนาดใหญ่สุดที่มี
      let cover = null;
      if (volumeInfo.imageLinks) {
        cover = volumeInfo.imageLinks.extraLarge ||
                volumeInfo.imageLinks.large ||
                volumeInfo.imageLinks.medium ||
                volumeInfo.imageLinks.thumbnail ||
                volumeInfo.imageLinks.smallThumbnail;
        
        // เปลี่ยนเป็น https และขอขนาดใหญ่ขึ้น
        if (cover) {
          cover = cover.replace('http:', 'https:').replace('&zoom=1', '&zoom=2');
        }
      }
      
      return {
        id: item.id,
        title: volumeInfo.title || '(No title)',
        author: volumeInfo.authors?.[0] || null,
        year: volumeInfo.publishedDate?.split('-')[0] || null,
        cover,
        rating: volumeInfo.averageRating || null,
      };
    });
    
    return {
      total: data.totalItems || 0,
      count: items.length,
      offset,
      limit,
      items,
    };
  } catch (error) {
    console.warn("Google Books API failed, falling back to Open Library:", error);
    
    // Fallback to Open Library
    const page = Math.floor(offset / limit) + 1;
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Both APIs failed`);
    }
    
    const data = await res.json();
    
    const items: Book[] = (data.docs || []).map((doc: OpenLibraryDoc) => {
      const isbn = doc.isbn?.[0];
      const olid = doc.edition_key?.[0] || doc.lending_edition_s;
      const ia = doc.ia?.[0];

      const cover = doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`
        : isbn 
          ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
          : olid
            ? `https://covers.openlibrary.org/b/olid/${olid}-L.jpg?default=false`
            : ia
              ? `https://archive.org/services/img/${ia}`
              : null;
      
      return {
        // Use ISBN or title as ID to allow BookDetail fallback to work
        id: isbn || doc.title,
        title: doc.title || '(No title)',
        author: doc.author_name?.[0] || null,
        year: doc.first_publish_year || doc.publish_year?.[0] || null,
        cover,
        rating: null,
      };
    });
    
    return {
      total: data.numFound || 0,
      count: items.length,
      offset,
      limit,
      items,
    };
  }
});

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.q = action.payload;
    },
    setPage(state, action: PayloadAction<{ offset: number; limit?: number }>) {
      state.offset = action.payload.offset;
      if (action.payload.limit) state.limit = action.payload.limit;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.offset = action.payload.offset;
        state.limit = action.payload.limit;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Fetch failed';
      });
  },
});

export const { setQuery, setPage } = booksSlice.actions;
export default booksSlice.reducer;