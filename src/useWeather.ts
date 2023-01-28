import { useEffect, useState } from 'react'
import { BehaviorSubject } from 'rxjs'
import {
   locations,
   TemperatureUnitProps,
   WeatherRequestProps,
   WeatherResponseProps,
} from 'weatherHelper'

export interface UseWeatherProps {
   defaultLocationKey: string
   defaultTemperatureUnit: TemperatureUnitProps
   setResult: (result: WeatherResponseProps) => void
}

export interface UseWeatherResponseProps {
   fetching: boolean
   error?: string
   weatherSubject: BehaviorSubject<WeatherRequestProps> | null
}

export const useWeather = ({
   defaultLocationKey,
   defaultTemperatureUnit,
   setResult,
}: UseWeatherProps): UseWeatherResponseProps => {
   const [fetching, setFetching] = useState<boolean>(false)
   const [error, setError] = useState()
   const [weatherSubject, setWeatherSubject] =
      useState<BehaviorSubject<WeatherRequestProps> | null>(null)

   useEffect(() => {
      if (!weatherSubject) {
         setWeatherSubject(
            new BehaviorSubject<WeatherRequestProps>({
               latitude: locations[defaultLocationKey].latitude,
               longitude: locations[defaultLocationKey].longitude,
               temperatureUnit: defaultTemperatureUnit,
            })
         )
         return
      }

      weatherSubject.subscribe(({ latitude, longitude, temperatureUnit }) => {
         setFetching(true)
         fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,temperature_2m_max&temperature_unit=${temperatureUnit}&timezone=${
               new Intl.DateTimeFormat().resolvedOptions().timeZone
            }`
         )
            .then((response) => {
               if (!response.ok) throw 'API Error'
               return response.json()
            })
            .then((weatherData: WeatherResponseProps) => {
               setResult(weatherData)
            })
            .catch(setError)
            .finally(() => setFetching(false))
      })
      return () => weatherSubject.unsubscribe()
   }, [weatherSubject, defaultLocationKey, defaultTemperatureUnit, setResult])

   return {
      fetching,
      error,
      weatherSubject,
   }
}
