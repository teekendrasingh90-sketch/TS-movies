import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Calendar, Play, Info, Tv, Film } from 'lucide-react';
import { MediaItem, getMediaDetails } from '../services/tmdb';

interface MoviePlayerProps {
  movie: MediaItem | null;
  onClose: () => void;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, onClose }) => {
  const [fullDetails, setFullDetails] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movie) {
      setLoading(true);
      getMediaDetails(movie.id, movie.media_type).then(details => {
        setFullDetails(details || movie);
        setLoading(false);
      });
    } else {
      setFullDetails(null);
      setIsPlaying(false);
    }
  }, [movie]);

  if (!movie) return null;

  // Use IMDB ID if available, otherwise fallback to TMDB ID
  const playerId = fullDetails?.imdb_id || movie.id;
  const embedUrl = `/proxy/player.autoembed.cc/embed/${movie.media_type}/${playerId}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl bg-[#141414] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors text-white"
          >
            <X size={24} />
          </button>

          {/* Left Side: Player or Poster */}
          <div className="w-full md:w-2/3 aspect-video md:aspect-auto bg-black relative">
            {isPlaying ? (
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                title={movie.title}
              />
            ) : (
              <div className="w-full h-full relative group">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="bg-orange-500 text-white p-6 rounded-full shadow-2xl transform transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                  >
                    <Play size={48} fill="white" className="ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Details */}
          <div className="w-full md:w-1/3 p-8 flex flex-col justify-between bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 text-orange-500">
                  <Star size={18} fill="currentColor" />
                  <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                </div>
                <span className="text-gray-500 text-sm">/ 10</span>
                <div className="ml-auto flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                  {movie.media_type === 'tv' ? <Tv size={12} className="text-orange-500" /> : <Film size={12} className="text-blue-500" />}
                  <span className="text-[10px] font-bold uppercase">{movie.media_type}</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight">{movie.title}</h2>
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                </div>
                {movie.media_type === 'movie' && fullDetails?.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{fullDetails.runtime} min</span>
                  </div>
                )}
                {movie.media_type === 'tv' && fullDetails?.number_of_seasons && (
                  <div className="flex items-center gap-1">
                    <Tv size={14} />
                    <span>{fullDetails.number_of_seasons} Seasons</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {fullDetails?.genres?.map(genre => (
                  <span key={genre.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-400 text-sm leading-relaxed line-clamp-6 mb-8">
                {movie.overview}
              </p>
            </div>

            <div className="space-y-4">
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all"
                >
                  <Play size={20} fill="currentColor" />
                  Start Watching
                </button>
              )}
              <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase tracking-widest">
                <Info size={12} />
                <span>Streaming from AutoEmbed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
