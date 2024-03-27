import './style.css';
async function getWeatherInfo(city) {
	try {
		const response = await fetch(
			`https://api.weatherapi.com/v1/current.json?key=2a5eb57601d6487a8e9194349242603&q=${city}`,
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
