"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export const useFetchPhoto = (url: string) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<Photo[]>(url);
        setPhotos(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [url]);

  return { photos, loading, error };
};

export default useFetchPhoto;
