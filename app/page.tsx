"use client";

import Image from "next/image";
import { useFetchPhoto } from "./hooks/useFetchPhoto";
import { PhotoCard } from "./components/PhotoCard";
import { Heart } from "./icons/Hear";
import { useMemo, useState, useReducer, useEffect } from "react";

// Types for Favorites State & Reducer
interface FavoriteState {
  favorites: string[];
}

type FavoriteAction =
  | { type: "INIT_FAVORITES"; payload: string[] }
  | { type: "TOGGLE_FAVORITE"; payload: string };

const FAVORITES_STORAGE_KEY = "celebrate_favorites";

const favoriteReducer = (state: FavoriteState, action: FavoriteAction): FavoriteState => {
  switch (action.type) {
    case "INIT_FAVORITES":
      return { ...state, favorites: action.payload };
    case "TOGGLE_FAVORITE": {
      const isFav = state.favorites.includes(action.payload);
      const updatedFavorites = isFav
        ? state.favorites.filter((id) => id !== action.payload)
        : [...state.favorites, action.payload];

      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      } catch (err) {
        console.error("Failed to save favorites to localStorage:", err);
      }

      return { ...state, favorites: updatedFavorites };
    }
    default:
      return state;
  }
};

export default function Home() {
  const { photos, loading, error } = useFetchPhoto("https://picsum.photos/v2/list?limit=30");
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // useReducer for Favorites
  const [favoriteState, dispatch] = useReducer(favoriteReducer, { favorites: [] });

  // Hydrate favorites from localStorage on mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "INIT_FAVORITES", payload: parsed });
        }
      }
    } catch (err) {
      console.error("Failed to load favorites from localStorage:", err);
    }
  }, []);

  // Filter photos by search query and favorite status
  const filteredPhotos = useMemo(() => {
    let result = photos;

    if (showFavoritesOnly) {
      result = result.filter((p) => favoriteState.favorites.includes(p.id));
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((p) => p.author.toLowerCase().includes(query));
    }

    return result;
  }, [photos, search, showFavoritesOnly, favoriteState.favorites]);

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/celebrare-logo.webp"
              alt="Celebrare Logo"
              width={120}
              height={40}
              priority
              className="h-10 w-auto object-contain rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72 md:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-4 pr-10 bg-gray-50 border border-gray-300 rounded-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:bg-white transition-all"
                placeholder="Search by author..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-200 rounded-full h-4 w-4 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Favorite Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3.5 h-10 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
                showFavoritesOnly
                  ? "bg-red-500 text-white border-red-500 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Heart filled={showFavoritesOnly} className={showFavoritesOnly ? "text-white" : "text-gray-600"} />
              <span>Favorites ({favoriteState.favorites.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <strong>Error loading photos:</strong> {error}
          </div>
        )}

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <PhotoCard
                  key={`skeleton-${idx}`}
                  id={`skeleton-${idx}`}
                  author=""
                  download_url=""
                  loading={true}
                />
              ))
            : filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  {...photo}
                  isFavorite={favoriteState.favorites.includes(photo.id)}
                  onToggleFavorite={() =>
                    dispatch({ type: "TOGGLE_FAVORITE", payload: photo.id })
                  }
                />
              ))}
        </div>

        {/* Empty States */}
        {!loading && filteredPhotos.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {showFavoritesOnly ? "No favorite photos yet" : "No photos found"}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {showFavoritesOnly
                ? "Click the heart button on any photo card to save it to your favorites."
                : `No photographers found matching "${search}". Try another search term.`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

