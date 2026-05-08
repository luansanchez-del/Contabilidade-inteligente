// Weather Service using Open-Meteo API (No API key required)
// https://open-meteo.com/en/docs

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  timezone: string;
  lastUpdated: number;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';
const GEO_API_BASE = 'https://geocoding-api.open-meteo.com/v1';

// Weather code interpretation
const weatherCodeDescriptions: { [key: number]: string } = {
  0: 'Céu Limpo',
  1: 'Parcialmente Nublado',
  2: 'Nublado',
  3: 'Muito Nublado',
  45: 'Nevoento',
  48: 'Nevoento com Depósito de Gelo',
  51: 'Chuvisco Leve',
  53: 'Chuvisco Moderado',
  55: 'Chuvisco Denso',
  61: 'Chuva Leve',
  63: 'Chuva Moderada',
  65: 'Chuva Forte',
  71: 'Neve Leve',
  73: 'Neve Moderada',
  75: 'Neve Forte',
  77: 'Grãos de Neve',
  80: 'Chuva Leve',
  81: 'Chuva Moderada',
  82: 'Chuva Forte',
  85: 'Chuvisco de Neve Leve',
  86: 'Chuvisco de Neve Denso',
  95: 'Trovoada',
  96: 'Trovoada com Granizo Leve',
  99: 'Trovoada com Granizo Forte',
};

export const weatherService = {
  searchLocations: async (query: string): Promise<LocationCoords[]> => {
    if (!query || query.length < 2) return [];

    try {
      const response = await fetch(
        `${GEO_API_BASE}/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return [];
      }

      return data.results.map((result: any) => ({
        latitude: result.latitude,
        longitude: result.longitude,
        name: result.name,
        country: result.country || 'Desconhecido',
      }));
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
      throw new Error('Não foi possível buscar localizações');
    }
  },

  getWeather: async (latitude: number, longitude: number, locationName: string): Promise<WeatherData> => {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE}/forecast?` +
        `latitude=${latitude}&longitude=${longitude}&` +
        `current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&` +
        `daily=sunrise,sunset&` +
        `timezone=auto&` +
        `language=pt`
      );

      const data = await response.json();

      if (!data.current) {
        throw new Error('Dados de clima não disponíveis');
      }

      const current = data.current;
      const daily = data.daily;
      const weatherCode = current.weather_code || 0;

      return {
        location: locationName,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
        weatherCode,
        weatherDescription: weatherCodeDescriptions[weatherCode] || 'Desconhecido',
        uvIndex: current.uv_index,
        sunrise: daily.sunrise[0],
        sunset: daily.sunset[0],
        timezone: data.timezone,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Erro ao obter clima:', error);
      throw new Error('Não foi possível obter dados de clima');
    }
  },

  getWeatherIcon: (weatherCode: number): string => {
    if (weatherCode === 0) return '☀️'; // Céu limpo
    if (weatherCode === 1 || weatherCode === 2) return '⛅'; // Parcialmente nublado
    if (weatherCode === 3) return '☁️'; // Nublado
    if (weatherCode === 45 || weatherCode === 48) return '🌫️'; // Nevoento
    if (weatherCode >= 51 && weatherCode <= 67) return '🌧️'; // Chuva
    if (weatherCode >= 71 && weatherCode <= 86) return '❄️'; // Neve
    if (weatherCode >= 95 && weatherCode <= 99) return '⛈️'; // Trovoada
    return '🌡️'; // Padrão
  },

  formatTime: (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  },
};
