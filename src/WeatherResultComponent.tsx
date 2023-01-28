import React from 'react'
import { Daily } from 'weatherHelper'

interface WeatherResultComponentProps {
   daily: Daily
   temperatureUnit: '°C' | '°F'
}

const WeatherResultComponent = ({
   daily: { time, temperature_2m_max, temperature_2m_min },
   temperatureUnit,
}: WeatherResultComponentProps) => {
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

export default WeatherResultComponent
