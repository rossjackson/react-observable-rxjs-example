import { BehaviorSubject, switchMap } from 'rxjs'
import { fromFetch } from 'rxjs/fetch'
import {
   defaultLocationKey,
   defaultTemperatureUnit,
   locations,
   WeatherRequestProps,
   WeatherResponseProps,
} from 'weatherHelper'

export const weatherRequest$ = new BehaviorSubject<WeatherRequestProps>({
   latitude: locations[defaultLocationKey].latitude,
   longitude: locations[defaultLocationKey].longitude,
   temperatureUnit: defaultTemperatureUnit,
})

export const weatherResponse$ = weatherRequest$.pipe(
   switchMap(({ latitude, longitude, temperatureUnit }) =>
      fromFetch<WeatherResponseProps>(
         `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,temperature_2m_max&temperature_unit=${temperatureUnit}&timezone=${
            new Intl.DateTimeFormat().resolvedOptions().timeZone
         }`,
         {
            selector: (response) => response.json(),
         }
      )
   )
)
