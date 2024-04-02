import { getFormattedWeatherInfo, autocomplete } from './api.js';
import humidityImg from '../public/img/humidity.svg';
import windImg from '../public/img/wind.svg';
import sunriseImg from '../public/img/sunrise.svg';
import sunsetImg from '../public/img/sunset.svg';

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
		document.addEventListener('click', (e) => {
			if (
				e.target !== input &&
				e.target !== completionsContainer &&
				!completionsContainer.contains(e.target)
			) {
				completionsContainer.innerHTML = '';
			}
		});
		input.addEventListener('focus', handleInput);

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
			} else if (input.value.length === 0) {
				completionsContainer.innerHTML = '';
			} else {
				const completions = await autocomplete(input.value);
				completionsContainer.innerHTML = '';
				completions.forEach((completion) => {
					const completionDiv = document.createElement('div');
					completionDiv.textContent = `${completion.name}, ${completion.region}`;
					completionDiv.addEventListener('click', () => {
						input.value = '';
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
		const region = document.createElement('p');
		const currentTemp = document.createElement('p');
		const condition = document.createElement('p');
		const conditionImg = document.createElement('img');
		location.setAttribute('id', 'location');
		location.textContent = weatherInfo.location;
		region.textContent = weatherInfo.region;
		currentTemp.textContent =
			currentUnit === 'f'
				? `${weatherInfo.currentWeather[0].currentTemp}°F`
				: `${weatherInfo.currentWeather[0].currentTemp}°C`;
		condition.textContent = weatherInfo.currentWeather[0].condition;
		conditionImg.src = weatherInfo.currentWeather[0].conditionImgSrc;

		const currentContainer = document.querySelector('#current');
		const localTime = weatherInfo.currentWeather[0].localTime;

		if (localTime >= 6 && localTime < 18) {
			currentContainer.className = 'day';
		} else {
			currentContainer.className = 'night';
		}

		currentWeatherContainer.append(
			location,
			region,
			currentTemp,
			conditionImg,
			condition,
		);
	}

	function renderTodayForecast(weatherInfo) {
		const todayForecastContainer = document.querySelector('#todayForecast');
		todayForecastContainer.innerHTML = '';
		weatherInfo.todayForecast.forEach((hour) => {
			const hourContainer = document.createElement('div');
			const time = document.createElement('h2');
			const temp = document.createElement('p');
			const conditionImg = document.createElement('img');
			time.textContent = hour.time;
			temp.textContent =
				currentUnit === 'f' ? `${hour.temp}°F` : `${hour.temp}°C`;
			conditionImg.src = hour.conditionImgSrc;
			hourContainer.append(time, temp, conditionImg);
			todayForecastContainer.appendChild(hourContainer);
		});
	}

	function renderTodayWeatherDetails(weatherInfo) {
		const todayWeatherDetailsContainer = document.querySelector(
			'#todayWeatherDetails',
		);

		todayWeatherDetailsContainer.innerHTML = '';

		const humidityContainer = document.createElement('div');
		const windContainer = document.createElement('div');
		const sunriseContainer = document.createElement('div');
		const sunsetContainer = document.createElement('div');

		const humidityLabel = document.createElement('h2');
		const windLabel = document.createElement('h2');
		const sunriseLabel = document.createElement('h2');
		const sunsetLabel = document.createElement('h2');

		const humidityImgElement = document.createElement('img');
		const windImgElement = document.createElement('img');
		const sunriseImgElement = document.createElement('img');
		const sunsetImgElement = document.createElement('img');

		humidityImgElement.src = humidityImg;
		windImgElement.src = windImg;
		sunriseImgElement.src = sunriseImg;
		sunsetImgElement.src = sunsetImg;

		const humidity = document.createElement('p');
		const wind = document.createElement('p');
		const sunrise = document.createElement('p');
		const sunset = document.createElement('p');

		humidityLabel.textContent = 'Humidity';
		windLabel.textContent = 'Wind';
		sunriseLabel.textContent = 'Sunrise';
		sunsetLabel.textContent = 'Sunset';

		humidity.textContent = `${weatherInfo.currentWeather[0].humidity}%`;
		wind.textContent = `${weatherInfo.currentWeather[0].wind} KPH`;
		sunrise.textContent = weatherInfo.currentWeather[0].sunrise;
		sunset.textContent = weatherInfo.currentWeather[0].sunset;

		humidityContainer.append(humidityLabel, humidityImgElement, humidity);
		windContainer.append(windLabel, windImgElement, wind);
		sunriseContainer.append(sunriseLabel, sunriseImgElement, sunrise);
		sunsetContainer.append(sunsetLabel, sunsetImgElement, sunset);

		todayWeatherDetailsContainer.append(
			humidityContainer,
			windContainer,
			sunriseContainer,
			sunsetContainer,
		);
	}

	function renderFutureForecast(weatherInfo) {
		const futureForecastContainer =
			document.querySelector('#futureForecast');
		futureForecastContainer.innerHTML = '';
		weatherInfo.futureForecast.forEach((day) => {
			const dayContainer = document.createElement('div');
			const dayOfWeek = document.createElement('h2');
			const maxTemp = document.createElement('p');
			const minTemp = document.createElement('p');
			const conditionImg = document.createElement('img');
			dayOfWeek.textContent = day.dayOfWeek;
			maxTemp.textContent =
				currentUnit === 'f' ? `${day.maxTemp}°F` : `${day.maxTemp}°C`;
			minTemp.textContent =
				currentUnit === 'f' ? `${day.minTemp}°F` : `${day.minTemp}°C`;
			conditionImg.src = day.conditionImgSrc;
			dayContainer.append(dayOfWeek, maxTemp, minTemp, conditionImg);
			futureForecastContainer.appendChild(dayContainer);
		});
	}

	async function updateWeatherInfo(city) {
		try {
			const unit = currentUnit;
			const weatherInfo = await getFormattedWeatherInfo(city, unit);
			renderCurrentWeather(weatherInfo);
			renderTodayWeatherDetails(weatherInfo);
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
			unit === 'f' ? 'Celsius °C' : 'Fahrenheit °F';
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

	function createFooter() {
		const footer = document.querySelector('footer');
		const copyrightParagraph = document.createElement('p');
		copyrightParagraph.innerHTML = `Copyright &copy;<span id='year'>${new Date().getFullYear()}</span> sebastianmsz`;
		const githubLink = document.createElement('a');
		githubLink.href = 'https://github.com/sebastianmsz';
		githubLink.target = '_blank';
		githubLink.innerHTML =
			'<i class="fa-brands fa-github" aria-hidden="true"></i>';
		copyrightParagraph.appendChild(githubLink);
		footer.appendChild(copyrightParagraph);
	}

	createFooter();
	updateWeatherInfo('London', 'c');
}
