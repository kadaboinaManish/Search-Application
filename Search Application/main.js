//DOM elements
const contentDivs = document.querySelectorAll('.page');
const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');
const weatherResult = document.getElementById('weatherResult'); 
const imagesResult = document.getElementById('page2Content');
const restaurantsResult = document.getElementById('page3Content');
const showMoreBtn = document.getElementById('show-more-btn');
const NavBar = document.getElementById('nav-bar');

let userInputValue = ''; // Store user input value
let pageNumber = 1; // Store page number
let photos = []; // Global variable to store fetched photos
let matchingCities =[] // Global variable to store matching cities

// Carousel
const Carouselbuttons = document.querySelectorAll("[data-carousel-button]")

Carouselbuttons.forEach(button => {
  button.addEventListener("click", () => {
    const offset = button.dataset.carouselButton === "next" ? 1 : -1
    const slides = button
      .closest("[data-carousel]")
      .querySelector("[data-slides]")

    const activeSlide = slides.querySelector("[data-active]")
    let newIndex = [...slides.children].indexOf(activeSlide) + offset
    if (newIndex < 0) newIndex = slides.children.length - 1
    if (newIndex >= slides.children.length) newIndex = 0

    slides.children[newIndex].dataset.active = true
    delete activeSlide.dataset.active
  })
});



// Function to update content based on user input
function updatePageContent(pageId, content) {
  const pageContent = document.getElementById(`${pageId}Content`);
  pageContent.innerHTML = content;
}


userInput.addEventListener('input',fetchCitiesData);
// Event listener for submit button
submitButton.addEventListener('click', async () => {
  userInputValue = userInput.value; // Store user input value
  contentDivs.forEach(div => div.style.display = 'none'); 
  location.hash = '#home'; 
  userInput.value = ''; 

  NavBar.style.display = 'flex';
  //fetch matching cities data
  if (userInputValue) {
    const CitiesData = await fetchCitiesData(userInputValue);
    console.log(CitiesData);
    if (CitiesData) {
      matchingCities = CitiesData._embedded["city:search-results"].map((city) => city.matching_full_name);
      console.log(matchingCities);
    }
  }

  // Fetch weather data and update the weatherResult element
  if (userInputValue) {
    const weatherData = await fetchWeatherData(userInputValue);
    if (weatherData) {
        const cityName = weatherData.name;
      const temperature = weatherData.main.temp;
      const description = weatherData.weather[0].description;
      const humidity = weatherData.main.humidity;
      const pressure = weatherData.main.pressure;
      const visibility = weatherData.visibility;
      const resultHTML = `
      <p>City: ${cityName}</p>
      <p>Temperature: ${temperature} K</p>
      <p>Description: ${description}</p>
      <p>Humidity: ${humidity}</p>
      <p>Pressure: ${pressure}</p>
      <p>Visibility: ${visibility}</p>`;
      weatherResult.innerHTML = resultHTML;
    } else {
      weatherResult.innerHTML = '<p>Weather data not available for the provided city.</p>';
    }
  } else {
    weatherResult.innerHTML = '<p>Please enter a city name on the home page.</p>';
  }

  //Fetch Images data and update the images element
  if (userInputValue) {
    const imagesData = await fetchImagesData(userInputValue);
    if (imagesData) {
        // update the photos array with the fetched photos
        photos = imagesData.results;
        photos.forEach((photo)=>{
            const image = document.createElement('img');
            image.src = photo.urls.small;

            const imageLink = document.createElement('a');
            imageLink.href = photo.links.html;
            imageLink.appendChild(image);

            imagesResult.appendChild(imageLink);
        }); 
        //showMoreBtn.style.display = 'block';
    }
  }



  //Fetch Restaurants data and update the restaurant element
  if (userInputValue){
    const restaurantsData = await fetchRestaurantsData(userInputValue);
    if (restaurantsData) {
        restaurantsData.results.forEach((restaurant)=>{
            const restaurantName = restaurant.name;
            const restaurantAddress = restaurant.format_address;

            const restaurantInfo = document.createElement('div');
            restaurantInfo.innerHTML = `<p>Name: ${restaurantName}</p>
            <p>Address: ${restaurantAddress}</p>`;

            restaurantsResult.appendChild(restaurantInfo)
        });
    }
  }


});

// Event listener for show more button
//showMoreBtn.addEventListener("click",loadMoreImages)

// Event listener for navigation
window.addEventListener('hashchange', async () => {
  const hash = location.hash;
  contentDivs.forEach(div => {
    div.style.display = div.id === hash.slice(1) ? 'block' : 'none';
  });

  //Hide nav on home page
  if(hash === '#home') {
    NavBar.style.display = 'none';
  }else{
    NavBar.style.display = 'flex';
  }

  // Clear weather data when not on the "Weather" page
  if (hash !== '#page1') {
    weatherResult.innerHTML = '';
  }
  // Clear images data when not on the "Images" page
  if (hash!== '#page2') {
      imagesResult.innerHTML = '';
      showMoreBtn.style.display = 'none';
    }else{
      if (userInputValue){
                await displayImagesData(userInputValue);
                showMoreBtn.style.display = 'block';
            }
    }
  // Clear images data when not on the "Restaurants" page
  if (hash!== '#page3') {
      restaurantsResult.innerHTML = '';
    }else{
        if (userInputValue){
            await displayRestaurantsData(userInputValue);
        }
    }

    if (hash === '#page1' && userInputValue) {
      await fetchWeatherData(userInputValue);
      await displayWeatherData(userInputValue);
    }

    if (hash === '#page2' && userInputValue) {
      await fetchImagesData(userInputValue);
      await displayImagesData(userInputValue);
      showMoreBtn.style.display = 'block';
    }
});

// Fetch Cities data function

async function fetchCitiesData(city) {
  const citiesUrl = `https://api.teleport.org/api/cities/?search=${city}&limit=10`;

  try {
    const response = await fetch(citiesUrl);
    if (!response.ok) {
      throw new Error('Cities data not available.');
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching cities data:', error);
    return null;
  }
}

// Fetch Weather Data function
async function fetchWeatherData(city) {
  const weatherApiKey = "1d44b727f10c0433b94bfa4f7f986631"
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=imperial`;

  try {
    const response = await fetch(weatherUrl);
    if (!response.ok) {
      throw new Error('Weather data not available for the provided city.');
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

async function displayWeatherData(city) {
    const weatherData = await fetchWeatherData(city);
    if (weatherData) {
        const cityName = weatherData.name;
      const temperature = weatherData.main.temp;
      const description = weatherData.weather[0].main;
      console.log(description);
      const humidity = weatherData.main.humidity;
      const pressure = weatherData.main.pressure;
      const visibility = formatVisibility(weatherData.visibility);
      //const visibility = weatherData.visibility;
      
      const sunriseTime = formatUnixTime(weatherData.sys.sunrise);
      const sunsetTime = formatUnixTime(weatherData.sys.sunset);
      console.log(sunriseTime);
      console.log(sunsetTime);

      const resultHTML = `
      <div id="basic-info">
        <div id="basic-info-1">
            <h1 id="city-name">${cityName}</h1>
            <h2 id="city-temperature">${temperature}°F </h2>
            <h3 id="temp-description">${description}</h3>
        </div>
        <div id="basic-info-2">
            <p id="temp-low">L: ${weatherData.main.temp_min}°F</p>
            <p id="temp-high">H: ${weatherData.main.temp_max}°F</p>
        </div>
      </div>
      <div id="sun">
        <div id="sun-rise">
            <img id="sun-rise-img"src ="sunrise.png"/>
            <p>Sunrise: ${sunriseTime}</p>
        </div>
        <div id="sun-set">
            <img id="sun-set-img"src ="sunset.png"/>
            <p>Sunset: ${sunsetTime}</p>
        </div>
      </div>
      <div id="weather-other">
        <div id="humidity-main">
            <img id="humidity-img"src ="humidity.png"/>
            <p id="temp-humidity">Humidity: ${humidity} %</p>
        </div>
        <div id="pressure-main">
            <img id="pressure-img"src ="pressure.png"/>
            <p id="temp-pressure">Pressure: ${pressure} hPa</p>
        </div>
        <div id="visibility-main">
            <img id="visibility-img" src ="vision.png"/>
            <p id="temp-visibility">Visibility: ${visibility} </p>
        </div>
      </div>`;
      weatherResult.innerHTML = resultHTML;
      //Add the weather class to the page1Content element
      const page1Content = document.getElementById('page1Content');
      page1Content.clasName ='';
        const weatherClass = getWeatherClass(description);
      if (weatherClass) {
        //contentDivs[0].classList.remove('weather-clear', 'weather-clouds','weather-rain');
        page1Content.classList.add(weatherClass);
        console.log(page1Content.classList);
      }
    }else{
        weatherResult.innerHTML = '<p>Weather data not available for the provided city.</p>';
    }
}

function formatUnixTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >=12 ? 'PM' : 'AM';

  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

function formatVisibility(visibility) {
  if (visibility) {
      return Math.round(visibility/1609.344) +  'miles';
    } 
}

async function fetchImagesData(city) {
    const ImagesApiKey = "4cIsIHc3SPyxfwZFwbXUmaD-TsSZJf3QsEU_u2lpPqI"
    const ImagesUrl=`https://api.unsplash.com/search/photos?page=${pageNumber}&query=${city}&client_id=${ImagesApiKey}&per_page=12`;
    try {
        const response = await fetch(ImagesUrl);
        if (!response.ok) {
                    throw new Error('Images data not available for the provided city.');
                }
                if (pageNumber === 1) {
                    imagesResult.innerHTML = '';
                }
                const data = await response.json();
                return data;
    } 
    catch (error) {
        console.error('Error fetching images data:', error);
        return null;
    }
}

async function displayImagesData(city){
    const imagesData = await fetchImagesData(city);
    if (imagesData) {
        // update the photos array with the fetched photos
        photos = imagesData.results;
        imagesResult.innerHTML = '';
        photos.forEach((photo)=>{
            const image = document.createElement('img');
            image.src = photo.urls.small;
         
            const imageLink = document.createElement('a');
            imageLink.href = photo.links.html;
            imageLink.appendChild(image);

            imagesResult.appendChild(imageLink);
        }); 
        //showMoreBtn.style.display = 'block';
    }
}

// Fetch data from Google Places API
async function fetchRestaurantsData(city) {
    const RestaurantsApiKey = "AIzaSyBqfp5pHfTzMK8ldvI0uQvymm2AWm6JiqY"
    const RestaurantsUrl=`https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+${city}&key=${RestaurantsApiKey}`;
    try {
        const response = await fetch(RestaurantsUrl);
        if (!response.ok) {
                    throw new Error('Restaurants data not available for the provided city.');
                }
                if (pageNumber === 1) {
                    restaurantsResult.innerHTML = '';
                }
                const data = await response.json();
                console.log(data)
                return data;
    } 
    catch (error) {
        console.error('Error fetching restaurants data:', error);
        return null;
    }
}

// Display restaurants data 
async function displayRestaurantsData(city) {
    const restaurantsData = await fetchRestaurantsData(city);
    console.assert(restaurantsData);
    if (restaurantsData) {
        restaurantsResult.innerHTML = '';// Clear restaurants data when not on the "Restaurants" page
        restaurantsData.results.forEach((restaurant)=>{
            const restaurantName = restaurant.name;
            const restaurantAddress = restaurant.formatted_address;
            const restaurantRating = restaurant.rating;
            const restaurantPrice = restaurant.price_level;
            const restaurantTotalRating = restaurant.user_ratings_total;
            const openingHours = restaurant.opening_hours.open_now;
            const restaurantIcon = restaurant.icon;
            console.log(openingHours);
            let open_now = '';
            if (openingHours === true) {
              open_now="Open Now"
            }else if (openingHours === false) {
              open_now= "Closed";
            }
            
            console.log(open_now);

            const restaurantCard = document.createElement('div');
            restaurantCard.classList.add('restaurant-card');
            restaurantCard.innerHTML = `
            <div id="restaurant-info">
              <div id="restaurant-image">
                <img src="${restaurantIcon}"/>
              </div>
              <div id="restaurant-basic-info">
                <div id="restaurant-basic-info-2">
                  <p id="restaurant-name">${restaurantName}</p>
                </div>
                <div id="restaurant-basic-info-3">
                  <p>${open_now} </p>
                  <div id="rating_price">
                    <p id="restaurant-rating">Rating: ${restaurantRating}/${restaurantTotalRating}</p>
                    <p id="restaurant-price">Price Level: ${restaurantPrice} </p>
                  </div>
                </div>
              </div>
              <p id="restaurant-address">Address: ${restaurantAddress}</p>
            </div>
            `;

            restaurantsResult.appendChild(restaurantCard)
        });
    }

}

function loadMoreImages() {
    pageNumber++;
    displayImagesData(userInputValue);
}

function getWeatherClass(description) {
    const lowerCasedDescription = description.toLowerCase();
    if (lowerCasedDescription.includes('clear')|| description.includes('sunny')){
        return 'weather-clear';
    }else if (lowerCasedDescription.includes('clouds')){
        return 'weather-clouds';
    }else if (lowerCasedDescription.includes('rain') || description.includes('shower')){
        return 'weather-rain';
    }else{
        return '';
    }
}