# react-observable-rxjs-example
An approach on how to use Observable with React application

## RxJS

[RxJS](https://rxjs.dev/) is the Javascript implementation of [ReactiveX](https://reactivex.io/).  [ReactiveX](https://reactivex.io/) was created by Microsoft to allow [reactive programming](https://en.wikipedia.org/wiki/Reactive_programming).  It is based on the [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).  The central data source called the observable sends the items it receives one at a time.  An Observable emits three events (next, error, complete).

One thing to note is that Observable are not asynchronous.  It all depends on how you construct your Observable.  If you have promises, then it will return it asynchronously.

## Implementation

One benefit I will show you in this [react-observable-rxjs-example](https://github.com/rossjackson/react-observable-rxjs-example) is how it re-renders the component less than using pure `useState`s.  Even though React has a virtual DOM to compare which has changed and update accordingly, it is still better to get lesser re-render.

I used [Open-Meteo](https://open-meteo.com/), a free weather API.  In this example, I made the longitude, latitude, and temperature unit as states that users can update.  I exposed a dropdown to select 3 different locations: Washington, DC, New York, NY, and San Francisco, CA.  A final design looks like:

<img width="949" alt="image" src="https://user-images.githubusercontent.com/3269153/215918266-76510d0c-2abf-4b1d-9cee-1688cc9a2c22.png">

To run the code, install modules by running `npm i` and then you can start by `npm start`.

I have used [BehaviorSubject](https://rxjs.dev/api/index/class/BehaviorSubject) as my Observable.  It is a variant of [Subject](https://rxjs.dev/api/index/class/Subject) that requires a default value.  Our default value is set in Washington, DC.

The dropdown locations can be seen in [weatherHelper.ts](https://github.com/rossjackson/react-observable-rxjs-example/blob/main/src/weatherHelper.ts#L52).  You can also see the default value.

<img width="476" alt="image" src="https://user-images.githubusercontent.com/3269153/215919421-f7e6d87f-0f5a-42cb-b186-9c1674f7e911.png">

I have maintain my custom hook and comment out some code to show you on how you can achieve Observables in React.

## useWeather custom hook

The [useWeather](https://github.com/rossjackson/react-observable-rxjs-example/blob/main/src/useWeather.ts) custom hook requires a [UseWeatherProps](https://github.com/rossjackson/react-observable-rxjs-example/blob/main/src/useWeather.ts#L10) object.  These are `defaultLocationKey`, `defaultTemperatureUnit` and `setResult` shown below:

<img width="517" alt="image" src="https://user-images.githubusercontent.com/3269153/215919825-c035a4b4-bf1d-40a0-8fc1-545ec11ced05.png">

I have two states created for this custom hook which later be exposed as a return object.

<img width="161" alt="image" src="https://user-images.githubusercontent.com/3269153/215920319-6dfff4fd-d4b5-479b-8e56-8591e9972db9.png">

`weatherSubject` is a `BehaviorSubject` that starts of as `null`.

I, then, instantiate `weatherSubject` inside of a `useEffect` so that I can unsubscribe to it when the component unmounts.  It is a must to unsubscribe your Observable / Subject when you are done to avoid memory leaks.  You can do this by returning a function within your `useEffect`.  In my example, it is `return () => weatherSubject.unsubsribe()`

In my `useEffect`, I first check if `weatherSubject` is null.  If it is, I instantiate it with `BehaviorSubject` with the intial values.
```
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
```

The next thing React will do is fire up the `useEffect` again since now the `weatherSubject` has changed.  This effect can be seen by the second argument of the `useEffect` which is `[weatherSubject, defaultLocationKey, defaultTemperatureUnit, setResult]`.

The second time the `useEffect` gets triggered is when I subscribe to my `weatherSubject`.
```
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
            .then((weather: Weather) => {
               setResult({
                  success: true,
                  weather
               })
            })
            .catch(() => {
               setResult({
                  success: false,
               })
            })
            .finally(() => setFetching(false))
      })
```

Here, you can see that the subscribe has the `WeatherRequestProps` as its request props.  I then trigger the state to let the user of the hooks that the API is about to fetch something by calling `setFetching(true)`.  The next line of code is a common `fetch` call.  I am handling the error on the first response and throwing it so the `catch` can be called by returning a `success` property of false.  If it is a successful call, I pass the weather as a `WeatherResponseProps` and finally setting the `fetching` back to false.

I can then call it in my `App.tsx` as:
```
   const { fetching, weatherSubject } = useWeather({
      defaultLocationKey,
      defaultTemperatureUnit,
      setResult,
   })
```

Displaying the result like this:
```
            {result.weather && (
               <WeatherResultComponent
                  daily={result.weather.daily}
                  temperatureUnit={result.weather.daily_units.temperature_2m_max}
               />
            )}
```

Now, the `select` elements don't need `useState`s and this is where the `Observable` shines a lot.  You can make your `select` methods as Observers to the `weatherSubject` and inform the `weatherSubject` when a data has changed.

So given my two lovely `selects` shown here:
```
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
```

You can see that the `onChange` event calls these:
```
   const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
      if (!weatherSubject) return
      const { latitude, longitude } = locations[e.currentTarget.value]
      weatherSubject.next({
         ...weatherRequest$.value,
         latitude,
         longitude,
      })
   }

   const handleTemperatureChange = (e: ChangeEvent<HTMLSelectElement>) => {
      if (!weatherSubject) return
      weatherSubject.next({
         ...weatherSubject.value,
         temperatureUnit: e.currentTarget.value as TemperatureUnitProps,
      })
   }
```

What it basically does is when the locations or temperature unit changes, to call the `next()` event so the `weatherSubject` will then update its subscriber.  There is only one subscriber and it is in the `useEffect` of the custom hook.  This will then update the `result` by calling the `setResult`.

I have added a `console.log()` before rendering component to observe how many times it gets called.  You can uncomment the old way of updating states and you will see that it is less render than using `useState`.

## weatherObservable.ts

Another approach to this is creating the `weatherRequest$` as an exported `BehaviorSubject`. The `$` at the end symbolizes that it is an Observable.  A pattern used in Angular.

You can create another custom hook but for this example, I just added the `useEffect` in `App.tsx`.
```
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
```

This `useEffect` will only fire once `[]` on render. You can see that I subscribe and unsubscribe at the end when the component unmounts to avoid memory leak.  The first thing I did was to use `.pipe()`.  The [pipe()](https://rxjs.dev/api/index/function/pipe) function takes one argument and uses it to return a value.

Within the `.pipe()`, I used `tap()` so I can perform side-effect and inform the component that I am about to call the API to let the app know to show a fetching state.  `SwitchMap` is then used to pass the request argument to the `fromFetch()`.  The cool thing about [SwitchMap()](https://rxjs.dev/api/index/function/switchMap) is that it discards the latest network call when the new event arrives.  Another `pipe()` is called within a `pipe()` and this is completely fine since Javascript's functions are first class functions.  Which mean you can treat functions as values, pass them as arguments, or even return a function from another function.  The preceding functions within the second pipe is basically handling the same `then()` function on our custom hook.  The first is `tap()` to check if the `response.ok` is set to false, if yes, throw an error so `catchError` can act on it and return another Observable with a `success: false`.  If everything is good, then `map()` returns the `Weather` object and formats it to `WeartherResponseProps`.

### Please let me know if you have any questions or you see other ways on how to do so!
