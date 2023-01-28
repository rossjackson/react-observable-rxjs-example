import React, { ChangeEvent, useEffect, useState } from 'react'
import { Daily, getWeather, TemperatureUnitProps, WeatherResponseProps } from 'weather'
import './App.scss'

interface LatLongProps {
   latitude: number
   longitude: number
}

const locations: Record<string, LatLongProps> = {
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

const App = () => {
   const locationKeys = Object.keys(locations)
   const [selectedLocation, setSelectedLocation] = useState<string>('WashingtonDC')
   const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnitProps>('fahrenheit')
   const [result, setResult] = useState<WeatherResponseProps | null>(null)

   const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
      setSelectedLocation(e.currentTarget.value)
   }

   const handleTemperatureChange = (e: ChangeEvent<HTMLSelectElement>) => {
      setTemperatureUnit(e.currentTarget.value as TemperatureUnitProps)
   }

   useEffect(() => {
      const { latitude, longitude } = locations[selectedLocation]
      const weatherSubscription = getWeather({
         latitude,
         longitude,
         temperatureUnit,
      }).subscribe({
         next: setResult,
         error: console.error,
      })

      return () => {
         weatherSubscription.unsubscribe()
      }
   }, [selectedLocation, temperatureUnit])

   return (
      <div className="App">
         <header className="App-header">
            <select onChange={handleSelectionChange} value={selectedLocation}>
               {locationKeys.map((location) => (
                  <option key={location} value={location}>
                     {location}
                  </option>
               ))}
            </select>
            <select value={temperatureUnit} onChange={handleTemperatureChange}>
               <option value="celsius">Celcius</option>
               <option value="fahrenheit">Fahrenheit</option>
            </select>
            {result && (
               <ResultComponent
                  daily={result.daily}
                  temperatureUnit={result.daily_units.temperature_2m_max}
               />
            )}
         </header>
      </div>
   )
}

interface ResultComponentProps {
   daily: Daily
   temperatureUnit: '°C' | '°F'
}

const ResultComponent = ({
   daily: { time, temperature_2m_max, temperature_2m_min },
   temperatureUnit,
}: ResultComponentProps) => {
   return (
      <div className="container-column">
         <div className="container-row">
            <div className="item">Date</div>
            {time.map((t, idx) => {
               const date = new Date(t)
               return (
                  <div key={idx} className="item">
                     <span>
                        {date.getMonth() + 1}/{date.getUTCDate()}
                     </span>
                  </div>
               )
            })}
         </div>
         <div className="container-row">
            <div className="item">High</div>
            {temperature_2m_max.map((t, idx) => (
               <div key={idx} className="item">
                  <span>
                     {t}
                     {temperatureUnit}
                  </span>
               </div>
            ))}
         </div>
         <div className="container-row">
            <div className="item">Low</div>
            {temperature_2m_min.map((t, idx) => (
               <div key={idx} className="item">
                  <span>
                     {t}
                     {temperatureUnit}
                  </span>
               </div>
            ))}
         </div>
      </div>
   )
}

export default App
