import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, RefreshCw, ExternalLink, Clock, MapPin, AlertCircle, Loader2, Calendar, Search } from 'lucide-react';
import { fetchLunchMenus, RestaurantMenu } from './services/lunchService';

export default function App() {
  const [menus, setMenus] = useState<RestaurantMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("2026-03-05");

  const loadMenus = async (dateOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const dateToFetch = new Date(dateOverride || selectedDate);
      const data = await fetchLunchMenus(dateToFetch);
      setMenus(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Lounaslistojen haku epäonnistui. Yritä hetken kuluttua uudelleen.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const today = new Date(selectedDate);
  const formattedDate = today.toLocaleDateString('fi-FI', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
              <Utensils size={22} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Vaasa Lounas</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} /> {formattedDate}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all w-full"
              />
            </div>
            <button 
              onClick={() => loadMenus()}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              <span className="hidden sm:inline">Hae lounas</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative">
                <Loader2 size={48} className="text-emerald-600 animate-spin" />
                <div className="absolute inset-0 blur-xl bg-emerald-400/20 animate-pulse rounded-full" />
              </div>
              <h2 className="mt-6 text-lg font-medium">Haetaan päivän makuja...</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xs">
                Käymme läpi ravintoloiden sivuja ja poimimme sinulle parhaat palat.
              </p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-lg mx-auto"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-red-900 font-semibold text-lg">Hups! Jotain meni vikaan</h2>
              <p className="text-red-700 mt-2 text-sm">{error}</p>
              <button 
                onClick={loadMenus}
                className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Yritä uudelleen
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {menus.map((menu, idx) => (
                <motion.div
                  key={menu.restaurantName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold leading-tight group-hover:text-emerald-700 transition-colors">
                        {menu.restaurantName}
                      </h3>
                      {menu.price && (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                          {menu.price}
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {menu.items.length > 0 ? (
                        menu.items.map((item, i) => (
                          <div key={i} className="relative pl-4 border-l-2 border-emerald-100 group-hover:border-emerald-200 transition-colors">
                            <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">Ei lounastietoja saatavilla tälle päivälle.</p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50/50 border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <MapPin size={10} /> Vaasa
                    </div>
                    <a 
                      href={menu.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-xs font-semibold"
                    >
                      Sivustolle <ExternalLink size={12} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !error && (
          <footer className="mt-12 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Viimeksi päivitetty: {lastUpdated?.toLocaleTimeString('fi-FI')} • Tiedot haettu tekoälyllä ravintoloiden sivuilta
            </p>
          </footer>
        )}
      </main>
    </div>
  );
}

