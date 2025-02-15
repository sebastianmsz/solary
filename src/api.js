import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/brands';
const AUTH_KEY = '2a5eb57601d6487a8e9194349242603';
export { getFormattedWeatherInfo, autocomplete };
async function getWeatherInfo(location) {
	try {
		const response = await fetch(
			`https://api.weatherapi.com/v1/forecast.json?q=${location}&days=6&key=${AUTH_KEY}`,
			{
				mode: 'cors',
			},
		);
		if (!response.ok) {
			throw new Error('Failed to fetch weather data');
		}
		const weatherInfo = await response.json();
		return weatherInfo;
	} catch (error) {
		console.error('Error fetching weather data:', error);
		return null;
	}
}
async function getFormattedWeatherInfo(location, tempUnit) {
	try {
		const weatherInfo = await getWeatherInfo(location, tempUnit);

		let currentWeather = [];
		let todayForecast = [];
		let futureForecast = [];

		let currentTemp =
			tempUnit === 'f'
				? weatherInfo.current.temp_f
				: weatherInfo.current.temp_c;
		let condition = weatherInfo.current.condition.text;
		let conditionImgSrc = weatherInfo.current.condition.icon;
		let humidity = weatherInfo.current.humidity;
		let wind = weatherInfo.current.wind_kph;
		let sunrise = weatherInfo.forecast.forecastday[0].astro.sunrise;
		let sunset = weatherInfo.forecast.forecastday[0].astro.sunset;
		let localTime = new Date(weatherInfo.location.localtime).getHours();

		sunrise = timeTo24Hour(sunrise);
		sunset = timeTo24Hour(sunset);

		currentWeather.push({
			currentTemp,
			condition,
			conditionImgSrc,
			humidity,
			wind,
			sunrise,
			sunset,
			localTime,
		});

		for (let i = 0; i < 10; i++) {
			let time = localTime + i;
			if (time > 23) {
				time = time - 24;
			}
			let temp =
				tempUnit === 'f'
					? weatherInfo.forecast.forecastday[0].hour[time].temp_f
					: weatherInfo.forecast.forecastday[0].hour[time].temp_c;
			let conditionImgSrc =
				weatherInfo.forecast.forecastday[0].hour[time].condition.icon;
			time = time < 10 ? `0${time}:00` : `${time}:00`;

			todayForecast.push({ time, temp, conditionImgSrc });
		}

		const futureForecastDays = weatherInfo.forecast.forecastday;
		console.log(futureForecastDays);
		futureForecastDays.forEach((day) => {
			let date = day.date.split('-');
			let dayOfWeek = new Date(
				date[0],
				date[1] - 1,
				date[2],
			).toLocaleString('en-us', { weekday: 'long' });
			let maxTemp =
				tempUnit === 'f' ? day.day.maxtemp_f : day.day.maxtemp_c;
			let minTemp =
				tempUnit === 'f' ? day.day.mintemp_f : day.day.mintemp_c;
			let conditionImgSrc = day.day.condition.icon;
			futureForecast.push({
				dayOfWeek,
				maxTemp,
				minTemp,
				conditionImgSrc,
			});
		});

		let formattedWeatherInfo = {
			location: weatherInfo.location.name,
			region: weatherInfo.location.region,
			currentWeather: currentWeather,
			todayForecast: todayForecast,
			futureForecast: futureForecast,
		};

		return formattedWeatherInfo;
	} catch (error) {
		console.error('Error fetching weather data:', error);
		return null;
	}
}

function timeTo24Hour(time) {
	let [hours, minutes, period] = time.split(/[:\s]/);
	if (period === 'PM' && hours !== '12') {
		hours = parseInt(hours) + 12;
	}
	if (period === 'AM' && hours === '12') {
		hours = '00';
	}
	return `${hours}:${minutes}`;
}

async function autocomplete(input) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${AUTH_KEY}&q=${encodeURIComponent(input)}`,
            { mode: 'cors' }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch autocomplete suggestions');
        }
        
        const data = await response.json();
        if (!Array.isArray(data)) {
            return [];
        }
        
        return data.map(item => ({
            name: item.name,
            region: item.region || item.country
        }));
    } catch (error) {
        console.error('Autocomplete API error:', error);
        return [];
    }
}
