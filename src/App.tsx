import React, { ChangeEvent, useEffect, useState } from 'react'
import {
   defaultLocationKey,
   defaultTemperatureUnit,
   locations,
   TemperatureUnitProps,
   WeatherResponseProps,
} from 'weatherHelper'
import { weatherRequest$, weatherResponse$ } from 'weatherObservable'
import WeatherResultComponent from 'WeatherResultComponent'
import './App.scss'

const App = () => {
   const locationKeys = Object.keys(locations)
   const [result, setResult] = useState<WeatherResponseProps | null>(null)

   // const { fetching, error, weatherSubject } = useWeather({
   //    defaultLocationKey,
   //    defaultTemperatureUnit,
   //    setResult,
   // })

   useEffect(() => {
      const sub = weatherResponse$.subscribe((res) => setResult(res))
      return () => sub.unsubscribe()
   }, [])

   console.log('render')

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

   return (
      <div className="App">
         <header className="App-header">
            <div className="margin-bottom">
               <span>Show weather:</span>
               {/* {fetching && <span>fetching data...</span>}
               {error && <span>Error loading data</span>} */}
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
            {result && (
               <WeatherResultComponent
                  daily={result.daily}
                  temperatureUnit={result.daily_units.temperature_2m_max}
               />
            )}
         </header>
      </div>
   )
}

export default App
