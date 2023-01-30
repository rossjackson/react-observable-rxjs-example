interface CurrentWeather {
   temperature: number
   windspeed: number
   winddirection: number
   weathercode: number
   time: string
}

interface DailyUnits {
   time: string
   temperature_2m_min: '°C' | '°F'
   temperature_2m_max: '°C' | '°F'
}

export interface Daily {
   time: string[]
   temperature_2m_min: number[]
   temperature_2m_max: number[]
}

export interface WeatherResponseProps {
   latitude: number
   longitude: number
   generationtime_ms: number
   utc_offset_seconds: number
   timezone: string
   timezone_abbreviation: string
   elevation: number
   current_weather: CurrentWeather
   daily_units: DailyUnits
   daily: Daily
}

export type TemperatureUnitProps = 'celsius' | 'fahrenheit'

export interface WeatherRequestProps {
   latitude: number
   longitude: number
   temperatureUnit: TemperatureUnitProps
}

export interface LatLongProps {
   latitude: number
   longitude: number
}

export const locations: Record<string, LatLongProps> = {
   WashingtonDC: {
      latitude: 38.8937335,
      longitude: -77.0847874,
   },
   NewYorkNY: {
      latitude: 40.6971478,
      longitude: -74.2605478,
   },
   SanFranciscoCA: {
      latitude: 37.7576792,
      longitude: -122.5078114,
   },
}

export const defaultLocationKey = 'WashingtonDC'
export const defaultTemperatureUnit = 'fahrenheit'
