import { getFormattedWeatherInfo, autocomplete } from './api.js';
export default async function ui() {
	const location = 'Saint-Georges';
	const tempUnit = 'c';
	const weatherInfo = await getFormattedWeatherInfo(location, tempUnit);
	console.log(weatherInfo);
}
