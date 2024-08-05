window.onload = function() {
  const temp = document.getElementById("temp"),
      date = document.getElementById("date-time"),
      condition = document.getElementById("condition"),
      rain = document.getElementById("rain"),
      mainIcon = document.getElementById("icon"),
      currentLocation = document.getElementById("location"),
      uvIndex = document.querySelector(".uv-index"),
      windSpeed = document.querySelector(".wind-speed"),
      sunRise = document.querySelector(".sun-rise"),
      sunSet = document.querySelector(".sun-set"),
      humidity = document.querySelector(".humidity"),
      visibilty = document.querySelector(".visibilty"),
      airQuality = document.querySelector(".air-quality"),
      searchForm = document.querySelector("#search"),
      search = document.querySelector("#query"),
      celciusBtn = document.querySelector(".celcius"),
      fahrenheitBtn = document.querySelector(".fahrenheit"),
      tempUnit = document.querySelectorAll(".temp-unit"),
      hourlyBtn = document.querySelector(".hourly"),
      weekBtn = document.querySelector(".week"),
      weatherCards = document.querySelector("#weather-cards");

  let currentCity = "";
  let currentUnit = "c";
  let hourlyorWeek = "week";

  function getDateTime() {
      let now = new Date();
      let hour = now.getHours();
      let minute = now.getMinutes();
      let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      hour = hour % 12 || 12; // Convert to 12-hour format
      minute = minute < 10 ? "0" + minute : minute;
      let dayString = days[now.getDay()];
      return `${dayString}, ${hour}:${minute}`;
  }

  if (date) {
      date.innerText = getDateTime();
      setInterval(() => {
          date.innerText = getDateTime();
      }, 1000);
  } else {
      console.error("Element with ID 'date-time' not found.");
  }

  function getWeatherData(city, unit, hourlyorWeek) {
      const apiKey = '4PVJV3CLDBWNTNK57DAS5KRLN';
      fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json`)
          .then(response => response.json())
          .then(data => {
              let today = data.currentConditions;
              if (temp) temp.innerText = unit === "c" ? today.temp : celciusToFahrenheit(today.temp);
              if (currentLocation) currentLocation.innerText = data.resolvedAddress;
              if (condition) condition.innerText = today.conditions;
              if (rain) rain.innerText = "Perc - " + today.precip + "%";
              if (uvIndex) uvIndex.innerText = today.uvindex;
              if (windSpeed) windSpeed.innerText = today.windspeed;
              if (mainIcon) mainIcon.src = getIcon(today.icon);
              changeBackground(today.icon);
              if (humidity) humidity.innerText = today.humidity + "%";
              updateHumidityStatus(today.humidity);
              if (visibilty) visibilty.innerText = today.visibility;
              updateVisibiltyStatus(today.visibility);
              if (airQuality) airQuality.innerText = today.winddir;
              updateAirQualityStatus(today.winddir);
              if (hourlyorWeek === "hourly") {
                  updateForecast(data.days[0].hours, unit, "day");
              } else {
                  updateForecast(data.days, unit, "week");
              }
              if (sunRise) sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
              if (sunSet) sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
          })
          .catch(err => {
              alert("City not found in our database");
          });
  }

  function updateForecast(data, unit, type) {
      weatherCards.innerHTML = "";
      let day = 0;
      let numCards = type === "day" ? 24 : 7;
      for (let i = 0; i < numCards; i++) {
          let card = document.createElement("div");
          card.classList.add("card");
          let dayName = type === "week" ? getDayName(data[day].datetime) : getHour(data[day].datetime);
          let dayTemp = unit === "f" ? celciusToFahrenheit(data[day].temp) : data[day].temp;
          let iconSrc = getIcon(data[day].icon);
          let tempUnit = unit === "f" ? "°F" : "°C";
          card.innerHTML = `
              <h2 class="day-name">${dayName}</h2>
              <div class="card-icon">
                <img src="${iconSrc}" class="day-icon" alt="" />
              </div>
              <div class="day-temp">
                <h2 class="temp">${dayTemp}</h2>
                <span class="temp-unit">${tempUnit}</span>
              </div>
          `;
          weatherCards.appendChild(card);
          day++;
      }
  }

  function getIcon(condition) {
      const icons = {
          "partly-cloudy-day": "https://i.ibb.co/PZQXH8V/27.png",
          "partly-cloudy-night": "https://i.ibb.co/Kzkk59k/15.png",
          "rain": "https://i.ibb.co/kBd2NTS/39.png",
          "clear-day": "https://i.ibb.co/rb4rrJL/26.png",
          "clear-night": "https://i.ibb.co/1nxNGHL/10.png",
      };
      return icons[condition] || icons["clear-day"];
  }

  function changeBackground(condition) {
      const backgrounds = {
          "partly-cloudy-day": "https://i.ibb.co/qNv7NxZ/pc.webp",
          "partly-cloudy-night": "https://i.ibb.co/RDfPqXz/pcn.jpg",
          "rain": "https://i.ibb.co/h2p6Yhd/rain.webp",
          "clear-day": "https://i.ibb.co/WGry01m/cd.jpg",
          "clear-night": "https://i.ibb.co/kqtZ1Gx/cn.jpg",
      };
      document.body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${backgrounds[condition] || backgrounds["clear-day"]})`;
  }

  function getHour(time) {
      let [hour, min] = time.split(":");
      hour = hour % 12 || 12;
      return `${hour}:${min} ${hour >= 12 ? "PM" : "AM"}`;
  }

  function covertTimeTo12HourFormat(time) {
      let [hour, minute] = time.split(":");
      let part = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour}:${minute.padStart(2, "0")} ${part}`;
  }

  function getDayName(date) {
      let day = new Date(date);
      let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return days[day.getDay()];
  }

  function measureUvIndex(uvIndex) {
      const levels = ["Low", "Moderate", "High", "Very High", "Extreme"];
      const index = uvIndex <= 2 ? 0 : uvIndex <= 5 ? 1 : uvIndex <= 7 ? 2 : uvIndex <= 10 ? 3 : 4;
      return levels[index];
  }

  function updateHumidityStatus(humidity) {
      const levels = ["Low", "Normal", "High"];
      const index = humidity <= 30 ? 0 : humidity <= 60 ? 1 : 2;
      document.querySelector(".humidity-status").innerText = levels[index];
  }

  function updateVisibiltyStatus(visibility) {
      const levels = ["Low", "Normal", "High"];
      const index = visibility <= 5 ? 0 : visibility <= 10 ? 1 : 2;
      document.querySelector(".visibilty-status").innerText = levels[index];
  }

  function updateAirQualityStatus(airQuality) {
      const levels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
      const index = airQuality <= 50 ? 0 : airQuality <= 100 ? 1 : airQuality <= 150 ? 2 : airQuality <= 200 ? 3 : 4;
      document.querySelector(".air-quality-status").innerText = levels[index];
  }

  searchForm.addEventListener("submit", e => {
      e.preventDefault();
      currentCity = search.value;
      getWeatherData(currentCity, currentUnit, hourlyorWeek);
  });

  celciusBtn.addEventListener("click", () => {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
      tempUnit.forEach(unit => unit.innerText = "°C");
      currentUnit = "c";
      getWeatherData(currentCity, currentUnit, hourlyorWeek);
  });

  hourlyBtn.addEventListener("click", () => {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
      hourlyorWeek = "hourly";
      getWeatherData(currentCity, currentUnit, hourlyorWeek);
  });

  weekBtn.addEventListener("click", () => {
      weekBtn.classList.add("active");
      hourlyBtn.classList.remove("active");
      hourlyorWeek = "week";
      getWeatherData(currentCity, currentUnit, hourlyorWeek);
  });
};
