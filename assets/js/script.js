var APIKey = "&appid=e0f3fd1758eb9ee23eebdfd362d21c11";
var cityInput = document.querySelector("#citySearch");

// On page load adds search handler and generates Seattle weather data
window.addEventListener("load", function () {
  var search = document.querySelector("#searchForm");
  var cityInfo = { cityName: "Seattle", lat: 47.6038321, lon: -122.3300624 };

  // Sends user city input to getLatLon() to get latitude and longitude
  search.addEventListener("submit", function (event) {
    event.preventDefault();
    cityInfo.cityName = cityInput.value;
    getLatLon(cityInfo);
  });

  // Loads Seattle weather data as placeholder until user inputs city
  getWeatherData(cityInfo);
  loadSearchList();
});

// Returns longitude and latitude from city input
function getLatLon(cityInfo) {
  var url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInfo.cityName}${APIKey}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Checks to see if user's city input was valid
      if (!data[0]) {
        alert("Please enter a valid city.");
        cityInput.value = "";
        return;
      } else {
        cityInfo.lat = data[0].lat;
        cityInfo.lon = data[0].lon;

        // Sends user's city input info to store in local storage and to display weather data on webpage
        storeCitySearch(cityInfo);
        getWeatherData(cityInfo);
      }
    });
}

// Stores user city input into local storage
function storeCitySearch(cityInfo) {
  var searchHistory = [];

  if (!localStorage.getItem("searchHistory")) {
    searchHistory.push(cityInfo);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  } else {
    var existingHistory = localStorage.getItem("searchHistory");
    searchHistory = JSON.parse(existingHistory);

    for (let i = 0; i < searchHistory.length; i++) {
      if (cityInfo.cityName === searchHistory[i].cityName) {
        searchHistory.splice(i, 1);
      }
    }

    searchHistory.unshift(cityInfo);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }

  // Loads user's search history from local storage onto webpage
  loadSearchList();
}

// Generates users search history from local storage
function loadSearchList() {
  var searchList = document.querySelector("#searchHistory");

  while (searchList.lastChild) {
    searchList.removeChild(searchList.lastChild);
  }

  var existingHistory = localStorage.getItem("searchHistory");
  var searchHistory = JSON.parse(existingHistory);

  if (!localStorage.getItem("searchHistory")) {
    return;
  } else {
    for (let i = 0; i < searchHistory.length; i++) {
      var listEl = document.createElement("li");
      listEl.textContent = searchHistory[i].cityName;
      listEl.setAttribute("data-lat", searchHistory[i].lat);
      listEl.setAttribute("data-lon", searchHistory[i].lon);

      listEl.addEventListener("click", function () {
        getWeatherData(searchHistory[i]);
      });

      searchList.appendChild(listEl);
    }
  }
}

// Fetches weather data from API
function getWeatherData(cityInfo) {
  var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityInfo.lat}&lon=${cityInfo.lon}&units=imperial${APIKey}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Sends weather data and city info to display on webpage
      displayWeather(data, cityInfo.cityName);
    });
}

// Displays current weather data on webpage
function displayWeather(data, city) {
  var currentDayInfo = document.querySelector("#currentDayInfo");
  var today = requestDay(0);

  var currentCity = currentDayInfo.querySelector("#currentCity");
  var currentTemp = currentDayInfo.querySelector("#currentTemp");
  var currentWind = currentDayInfo.querySelector("#currentWind");
  var currentHumidity = currentDayInfo.querySelector("#currentHumidity");
  var currentUv = currentDayInfo.querySelector("#currentUv");

  var icon = currentDayInfo.querySelector("img");
  var currentWeatherIcon = data.current.weather[0].icon;

  currentCity.textContent = city + " (" + today + ") ";
  icon.setAttribute("src", requestIcon(currentWeatherIcon));
  currentTemp.textContent = `Temp: ${data.current.temp}\xB0F`;
  currentWind.textContent = `Wind: ${data.current.wind_speed} MPH`;
  currentHumidity.textContent = `Humidity: ${data.current.humidity}%`;

  var uv = data.current.uvi;
  currentUv.textContent = uv;

  // Changes background color according to current UV index
  if (uv >= 0 && uv < 3) {
    currentUv.style.backgroundColor = "#8ec641";
  } else if (uv >= 3 && uv < 6) {
    currentUv.style.backgroundColor = "#f9ee3a";
  } else if (uv >= 6 && uv < 8) {
    currentUv.style.backgroundColor = "#f89f29";
  } else if (uv >= 8 && uv < 10.01) {
    currentUv.style.backgroundColor = "#f15e28";
  } else {
    currentUv.style.backgroundColor = "#ed1e26";
  }

  displayForecast(data);
}

// Displays 5-day weather forecast on webpage
function displayForecast(data) {
  var weatherForecast = document.querySelector("#weatherForecast");
  var dayOne = weatherForecast.querySelector("#dayOne");
  var dayTwo = weatherForecast.querySelector("#dayTwo");
  var dayThree = weatherForecast.querySelector("#dayThree");
  var dayFour = weatherForecast.querySelector("#dayFour");
  var dayFive = weatherForecast.querySelector("#dayFive");
  var forecastArr = [dayOne, dayTwo, dayThree, dayFour, dayFive];

  for (let i = 0; i < forecastArr.length; i++) {
    var forecastDate = requestDay(i + 1);
    forecastArr[i].querySelector("h4").textContent = forecastDate;

    var iconLocation = forecastArr[i].querySelector("img");
    var icon = data.daily[i].weather[0].icon;
    iconLocation.setAttribute("src", requestIcon(icon));

    forecastArr[i].children[0].children[2].innerHTML = "";

    var tempP = document.createElement("p");
    tempP.setAttribute("id", "card-text");
    tempP.textContent = `Temp: ${data.daily[i].temp.day}\xB0F`;
    forecastArr[i].children[0].children[2].appendChild(tempP);

    var windP = document.createElement("p");
    windP.setAttribute("id", "card-text");
    windP.textContent = `Wind: ${data.daily[i].wind_speed} MPH`;
    forecastArr[i].children[0].children[2].appendChild(windP);

    var humidityP = document.createElement("p");
    humidityP.setAttribute("id", "card-text");
    humidityP.textContent = `Humidity: ${data.daily[i].humidity}%`;
    forecastArr[i].children[0].children[2].appendChild(humidityP);
  }
}

// Returns requested day
function requestDay(i) {
  var today = new Date();
  var date = new Date();
  date.setDate(today.getDate() + i);

  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var fullDate = `${month}/${day}/${year}`;

  return fullDate;
}

// Returns weather icon src
function requestIcon(icon) {
  var url = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  return url;
}
