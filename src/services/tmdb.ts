import axios from 'axios';

const TMDB_API_KEY = (import.meta as any).env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export interface MediaItem {
  id: number;
  imdb_id?: string;
  title: string; // Normalized from title or name
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string; // Normalized from release_date or first_air_date
  vote_average: number;
  genres?: { id: number; name: string }[];
  runtime?: number;
  media_type: 'movie' | 'tv';
  number_of_seasons?: number;
  number_of_episodes?: number;
}

const normalizeMedia = (item: any, type?: 'movie' | 'tv'): MediaItem => ({
  ...item,
  title: item.title || item.name,
  release_date: item.release_date || item.first_air_date,
  media_type: item.media_type || type || (item.title ? 'movie' : 'tv'),
});

export const getTrending = async (type: 'all' | 'movie' | 'tv' = 'all'): Promise<MediaItem[]> => {
  try {
    const response = await tmdb.get(`/trending/${type}/week`);
    return response.data.results.map((item: any) => normalizeMedia(item));
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const getMediaDetails = async (id: number, type: 'movie' | 'tv'): Promise<MediaItem | null> => {
  try {
    const response = await tmdb.get(`/${type}/${id}`, {
      params: { append_to_response: 'external_ids' }
    });
    const data = response.data;
    return normalizeMedia({
      ...data,
      imdb_id: data.external_ids?.imdb_id
    }, type);
  } catch (error) {
    console.error('Error fetching media details:', error);
    return null;
  }
};

export const searchMedia = async (query: string): Promise<MediaItem[]> => {
  try {
    const response = await tmdb.get('/search/multi', {
      params: { query },
    });
    return response.data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => normalizeMedia(item));
  } catch (error) {
    console.error('Error searching media:', error);
    return [];
  }
};

export const getImageUrl = (path: string) => path ? `${IMAGE_BASE_URL}${path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
