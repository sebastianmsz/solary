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
		const location = document.createElement('h1');
		location.setAttribute('id', 'location');
		const region = document.createElement('h2');
		const condition = document.createElement('h3');
		const currentTemp = document.createElement('h3');
		currentWeatherContainer.innerHTML = '';
		location.textContent = weatherInfo.location;
		region.textContent = weatherInfo.region;
		condition.textContent = weatherInfo.condition;
		currentTemp.textContent = weatherInfo.currentTemp;
		currentWeatherContainer.append(
			location,
			region,
			condition,
			currentTemp,
		);
	}

	function renderTodayForecast(weatherInfo) {
		const todayForecastContainer = document.querySelector('#todayForecast');
		todayForecastContainer.innerHTML = '';
		weatherInfo.hourlyForecast.forEach((hour) => {
			const hourContainer = document.createElement('div');
			const time = document.createElement('h3');
			const temp = document.createElement('h3');
			const condition = document.createElement('h3');
			time.textContent = `${hour.time}:00`;
			temp.textContent = hour.temp;
			condition.textContent = hour.condition;
			hourContainer.append(time, temp, condition);
			todayForecastContainer.appendChild(hourContainer);
		});
	}

	function renderFutureForecast(weatherInfo) {
		const futureForecastContainer =
			document.querySelector('#futureForecast');
		futureForecastContainer.innerHTML = '';
		weatherInfo.forecast.forEach((day) => {
			const dayContainer = document.createElement('div');
			const date = document.createElement('h3');
			const maxTemp = document.createElement('h3');
			const minTemp = document.createElement('h3');
			const condition = document.createElement('h3');
			date.textContent = day.date;
			maxTemp.textContent = `Max: ${day.maxTemp}`;
			minTemp.textContent = `Min: ${day.minTemp}`;
			condition.textContent = day.condition;
			dayContainer.append(date, maxTemp, minTemp, condition);
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

		changeTemperatureUnitBtn.removeEventListener(
			'click',
			tempUnitButtonClickHandler,
		);

		changeTemperatureUnitBtn.addEventListener(
			'click',
			tempUnitButtonClickHandler,
		);

		function tempUnitButtonClickHandler() {
			const location = document.querySelector('#location').textContent;
			const newUnit = unit === 'f' ? 'c' : 'f';
			changeTemperatureUnitBtn.textContent =
				newUnit === 'c' ? 'Change to Fahrenheit' : 'Change to Celsius';
			currentUnit = newUnit;
			updateWeatherInfo(location);
		}
	}

	updateWeatherInfo('cali', 'c');
}
