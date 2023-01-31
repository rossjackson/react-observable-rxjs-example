import React, { ChangeEvent, useEffect, useState } from 'react'
import { catchError, concatMap, map, of, switchMap, tap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import {
   defaultLocationKey,
   defaultTemperatureUnit,
   locations,
   TemperatureUnitProps,
   Weather,
   WeatherResponseProps,
} from 'weatherHelper'
import { weatherRequest$ } from 'weatherObservable'
import WeatherResultComponent from 'WeatherResultComponent'
import './App.scss'

const App = () => {
   const locationKeys = Object.keys(locations)
   const [result, setResult] = useState<WeatherResponseProps>({
      success: false,
   })
   const [loading, setLoading] = useState<boolean>(false)
   // const [location, setLocation] = useState<LatLongProps>(locations[defaultLocationKey])
   // const [temperatureUnit, setTemperatureUnit] =
   //    useState<TemperatureUnitProps>(defaultTemperatureUnit)

   // const { fetching, error, weatherSubject } = useWeather({
   //    defaultLocationKey,
   //    defaultTemperatureUnit,
   //    setResult,
   // })

   // useEffect(() => {
   //    const abortController = new AbortController()
   //    const { latitude, longitude } = location
   //    setLoading(true)
   //    fetch(
   //       `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,temperature_2m_max&temperature_unit=${temperatureUnit}&timezone=${
   //          new Intl.DateTimeFormat().resolvedOptions().timeZone
   //       }`,
   //       { signal: abortController.signal }
   //    )
   //       .then((response) => {
   //          if (!response.ok) {
   //             throw new Error('API error')
   //          }
   //          return response.json()
   //       })
   //       .then((response) => {
   //          setResult({
   //             success: true,
   //             weather: response,
   //          })
   //       })
   //       .catch(() => {
   //          setResult({
   //             success: false,
   //          })
   //       })
   //       .finally(() => {
   //          setLoading(false)
   //       })

   //    return () => abortController.abort()
   // }, [temperatureUnit, location])

   useEffect(() => {
      const sub = weatherRequest$
         .pipe(
            tap(() => setLoading(true)),
            switchMap(({ latitude, longitude, temperatureUnit }) =>
               fromFetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,temperature_2m_max&temperature_unit=${temperatureUnit}&timezone=${
                     new Intl.DateTimeFormat().resolvedOptions().timeZone
                  }`
               ).pipe(
                  tap((response) => {
                     if (!response.ok) {
                        throw new Error('API error')
                     }
                  }),
                  concatMap<Response, Promise<Weather>>((response) => response.json()),
                  map(
                     (response) =>
                        ({
                           success: true,
                           weather: response,
                        } as WeatherResponseProps)
                  ),
                  catchError(() => {
                     return of<WeatherResponseProps>({
                        success: false,
                     })
                  }),
                  tap(() => setLoading(false))
               )
            )
         )
         .subscribe((res) => setResult(res))
      return () => sub.unsubscribe()
   }, [])

   const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
      if (!weatherRequest$) return
      const { latitude, longitude } = locations[e.currentTarget.value]
      weatherRequest$.next({
         ...weatherRequest$.value,
         latitude,
         longitude,
      })
   }

   const handleTemperatureChange = (e: ChangeEvent<HTMLSelectElement>) => {
      if (!weatherRequest$) return
      weatherRequest$.next({
         ...weatherRequest$.value,
         temperatureUnit: e.currentTarget.value as TemperatureUnitProps,
      })
   }

   // const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
   //    setLocation(locations[e.currentTarget.value])
   // }

   // const handleTemperatureChange = (e: ChangeEvent<HTMLSelectElement>) => {
   //    setTemperatureUnit(e.currentTarget.value as TemperatureUnitProps)
   // }

   console.log('render', loading)

   return (
      <div className="App">
         <header className="App-header">
            <div className="margin-bottom">
               <span>Show weather:</span>
               {loading && <span> fetching data...</span>}
               {!result.success && <span> Error loading data</span>}
            </div>
            <select onChange={handleSelectionChange} defaultValue={defaultLocationKey}>
               {locationKeys.map((location) => (
                  <option key={location} value={location}>
                     {location}
                  </option>
               ))}
            </select>
            <select
               onChange={handleTemperatureChange}
               defaultValue={defaultTemperatureUnit}
               className="margin-bottom"
            >
               <option value="celsius">Celcius</option>
               <option value="fahrenheit">Fahrenheit</option>
            </select>
            {result.weather && (
               <WeatherResultComponent
                  daily={result.weather.daily}
                  temperatureUnit={result.weather.daily_units.temperature_2m_max}
               />
            )}
         </header>
      </div>
   )
}

export default App
