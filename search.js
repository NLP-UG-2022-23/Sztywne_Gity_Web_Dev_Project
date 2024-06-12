const CLIENT_ID = 'NDE4Nzc3NTJ8MTcxNjk5MDcyMC4zNDg1MDM0';
const WEATHER_API_KEY = '18588372be3342ea959135809240506';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

let currentPage = 1;
const next_button = document.getElementById("next_button");
const previous_button = document.getElementById("previous_button");

document.getElementById('searchBtn').addEventListener('click', () => {
    currentPage = 1; // Reset to first page on new search
    fetchEvents();
});

async function fetchEvents() {
    const query = document.getElementById('eventInput').value;
    const location = document.getElementById('locationInput').value; 
    const dateInput = document.getElementById('dateInput').value;
    const date = dateInput ? dateInput : new Date().toISOString().split('T')[0]; 

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    try {
        let url = `https://api.seatgeek.com/2/events?q=${query}&datetime_local.gte=${date}&client_id=${CLIENT_ID}&page=${currentPage}`;
        if (location) {
            url += `&venue.city=${location}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data.events);

        // Handle visibility of navigation buttons
        if (data.meta.total > 10 * currentPage) {
            next_button.classList.add("visible");
        } else {
            next_button.classList.remove("visible");
        }
        if (currentPage > 1) {
            previous_button.classList.add("visible");
        } else {
            previous_button.classList.remove("visible");
        }
    } catch (error) {
        console.error('Error fetching events:', error);
        resultsContainer.innerHTML = `<p>There was an error fetching events. Please try again later. Error: ${error.message}</p>`;
    }
}

async function getWeather(location, date) {
    const url = `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${location}&dt=${date}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const forecast = data.forecast.forecastday[0].day;
    return {
        avgtemp_c: forecast.avgtemp_c,
        condition: forecast.condition.text
    };
}
async function displayResults(events) {
    const resultsContainer = document.getElementById('results');
    if (events.length === 0) {
        resultsContainer.innerHTML = '<p>No events found. Please try a different search.</p>';
        return;
    }

for (const event of events) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'result';
        const eventTypeEmoji = event.type === 'concert' ? '🎵' : event.type === 'sports' ? '⚽' : '🎭';
        eventDiv.innerHTML = `
            <div class="result-content">
                <span class="emoji">${eventTypeEmoji}</span>
                <div>
                    <h2>${event.title}</h2>
                    <p>Date: ${event.datetime_local}</p>
                    <p>Venue: ${event.venue.name}</p>
                    <div class="weather-container">
                        <img id="icon-${event.id}" class="weather-icon" />
                        <div id="weather-${event.id}" class="weather-info"></div>
                    </div>
                    <span class="show-more">Show more</span>
                    <div class="details">
                        <p>Event URL: <a href="${event.url}" target="_blank">${event.url}</a></p>
                    </div>
                </div>
            </div>
            <hr>
        `;
        resultsContainer.appendChild(eventDiv);

        const showMore = eventDiv.querySelector('.show-more');
        const details = eventDiv.querySelector('.details');
        showMore.addEventListener('click', () => {
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
            showMore.textContent = details.style.display === 'none' ? 'Show more' : 'Show less';
        });

        const eventDate = event.datetime_local.split('T')[0];
        const location = `${event.venue.city}, ${event.venue.state}`;
        try {
            const weather = await getWeather(location, eventDate);
            const weatherElement = eventDiv.querySelector(`#weather-${event.id}`);
            weatherElement.innerText = `Average Temp: ${weather.avgtemp_c}°C, Condition: ${weather.condition}`;
            const weatherIcon = eventDiv.querySelector(`#icon-${event.id}`);
            weatherIcon.src = getWeatherIcon(weather.condition);
            weatherIcon.style.display = 'block';
        } catch (error) {
            console.error('Error fetching weather:', error);
            eventDiv.querySelector(`#weather-${event.id}`).innerText = 'Weather information not available';
        }
    }
}

function changePage(direction) {
    currentPage += direction;
    fetchEvents();
}

// Slideshow
let slideIndex = 0;
showSlides();

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 5000); // Change image every 5 seconds
}

function getWeatherIcon(condition) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny')) {
        return 'sunny.png';
    } else if (conditionLower.includes('cloudy')) {
        return 'cloudy.png';
    } else if (conditionLower.includes('rain')) {
        return 'rain.png';
    } else if (conditionLower.includes('snow')) {
        return 'snow.png';
    } else if (conditionLower.includes('storm')) {
        return 'storm.png';
    } else {
        return 'icons/default.png'; // A default icon for unspecified weather conditions
    }
}
