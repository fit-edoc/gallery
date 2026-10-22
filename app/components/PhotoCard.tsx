

import Image from "next/image";
import { Heart } from "../icons/Hear";

export interface PhotoCardProps {
  id: string;
  author: string;
  width?: number;
  height?: number;
  download_url: string;
  loading?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const PhotoCard = ({
  id,
  author,
  download_url,
  loading = false,
  isFavorite = false,
  onToggleFavorite,
}: PhotoCardProps) => {
  if (loading) {
    return (
      <div className="w-full h-80 bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col animate-pulse">
        <div className="w-full h-52 bg-gray-200" />
        <div className="flex-1 p-4 flex justify-between items-center">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative w-full h-80 bg-white flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative w-full h-52 overflow-hidden bg-gray-100">
        <Image
          src={download_url}
          alt={author || "Photo"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="flex-1 p-4 flex justify-between items-center">
        <div className="pr-2 min-w-0">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Photographer</p>
          <p className="text-gray-900 font-semibold truncate text-sm" title={author}>
            {author}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`h-10 w-10 flex-shrink-0 flex justify-center items-center rounded-full transition-colors cursor-pointer ${
            isFavorite
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Heart filled={isFavorite} />
        </button>
      </div>
    </div>
  );
};