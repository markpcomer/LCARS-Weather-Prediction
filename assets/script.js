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

    analogHeaderContainer.append(headerRow);
}

async function renderAnalogCities() {
    renderAnalogWeatherHeader();
    
    for (let i = 0; i < analogWeatherCities.length; i++) {
        await fetchAnalogWeather(analogWeatherCities[i]);
    }
}

function renderTodayWeatherCard(weatherData) {
    todayCard.innerHTML = ' ';
    if(!weatherData) {
        console.error('Weather data is missing or invalid.');
        return;
    }
    
    let todayDate = dayjs();
    let currentStarDate = getStardate(todayDate);
    console.log(currentStarDate);

    const card = document.createElement('div');
    card.className = 'card';
    const cardBody = document.createElement('div'); 
    cardBody.className = 'card-body';
    card.append(cardBody);

    const cardHeading = document.createElement('h2');
    cardHeading.className = 'h3 card-heading';
    cardHeading.textContent = `${city} ${todayDate} Stardate: ${currentStarDate}`;

    const sky = document.createElement('p');
    sky.classList = 'card-text';
    sky.textContent = `${weatherData.list[0].weather[0].main}`;

    const temp = document.createElement('p');
    temp.classList = 'card-text';
    temp.textContent = `Temp: ${weatherData.list[0].main.temp}°F`;

    const humidity = document.createElement('p');
    humidity.classList = 'card-text';
    humidity.classList = `${weatherData.list[0].main.humidity}%`;

    const wind = document.createElement('p');
    wind.classList = 'card-text';
    wind.textContent = `Wind: ${wind} MPH`;

    const aqi = document.createElement('p');
    aqi.classList = 'card-text';
    aqi.textContent = `AQI: ${pollutionData.list[0].main.aqi}`;

    cardBody.append(cardHeading, sky, temp, humidity, wind, aqi);
    card.append(cardBody);
    
    todayCard.append(card);

}

function renderAllCards(city, data) {
    renderTodayWeatherCard(city, data.list[0], data.city.timezone);
}

function fetchWeatherData(location) {
    const { lat, lon} = location; 
    const city = location.name;

    var weatherAPI = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;

    fetch(weatherAPI)
        .then(function (res) {
            return res.json
        })
        .then(function (data) {
            renderItems(city, data);
        })
        .catch(function (err) {
            console.error(err)
        })
}


function fetchCoordinates(search) {
    var apiUrl = `${rootAPIUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${APIKey}`;

    fetch(apiUrl) 
        .then(function (res) {
            return res.json
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
    searchInput.value = ' ';
}

document.addEventListener('DOMContentLoaded', function () {
    renderAnalogCities();
});
searchForm.addEventListener('submit', handleSearchFormSubmit);


// const exampleLocation = {
//     lat: 40.7128,        // Latitude of New York City
//     lon: -74.0060,       // Longitude of New York City
//     name: 'New York'     // City name
//   };
  
// function fetchWeather(searchValue) {
//     console.log(`🔍 Starting weather data fetch for: ${searchValue}`);

//     let geoCodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${searchValue}&limit=5&appid=${APIKey}`;
//     console.log(`🌐 Geocode API URL: ${geoCodeURL}`);


//     fetch(geoCodeURL)
//         .then(function (res) {
//             console.log('📡 Geocode response received:', res);
//             return res.json();
//         })
//         .then(function (data) {
//             console.log('📦 Parsed geocode data', data);

//             if(!data[0]){
//                 console.error('Location not found.');
//                 return;
//             } else {
//                 let { lat, lon } = data[0];
//                 console.log(`📍 Coordinates found: Latitude = ${lat}, Longitude = ${lon}.`);

            //     const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
            //     // console.log(`🌦️ Weather API URL: ${weatherApiUrl}`);

            //     fetch(weatherApiUrl)
            //     .then(function (res) {
            //         // console.log('Weather response received', res);
            //         return res.json();
            //     })
            //     .then(function(weather){
            //         //  function to render current weather card
            //         // function to update search history (...?)
            //         console.log('Weather handling complete', weather);
            //     })
            //     .catch(function(err){
            //         console.error('Error fetching weather', err);
            //     })
            // }
//         })
//         .catch(function(err){
//             console.error('Error fetching geocode data.', err);
//         })
// }



// function fetchWeatherData(location, onSuccess) {
//     const { lat, lon, name: city } = location; 
//     const coordinateSearchURL = `${rootAPIUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
//     // console.log('Weather for:' + city);
//     // console.log('Lat:' + lat);
//     // console.log('Lon:' + lon);
//     // console.log('API URL', coordinateSearchURL);

//     fetch(coordinateSearchURL)
//         .then((res) => {
//             // console.log('Raw response received', res);
//             return res.json();
//         })
//         .then((weatherData) => {
//             // console.log('Parsed weather:', weatherData);
//             onSuccess(city, weatherData);
//         })
        
//         .catch((err) => {
//             console.error('Error fetching:', err);
//         })
// }

// function handleWeatherData(cityName, weatherData) {
//     console.log("Weather data for:", cityName);
//     console.log(weatherData);
// }

// fetchWeatherData(exampleLocation.name, handleWeatherData);




