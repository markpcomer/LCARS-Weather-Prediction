const rootAPIUrl = 'https://api.openweathermap.org';
const APIKey = '20ef3ea6758a437fd090faae1ef08152';

// // ========== DOM Utilities ==========
// FUNCTION get DOM references
//     RETURN references to form, input, containers

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const searchHistoryEl = document.querySelector('#history');
const todayCard = document.querySelector('#today-card');
const futureCards = document.querySelector('#future-cards');


// // ========== Day.js Setup ==========
// FUNCTION setup date/time plugins
// LOAD utc and timezone plugins into dayjs

dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

const analogWeatherCities = [
    {city: 'San Francisco', abbreviation: 'SF', lat: 37.7749, lon: 122.4194},
    {city: 'Tokyo', abbreviation: 'TYO', lat: 35.6897, lon: 139.6922},
    {city: 'Dehli', abbreviation: 'DL', lat: 28.6139, lon: 77.2089},
    {city: 'Shanghai', abbreviation: 'HU', lat: 31.2286, lon: 121.4747},
    {city: 'Dhaka', abbreviation: 'DAC', lat: 23.8042, lon: 90.4153},
    {city: 'Cairo', abbreviation: 'Cairo', lat: 30.0444, lon: 31.2358},
    {city: 'New York City',abbreviation: 'NYC', lat: 40.7128, lon: -74.0060}
];

// console.log(analogWeatherCities);


function fetchAnalogWeather(location) {
    const { lat, lon, city } = location;

    console.log('Fetching data for:', city);
    console.log('Latitude:', lat, "Longitude:", lon);

    if (!lat || !lon) {
        console.error('Missing lat/lon for:', city);
        return;
    }

    const apiUrl = `${rootAPIUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
    const pollutionApiUrl = `${rootAPIUrl}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIKey}`;

    Promise.all([
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
        

        console.log('City:', city);
        console.log('Weather Data:', apiData);
        console.log('Pollution Data', pollutionData);
    })
    .catch(function(err) {
        console.error('Error:', city, err);
    })

}

fetchAnalogWeather(analogWeatherCities[6]);

// analogWeatherCities.forEach(function(cityObj) {
//     fetchAnalogWeather(cityObj);
// });


function createAnalogWeatherRow(weatherData, pollutionData) {
    let city = weatherData.city.name;
    let sky = weatherData.list[0].weather[0].main;
    let temp = weather.list[0].main.temp;
    let humidity = weatherData.list[0].main.humidity;
    let wind = weatherData.list[0].wind.speed;
    let lat = weatherData.city.coord.lat;
    let lon = weatherData.city.coord.lon;
    let pollution = pollutionData.list[0].main.aqi;
    
    let resultRow = document.createElement('div');

    let cityResult = document.createElement('div');
    let skyResult = document.createElement('div');
    let tempResult = document.createElement('div');
    let humidityResult = document.createElement('div');
    let windResult = document.createElement('div');
    let latResult = document.createElement('div');
    let lonResult = document.createElement('div');
    let airQualityResult = document.createElement('div');

    resultRow.setAttribute('class', 'row', 'row-cols-6', 'm-0', 'p-0');

    cityResult.setAttribute('class', 'col-sm-1');
    skyResult.setAttribute('class', 'col-sm-1');
    tempResult.setAttribute('class', 'col-sm-1');
    humidityResult.setAttribute('class', 'col-sm-1');
    windResult.setAttribute('class', 'col-sm-2');
    latResult.setAttribute('class', 'col-sm-2');
    lonResult.setAttribute('class', 'col-sm-2');
    airQualityResult.setAttribute('class', 'col-sm-2');


}

function renderAnalogCities() {
    analogWeatherCities.forEach(function(cityObj) {
        fetchAnalogWeather(cityObj);
    })
}

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

// console.log("Current Stardate: " + getStardate());




// // ========== Search History ==========
// FUNCTION get stored history from local storage
//     IF history exists
//         RETURN parsed history
//     ELSE
//         RETURN empty list

// FUNCTION save history to local storage

// FUNCTION create button for a past search
//     CREATE button element with search term

// FUNCTION render all history buttons in container
//     CLEAR container
//     FOR each item in history (latest first)
//         CREATE button
//         ADD to container

// FUNCTION add new search to history
//     IF already in history, STOP
//     ADD to history list
//     SAVE history
//     RE-RENDER history buttons

// FUNCTION initialize history on app load
//     GET stored history
//     RENDER buttons
//     RETURN history list

// // ========== Weather Rendering ==========
// FUNCTION create today's weather card
//     CREATE card element with:
//         - city name
//         - date
//         - weather icon
//         - temp, wind, humidity
//     RETURN card

// FUNCTION show today's weather in container
//     CLEAR container
//     CREATE card
//     ADD card to container

function renderTodayWeatherCard(weatherData) {
    todayCard.innerHTML = ' ';

    if(!weatherData) {
        console.error('Weather data is missing or invalid.');
        return;
    }
    
    let todayDate = dayjs.format('MM/DD/YYYY');
    let city = weatherData.city.name;
    let temp;
    let humidity;
    let wind;


}

// FUNCTION create 1 forecast card
//     CREATE card with:
//         - forecast date
//         - icon, temp, wind, humidity
//     RETURN card

// FUNCTION render all forecast cards
//     GET forecast data between tomorrow and 5 days out at noon
//     CLEAR container
//     ADD "5-Day Forecast" title
//     FOR each valid forecast
//         CREATE forecast card
//         ADD to container

// FUNCTION render both current + forecast weather
//     RENDER current weather
//     RENDER forecast

// // ========== API Calls ==========
// FUNCTION fetch weather by coordinates
//     MAKE API call with lat/lon
//     ON success:
//         RUN success function with city + weather data
//     ON failure:
//         LOG error

// FUNCTION fetchCurrentWeatherData(searchValue):

//   SET geoCodeURL TO "geocoding API URL with searchValue and API key"

//   MAKE network request to geoCodeURL
//     ON response:
//       CONVERT response to JSON
//       IF no data found (empty array or no first item):
//         LOG "location not found"
//       ELSE:
//         EXTRACT latitude and longitude from the first result

//         SET weatherApiUrl TO "weather API URL using lat, lon, and API key"

//         MAKE network request to weatherApiUrl
//           ON response:
//             CONVERT response to JSON
//             CALL renderCurrentWeatherCard with the weather data
//             CALL citySearchHistory with the original searchValue
//           ON error:
//             LOG "Error in inner fetch" with error details

//     ON error:
//       LOG "Error in outer fetch" with error details


const exampleLocation = {
    lat: 40.7128,        // Latitude of New York City
    lon: -74.0060,       // Longitude of New York City
    name: 'New York'     // City name
  };
  
function fetchWeather(searchValue) {
    console.log(`🔍 Starting weather data fetch for: ${searchValue}`);

    let geoCodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${searchValue}&limit=5&appid=${APIKey}`;
    console.log(`🌐 Geocode API URL: ${geoCodeURL}`);


    fetch(geoCodeURL)
        .then(function (res) {
            console.log('📡 Geocode response received:', res);
            return res.json();
        })
        .then(function (data) {
            console.log('📦 Parsed geocode data', data);

            if(!data[0]){
                console.error('Location not found.');
                return;
            } else {
                let { lat, lon } = data[0];
                console.log(`📍 Coordinates found: Latitude = ${lat}, Longitude = ${lon}.`);

                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
                // console.log(`🌦️ Weather API URL: ${weatherApiUrl}`);

                fetch(weatherApiUrl)
                .then(function (res) {
                    // console.log('Weather response received', res);
                    return res.json();
                })
                .then(function(weather){
                    //  function to render current weather card
                    // function to update search history (...?)
                    console.log('Weather handling complete', weather);
                })
                .catch(function(err){
                    console.error('Error fetching weather', err);
                })
            }
        })
        .catch(function(err){
            console.error('Error fetching geocode data.', err);
        })
}

function checkApiIsWorking() {
    
    console.log(`${rootAPIUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`);
}

checkApiIsWorking(exampleLocation);


function fetchWeatherData(location, onSuccess) {
    const { lat, lon, name: city } = location; 
    const coordinateSearchURL = `${rootAPIUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
    // console.log('Weather for:' + city);
    // console.log('Lat:' + lat);
    // console.log('Lon:' + lon);
    // console.log('API URL', coordinateSearchURL);

    fetch(coordinateSearchURL)
        .then((res) => {
            // console.log('Raw response received', res);
            return res.json();
        })
        .then((weatherData) => {
            // console.log('Parsed weather:', weatherData);
            onSuccess(city, weatherData);
        })
        
        .catch((err) => {
            console.error('Error fetching:', err);
        })
}

function handleWeatherData(cityName, weatherData) {
    console.log("Weather data for:", cityName);
    console.log(weatherData);
}

// fetchWeatherData(exampleLocation.name, handleWeatherData);

  




// FUNCTION fetch coordinates from search string
//     MAKE geocoding API call with search
//     ON success:
//         IF location found
//             ADD to history
//             FETCH weather for location
//             RENDER results
//         ELSE
//             SHOW "Location not found" alert
//     ON failure:
//         LOG error

// // ========== Event Handlers ==========
// FUNCTION on search form submit
//     PREVENT default form behavior
//     GET search value
//     IF empty, STOP
//     FETCH coordinates
//     CLEAR input

// FUNCTION on history button click
//     IF clicked target is a history button
//         GET search term from button
//         FETCH coordinates

// // ========== App Initialization ==========
// FUNCTION start app
//     SETUP date/time
//     GET DOM references
//     INITIALIZE history
//     LISTEN for form submit → handleSearchSubmit
//     LISTEN for history button click → handleHistoryClick

// CALL start app



