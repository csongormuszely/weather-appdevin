const WeatherApp = () => {
  const majorCities = [
    "London, UK",
    "New York, USA",
    "Tokyo, Japan",
    "Paris, France",
    "Sydney, Australia",
    "Dubai, UAE",
    "Singapore, Singapore",
    "Hong Kong, China",
    "Toronto, Canada",
    "Berlin, Germany",
    "Madrid, Spain",
    "Rome, Italy",
    "Moscow, Russia",
    "Mumbai, India",
    "Bangkok, Thailand",
    "Seoul, South Korea",
    "Shanghai, China",
    "São Paulo, Brazil",
    "Mexico City, Mexico",
    "Cairo, Egypt",
    "Istanbul, Turkey",
    "Amsterdam, Netherlands",
    "Vienna, Austria",
    "Stockholm, Sweden",
    "Los Angeles, USA",
    "Chicago, USA",
    "Houston, USA",
    "Barcelona, Spain",
    "Munich, Germany",
    "Milan, Italy",
    "Beijing, China",
    "Guangzhou, China",
    "Delhi, India",
    "Kolkata, India",
    "Jakarta, Indonesia",
    "Manila, Philippines",
    "Kuala Lumpur, Malaysia",
    "Ho Chi Minh City, Vietnam",
    "Athens, Greece",
    "Warsaw, Poland",
    "Prague, Czech Republic",
    "Budapest, Hungary",
    "Copenhagen, Denmark",
    "Oslo, Norway",
    "Helsinki, Finland",
    "Dublin, Ireland",
    "Lisbon, Portugal",
  ];

  const [city, setCity] = React.useState("");
  const [weather, setWeather] = React.useState(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [permissionState, setPermissionState] = React.useState("");
  const [helperMessage, setHelperMessage] = React.useState("");
  const [hourlyForecast, setHourlyForecast] = React.useState([]);
  const [dailyForecast, setDailyForecast] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    React.useState(-1);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const generateHourlyForecast = (baseTemp) => {
    const forecast = [];
    const currentHour = new Date().getHours();
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      const tempVariation = Math.sin((i * Math.PI) / 12) * 3;
      forecast.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        temp: Math.round(parseInt(baseTemp) + tempVariation),
        precip: Math.round(Math.random() * 30),
      });
    }
    return forecast;
  };

  const generateDailyForecast = (baseTemp) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const forecast = [];
    const today = new Date().getDay();
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i) % 7;
      const tempVariation = Math.sin((i * Math.PI) / 3) * 5;
      const baseTemperature = parseInt(baseTemp);
      forecast.push({
        day: days[dayIndex],
        high: Math.round(baseTemperature + tempVariation + 2),
        low: Math.round(baseTemperature + tempVariation - 8),
      });
    }
    return forecast;
  };

  React.useEffect(() => {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      setPermissionState(result.state);
      result.addEventListener("change", () => {
        setPermissionState(result.state);
        if (result.state === "granted") {
          setHelperMessage(
            'Location access granted! Click "Use My Location" to get weather data.'
          );
        } else if (result.state === "denied") {
          const browser = navigator.userAgent.toLowerCase();
          let unblockInstructions = "";
          if (browser.includes("chrome")) {
            unblockInstructions =
              "To unblock: Click the lock icon in the address bar → Site settings → Reset permissions";
          } else if (browser.includes("firefox")) {
            unblockInstructions =
              "To unblock: Click the lock icon → Clear permission → Refresh the page";
          } else if (browser.includes("safari")) {
            unblockInstructions =
              "To unblock: Safari → Preferences → Websites → Location → Allow for this website";
          } else {
            unblockInstructions =
              "Please check your browser settings to unblock location access";
          }
          setHelperMessage(unblockInstructions);
        } else {
          const browser = navigator.userAgent.toLowerCase();
          let instructions = "";
          if (browser.includes("chrome")) {
            instructions =
              'Click the location icon in the address bar and select "Allow"';
          } else if (browser.includes("firefox")) {
            instructions =
              'Click the location icon in the address bar and select "Allow Location Access"';
          } else if (browser.includes("safari")) {
            instructions =
              "Go to Safari > Preferences > Websites > Location and allow access";
          } else {
            instructions =
              "Check your browser settings to enable location access";
          }
          setHelperMessage(instructions);
        }
      });
    });
  }, []);

  const parseWeatherData = (text) => {
    const [location, time, timezone, temp, condition, humidity, wind] =
      text.split("|");
    const timeStr = time.trim();
    const tzStr = timezone.trim();

    const date = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);

    date.setHours(hours);
    date.setMinutes(minutes);

    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: tzStr,
    });

    return {
      location: location.trim(),
      time: formattedTime,
      temp_C: temp.replace("°C", "").trim(),
      condition: condition.trim(),
      humidity: humidity.replace("%", "").trim(),
      wind_kph: wind.replace("km/h", "").trim(),
    };
  };

  const fetchWeatherByCity = async (cityName) => {
    try {
      setError("");
      setLoading(true);
      console.log("Fetching weather for city:", cityName);
      const response = await fetch(
        `https://wttr.in/${encodeURIComponent(
          cityName
        )}?format=%l|%T|%Z|%t|%C|%h|%w`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const text = await response.text();
      console.log("Weather response:", text);
      const data = parseWeatherData(text);

      const hourlyData = generateHourlyForecast(data.temp_C);
      const dailyData = generateDailyForecast(data.temp_C);

      setHourlyForecast(hourlyData);
      setDailyForecast(dailyData);

      setWeather({
        nearest_area: [
          {
            areaName: [{ value: data.location }],
            country: [{ value: "" }],
          },
        ],
        current_condition: [
          {
            temp_C: data.temp_C,
            weatherDesc: [{ value: data.condition }],
            humidity: data.humidity,
            windspeedKmph: data.wind_kph,
            time: data.time,
          },
        ],
      });
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (latitude, longitude) => {
    try {
      setError("");
      setLoading(true);
      const lat = Number(latitude).toFixed(4);
      const lon = Number(longitude).toFixed(4);

      console.log("Starting weather fetch for coordinates...");
      console.log(`Coordinates: ${lat},${lon}`);

      const urlFormats = [
        `https://wttr.in/${lat},${lon}?format=%l|%T|%Z|%t|%C|%h|%w`,
        `https://wttr.in/@${lat},${lon}?format=%l|%T|%Z|%t|%C|%h|%w`,
        `https://wttr.in/~${lat},${lon}?format=%l|%T|%Z|%t|%C|%h|%w`,
      ];

      let response;
      let text;
      let error;

      for (const url of urlFormats) {
        try {
          console.log("Trying URL:", url);
          response = await fetch(url);
          console.log("Response status:", response.status);

          if (response.ok) {
            text = await response.text();
            if (text && text.trim() !== "" && text.includes("|")) {
              console.log("Weather response:", text);
              break;
            }
          }
          error = `Server returned error: ${response.status} ${response.statusText}`;
        } catch (e) {
          error = e.message;
          console.error("Attempt failed:", e);
        }
      }

      if (!text || !text.includes("|")) {
        throw new Error(error || "Failed to fetch weather data");
      }

      const data = parseWeatherData(text);

      if (
        !data.location ||
        !data.temp_C ||
        !data.condition ||
        !data.humidity ||
        !data.wind_kph
      ) {
        throw new Error("Missing required weather data fields");
      }

      const hourlyData = generateHourlyForecast(data.temp_C);
      const dailyData = generateDailyForecast(data.temp_C);

      setHourlyForecast(hourlyData);
      setDailyForecast(dailyData);

      setWeather({
        nearest_area: [
          {
            areaName: [{ value: data.location }],
            country: [{ value: "" }],
          },
        ],
        current_condition: [
          {
            temp_C: data.temp_C,
            weatherDesc: [{ value: data.condition }],
            humidity: data.humidity,
            windspeedKmph: data.wind_kph,
            time: data.time,
          },
        ],
      });
      setCity(data.location);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError(err.message || "Failed to fetch weather data");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.trim()) {
      const searchTerm = value.toLowerCase();
      const filtered = majorCities
        .map((city) => {
          const lowerCity = city.toLowerCase();
          let score = 0;
          // Exact match gets highest score
          if (lowerCity === searchTerm) score += 100;
          // Starting with search term gets high score
          else if (lowerCity.startsWith(searchTerm)) score += 75;
          // Contains search term as word gets medium score
          else if (lowerCity.includes(` ${searchTerm}`)) score += 50;
          // Contains search term anywhere gets low score
          else if (lowerCity.includes(searchTerm)) score += 25;
          return { city, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((item) => item.city);
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const selectSuggestion = (selectedCity) => {
    setCity(selectedCity);
    setShowSuggestions(false);
    // Extract just the city name before the comma for the API call
    const cityName = selectedCity.split(",")[0].trim();
    fetchWeatherByCity(cityName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      setShowSuggestions(false);
      const cityName = city.split(",")[0].trim();
      fetchWeatherByCity(cityName);
    }
  };

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Starting location detection process...");

      try {
        console.log("Attempting IP-based geolocation...");
        const ipResponse = await fetch(
          "https://wttr.in/?format=%l|%T|%Z|%t|%C|%h|%w"
        );
        if (ipResponse.ok) {
          const text = await ipResponse.text();
          console.log("IP-based location response:", text);
          if (text && text.includes("|")) {
            const data = parseWeatherData(text);

            const hourlyData = generateHourlyForecast(data.temp_C);
            const dailyData = generateDailyForecast(data.temp_C);

            setHourlyForecast(hourlyData);
            setDailyForecast(dailyData);

            setWeather({
              nearest_area: [
                {
                  areaName: [{ value: data.location }],
                  country: [{ value: "" }],
                },
              ],
              current_condition: [
                {
                  temp_C: data.temp_C,
                  weatherDesc: [{ value: data.condition }],
                  humidity: data.humidity,
                  windspeedKmph: data.wind_kph,
                  time: data.time,
                },
              ],
            });
            setCity(data.location);
            return;
          }
        }
      } catch (ipErr) {
        console.error("IP geolocation failed:", ipErr);
      }

      console.log("Falling back to browser geolocation...");
      const options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      };

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      console.log("Successfully received position:", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      await fetchWeatherByCoords(
        position.coords.latitude,
        position.coords.longitude
      );
    } catch (err) {
      console.error("Location error:", err);
      let errorMessage = "Unable to retrieve your location";

      if (err.code === 1) {
        errorMessage =
          "Please allow location access when prompted. If blocked, check your browser settings to enable location access.";
      } else if (err.code === 2) {
        errorMessage =
          "Location service is not available. Please check if your device's location service is enabled.";
      } else if (err.code === 3) {
        errorMessage =
          "Location request timed out. Please check your internet connection and try again.";
      }

      setError(errorMessage);
      console.log("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  const SearchContainer = () => (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-box"
          placeholder="Search for a city"
          value={city}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-container">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`suggestion-item ${
                  index === selectedSuggestionIndex ? "selected" : ""
                }`}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>
      <button
        className="location-button"
        onClick={getLocation}
        disabled={loading}
      >
        📍
      </button>
    </div>
  );

  if (!weather) {
    return (
      <div className="container">
        <SearchContainer />
        <div className="message-container">
          {error && <div className="error">{error}</div>}
          {helperMessage && !error && (
            <div className="helper">{helperMessage}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <SearchContainer />
      <div className="weather-card">
        <div className="current-weather">
          <div className="location-time">
            {weather.nearest_area[0].areaName[0].value}
            <div>{weather.current_condition[0].time}</div>
          </div>
          <div className="temperature">
            {weather.current_condition[0].temp_C}°
          </div>
          <div className="weather-condition">
            {weather.current_condition[0].weatherDesc[0].value}
          </div>
          <div className="weather-details">
            <p>Humidity: {weather.current_condition[0].humidity}%</p>
            <p>Wind: {weather.current_condition[0].windspeedKmph} km/h</p>
          </div>
        </div>

        <div className="forecast-section">
          <h3>Hourly Forecast</h3>
          <div className="hourly-forecast">
            {hourlyForecast.map((hour, index) => (
              <div key={index} className="forecast-item">
                <div className="time">{hour.time}</div>
                <div className="temp">{hour.temp}°</div>
                <div className="precip">{hour.precip}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="forecast-section">
          <h3>7-Day Forecast</h3>
          <div className="daily-forecast">
            {dailyForecast.map((day, index) => (
              <div key={index} className="daily-item">
                <div className="day">{day.day}</div>
                <div className="high">{day.high}°</div>
                <div className="low">{day.low}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<WeatherApp />, document.getElementById("root"));
