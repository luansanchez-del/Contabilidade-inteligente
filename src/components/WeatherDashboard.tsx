import { useState, useEffect } from 'react';
import { weatherService, WeatherData, LocationCoords } from '../services/weatherService';
import { Cloud, Droplets, Wind, Eye, Sun, Sunrise, Sunset, AlertCircle, Loader, Search, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export const WeatherDashboard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<LocationCoords[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load default location on mount
  useEffect(() => {
    loadDefaultWeather();
  }, []);

  const loadDefaultWeather = async () => {
    try {
      setLoading(true);
      setError('');
      // São Paulo, Brasil
      const data = await weatherService.getWeather(-23.5505, -46.6333, 'São Paulo, BR');
      setWeather(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setLocations([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await weatherService.searchLocations(query);
      setLocations(results);
      setShowSuggestions(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectLocation = async (location: LocationCoords) => {
    setShowSuggestions(false);
    setSearchQuery(`${location.name}, ${location.country}`);

    try {
      setLoading(true);
      setError('');
      const data = await weatherService.getWeather(
        location.latitude,
        location.longitude,
        `${location.name}, ${location.country}`
      );
      setWeather(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-slate-100 rounded-3xl p-8 shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-black text-slate-900">Previsão do Tempo</h2>
        </div>
        <p className="text-slate-600 text-sm">Dados em tempo real - Open-Meteo API</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Buscar cidade..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={loadDefaultWeather}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Localização Atual
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && locations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50"
          >
            {locations.map((location, idx) => (
              <button
                key={idx}
                onClick={() => selectLocation(location)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900">{location.name}</div>
                  <div className="text-xs text-slate-500">{location.country}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-8"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
          />
        </div>
      )}

      {/* Weather Display */}
      {weather && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Weather Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-3xl font-black mb-2">{weather.location}</h3>
                <p className="text-blue-100 text-sm">{weather.weatherDescription}</p>
              </div>
              <div className="text-6xl">{weatherService.getWeatherIcon(weather.weatherCode)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-blue-400">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Temperatura</p>
                <p className="text-4xl font-black">{weather.temperature}°C</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Sensação Térmica</p>
                <p className="text-2xl font-bold">{weather.feelsLike}°C</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Humidity */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase">Umidade</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{weather.humidity}%</p>
            </motion.div>

            {/* Wind Speed */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase">Vento</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{weather.windSpeed} km/h</p>
            </motion.div>

            {/* UV Index */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase">UV</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{Math.round(weather.uvIndex)}</p>
              <p className="text-xs text-slate-500 mt-1">
                {weather.uvIndex < 3 ? 'Baixo' : weather.uvIndex < 6 ? 'Médio' : weather.uvIndex < 8 ? 'Alto' : 'Muito Alto'}
              </p>
            </motion.div>

            {/* Visibility */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600 uppercase">Código</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{weather.weatherCode}</p>
            </motion.div>
          </div>

          {/* Sunrise & Sunset */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <Sunrise className="w-6 h-6 text-orange-500" />
                <span className="font-bold text-slate-900">Nascimento do Sol</span>
              </div>
              <p className="text-2xl font-black text-orange-600">{weatherService.formatTime(weather.sunrise)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Sunset className="w-6 h-6 text-purple-500" />
                <span className="font-bold text-slate-900">Pôr do Sol</span>
              </div>
              <p className="text-2xl font-black text-purple-600">{weatherService.formatTime(weather.sunset)}</p>
            </div>
          </div>

          {/* Info Footer */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Última atualização: {new Date(weather.lastUpdated).toLocaleTimeString('pt-BR')}
            </p>
            <p className="text-xs text-slate-400 mt-1">Fuso horário: {weather.timezone}</p>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!weather && !loading && !error && (
        <div className="text-center py-12">
          <Cloud className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Clique em "Localização Atual" para carregar dados de clima</p>
        </div>
      )}
    </div>
  );
};
