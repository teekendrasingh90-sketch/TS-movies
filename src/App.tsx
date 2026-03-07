import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Plus, 
  Info, 
  X, 
  Search, 
  Bell, 
  User, 
  ChevronRight, 
  ChevronLeft,
  LayoutGrid,
  ExternalLink,
  Trash2,
  Monitor
} from 'lucide-react';

interface Item {
  id: number;
  title: string;
  url: string;
  thumbnail: string;
  type: 'movie' | 'app';
  category: string;
  imdbId?: string;
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', url: '', thumbnail: '', type: 'movie' as const, category: 'Logistiek' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [indianMovies, setIndianMovies] = useState<any[]>([]);
  const [movieboxItems, setMovieboxItems] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [activeServer, setActiveServer] = useState('vidsrc.to');
  const [viewMode, setViewMode] = useState<'portal' | 'browser'>('browser');
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(true);

  const BROWSER_URL = "https://streamex.sh";

  const movieServers = [
    { name: 'Server 1', host: 'vidsrc.to' },
    { name: 'Server 2', host: 'vidsrc.me' },
    { name: 'Server 3', host: 'vidsrc.xyz' },
    { name: 'Server 4', host: 'embed.su' }
  ];

  useEffect(() => {
    const init = async () => {
      setIsPortalLoading(true);
      // Run fetches independently for faster perceived loading
      fetchItems().then(() => {
        const savedRecents = localStorage.getItem('recentItems');
        if (savedRecents) {
          setRecentItems(JSON.parse(savedRecents));
        }
      });
      
      fetchIndianMovies();
      fetchMovieboxItems();
      
      // We set loading to false after a short delay or when primary items are ready
      setTimeout(() => setIsPortalLoading(false), 800);
    };
    init();
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToRecent = (item: Item) => {
    setRecentItems(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 10);
      localStorage.setItem('recentItems', JSON.stringify(updated));
      return updated;
    });
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=d11aee10`);
      const data = await res.json();
      if (data.Search) {
        setSearchResults(data.Search);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setIsSearching(true);
    }
  };

  const fetchMovieboxItems = async () => {
    // Simulating Moviebox API integration by fetching some trending titles
    const titles = ["Avatar: The Way of Water", "Merlin", "The Boys", "Stranger Things", "Wednesday"];
    try {
      const moviePromises = titles.map(title => 
        fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=d11aee10`).then(res => res.json())
      );
      const results = await Promise.all(moviePromises);
      setMovieboxItems(results.filter(m => m.Response === "True"));
    } catch (error) {
      console.error("Error fetching Moviebox items:", error);
    }
  };

  const fetchIndianMovies = async () => {
    const titles = ["RRR", "Pushpa: The Rise", "Pathaan", "Jawan", "Animal", "Kalki 2898 AD", "Salaar", "Brahmastra", "Leo", "Jailer"];
    try {
      const moviePromises = titles.map(title => 
        fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=d11aee10`).then(res => res.json())
      );
      const results = await Promise.all(moviePromises);
      // Filter for valid movies from 2021-2026
      const filtered = results.filter(m => 
        m.Response === "True" && 
        parseInt(m.Year) >= 2021 && 
        parseInt(m.Year) <= 2026
      );
      setIndianMovies(filtered);
    } catch (error) {
      console.error("Error fetching Indian movies:", error);
    }
  };

  const fetchItems = async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    setNewItem({ title: '', url: '', thumbnail: '', type: 'movie', category: 'Logistiek' });
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#333] font-sans selection:bg-[#004a99] selection:text-white overflow-x-hidden">
      {/* Browser View (Always in DOM but conditionally visible) */}
      <div className={`fixed inset-0 z-[60] bg-white flex flex-col overflow-hidden transition-transform duration-500 ${viewMode === 'browser' ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Hidden Toggle for Admin/Portal - subtle interaction at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 z-50 hover:h-12 group transition-all duration-300 flex items-center justify-center overflow-hidden">
          <div className="bg-[#004a99]/90 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-6">
            <button 
              onClick={() => setViewMode('portal')}
              className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white/80"
            >
              <LayoutGrid className="w-4 h-4" /> Portal
            </button>
            <div className="w-px h-4 bg-white/20" />
            <button 
              onClick={() => window.location.reload()}
              className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white/80"
            >
              <Monitor className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
        
        {/* Loading Spinner */}
        {isIframeLoading && (
          <div className="absolute inset-0 z-40 bg-white flex flex-col items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-[#004a99] border-t-transparent rounded-full mb-4"
            />
            <p className="text-[#004a99] font-bold animate-pulse">Loading Application...</p>
          </div>
        )}

        {/* Full Screen Application Content */}
        <div className="flex-1 w-full h-full">
          <iframe 
            src={BROWSER_URL}
            className={`w-full h-full border-none bg-white transition-opacity duration-500 ${isIframeLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsIframeLoading(false)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="flex items-center gap-8">
          <h1 className="text-[#004a99] text-3xl font-black tracking-tighter uppercase italic">Movies</h1>
          <div className="hidden md:flex gap-5 text-sm font-bold text-gray-600">
            <button className="hover:text-[#004a99] transition-colors">Home</button>
            <button className="hover:text-[#004a99] transition-colors">Movies</button>
            <button className="hover:text-[#004a99] transition-colors">TV Shows</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center">
            <AnimatePresence>
              {showSearchOverlay && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  autoFocus
                  placeholder="Titles, people, genres"
                  className="bg-black/80 border border-white/20 rounded-sm pl-9 pr-8 py-1.5 text-sm focus:outline-none focus:border-white transition-all w-full"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                />
              )}
            </AnimatePresence>
            <Search 
              className={`w-5 h-5 cursor-pointer hover:text-gray-400 absolute left-2.5 transition-all ${showSearchOverlay ? 'text-white' : 'text-gray-300'}`} 
              onClick={() => {
                setShowSearchOverlay(!showSearchOverlay);
                if (showSearchOverlay) {
                  setSearchQuery('');
                  setSearchResults([]);
                }
              }}
            />
            {showSearchOverlay && (searchQuery || isSearching) && (
              <div className="absolute right-2.5 flex items-center gap-2">
                {isSearching && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full"
                  />
                )}
                {searchQuery && (
                  <button 
                    onClick={() => {setSearchQuery(''); setSearchResults([]);}}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-400" />
          <div className="relative group">
            <div className="w-8 h-8 bg-[#004a99] rounded cursor-pointer flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]">
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => setViewMode('browser')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" /> App View
                </button>
                <button 
                  onClick={() => setShowAdmin(!showAdmin)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4" /> Admin Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <AnimatePresence>
          {showSearchOverlay && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 z-40 bg-[#141414]/95 backdrop-blur-md pt-24 px-4 md:px-12 overflow-y-auto pb-20"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">
                    {searchQuery ? `Results for "${searchQuery}"` : "Start typing to search..."}
                  </h2>
                  {isSearching && <span className="text-red-600 text-sm font-medium animate-pulse">Searching...</span>}
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {searchResults.map((movie) => (
                      <motion.div 
                        key={movie.imdbID}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -10 }}
                        className="relative group"
                      >
                        <div 
                          className="aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-lg border border-white/5"
                          onClick={() => {
                            const item: Item = {
                              id: Math.random(),
                              title: movie.Title,
                              url: `https://vidsrc.to/embed/movie/${movie.imdbID}`,
                              thumbnail: movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/movie/400/600',
                              type: 'movie',
                              category: 'Search Result',
                              imdbId: movie.imdbID
                            };
                            setSelectedItem(item);
                            addToRecent(item);
                          }}
                        >
                          <img 
                            src={movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/movie/400/600'} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            alt={movie.Title}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                          
                          <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewItem({
                                  title: movie.Title,
                                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + ' trailer')}`,
                                  thumbnail: movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/movie/400/600',
                                  type: 'movie',
                                  category: 'Added from Search'
                                });
                                setShowAdmin(true);
                              }}
                              className="mb-3 w-full bg-white text-black text-xs font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add to Platform
                            </button>
                            <p className="font-bold text-sm leading-tight">{movie.Title}</p>
                            <p className="text-xs text-gray-400 mt-1">{movie.Year} • {movie.Type}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery.length > 2 && !isSearching ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Search className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-xl">No results found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try searching for something else or check your spelling.</p>
                  </div>
                ) : !searchQuery && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40">
                    {[1,2,3].map(i => (
                      <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <img 
          src="https://picsum.photos/seed/office/1920/1080" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        
        <div className="absolute bottom-1/4 left-4 md:left-12 max-w-xl space-y-6">
          <h2 className="text-5xl md:text-7xl font-bold drop-shadow-2xl text-white">Stream de nieuwste films</h2>
          <p className="text-lg md:text-xl text-white drop-shadow-md">
            Bekijk de nieuwste blockbusters, series en documentaires in de hoogste kwaliteit. Start vandaag nog met streamen.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setViewMode('browser')}
              className="flex items-center gap-2 bg-[#004a99] text-white px-8 py-3 rounded font-bold hover:bg-[#003d7a] transition-colors shadow-lg"
            >
              <Search className="w-5 h-5" /> Bekijk Alles
            </button>
            <button className="flex items-center gap-2 bg-white/20 text-white px-8 py-3 rounded font-bold hover:bg-white/30 transition-colors backdrop-blur-md border border-white/30">
              <Info className="w-5 h-5" /> Meer Info
            </button>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="relative z-10 -mt-32 pb-20 px-4 md:px-12 space-y-12">
        {isPortalLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-8 w-48 bg-gray-300/20 rounded animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3, 4, 5, 6].map(j => (
                    <div key={j} className="flex-none w-40 md:w-56 aspect-[2/3] bg-gray-300/10 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Continue Watching Row */}
            {recentItems.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {recentItems.map(item => (
                <motion.div 
                  key={`recent-${item.id}`}
                  whileHover={{ scale: 1.05, zIndex: 20 }}
                  className="relative flex-none w-64 md:w-72 aspect-video rounded-md overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setSelectedItem(item);
                    addToRecent(item);
                  }}
                >
                  <img 
                    src={item.thumbnail || `https://picsum.photos/seed/${item.id}/400/225`} 
                    className="w-full h-full object-cover"
                    alt={item.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="p-2 bg-white rounded-full text-black">
                          <Play className="w-4 h-4 fill-black" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-xs text-green-500 font-semibold">Resume <span className="text-gray-400 border border-gray-400 px-1 ml-2 uppercase">{item.type}</span></p>
                    </div>
                  </div>
                  {/* Progress bar simulation */}
                  <div className="absolute bottom-0 left-0 h-1 bg-red-600" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }} />
                </motion.div>
              ))}
            </div>
        )}

        {/* Moviebox Integration Row */}
        {movieboxItems.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Aanbevolen Vacatures <ChevronRight className="w-5 h-5 text-gray-500" />
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {movieboxItems.map(movie => (
                <motion.div 
                  key={`moviebox-${movie.imdbID}`}
                  whileHover={{ scale: 1.05, zIndex: 20 }}
                  className="relative flex-none w-64 md:w-72 aspect-video rounded-md overflow-hidden cursor-pointer group"
                  onClick={() => {
                    const item: Item = {
                      id: Math.random(),
                      title: movie.Title,
                      url: `https://vidsrc.to/embed/movie/${movie.imdbID}`,
                      thumbnail: movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/moviebox/400/225',
                      type: 'movie',
                      category: 'Moviebox',
                      imdbId: movie.imdbID
                    };
                    setSelectedItem(item);
                    addToRecent(item);
                  }}
                >
                  <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/moviebox/400/225'} 
                    className="w-full h-full object-cover"
                    alt={movie.Title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="p-2 bg-white rounded-full text-black">
                          <Play className="w-4 h-4 fill-black" />
                        </div>
                        <div className="px-2 py-1 bg-red-600 text-[10px] font-bold rounded uppercase">Moviebox</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-bold">{movie.Title}</p>
                      <p className="text-xs text-gray-400">Stream via h5.aoneroom.com</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Indian Blockbusters Row */}
        {indianMovies.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Nieuwe Kansen <ChevronRight className="w-5 h-5 text-gray-500" />
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {indianMovies.map(movie => (
                <motion.div 
                  key={movie.imdbID}
                  whileHover={{ scale: 1.05, zIndex: 20 }}
                  className="relative flex-none w-64 md:w-72 aspect-video rounded-md overflow-hidden cursor-pointer group"
                  onClick={() => {
                    const item: Item = {
                      id: Math.random(),
                      title: movie.Title,
                      url: `https://vidsrc.to/embed/movie/${movie.imdbID}`,
                      thumbnail: movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/movie/400/225',
                      type: 'movie',
                      category: 'Indian Cinema',
                      imdbId: movie.imdbID
                    };
                    setSelectedItem(item);
                    addToRecent(item);
                  }}
                >
                  <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/movie/400/225'} 
                    className="w-full h-full object-cover"
                    alt={movie.Title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="p-2 bg-white rounded-full text-black">
                          <Play className="w-4 h-4 fill-black" />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewItem({
                              title: movie.Title,
                              url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.Title + ' trailer')}`,
                              thumbnail: movie.Poster !== 'N/A' ? movie.Poster : 'https://picsum.photos/seed/movie/400/225',
                              type: 'movie',
                              category: 'Indian Cinema'
                            });
                            setShowAdmin(true);
                          }}
                          className="p-2 border border-gray-400 rounded-full text-white hover:border-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-bold">{movie.Title}</p>
                      <p className="text-xs text-green-500 font-semibold">99% Match <span className="text-gray-400 border border-gray-400 px-1 ml-2 uppercase">{movie.Year}</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {category} <ChevronRight className="w-5 h-5 text-gray-500" />
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {items.filter(i => i.category === category).map(item => (
                <motion.div 
                  key={item.id}
                  whileHover={{ scale: 1.05, zIndex: 20 }}
                  className="relative flex-none w-64 md:w-72 aspect-video rounded-md overflow-hidden cursor-pointer group"
                  onClick={() => {
                    setSelectedItem(item);
                    addToRecent(item);
                  }}
                >
                  <img 
                    src={item.thumbnail || `https://picsum.photos/seed/${item.id}/400/225`} 
                    className="w-full h-full object-cover"
                    alt={item.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="p-2 bg-white rounded-full text-black">
                          <Play className="w-4 h-4 fill-black" />
                        </div>
                        <div className="p-2 border border-gray-400 rounded-full text-white hover:border-white">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="p-2 border border-gray-400 rounded-full text-white hover:border-white">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-xs text-green-500 font-semibold">98% Match <span className="text-gray-400 border border-gray-400 px-1 ml-2 uppercase">{item.type}</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
          </>
        )}
      </div>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#181818] w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#202020]">
                <h2 className="text-2xl font-bold flex items-center gap-2"><LayoutGrid className="text-red-600" /> Manage Platform</h2>
                <button onClick={() => setShowAdmin(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 font-bold">Title</label>
                    <input 
                      required
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      placeholder="e.g. Inception"
                      value={newItem.title}
                      onChange={e => setNewItem({...newItem, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 font-bold">Category</label>
                    <input 
                      required
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      placeholder="e.g. Sci-Fi"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase text-gray-500 font-bold">URL (Movie or App)</label>
                    <input 
                      required
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      placeholder="https://..."
                      value={newItem.url}
                      onChange={e => setNewItem({...newItem, url: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs uppercase text-gray-500 font-bold">Thumbnail URL</label>
                    <input 
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      placeholder="https://..."
                      value={newItem.thumbnail}
                      onChange={e => setNewItem({...newItem, thumbnail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 font-bold">Type</label>
                    <select 
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-red-600"
                      value={newItem.type}
                      onChange={e => setNewItem({...newItem, type: e.target.value as 'movie' | 'app'})}
                    >
                      <option value="movie">Movie</option>
                      <option value="app">Application</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition-colors">
                      Add to Platform
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-l-4 border-red-600 pl-3">Existing Items</h3>
                  <div className="grid gap-2">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-white/5 p-3 rounded hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-4">
                          <img src={item.thumbnail} className="w-16 aspect-video object-cover rounded" alt="" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-sm">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.category} • {item.type}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Browser/Player Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
          >
            {/* Browser Header with "Ads" */}
            <div className="h-14 bg-[#181818] border-b border-white/10 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
                  {selectedItem.type === 'movie' ? <Play className="w-4 h-4 text-red-600" /> : <Monitor className="w-4 h-4 text-blue-600" />}
                  <span className="text-sm font-medium truncate max-w-[200px]">{selectedItem.title}</span>
                </div>
              </div>

              {/* Simulated Ad Space */}
              <div className="hidden md:flex items-center gap-4 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1 rounded animate-pulse">
                <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-widest">Sponsored</span>
                <p className="text-xs text-yellow-200/80">Premium Ad: Get 50% off on Premium today!</p>
                <ExternalLink className="w-3 h-3 text-yellow-500" />
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-xs text-gray-500 font-mono">
                  {selectedItem.url.substring(0, 40)}...
                </div>
                <button className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-red-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>

            <div className="flex-1 flex relative overflow-hidden">
              {/* Main Content (Iframe or Video Player) */}
              <div className="flex-1 bg-black relative flex flex-col">
                {/* Server Switcher for Movies */}
                {selectedItem.type === 'movie' && selectedItem.imdbId && (
                  <div className="bg-[#111] p-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5">
                    {movieServers.map(server => (
                      <button
                        key={server.host}
                        onClick={() => setActiveServer(server.host)}
                        className={`flex-none px-4 py-1 rounded-full text-[10px] font-bold transition-colors ${activeServer === server.host ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        {server.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 relative">
                  {selectedItem.url.endsWith('.mp4') || selectedItem.url.endsWith('.mkv') ? (
                    <video 
                      src={selectedItem.url} 
                      controls 
                      autoPlay 
                      className="w-full h-full"
                    />
                  ) : (
                    <iframe 
                      key={`${selectedItem.id}-${activeServer}`}
                      src={selectedItem.type === 'movie' && selectedItem.imdbId 
                        ? `https://${activeServer}/embed/movie/${selectedItem.imdbId}` 
                        : selectedItem.url
                      }
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {/* Fallback for blocked iframes */}
                  <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                    <button 
                      onClick={() => window.open(selectedItem.type === 'movie' && selectedItem.imdbId ? `https://${activeServer}/embed/movie/${selectedItem.imdbId}` : selectedItem.url, '_blank')}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> External Player
                    </button>
                    <button 
                      onClick={() => {
                        const current = selectedItem;
                        setSelectedItem(null);
                        setTimeout(() => setSelectedItem(current), 100);
                      }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
                    >
                      Refresh Player
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Ad Space */}
              <div className="hidden lg:flex w-64 bg-[#111] border-l border-white/10 flex-col p-4 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Advertisement</span>
                  <div className="aspect-[3/4] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-4 flex flex-col justify-between">
                    <h4 className="font-bold text-lg">Upgrade to Pro</h4>
                    <p className="text-xs text-white/70">Ad-free experience, 4K streaming, and early access to new apps.</p>
                    <button className="w-full bg-white text-black text-xs font-bold py-2 rounded">Learn More</button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Trending Now</span>
                  <div className="space-y-3">
                    {items.slice(0, 3).map(i => (
                      <div key={i.id} className="flex gap-3 items-center group cursor-pointer" onClick={() => setSelectedItem(i)}>
                        <img src={i.thumbnail} className="w-16 aspect-video object-cover rounded border border-white/10 group-hover:border-red-600 transition-colors" alt="" referrerPolicy="no-referrer" />
                        <p className="text-xs font-medium line-clamp-2 group-hover:text-red-500 transition-colors">{i.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="px-4 md:px-12 py-20 bg-[#141414] border-t border-white/5 text-gray-500 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <p className="hover:underline cursor-pointer">Audio Description</p>
            <p className="hover:underline cursor-pointer">Investor Relations</p>
            <p className="hover:underline cursor-pointer">Legal Notices</p>
          </div>
          <div className="space-y-4">
            <p className="hover:underline cursor-pointer">Help Center</p>
            <p className="hover:underline cursor-pointer">Jobs</p>
            <p className="hover:underline cursor-pointer">Cookie Preferences</p>
          </div>
          <div className="space-y-4">
            <p className="hover:underline cursor-pointer">Gift Cards</p>
            <p className="hover:underline cursor-pointer">Terms of Use</p>
            <p className="hover:underline cursor-pointer">Corporate Information</p>
          </div>
          <div className="space-y-4">
            <p className="hover:underline cursor-pointer">Media Center</p>
            <p className="hover:underline cursor-pointer">Privacy</p>
            <p className="hover:underline cursor-pointer">Contact Us</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button className="border border-gray-500 px-2 py-1 w-fit hover:text-white transition-colors">Service Code</button>
          <p>© 1997-2026 Movies Platform, Inc.</p>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
