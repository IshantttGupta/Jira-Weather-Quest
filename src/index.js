import Resolver from '@forge/resolver';
import { fetch } from '@forge/api'
import * as api from "@forge/api";

const resolver = new Resolver();

resolver.define('getText', (req) => {
    console.log(req);

    return 'Hello, world!';
});
resolver.define('getWeatherForecast', async ({ payload, context }) => {
    const lat = context.extension.gadgetConfiguration.lat;
    const lon = context.extension.gadgetConfiguration.lon;
    const apiKey = process.env.OPENWEATHER_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const res = await api.fetch(url);
    return await res.json();
});

resolver.define('getLocationCoordinates', async (req) => {

    if(req.payload.location) {
        const config = req.payload.location;
        const url = "https://api.openweathermap.org/geo/1.0/direct?q=" + config.city + "," + config.country + "&limit=5&appid=" + process.env.OPENWEATHER_KEY;
        const response = await fetch(url)
        if(!response.ok) {
            const errmsg = `Error from Open Weather Map Geolocation API: ${response.status} ${await response.text()}`;
            console.error(errmsg)
            throw new Error(errmsg)
        }
        const locations = await response.json()
        return locations;
    } else {
        return null;
    }
});
resolver.define('getCurrentWeather', async (req) => {
    const coord = req.context.extension.gadgetConfiguration;

    if (coord?.lat && coord?.lon) {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coord.lat}&lon=${coord.lon}&units=metric&appid=${process.env.OPENWEATHER_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errmsg = `Error from Open Weather Map Current Weather API: ${response.status} ${await response.text()}`;
            console.error(errmsg);
            throw new Error(errmsg);
        }

        const weather = await response.json();
        return weather;
    } else {
        throw new Error('Invalid or missing coordinates in gadgetConfiguration');
    }
});


export const handler = resolver.getDefinitions();