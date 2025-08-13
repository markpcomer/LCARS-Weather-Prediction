const rootAPIUrl = 'https://api.openweathermap.org';
const APIKey = '20ef3ea6758a437fd090faae1ef08152';


const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const searchHistoryEl = document.querySelector('#history');
const todayCard = document.querySelector('#today-card');
const futureCards = document.querySelector('#future-cards');

const styleTag = document.createElement('style');
styleTag.innerHTML = `
    @keyframes colorchange {
        0% {color: #f80;}
        25% {color: #f80;}
        50% {color: #f80;}
        75% {color: #f80;}
        80% {color: black;}
        90% {color: black;}
        100% { color: #f5f6fa;}
    }

    @keyframes alert-colorchange {
        0% {color: yellow;}
        25% {color: yellow;}
        50% {color: yellow;}
        75% {color: yellow;}
        80% {color: black;}
        90% {color: black;}
        100% { color: #f5f6fa;}
    }

    @keyframes alert-danger {
        0% {color: red;}
        25% {color: red;}
        50% {color: red;}
        75% {color: red;}
        80% {color: black;}
        90% {color: black;}
        100% {color: #f5f6fa}
    }
`;

document.head.append(styleTag);


dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function getStardate() {
    const baseYear = 2323;
    // let today = dayjs().format('M/D/YYYY');
    let now = dayjs.utc();
    let year = now.year();
    const startOfYear = dayjs.utc(`${year}-01-01`);
    let dayOfYear = now.diff(startOfYear, 'day') + 1;
    let checkLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    let daysInYear = checkLeapYear ? 366 : 365;
    let yearDiff = year - baseYear;
    let starDateValue = 1000 * yearDiff + (dayOfYear / daysInYear ) * 1000;

    return starDateValue.toFixed(4);
}


const analogWeatherCities = [
    {city: 'San Francisco', abbreviation: 'SF', lat: 37.7749, lon: -122.4194},
    {city: 'Tokyo', abbreviation: 'TYO', lat: 35.6897, lon: 139.6922},
    {city: 'Dehli', abbreviation: 'DL', lat: 28.6139, lon: 77.2089},
    {city: 'Shanghai', abbreviation: 'HU', lat: 31.2286, lon: 121.4747},
    {city: 'Dhaka', abbreviation: 'DAC', lat: 23.8042, lon: 90.4153},
    {city: 'Cairo', abbreviation: 'Cairo', lat: 30.0444, lon: 31.2358},
    {city: 'New York City',abbreviation: 'NYC', lat: 40.7128, lon: -74.0060}
];



function fetchAnalogWeather(location) {
    const { lat, lon, city, abbreviation } = location;

    if (!lat || !lon) {
        console.error('Missing lat/lon for:', city);
        return Promise.resolve();
    }

    const apiUrl = `${rootAPIUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
    const pollutionApiUrl = `${rootAPIUrl}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIKey}`;

    return Promise.all([
        fetch(apiUrl)
            .then(function (res) {
                return res.json();
            }),
        fetch(pollutionApiUrl)
            .then(function (res) {
                return res.json();
            }) 
            
    ])
    .then(function(results) {
        let weatherData = results[0];
        let pollutionData = results[1];
        createAnalogWeatherRow(abbreviation, weatherData, pollutionData);
    })
    .catch(function(err) {
        console.error('Error:', city, err);
    })
}

function createAnalogWeatherRow(abbreviation, weatherData, pollutionData) {
    const analogContainer = document.querySelector('#analog-forecast');
    analogContainer.setAttribute('class', 'm-0');

    // if (!weatherData.list || weatherData.list.length) return;

    let sky = weatherData.list[0].weather[0].main;
    let temp = weatherData.list[0].main.temp;
    let humidity = weatherData.list[0].main.humidity;
    let wind = weatherData.list[0].wind.speed;
    let lat = weatherData.city.coord.lat;
    let lon = weatherData.city.coord.lon;
    let aqi = pollutionData.list[0].main.aqi;
    
    function createAnalogCells(className, content, value, thresholds) {
        let li = document.createElement('li');
        li.setAttribute('class', className);
        li.textContent = content;

        if(thresholds) {
            if(value >= thresholds.danger) {
                li.style.animation = 'danger-colorchange 3s infinite';
            } else if (value >= thresholds.alert) {
                li.style.animation = 'alert-colorchange 3s infinite'
            } else {
                li.style.animation = 'colorchange 3s infinite';
            }
        } else {
            li.style.animation = 'colorchange 3s infinite';
        }
        return li;
    }

        let resultRow = document.createElement('ul');
        resultRow.setAttribute('class', 'analog-row row row-cols-6 m-0 p-0 g-0');

        let cityResult = createAnalogCells('col-sm-1 text-center', abbreviation);
        let skyResult = createAnalogCells('col-sm-1 text-center', sky);
        let tempResult = createAnalogCells('col-sm-1 text-center', `${temp.toFixed(0)}°F`, temp, {danger: 100, alert: 80});
        let humidityResult = createAnalogCells('col-sm-1 text-center', `${humidity}%`, humidity, {danger: 80, alert: 60});
        let windResult = createAnalogCells('col-sm-2 text-center', `${wind}mph`, wind, {danger: 55, alert: 30});
        let latResult = createAnalogCells('col-sm-2 text-center', lat);
        let lonResult = createAnalogCells('col-sm-2 text-center', lon);
        let airQualityResult = createAnalogCells('col-sm-2 text-center',`aqi: ${aqi}`, aqi, {danger: 4, alert: 3});

        resultRow.append(cityResult, skyResult, tempResult, humidityResult, 
            windResult, latResult, lonResult, airQualityResult);

        analogContainer.append(resultRow);   
    }

function renderAnalogWeatherHeader() {
    const analogHeaderContainer = document.createElement('div');
    analogHeaderContainer.setAttribute('class','d-flex');

    const headerRow = document.createElement('ul');
    headerRow.setAttribute('class', 'row m-0 mb-0 text-white');
    const headers = ['City', 'Sky', 'Temp', 'Hum', 'Wind', 'Lat', 'Lon', 'AQI'];
    const sizes = ['col-sm-1', 'col-sm-1', 'col-sm-1', 'col-sm-1', 'col-sm-2', 'col-sm-2', 'col-sm-2', 'col-sm-2'];
    
    for (let i = 0; i < headers.length; i++) {
        let col = document.createElement('div');
        col.className = sizes[i];
        col.textContent = headers[i];
        headerRow.append(col);
    }

    // analogHeaderContainer.append(headerRow);
    document.querySelector('#analog-forecast').prepend(analogHeaderContainer);

}

async function renderAnalogCities() {
    renderAnalogWeatherHeader();
    
    for (let i = 0; i < analogWeatherCities.length; i++) {
        await fetchAnalogWeather(analogWeatherCities[i]);
    }
}

function renderTodayWeatherCard(city, weatherData, pollutionData) {
    todayCard.innerHTML = ' ';
    if(!weatherData) {
        console.error('Weather data is missing or invalid.');
        return;
    }
    
    let todayDate = dayjs().format('M/D/YYYY');
    let currentStarDate = getStardate(todayDate);
    console.log(currentStarDate);

    const card = document.createElement('div');
    // card.setAttribute('class','current-card');
    // card.classList.add('current-card');
    card.className = 'current-card';
    
    const cardBody = document.createElement('div'); 
    // cardBody.setAttribute('class', 'current-card-body card-body rounded-3');
    // cardBody.className = 'card-body';
    // cardBody.classList.add('current-card-body');
    cardBody.className = 'current-card-body';
    


    const cardHeading = document.createElement('h1');
    cardHeading.className = 'h3 card-heading';
    cardHeading.textContent = `${city} ${todayDate} Stardate: ${currentStarDate}`;

    const sky = document.createElement('p');
    sky.classList = 'card-text';
    sky.textContent = `Sky: ${weatherData.list[0].weather[0].main}`;

    const temp = document.createElement('p');
    temp.classList = 'card-text';
    temp.textContent = `Temp: ${weatherData.list[0].main.temp}°F`;

    const humidity = document.createElement('p');
    humidity.classList = 'card-text';
    humidity.textContent = `Humidity: ${weatherData.list[0].main.humidity}%`;

    const wind = document.createElement('p');
    wind.classList = 'card-text';
    wind.textContent = `Wind: ${weatherData.list[0].wind.speed} MPH`;

    const aqi = document.createElement('p');
    aqi.classList = 'card-text';
    aqi.textContent = `AQI: ${pollutionData.list[0].main.aqi}`;

    cardBody.append(cardHeading, sky, temp, humidity, wind, aqi);
    card.append(cardBody);
    
    todayCard.appendChild(card);

}

function renderFutureWeatherCard(forecast, pollutionData) {
    let sky = forecast.weather[0].main;
    let temp = forecast.main.temp;
    let humidity = forecast.main.humidity;
    let wind = forecast.wind.speed;
    let aqi = pollutionData.list[0].main.aqi;

    const col = document.createElement('div');
    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');

    const card = document.createElement('div');
    card.setAttribute('class', 'h-100');

    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body p-3 text-center');
    cardBody.classList.add('five-day-cardBody');

    const cardTitle = document.createElement('h3');
    cardTitle.setAttribute('class', 'card-title');
    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');

    const starDateEl = document.createElement('h4');
    starDateEl.setAttribute('class', 'card-title');
    starDateEl.textContent = `Stardate: ${getStardate()}`;

    const skyEl = document.createElement('p');
    skyEl.setAttribute('class', 'card-text');
    skyEl.textContent = `Sky: ${sky}`;

    const tempEl = document.createElement('p');
    tempEl.setAttribute('class', 'card-text');
    tempEl.textContent = `Temp: ${temp} °F`;

    const humEl = document.createElement('p');
    humEl.setAttribute('class', 'card-text');
    humEl.textContent = `Humidity: ${humidity} %`;

    const windEl = document.createElement('p');
    windEl.setAttribute('class', 'card-text');
    windEl.textContent = `Wind: ${wind} MPH`;

    const aqiEl = document.createElement('p');
    aqiEl.setAttribute('class', 'card-text');
    aqiEl.textContent = `AQI: ${aqi}`;

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, starDateEl, skyEl, tempEl, humEl, windEl, aqiEl);

    futureCards.append(col);
}

function renderForecastSection(dailyForecast, pollutionData) {
    let startDate = dayjs().add(1, 'day').startOf('day').unix();
    let endDate = dayjs().add(6, 'day').startOf('day').unix();

    let headingCol = document.createElement('div');
    headingCol.setAttribute('class', 'col-12 text-white');

    let heading = document.createElement('h4');
    heading.textContent = '5-Day Federation Forecast';

    headingCol.append(heading);

    futureCards.innerHTML = '';
    futureCards.append(headingCol);

    for (let i = 0; i < dailyForecast.length; i++) {
        const forecast = dailyForecast[i];
        if (forecast.dt >= startDate && forecast.dt < endDate) {
            if (forecast.dt_txt.slice(11, 13) === "12") {
                renderFutureWeatherCard(forecast, pollutionData);
            }
        }
    }


}

function renderAllCards(city, weatherData, pollutionData) {
    renderTodayWeatherCard(city, weatherData, pollutionData);
    renderForecastSection(weatherData.list, pollutionData);
}

function fetchWeatherData(location) {
    let { lat, lon } = location; 
    let city = location.name;

    const weatherAPI = `${rootAPIUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
    const pollutionApiUrl = `${rootAPIUrl}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIKey}`;

        return Promise.all([
            fetch(weatherAPI)
                .then(function (res) {
                    return res.json();
                }),
            fetch(pollutionApiUrl)
                .then(function (res) {
                    return res.json();
                })
        ])
        .then(function(res) {
            let weatherData = res[0];
            let pollutionData = res[1];
            renderAllCards(city, weatherData, pollutionData);
        })
        .catch(function(err) {
            console.error('Error:', city, err);
        })
}


function fetchCoordinates(search) {
    var apiUrl = `${rootAPIUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${APIKey}`;

    fetch(apiUrl) 
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert('Federation City Not Found')
            } else {
                fetchWeatherData(data[0]);
            }
        })
        .catch(function (err) {
            console.error(err)
        });
}

function handleSearchFormSubmit(e) {
    if (!searchInput.value)  {
        return;
    }
    e.preventDefault();
    let search = searchInput.value.trim();
    fetchCoordinates(search);
    searchInput.value = '';
}

document.addEventListener('DOMContentLoaded', function () {
    renderAnalogCities();
});
searchForm.addEventListener('submit', handleSearchFormSubmit);












