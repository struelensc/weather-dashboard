var APIKey = "&appid=e0f3fd1758eb9ee23eebdfd362d21c11";
var cityInput = document.querySelector("#citySearch");
var searchBtn = document.querySelector("#searchBtn");

// On page load adds search handler and generates Seattle weather data
window.addEventListener("load", function () {
  var cityName = "Seattle";
  var lat = 47.6038321;
  var lon = -122.3300624;
  var cityInfo = { cityName, lat, lon };

  // Takes user city input
  searchBtn.addEventListener("click", function () {
    cityInfo.cityName = cityInput.value;
    getLatLon(cityInfo);
  });

  getWeatherData(cityInfo);
  loadSearchList();
});

// Returns longitude and latitude from city input
function getLatLon(cityInfo) {
  var url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInfo.cityName}${APIKey}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);

      if (!data[0]) {
        alert("Please enter a valid city.");
        cityInput.value = "";
        return;
      } else {
        cityInfo.lat = data[0].lat;
        cityInfo.lon = data[0].lon;

        storeCitySearch(cityInfo);
        getWeatherData(cityInfo);
      }
    });
}

// Fetches weather data from API
function getWeatherData(cityInfo) {
  var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityInfo.lat}&lon=${cityInfo.lon}&units=imperial${APIKey}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayWeather(data, cityInfo.cityName);
    });
}

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

  loadSearchList();
}

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

// Displays current weather data
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
  currentUv.textContent = `UV Index: ${data.current.uvi}`;

  displayForecast(data);
}

// Displays 5-day weather forecast
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
  var url = `http://openweathermap.org/img/wn/${icon}@2x.png`;
  return url;
}
