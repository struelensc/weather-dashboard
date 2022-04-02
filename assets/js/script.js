var APIKey = "&appid=" + "e0f3fd1758eb9ee23eebdfd362d21c11";

var cityInput = document.querySelector("#citySearch");
var searchBtn = document.querySelector("#searchBtn");

searchBtn.addEventListener("click", getLatLon);

// Returns longitude and latitude from city input
function getLatLon() {
  var cityName = cityInput.value;
  console.log(cityName);

  var url =
    "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + APIKey;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var lat = data[0].lat;
      var lon = data[0].lon;

      storeSearch(cityName, lat, lon);
      getWeatherData(lat, lon, cityName);
    });
}

// Fetches weather data from API
function getWeatherData(lat, lon, cityName) {
  var url =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial" +
    APIKey;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayWeather(data, cityName);
    });
}

// Returns requested day
function requestDay(i) {
  var today = new Date();
  var date = new Date();
  date.setDate(today.getDate() + i);

  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  var fullDate = month + "/" + day + "/" + year;

  return fullDate;
}

function storeSearch(cityName, lat, lon) {
  var cityInfo = { cityName, lat, lon };
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

  for (let i = 0; i < searchHistory.length; i++) {
    var listEl = document.createElement("li");
    listEl.textContent = searchHistory[i].cityName;
    listEl.setAttribute("data-lat", searchHistory[i].lat);
    listEl.setAttribute("data-lon", searchHistory[i].lon);

    listEl.addEventListener("click", getLatLon);

    searchList.appendChild(listEl);
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
  currentTemp.textContent = "Temp: " + data.current.temp + "\xB0F";
  currentWind.textContent = "Wind: " + data.current.wind_speed + " MPH";
  currentHumidity.textContent = "Humidity: " + data.current.humidity + "%";
  currentUv.textContent = "UV Index: " + data.current.uvi;

  console.log(data);
  displayForcast(data);
}

// Displays 5-day weather forcast
function displayForcast(data) {
  var weatherForcast = document.querySelector("#weatherForcast");
  var dayOne = weatherForcast.querySelector("#dayOne");
  var dayTwo = weatherForcast.querySelector("#dayTwo");
  var dayThree = weatherForcast.querySelector("#dayThree");
  var dayFour = weatherForcast.querySelector("#dayFour");
  var dayFive = weatherForcast.querySelector("#dayFive");
  var forcastArr = [dayOne, dayTwo, dayThree, dayFour, dayFive];

  for (let i = 0; i < forcastArr.length; i++) {
    var forcastDate = requestDay(i + 1);
    forcastArr[i].querySelector("h4").textContent = forcastDate;

    var iconLocation = forcastArr[i].querySelector("img");
    var icon = data.daily[i].weather[0].icon;
    iconLocation.setAttribute("src", requestIcon(icon));

    var tempP = document.createElement("p");
    tempP.setAttribute("id", "card-text");
    tempP.textContent = "Temp: " + data.daily[i].temp.day + "\xB0F";
    forcastArr[i].appendChild(tempP);

    var windP = document.createElement("p");
    windP.setAttribute("id", "card-text");
    windP.textContent = "Wind: " + data.daily[i].wind_speed + " MPH";
    forcastArr[i].appendChild(windP);

    var humidityP = document.createElement("p");
    humidityP.setAttribute("id", "card-text");
    humidityP.textContent = "Humidity: " + data.daily[i].humidity + "%";
    forcastArr[i].appendChild(humidityP);
  }
}

// Returns weather icon src
function requestIcon(icon) {
  var url = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
  return url;
}
