import React, { useEffect, useRef, useState } from 'react'
import { getWeather, WeatherResponseProps } from 'weather'
import './App.scss'

function App() {
   const [weatherData, setWeatherData] = useState<WeatherResponseProps | null>(null)
   const renderedRef = useRef<boolean>(false)

   useEffect(() => {
      if (renderedRef.current) return
      console.log('rendered')

      const subscription = getWeather({
         latitude: 38.8937335,
         longitude: -77.0847874,
         temperatureUnit: 'fahrenheit',
      }).subscribe((data) => {
         setWeatherData(data)

         renderedRef.current = true
      })

      return () => {
         subscription.unsubscribe()
      }
   }, [])

   console.log(weatherData)

   return (
      <div className="App">
         <header className="App-header">
            <p>
               Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
               className="App-link"
               href="https://reactjs.org"
               target="_blank"
               rel="noopener noreferrer"
            >
               Learn React
            </a>
         </header>
      </div>
   )
}

export default App
