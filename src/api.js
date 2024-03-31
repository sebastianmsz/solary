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

		//current weather
		let currentTemp =
			tempUnit === 'f'
				? weatherInfo.current.temp_f
				: weatherInfo.current.temp_c;
		let condition = weatherInfo.current.condition.text;
		let humidity = weatherInfo.current.humidity;
		let wind = weatherInfo.current.wind_mph;
		let sunrise = weatherInfo.forecast.forecastday[0].astro.sunrise;
		let sunset = weatherInfo.forecast.forecastday[0].astro.sunset;
		currentWeather.push({
			currentTemp,
			condition,
			humidity,
			wind,
			sunrise,
			sunset,
		});

		//today forecast
		let currentHour = new Date().getHours();
		for (let i = 0; i < 10; i++) {
			let time = (currentHour + i) % 24;
			let temp =
				tempUnit === 'f'
					? weatherInfo.forecast.forecastday[0].hour[i].temp_f
					: weatherInfo.forecast.forecastday[0].hour[i].temp_c;
			let condition =
				weatherInfo.forecast.forecastday[0].hour[i].condition.text;
			todayForecast.push({ time, temp, condition });
		}

		//future forecast
		for (let i = 1; i < 6; i++) {
			let date = weatherInfo.forecast.forecastday[i].date;
			let dayOfWeek = new Date(date).toLocaleDateString('en-US', {
				weekday: 'long',
			});
			let maxTemp =
				tempUnit === 'f'
					? weatherInfo.forecast.forecastday[i].day.maxtemp_f
					: weatherInfo.forecast.forecastday[i].day.maxtemp_c;
			let minTemp =
				tempUnit === 'f'
					? weatherInfo.forecast.forecastday[i].day.mintemp_f
					: weatherInfo.forecast.forecastday[i].day.mintemp_c;
			let condition =
				weatherInfo.forecast.forecastday[i].day.condition.text;
			futureForecast.push({ dayOfWeek, maxTemp, minTemp, condition });
		}

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

async function autocomplete(input) {
	const response = await fetch(
		`https://api.weatherapi.com/v1/search.json?key=${AUTH_KEY}&q=${input}`,
		{ mode: 'cors' },
	);
	const autocompletion = await response.json();
	let formattedAutocompletion = [];
	autocompletion.forEach((element) => {
		formattedAutocompletion.push(element);
	});
	return formattedAutocompletion;
}
