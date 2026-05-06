const dogOutput = document.getElementById("dog-output");
const catOutput = document.getElementById("cat-output");
const weatherOutput = document.getElementById("weather-output");
const currencyOutput = document.getElementById("currency-output");
const currencyDropdownOriginal = document.getElementById(
  "currency-original-select",
);
const currencyDropdownConvert = document.getElementById(
  "currency-original-convert",
);
const moviesOutput = document.getElementById("movies-output");
const githubOutput = document.getElementById("github-output");
const jokeOutput = document.getElementById("joke-output");
const apiOutput = document.getElementById("publicapi-output");

// Pull in list of currencies for currency exchange drop down menu at web page load
async function getCurriencies() {
  const responseAll = await fetch("https://api.frankfurter.dev/v1/latest?");
  const dataAll = await responseAll.json();

  //add base currency as missing from rates object provided by api
  const currencySymbolUniverse = dataAll.rates;
  currencySymbolUniverse[dataAll.base] = 1;

  //convert to array to sort currencies alphabeticaly and then convert back to an object
  const arrayCurrencies = Object.keys(currencySymbolUniverse);
  arrayCurrencies.sort();
  const orderedCurrencies = { ...arrayCurrencies };

  for (const [key, value] of Object.entries(orderedCurrencies)) {
    // currencysymbolarray.push(key);
    const currencySymbolOriginal = document.createElement("option");
    const currencySymbolConvert = document.createElement("option");
    currencySymbolOriginal.value = value;
    currencySymbolConvert.value = value;
    currencySymbolOriginal.innerText = value;
    currencySymbolConvert.innerText = value;

    currencyDropdownOriginal.append(currencySymbolOriginal);
    currencyDropdownConvert.append(currencySymbolConvert);
  }
  // console.log("my array: ", currencysymbolarray);
  // currencysymbolarray.sort();
  // console.log("sorted array: ", currencysymbolarray);
}

getCurriencies();

async function getDogImage() {
  const response = await fetch("https://dog.ceo/api/breeds/image/random");
  const data = await response.json();

  dogOutput.innerHTML = "";

  const img = document.createElement("img");
  img.src = data.message;

  dogOutput.appendChild(img);
}

async function getCatImage() {
  const response = await fetch("https://api.thecatapi.com/v1/images/search");
  const data = await response.json();

  catOutput.innerHTML = "";

  const img = document.createElement("img");
  img.src = data[0].url;

  catOutput.appendChild(img);
}

//2 different API calls
async function getWeather() {
  //Takes the users input of city and country and sends them to the nominatim API and returns the latitude and longitude values
  const city = document.getElementById("city");
  const country = document.getElementById("country");

  //encountered issue related to a User Agent requirement. I was blocked from the server after a few manual requests so attempting a header in my request
  const responseCoordinates = await fetch(
    `https://nominatim.openstreetmap.org/search?city=${city.value}&country=${country.value}&format=json`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "LearningAPIApril2026",
      },
    },
  );

  const dataCoordinates = await responseCoordinates.json();

  //takes the latitude and longitutde values to fetch weather data from the open-meteo weather api. If checks if their is data returned or if has an error.
  if (dataCoordinates.length > 0) {
    const latitudeValue = parseFloat(dataCoordinates[0].lat);
    const longitudeValue = parseFloat(dataCoordinates[0].lon);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitudeValue}&longitude=${longitudeValue}&daily=temperature_2m_max,temperature_2m_min,precipitation_hours,sunrise,sunset&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m&timezone=auto&past_days=0&forecast_days=7&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`,
    );
    const data = await response.json();

    weatherOutput.innerHTML = "";

    const currentConditions = document.createElement("h2");
    const timeZone = document.createElement("p");
    const currentTime = document.createElement("p");
    const currentTemp = document.createElement("p");
    const currentprecipitation = document.createElement("p");
    const currentWindSpeed = document.createElement("p");

    currentConditions.innerText = "Current Conditions";

    timeZone.innerText = "Time Zone: " + data.timezone;

    currentTemp.innerText =
      "Current Temp: " +
      data.current.temperature_2m +
      data.current_units.temperature_2m;

    currentTime.innerText = "Date & Time: " + data.current.time;

    currentprecipitation.innerText =
      "Precipitation: " +
      data.current.precipitation +
      " " +
      data.current_units.precipitation;

    currentWindSpeed.innerText =
      "Wind Speed: " +
      data.current.wind_speed_10m +
      " " +
      data.current_units.wind_speed_10m;

    weatherOutput.append(
      currentConditions,
      timeZone,
      currentTime,
      currentTemp,
      currentprecipitation,
      currentWindSpeed,
    );
  } else {
    weatherOutput.innerHTML = "";
    const errorWeather = document.createElement("h3");
    errorWeather.innerHTML = "Error: City and/or Country not found.";
    weatherOutput.append(errorWeather);
  }
}

async function getExchangeRates() {
  const currencyOriginal = document.getElementById("currency-original-select");
  const currencyConvert = document.getElementById("currency-original-convert");
  const currencyAmount = document.getElementById("amount");

  const response = await fetch(
    `https://api.frankfurter.dev/v1/latest?amount=${amount.value}&from=${currencyOriginal.value}&to=${currencyConvert.value}`,
  );

  const data = await response.json();

  currencyOutput.innerHTML = "";
  const converedCurrencyCode = Object.keys(data.rates);
  const currencyRate = document.createElement("p");
  const currencyConvertedAmount = document.createElement("p");

  currencyRate.innerText =
    currencyOriginal.value +
    " " +
    amount.value +
    " is equal to " +
    currencyConvert.value +
    " " +
    data.rates[converedCurrencyCode];

  currencyConvertedAmount.innerText =
    "1 " +
    currencyConvert.value +
    " is equal to " +
    currencyOriginal.value +
    " " +
    parseFloat(currencyAmount.value / data.rates[converedCurrencyCode]).toFixed(
      2,
    );

  currencyOutput.append(currencyRate, currencyConvertedAmount);
}

async function getMovies() {
  //Error handling if missing API key or config.js file
  if (typeof CONFIG === "undefined" || !CONFIG.TMDB_TOKEN) {
    console.error("Missing API Key! Please create a config.js file");
    moviesOutput.innerHTML =
      "<h2>Configuration Error! Please check the README to add your API Key.</h2>";
  } else {
    // Runs API fetch
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${CONFIG.TMDB_TOKEN}`,
    );

    moviesOutput.innerHTML = "";

    const data = await response.json();
    console.log(data.results);

    const movies = data.results;

    let index = 0;

    const h2TitleCheck = document.getElementById("dynamic-title");

    if (h2TitleCheck) {
      h2TitleCheck.remove();
    }

    moviesOutput.insertAdjacentHTML(
      "beforebegin",
      "<h2 id='dynamic-title'>Top Movies Of All Time</h2>",
    );

    while (index < 12) {
      const movieContainer = document.createElement("div");
      movieContainer.className = "movie-poster";
      const img = document.createElement("img");
      const hoverTitle = document.createElement("div");
      img.src = `https://image.tmdb.org/t/p/w200${movies[index].backdrop_path}`;
      img.alt = `${movies[index].title}(${movies[index].release_date.slice(0, 4)})`;
      hoverTitle.className = "movie-title";
      hoverTitle.textContent = `${movies[index].title}(${movies[index].release_date.slice(0, 4)})`;
      // movieContainer.append(img, hoverTitle);
      movieContainer.append(img, hoverTitle);
      moviesOutput.append(movieContainer);
      index++;
    }
  }
}

async function getGitHubUser() {
  const gitUserSearch = document.getElementById("github-user-name");

  const response = await fetch(
    `https://api.github.com/search/users?q=${gitUserSearch.value}+in:login`,
  );

  const data = await response.json();
  const gitUsersData = data;

  githubOutput.innerHTML = "";

  console.log(data);

  const topGitUserResult = data.items[0].login;

  console.log(topGitUserResult);

  const gitSearchResultsTitle = document.createElement("h2");
  const gitTotalResults = document.createElement("p");
  const gitProfileImg = document.createElement("img");
  const gitUserName = document.createElement("h3");
  const gitBio = document.createElement("p");
  const gitTitle = document.createElement("h3");
  const resultsNumber = gitUsersData.total_count;
  const topFiveUsersTitle = (document.createElement("h3").innerText =
    "Top 5 Users Found");
  console.log(
    "Type of resultsNumber is: ",
    typeof resultsNumber,
    " value is:  ",
    resultsNumber,
  );
  let index = 0;

  gitSearchResultsTitle.innerText = "Search Results";
  gitTotalResults.innerText = `Total Users found: ${gitUsersData.total_count}`;

  githubOutput.append(gitSearchResultsTitle, gitTotalResults);

  console.log(gitTotalResults);
  gitProfileImg.src = gitUsersData.items[0].avatar_url;
  console.log(gitProfileImg);

  githubOutput.append(gitTotalResults, topFiveUsersTitle);

  while (index < 5 && index < resultsNumber) {
    const gitTopFiveResults = document.createElement("p");
    gitTopFiveResults.innerText = gitUsersData.items[index].login;
    githubOutput.append(gitTopFiveResults);
    index++;
    console.log(gitTopFiveResults.innerText);
  }
}

async function getJoke() {
  jokeOutput.innerHTML = "";

  const jokeType = document.getElementById("joke-type");

  if (jokeType.value === "Chuck Norris") {
    const responseChuck = await fetch(
      `https://api.chucknorris.io/jokes/random`,
    );

    const dataChuck = await responseChuck.json();

    const printChuckJoke = document.createElement("p");
    printChuckJoke.innerText = dataChuck.value;

    jokeOutput.append(printChuckJoke);
  } else {
    const responseDad = await fetch(`https://icanhazdadjoke.com/`, {
      headers: {
        Accept: "application/json",
      },
    });

    const dataDad = await responseDad.json();

    const printDadJoke = document.createElement("p");
    printDadJoke.innerText = dataDad.joke;
    jokeOutput.append(printDadJoke);
  }
}

async function getPublicApiInfo() {
  apiOutput.innerHTML = "";

  const apiTitle = document.createElement("h3");
  const apiDescription = document.createElement("p");
  const apiDocumentation = document.createElement("a");

  const response = await fetch(`https://www.freepublicapis.com/api/random`);
  const data = await response.json();

  apiTitle.innerText = data.title;
  apiDescription.innerText = data.description;
  apiDocumentation.innerText = data.documentation;
  apiDocumentation.href = data.documentation;

  apiOutput.append(apiTitle, apiDescription, apiDocumentation);
  console.log(data);
}
