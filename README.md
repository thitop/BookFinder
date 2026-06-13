# 📚 BookFinder (Bookweb)

A modern web application built with React, TypeScript, and Vite that allows users to search for books, explore detailed information, manage their favorite books, and curate a personal reading list. Powered by external Book APIs (such as Google Books / Open Library) and optionally integrated with Supabase for data syncing.

## ✨ Features

- **Search Books**: Discover new and exciting books easily.
- **Book Details**: View comprehensive details about each book.
- **Favorites**: Save the books you love into a dedicated favorites collection.
- **Reading List**: Manage books you are currently reading or planning to read.
- **State Persistence**: Your favorites and reading list are saved locally so you don't lose them when you refresh.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4 + DaisyUI (Cupcake theme)
- **State Management**: Redux Toolkit + Redux Persist
- **Routing**: React Router DOM v7
- **Data Fetching**: Axios
- **Animations & Icons**: Framer Motion + Lucide React
- **Backend/Database (Optional/Planned)**: Supabase

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bookweb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/`

## 📁 Project Structure

- `/src/components`: Reusable UI components (e.g., Navbar).
- `/src/routes`: Page components for each route (Home, BookDetail, Favorites, ReadingList).
- `/src/store`: Redux slices and store configuration (Books, Favorites, Reading List, Sync Middleware).
- `/src/styles`: Global CSS and Tailwind configuration.
- `/src/lib` & `/src/types`: Utility functions and TypeScript type definitions.

## 📝 License

This project is open-source and available under the MIT License.
