import { getFormattedWeatherInfo, autocomplete } from './api.js';
import humidityImg from '../public/img/humidity.svg';
import windImg from '../public/img/wind.svg';
import sunriseImg from '../public/img/sunrise.svg';
import sunsetImg from '../public/img/sunset.svg';
import titleImg from '../public/img/title.svg';
import '@fortawesome/fontawesome-free/js/solid';

export default async function ui() {
	let currentUnit = localStorage.getItem('weatherUnit') || 'c';
	let lastLocation = localStorage.getItem('lastLocation') || 'London';
	let searchTimeout;
	let geolocationTimeout;
	let lastKnownPosition = null;
	let positionTimestamp = 0;
	const POSITION_MAX_AGE = 5 * 60 * 1000;

	const titleImage = document.querySelector('#current > img');
	if (titleImage) {
		titleImage.src = titleImg;
	}

	function setupGeolocationButton() {
		const locationButton = document.querySelector('#getCurrentLocation');
		locationButton.addEventListener('click', handleGeolocation);
	}

	async function handleGeolocation() {
		if (!("geolocation" in navigator)) {
			alert('Geolocation is not supported by your browser');
			return;
		}

		const locationButton = document.querySelector('#getCurrentLocation');
		
		if (geolocationTimeout) {
			clearTimeout(geolocationTimeout);
			geolocationTimeout = null;
		}

		if (locationButton.disabled) {
			locationButton.disabled = false;
			locationButton.style.opacity = '1';
			return;
		}

		locationButton.disabled = true;
		locationButton.style.opacity = '0.7';

		const now = Date.now();
		if (lastKnownPosition && (now - positionTimestamp < POSITION_MAX_AGE)) {
			await updateWeatherWithPosition(lastKnownPosition);
			locationButton.disabled = false;
			locationButton.style.opacity = '1';
			return;
		}

		try {
			const position = await getCurrentPosition();
			lastKnownPosition = position;
			positionTimestamp = now;
			await updateWeatherWithPosition(position);
		} catch (error) {
			handleGeolocationError(error);
		} finally {
			locationButton.disabled = false;
			locationButton.style.opacity = '1';
		}
	}

	function getCurrentPosition() {
		return new Promise((resolve, reject) => {
			const options = {
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: POSITION_MAX_AGE
			};

			geolocationTimeout = setTimeout(() => {
				reject(new Error('Location request timed out'));
			}, options.timeout + 1000); 

			navigator.geolocation.getCurrentPosition(
				(position) => {
					clearTimeout(geolocationTimeout);
					resolve(position);
				},
				(error) => {
					clearTimeout(geolocationTimeout);
					reject(error);
				},
				options
			);
		});
	}

	async function updateWeatherWithPosition(position) {
		try {
			const { latitude, longitude } = position.coords;
			const formattedLat = latitude.toFixed(4);
			const formattedLon = longitude.toFixed(4);
			const location = `${formattedLat},${formattedLon}`;
			
			const weatherInfo = await getFormattedWeatherInfo(location, currentUnit);
			if (!weatherInfo) {
				throw new Error('Failed to fetch weather data');
			}
			
			localStorage.setItem('lastLocation', location);
			await updateWeatherInfo(location);
			
			const searchInput = document.querySelector('#location-input');
			if (searchInput && weatherInfo.location) {
				searchInput.value = `${weatherInfo.location}, ${weatherInfo.region}`;
			}
		} catch (error) {
			console.error('Weather API error:', error);
			alert('Unable to fetch weather data for your location. Please try searching manually.');
			throw error;
		}
	}

	function handleGeolocationError(error) {
		console.error('Geolocation error:', error);
		let errorMessage = 'Unable to retrieve your location. ';
		
		if (error.code) {
			switch (error.code) {
				case error.PERMISSION_DENIED:
					errorMessage += 'Please enable location access in your browser settings.';
					break;
				case error.POSITION_UNAVAILABLE:
					errorMessage += 'Location information is unavailable.';
					break;
				case error.TIMEOUT:
					errorMessage += 'Location request timed out.';
					break;
				default:
					errorMessage += 'Please try searching manually.';
			}
		} else {
			errorMessage += error.message || 'Please try searching manually.';
		}
		
		alert(errorMessage);
	}

	function renderSearchBar() {
		const searchBarContainer = document.querySelector(
			'#searchBarContainer',
		);
		const input = document.createElement('input');
		const completionsContainer = document.createElement('div');
		completionsContainer.setAttribute('id', 'completionsContainer');

		input.setAttribute('type', 'text');
		input.setAttribute('placeholder', 'Search location');
		input.setAttribute('id', 'location-input');

		document.removeEventListener('click', handleClickOutside);

		input.addEventListener('input', handleInput);
		input.addEventListener('focus', handleInput);
		document.addEventListener('click', handleClickOutside);

		searchBarContainer.append(input, completionsContainer);
	}
	renderSearchBar();

	function handleClickOutside(e) {
		const completionsContainer = document.querySelector(
			'#completionsContainer',
		);
		const input = document.querySelector('#location-input');
		if (
			e.target !== input &&
			e.target !== completionsContainer &&
			!completionsContainer?.contains(e.target)
		) {
			completionsContainer.innerHTML = '';
		}
	}

	async function handleInput() {
		try {
			const completionsContainer = document.querySelector(
				'#completionsContainer',
			);
			const input = document.querySelector('#location-input');

			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}

			if (input.value.length < 3) {
				completionsContainer.innerHTML = '';
				return;
			}

			searchTimeout = setTimeout(async () => {
				try {
					const completions = await autocomplete(input.value);
					completionsContainer.innerHTML = '';

					if (completions && completions.length > 0) {
						completions.forEach((completion) => {
							const completionDiv = document.createElement('div');
							completionDiv.textContent = `${completion.name}, ${completion.region}`;
							completionDiv.addEventListener('click', () => {
								input.value = `${completion.name}, ${completion.region}`;
								completionsContainer.innerHTML = '';
								localStorage.setItem('lastLocation', completion.name);
								updateWeatherInfo(completion.name);
							});
							completionsContainer.appendChild(completionDiv);
						});
					}
				} catch (error) {
					console.error('Error fetching suggestions:', error);
				}
			}, 300); 
		} catch (error) {
			console.error('Error in handleInput:', error);
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
				currentUnit === 'f'
					? `${Math.round(hour.temp)}°F`
					: `${Math.round(hour.temp)}°C`;
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

		const details = [
			{
				label: 'Humidity',
				value: `${weatherInfo.currentWeather[0].humidity}%`,
				icon: humidityImg,
				unit: '',
			},
			{
				label: 'Wind Speed',
				value: weatherInfo.currentWeather[0].wind,
				icon: windImg,
				unit: 'KPH',
			},
			{
				label: 'Sunrise',
				value: weatherInfo.currentWeather[0].sunrise,
				icon: sunriseImg,
				unit: '',
			},
			{
				label: 'Sunset',
				value: weatherInfo.currentWeather[0].sunset,
				icon: sunsetImg,
				unit: '',
			},
		];

		details.forEach((detail) => {
			const container = document.createElement('div');
			const label = document.createElement('h2');
			const imgElement = document.createElement('img');
			const value = document.createElement('p');

			label.textContent = detail.label;
			imgElement.src = detail.icon;
			value.textContent = `${detail.value}${detail.unit ? ' ' + detail.unit : ''}`;

			container.append(label, imgElement, value);
			todayWeatherDetailsContainer.appendChild(container);
		});
	}

	function renderFutureForecast(weatherInfo) {
		const futureForecastContainer =
			document.querySelector('#futureForecast');
		futureForecastContainer.innerHTML = '';

		weatherInfo.futureForecast.forEach((day) => {
			const dayContainer = document.createElement('div');
			const dayOfWeekContainer = document.createElement('h2');
			const tempContainer = document.createElement('div');
			const maxTemp = document.createElement('p');
			const minTemp = document.createElement('p');
			const conditionImg = document.createElement('img');

			dayOfWeekContainer.textContent = day.dayOfWeek;
			maxTemp.textContent =
				currentUnit === 'f'
					? `${Math.round(day.maxTemp)}°F`
					: `${Math.round(day.maxTemp)}°C`;
			minTemp.textContent =
				currentUnit === 'f'
					? `${Math.round(day.minTemp)}°F`
					: `${Math.round(day.minTemp)}°C`;
			minTemp.style.opacity = '0.7';
			conditionImg.src = day.conditionImgSrc;

			tempContainer.style.display = 'flex';
			tempContainer.style.gap = '10px';
			tempContainer.append(maxTemp, minTemp);

			dayContainer.append(
				dayOfWeekContainer,
				tempContainer,
				conditionImg,
			);
			futureForecastContainer.appendChild(dayContainer);
		});
	}

	async function updateWeatherInfo(city) {
		try {
			const unit = currentUnit;
			const weatherInfo = await getFormattedWeatherInfo(city, unit);
			if (weatherInfo) {
				localStorage.setItem('lastLocation', city);
				localStorage.setItem('weatherUnit', unit);
				renderCurrentWeather(weatherInfo);
				renderTodayWeatherDetails(weatherInfo);
				renderTodayForecast(weatherInfo);
				renderFutureForecast(weatherInfo);
				renderTempUnitButton(unit);
			}
		} catch (error) {
			console.error('Error fetching weather information:', error);
		}
	}

	function renderTempUnitButton(unit) {
		const changeTemperatureUnitBtn = document.querySelector(
			'#changeTemperatureUnit',
		);
		changeTemperatureUnitBtn.replaceWith(changeTemperatureUnitBtn.cloneNode(true));
		const newBtn = document.querySelector('#changeTemperatureUnit');
		newBtn.textContent =
			unit === 'f' ? 'Celsius °C' : 'Fahrenheit °F';
		newBtn.addEventListener(
			'click',
			tempUnitButtonClickHandler,
		);
	}

	function tempUnitButtonClickHandler() {
		const location = localStorage.getItem('lastLocation') || document.querySelector('#location').textContent;
		const newUnit = currentUnit === 'f' ? 'c' : 'f';
		currentUnit = newUnit;
		localStorage.setItem('weatherUnit', newUnit);
		updateWeatherInfo(location, newUnit);
	}

	function createFooter() {
		const footer = document.querySelector('footer');
		const copyrightParagraph = document.createElement('p');
		const currentYear = new Date().getFullYear();
		
		copyrightParagraph.innerHTML = `Copyright © ${currentYear} `;
		
		const authorLink = document.createElement('a');
		authorLink.href = 'https://github.com/sebastianmsz';
		authorLink.target = '_blank';
		authorLink.rel = 'noopener noreferrer';
		authorLink.setAttribute('aria-label', 'Visit Sebastian Molina\'s GitHub profile');
		
		const authorText = document.createElement('span');
		authorText.textContent = 'sebastianmsz';
		
		const githubIcon = document.createElement('i');
		githubIcon.className = 'fa-brands fa-github';
		githubIcon.setAttribute('aria-hidden', 'true');
		
		authorLink.append(authorText, githubIcon);
		copyrightParagraph.appendChild(authorLink);
		footer.appendChild(copyrightParagraph);
	}

	window.addEventListener('beforeunload', () => {
		if (geolocationTimeout) {
			clearTimeout(geolocationTimeout);
		}
	});

	createFooter();
	setupGeolocationButton();
	updateWeatherInfo(lastLocation, currentUnit);
}
