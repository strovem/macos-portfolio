'use client';

/**
 * Open-Meteo Weather Service & WMO Weather Code Classification
 * Free API with 20-minute TTL caching and robust offline fallbacks.
 */

export type WeatherCategory =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'storm';

export interface WeatherCity {
  id: string;
  name: string;
  trName: string;
  latitude: number;
  longitude: number;
  isCustom?: boolean;
}

export const PRESET_CITIES: WeatherCity[] = [
  {
    id: 'eskisehir',
    name: 'Eskişehir',
    trName: 'Eskişehir',
    latitude: 39.7767,
    longitude: 30.5206,
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    trName: 'İstanbul',
    latitude: 41.0082,
    longitude: 28.9784,
  },
  {
    id: 'ankara',
    name: 'Ankara',
    trName: 'Ankara',
    latitude: 39.9334,
    longitude: 32.8597,
  },
];

export interface WeatherData {
  cityId: string;
  cityName: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  category: WeatherCategory;
  conditionTextTr: string;
  conditionTextEn: string;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  tempMax: number;
  tempMin: number;
  sunrise: string; // HH:mm format
  sunset: string; // HH:mm format
  fetchedAt: number;
}

/**
 * Map WMO weather codes to category and multilingual titles.
 * Specification: https://open-meteo.com/en/docs
 */
export function parseWmoCode(code: number): {
  category: WeatherCategory;
  tr: string;
  en: string;
} {
  switch (code) {
    case 0:
      return { category: 'clear', tr: 'Açık / Güneşli', en: 'Clear' };
    case 1:
      return { category: 'clear', tr: 'Çoğunlukla Açık', en: 'Mostly Clear' };
    case 2:
      return { category: 'partly-cloudy', tr: 'Parçalı Bulutlu', en: 'Partly Cloudy' };
    case 3:
      return { category: 'cloudy', tr: 'Kapalı / Bulutlu', en: 'Overcast' };
    case 45:
    case 48:
      return { category: 'fog', tr: 'Sisli & Puslu', en: 'Foggy' };
    case 51:
    case 53:
    case 55:
      return { category: 'rain', tr: 'Çiseleyen Yağmur', en: 'Drizzle' };
    case 56:
    case 57:
      return { category: 'rain', tr: 'Dondurucu Çisenti', en: 'Freezing Drizzle' };
    case 61:
    case 63:
    case 65:
      return { category: 'rain', tr: 'Yağmurlu', en: 'Rain' };
    case 66:
    case 67:
      return { category: 'rain', tr: 'Dondurucu Yağmur', en: 'Freezing Rain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { category: 'snow', tr: 'Kar Yağışlı', en: 'Snow' };
    case 80:
    case 81:
    case 82:
      return { category: 'rain', tr: 'Sağanak Yağış', en: 'Rain Showers' };
    case 85:
    case 86:
      return { category: 'snow', tr: 'Kar Sağanağı', en: 'Snow Showers' };
    case 95:
      return { category: 'storm', tr: 'Gök Gürültülü Fırtına', en: 'Thunderstorm' };
    case 96:
    case 99:
      return { category: 'storm', tr: 'Dolu & Şiddetli Fırtına', en: 'Severe Hailstorm' };
    default:
      return { category: 'partly-cloudy', tr: 'Parçalı Bulutlu', en: 'Partly Cloudy' };
  }
}

function formatTimeString(isoString?: string): string {
  if (!isoString) return '--:--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      // In case Open-Meteo returns YYYY-MM-DDTHH:MM without TZ
      const parts = isoString.split('T');
      if (parts[1]) return parts[1].substring(0, 5);
      return '--:--';
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '--:--';
  }
}

// 20-minute TTL in milliseconds
const CACHE_TTL_MS = 20 * 60 * 1000;
const CACHE_KEY_PREFIX = 'korumtas_weather_cache_';

export function getCachedWeather(cityId: string): WeatherData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${cityId}`);
    if (!raw) return null;
    const parsed: WeatherData = JSON.parse(raw);
    const age = Date.now() - parsed.fetchedAt;
    if (age < CACHE_TTL_MS) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCachedWeather(cityId: string, data: WeatherData): void {
  if (typeof window === 'undefined') return null as any;
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${cityId}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota or disabled localStorage
  }
}

export const FALLBACK_WEATHER: WeatherData = {
  cityId: 'eskisehir',
  cityName: 'Eskişehir',
  temperature: 11,
  apparentTemperature: 10,
  weatherCode: 2,
  category: 'partly-cloudy',
  conditionTextTr: 'Parçalı Bulutlu',
  conditionTextEn: 'Partly Cloudy',
  isDay: true,
  humidity: 58,
  windSpeed: 12,
  tempMax: 15,
  tempMin: 6,
  sunrise: '07:15',
  sunset: '18:45',
  fetchedAt: Date.now(),
};

/**
 * Fetch live Open-Meteo weather data with cache and safe fallbacks.
 */
export async function fetchCityWeather(city: WeatherCity, forceRefresh = false): Promise<WeatherData> {
  // Check local cache if not forcing refresh
  if (!forceRefresh) {
    const cached = getCachedWeather(city.id);
    if (cached) return cached;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,weather_code,is_day,relative_humidity_2m,wind_speed_10m&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    if (!data.current) {
      throw new Error('Malformed Open-Meteo response');
    }

    const temp = Math.round(data.current.temperature_2m ?? 12);
    const apparent = Math.round(data.current.apparent_temperature ?? temp);
    const code = Number(data.current.weather_code ?? 2);
    const wmo = parseWmoCode(code);
    const isDay = Boolean(data.current.is_day ?? 1);
    const humidity = Math.round(data.current.relative_humidity_2m ?? 50);
    const windSpeed = Math.round(data.current.wind_speed_10m ?? 10);

    const tempMax = Math.round(data.daily?.temperature_2m_max?.[0] ?? temp + 3);
    const tempMin = Math.round(data.daily?.temperature_2m_min?.[0] ?? temp - 3);
    const sunrise = formatTimeString(data.daily?.sunrise?.[0]);
    const sunset = formatTimeString(data.daily?.sunset?.[0]);

    const result: WeatherData = {
      cityId: city.id,
      cityName: city.name,
      temperature: temp,
      apparentTemperature: apparent,
      weatherCode: code,
      category: wmo.category,
      conditionTextTr: wmo.tr,
      conditionTextEn: wmo.en,
      isDay,
      humidity,
      windSpeed,
      tempMax,
      tempMin,
      sunrise,
      sunset,
      fetchedAt: Date.now(),
    };

    setCachedWeather(city.id, result);
    return result;
  } catch (error) {
    console.warn('[Weather] Open-Meteo fetch failed, using fallback:', error);
    // Return stale cache if available, else fallback
    const stale = getCachedWeather(city.id);
    if (stale) return stale;
    return {
      ...FALLBACK_WEATHER,
      cityId: city.id,
      cityName: city.name,
    };
  }
}
