//API KEYS

const flightApiKey = "1ba43f5064d5b93c6997aed369497978";
const weatherApiKey = "f5fb86d39d7cc2cc9d5f7c67db8fb37a";


// GET FLIGHT DATA
async function getFlights(date = "") {
    try {
        let arrivalsURL = `https://api.aviationstack.com/v1/flights?access_key=${flightApiKey}&arr_iata=CMX`;
        let departuresURL = `https://api.aviationstack.com/v1/flights?access_key=${flightApiKey}&dep_iata=CMX`;

        if (date !== "") {
            arrivalsURL += `&flight_date=${date}`;
            departuresURL += `&flight_date=${date}`;
        }

        const [arrivalsResponse, departuresResponse] = await Promise.all([
            fetch(arrivalsURL),
            fetch(departuresURL)
        ]);

        const arrivalsData = await arrivalsResponse.json();
        const departuresData = await departuresResponse.json();

        console.log("Arrivals API data:", arrivalsData);
        console.log("Departures API data:", departuresData);

        displayFlights(arrivalsData.data || [], "arrivals", "arrival");
        displayFlights(departuresData.data || [], "departures", "departure");

    } catch (error) {
        console.error("Flight API error:", error);
        document.getElementById("arrivals").innerHTML = "Error loading arrivals.";
        document.getElementById("departures").innerHTML = "Error loading departures.";
    }
}

// DISPLAY FLIGHTS
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

        // Use optional chaining and fallback values
        const airline = flight.airline?.name || "Unknown";
        const flightNumber = flight.flight?.iata || "N/A";

        const location = type === "arrival"
            ? flight.departure?.airport || "Unknown"
            : flight.arrival?.airport || "Unknown";

        const scheduled = type === "arrival"
            ? flight.arrival?.scheduled || "N/A"
            : flight.departure?.scheduled || "N/A";

        const actual = type === "arrival"
            ? flight.arrival?.actual || "N/A"
            : flight.departure?.actual || "N/A";

        const status = flight.flight_status || "Unknown";
        const gate = flight.departure?.gate || flight.arrival?.gate || "N/A";
        const aircraft = flight.aircraft?.registration || "N/A";

        div.innerHTML = `
            <b>Airline:</b> ${airline} <br>
            <b>Flight:</b> ${flightNumber} <br>
            <b>${type === "arrival" ? "From" : "To"}:</b> ${location} <br>
            <b>Scheduled:</b> ${formatTime(scheduled)} <br>
            <b>Actual:</b> ${formatTime(actual)} <br>
            <b>Status:</b> ${status} <br>
            <b>Gate:</b> ${gate} <br>
            <b>Aircraft:</b> ${aircraft} <br>
        `;

        container.appendChild(div);
    });
}

// FORMAT TIME
function formatTime(time) {
    if (!time || time === "N/A") return "N/A";
    const date = new Date(time);
    return date.toLocaleString();
}


//WEATHER DATA

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


//WEATHER FORECAST (1–2 DAYS)

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


//DATE SEARCH

function searchFlights() {

    const date = document.getElementById("datePicker").value;

    if (!date) {

        alert("Please select a date");
        return;
    }

    getFlights(date);
}


//AUTO REFRESH WEBCAM

function refreshWebcam() {

    const webcam = document.getElementById("webcam");

    if (webcam) {

        webcam.src = webcam.src.split("?")[0] + "?t=" + new Date().getTime();
    }
}



//INITIAL LOAD
getFlights();
getWeather();


//AUTO UPDATE EVERY 5 MINUTEs
setInterval(getFlights, 300000);
setInterval(getWeather, 300000);
setInterval(refreshWebcam, 60000);


//DATE FUNCTIONS
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
