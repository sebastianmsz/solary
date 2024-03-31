import { getFormattedWeatherInfo, autocomplete } from './api.js';

export default async function ui() {
	function renderSearchBar() {
		const searchBarContainer = document.querySelector(
			'#searchBarContainer',
		);
		const input = document.createElement('input');
		const completionsContainer = document.createElement('div');
		completionsContainer.setAttribute('id', 'completionsContainer');

		input.setAttribute('type', 'text');
		input.setAttribute('placeholder', 'Enter location');
		input.setAttribute('id', 'location-input');

		input.addEventListener('input', handleInput);

		searchBarContainer.append(input, completionsContainer);
	}
	renderSearchBar();

	async function handleInput() {
		try {
			const completionsContainer = document.querySelector(
				'#completionsContainer',
			);
			const input = document.querySelector('#location-input');
			if (input.value.length < 3) {
				completionsContainer.innerHTML = '';
				return;
			} else {
				const completions = await autocomplete(input.value);
				completionsContainer.innerHTML = '';
				completions.forEach((completion) => {
					const completionDiv = document.createElement('div');
					completionDiv.textContent = `${completion.name}, ${completion.region}`;
					completionDiv.addEventListener('click', () => {
						input.value = completion.name;
						completionsContainer.innerHTML = '';
						updateWeatherInfo(completion.name);
					});
					completionsContainer.appendChild(completionDiv);
				});
			}
		} catch (error) {
			console.error('Autocomplete error:', error);
		}
	}

	function renderCurrentWeather(weatherInfo) {
		const currentWeatherContainer =
			document.querySelector('#currentWeather');
		currentWeatherContainer.innerHTML = '';
		const location = document.createElement('h2');
		const region = document.createElement('h3');
		const currentTemp = document.createElement('h3');
		const condition = document.createElement('h3');
		const humidity = document.createElement('h3');
		const wind = document.createElement('h3');
		const sunrise = document.createElement('h3');
		const sunset = document.createElement('h3');

		location.setAttribute('id', 'location');
		location.textContent = weatherInfo.location;
		region.textContent = weatherInfo.region;
		currentTemp.textContent =
			currentUnit === 'f'
				? `${weatherInfo.currentWeather[0].currentTemp}°F`
				: `${weatherInfo.currentWeather[0].currentTemp}°C`;
		condition.textContent = weatherInfo.currentWeather[0].condition;
		humidity.textContent = weatherInfo.currentWeather[0].humidity;
		wind.textContent = weatherInfo.currentWeather[0].wind;
		sunrise.textContent = weatherInfo.currentWeather[0].sunrise;
		sunset.textContent = weatherInfo.currentWeather[0].sunset;

		currentWeatherContainer.append(
			location,
			region,
			currentTemp,
			condition,
			humidity,
			wind,
			sunrise,
			sunset,
		);
	}

	function renderTodayForecast(weatherInfo) {
		const todayForecastContainer = document.querySelector('#todayForecast');
		todayForecastContainer.innerHTML = '';
		weatherInfo.todayForecast.forEach((hour) => {
			const hourContainer = document.createElement('div');
			const time = document.createElement('h3');
			const temp = document.createElement('h3');
			const condition = document.createElement('h3');
			time.textContent = hour.time;
			temp.textContent =
				currentUnit === 'f' ? `${hour.temp}°F` : `${hour.temp}°C`;
			condition.textContent = hour.condition;
			hourContainer.append(time, temp, condition);
			todayForecastContainer.appendChild(hourContainer);
		});
	}

	function renderFutureForecast(weatherInfo) {
		const futureForecastContainer =
			document.querySelector('#futureForecast');
		futureForecastContainer.innerHTML = '';
		weatherInfo.futureForecast.forEach((day) => {
			const dayContainer = document.createElement('div');
			const dayOfWeek = document.createElement('h3');
			const maxTemp = document.createElement('h3');
			const minTemp = document.createElement('h3');
			const condition = document.createElement('h3');
			dayOfWeek.textContent = day.dayOfWeek;
			maxTemp.textContent =
				currentUnit === 'f' ? `${day.maxTemp}°F` : `${day.maxTemp}°C`;
			minTemp.textContent =
				currentUnit === 'f' ? `${day.minTemp}°F` : `${day.minTemp}°C`;
			condition.textContent = day.condition;
			dayContainer.append(dayOfWeek, maxTemp, minTemp, condition);
			futureForecastContainer.appendChild(dayContainer);
		});
	}

	async function updateWeatherInfo(city) {
		try {
			const unit = currentUnit;
			const weatherInfo = await getFormattedWeatherInfo(city, unit);
			renderCurrentWeather(weatherInfo);
			renderTodayForecast(weatherInfo);
			renderFutureForecast(weatherInfo);
			renderTempUnitButton(unit);
		} catch (error) {
			console.error('Error fetching weather information:', error);
		}
	}

	let currentUnit = 'c';

	function renderTempUnitButton(unit) {
		const changeTemperatureUnitBtn = document.querySelector(
			'#changeTemperatureUnit',
		);
		changeTemperatureUnitBtn.textContent =
			unit === 'f' ? 'Change to Celsius' : 'Change to Fahrenheit';

		changeTemperatureUnitBtn.addEventListener(
			'click',
			tempUnitButtonClickHandler,
		);
	}

	function tempUnitButtonClickHandler() {
		const location = document.querySelector('#location').textContent;
		const newUnit = currentUnit === 'f' ? 'c' : 'f';
		currentUnit = newUnit;
		updateWeatherInfo(location, newUnit);
	}

	updateWeatherInfo('London', 'c');
}
