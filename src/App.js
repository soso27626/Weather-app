import { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError('');

    try {
      // 先把城市名转成坐标
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError('City not found');
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 用坐标获取天气
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`
      );
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData, cityName: name, country });
    } catch (e) {
      setError('Something went wrong');
    }

    setLoading(false);
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return '☀️ Clear sky';
    if (code <= 3) return '⛅ Partly cloudy';
    if (code <= 48) return '🌫️ Foggy';
    if (code <= 67) return '🌧️ Rainy';
    if (code <= 77) return '❄️ Snowy';
    if (code <= 82) return '🌦️ Showers';
    return '⛈️ Thunderstorm';
  };

  return (
    <div className="app">
      <h1>🌤️ Weather App</h1>
      <div className="search-row">
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchWeather()}
          placeholder="Enter city name..."
        />
        <button onClick={searchWeather}>Search</button>
      </div>

      {loading && <p>Loading...</p >}
      {error && <p style={{ color: 'red' }}>{error}</p >}

      {weather && (
        <div className="weather-card">
          <h2>{weather.cityName}, {weather.country}</h2>
          <div className="current">
            <div className="temp">{weather.current.temperature_2m}°C</div>
            <div>{getWeatherDescription(weather.current.weathercode)}</div>
            <div>💨 Wind: {weather.current.windspeed_10m} km/h</div>
            <div>💧 Humidity: {weather.current.relative_humidity_2m}%</div>
          </div>

          <h3>7-Day Forecast</h3>
          <div className="forecast">
            {weather.daily.time.map((date, i) => (
              <div key={date} className="forecast-day">
                <div>{new Date(date).toLocaleDateString('en-NZ', { weekday: 'short' })}</div>
                <div>{getWeatherDescription(weather.daily.weathercode[i]).split(' ')[0]}</div>
                <div>{weather.daily.temperature_2m_max[i]}°</div>
                <div style={{ color: '#888' }}>{weather.daily.temperature_2m_min[i]}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
