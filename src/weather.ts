import { Observable } from 'rxjs'

const getTimeZone = () => new Intl.DateTimeFormat().resolvedOptions().timeZone

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

interface Daily {
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

export interface GetWeatherProps {
   latitude: number
   longitude: number
   temperatureUnit: 'celcius' | 'fahrenheit'
}

export const getWeather = ({ latitude, longitude, temperatureUnit }: GetWeatherProps) => {
   return new Observable<WeatherResponseProps>((subscriber) => {
      const abortController = new AbortController()
      const { signal } = abortController
      fetch(
         `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,temperature_2m_max&temperature_unit=${temperatureUnit}&timezone=${getTimeZone()}`,
         { signal }
      )
         .then((response) => response.json())
         .then((weatherData: WeatherResponseProps) => {
            subscriber.next(weatherData)
            subscriber.complete()
         })
         .catch((err) => subscriber.error(err))
      return () => abortController.abort()
   })
}
