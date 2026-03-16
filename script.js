// API KEYS

const flightApiKey = "YOUR_FLIGHT_API_KEY";
const weatherApiKey = "f5fb86d39d7cc2cc9d5f7c67db8fb37a";


// =========================
// GET FLIGHT DATA
// =========================

async function getFlights(date = "") {

    try {

        if (!date) {
            date = formatDate(new Date());
        }

        const from = `${date}T00:00`;
        const to = `${date}T11:59`;

        const url =
            `https://api.magicapi.dev/api/v1/aedbx/aerodatabox/flights/airports/iata/CMX/${from}/${to}?direction=Both&withCargo=false&withPrivate=false&withCancelled=false`;

        const response = await fetch(url, {
            headers: {
                "x-api-market-key": flightApiKey
            }
        });

        const data = await response.json();

        const arrivals = data.arrivals || [];
        const departures = data.departures || [];

        displayFlights(arrivals, "arrivals", "arrival");
        displayFlights(departures, "departures", "departure");

    } catch (error) {

        console.error("Flight API error:", error);

    }
}


// =========================
// DISPLAY FLIGHTS
// =========================

function displayFlights(flights, sectionId, type) {

    const container = document.getElementById(sectionId);
    container.innerHTML = "";

    if (!flights || flights.length === 0) {

        container.innerHTML = "No flight data available.";
        return;

    }

    flights.slice(0, 2).forEach(flight => {

        const div = document.createElement("div");
        div.className = "flight-card";

        const airline =
            flight.airline?.name ||
            flight.airline?.iata ||
            "Unknown";

        const flightNumber =
            flight.number ||
            flight.callSign ||
            "N/A";

        const location =
            type === "arrival"
                ? flight.departure?.airport?.name
                : flight.arrival?.airport?.name;

        const scheduled =
            type === "arrival"
                ? flight.arrival?.scheduledTime?.local
                : flight.departure?.scheduledTime?.local;

        const actual =
            type === "arrival"
                ? flight.arrival?.actualTime?.local
                : flight.departure?.actualTime?.local;

        const status =
            flight.status || "Unknown";

        div.innerHTML = `
            <b>Airline:</b> ${airline} <br>
            <b>Flight:</b> ${flightNumber} <br>
            <b>${type === "arrival" ? "From" : "To"}:</b> ${location || "Unknown"} <br>
            <b>Scheduled:</b> ${formatTime(scheduled)} <br>
            <b>Actual:</b> ${formatTime(actual)} <br>
            <b>Status:</b> ${status}
        `;

        container.appendChild(div);

    });

}


// =========================
// FORMAT TIME
// =========================

function formatTime(time) {

    if (!time) return "N/A";

    const date = new Date(time);

    return date.toLocaleString();

}


// =========================
// WEATHER DATA
// =========================

async function getWeather() {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=Houghton&units=imperial&appid=${weatherApiKey}`
        );

        const data = await response.json();

        const weatherHTML = `
            <b>Temperature:</b> ${data.main.temp} °F <br>
            <b>Wind Speed:</b> ${data.wind.speed} mph <br>
            <b>Conditions:</b> ${data.weather[0].description}
        `;

        document.getElementById("weather").innerHTML = weatherHTML;

        getForecast();

    } catch (error) {

        console.error("Weather API error:", error);

    }

}


// =========================
// WEATHER FORECAST
// =========================

async function getForecast() {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=Houghton&units=imperial&appid=${weatherApiKey}`
        );

        const data = await response.json();

        let forecastHTML = "<h3>Forecast</h3>";

        for (let i = 0; i < 5; i++) {

            const item = data.list[i];

            forecastHTML += `
                ${new Date(item.dt_txt).toLocaleString()}<br>
                Temp: ${item.main.temp} °F<br>
                ${item.weather[0].description}
                <hr>
            `;
        }

        document.getElementById("forecast").innerHTML = forecastHTML;

    } catch (error) {

        console.error("Forecast API error:", error);

    }

}


// =========================
// DATE SEARCH
// =========================

function searchFlights() {

    const date = document.getElementById("datePicker").value;

    if (!date) {

        alert("Please select a date");
        return;

    }

    getFlights(date);

}


// =========================
// WEBCAM AUTO REFRESH
// =========================

function refreshWebcam() {

    const webcam = document.getElementById("webcam");

    if (webcam) {

        webcam.src = webcam.src.split("?")[0] + "?t=" + new Date().getTime();

    }

}


// =========================
// DATE UTILITIES
// =========================

function formatDate(date) {

    return date.toISOString().split("T")[0];

}

function loadToday() {

    const today = formatDate(new Date());
    getFlights(today);

}

function loadYesterday() {

    const d = new Date();
    d.setDate(d.getDate() - 1);

    getFlights(formatDate(d));

}

function loadTwoDaysAgo() {

    const d = new Date();
    d.setDate(d.getDate() - 2);

    getFlights(formatDate(d));

}

function loadTomorrow() {

    const d = new Date();
    d.setDate(d.getDate() + 1);

    getFlights(formatDate(d));

}


// =========================
// INITIAL LOAD
// =========================

getFlights();
getWeather();


// =========================
// AUTO UPDATE
// =========================

setInterval(() => {
    loadToday();
}, 300000);

setInterval(getWeather, 300000);
setInterval(refreshWebcam, 60000);
