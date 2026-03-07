import React from 'react';
import { motion } from 'framer-motion';
import { Star, Play, Tv, Film } from 'lucide-react';
import { MediaItem, getImageUrl } from '../services/tmdb';

interface MovieCardProps {
  movie: MediaItem;
  onClick: (movie: MediaItem) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="relative group cursor-pointer"
      onClick={() => onClick(movie)}
    >
      <div className="aspect-[2/3] overflow-hidden rounded-xl shadow-2xl relative">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Media Type Tag */}
        <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
          {movie.media_type === 'tv' ? <Tv size={12} className="text-orange-500" /> : <Film size={12} className="text-blue-500" />}
          <span className="text-[10px] font-bold uppercase tracking-tighter">{movie.media_type}</span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex items-center gap-1 text-yellow-400 mb-1">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
          </div>
          <h3 className="text-sm font-bold line-clamp-2 leading-tight">{movie.title}</h3>
          <p className="text-[10px] text-gray-300 mt-1">{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <Play size={24} fill="white" className="text-white ml-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
