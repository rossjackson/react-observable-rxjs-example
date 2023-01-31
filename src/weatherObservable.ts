import { BehaviorSubject } from 'rxjs'
import {
   defaultLocationKey,
   defaultTemperatureUnit,
   locations,
   WeatherRequestProps,
} from 'weatherHelper'

export const weatherRequest$ = new BehaviorSubject<WeatherRequestProps>({
   latitude: locations[defaultLocationKey].latitude,
   longitude: locations[defaultLocationKey].longitude,
   temperatureUnit: defaultTemperatureUnit,
})
