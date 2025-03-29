// API Configuration
const apiKey = '47a1a7df542d3d483227f758a7317dff';
const moviesContainer = document.getElementById('movies');
const tvSeriesContainer = document.getElementById('tvSeries');
const horrorContainer = document.getElementById('horror');
const animeContainer = document.getElementById('anime');
const vivamaxContainer = document.getElementById('vivamax');
const searchInput = document.getElementById('search');
const searchResultsContainer = document.getElementById('searchResults');
const mediaSelect = document.getElementById('mediaSelect');
const companyId = 0x24696; // Vivamax company ID

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", () => {
  // Initialize data loading
  fetchMovies();
  fetchHorrorMovies();
  fetchTVSeries();
  fetchAnimeTVShows();
  fetchVivamaxMovies();

  // Initialize event listeners
  initializeEventListeners();

  // Add fade-in animation to sections
  document.querySelectorAll('.content-section').forEach((section, index) => {
    setTimeout(() => {
      section.classList.add('fade-in');
    }, 300 * index);
  });
});

// Initialize Event Listeners
function initializeEventListeners() {
  // Search functionality
  searchInput.addEventListener("input", debounce(searchMedia, 500));

  // Media type change
  mediaSelect.addEventListener("change", () => {
    searchInput.value = "";
    searchResultsContainer.innerHTML = "";
    showMainSections();
  });

  // Navigation scroll effects
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Add scroll event for header
  window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Debounce function to limit API calls
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

// Fetch and display popular movies
async function fetchMovies() {
  showLoadingState(moviesContainer);
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`
    );
    const data = await response.json();
    displayMovies(data.results.slice(0, 20));
  } catch (error) {
    console.error("Error fetching movies:", error);
    showErrorState(moviesContainer);
  }
}

// Fetch and display horror movies
async function fetchHorrorMovies() {
  showLoadingState(horrorContainer);
  try {
    const trendingUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=27`;
    const response = await fetch(trendingUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const horrorMovies = data.results.filter(movie =>
      movie.genre_ids && movie.genre_ids.includes(27)
    );

    displayHorrorMovies(horrorMovies.slice(0, 20));
  } catch (error) {
    console.error('Error fetching horror movies:', error);
    showErrorState(horrorContainer);
  }
}

// Fetch and display TV series
async function fetchTVSeries() {
  showLoadingState(tvSeriesContainer);
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=1`
    );
    const data = await response.json();
    displayTVSeries(data.results.slice(0, 20));
  } catch (error) {
    console.error('Error fetching TV series:', error);
    showErrorState(tvSeriesContainer);
  }
}

// Fetch and display anime TV shows
async function fetchAnimeTVShows() {
  showLoadingState(animeContainer);
  try {
    const animeGenreId = 16;
    const response = await fetch(
      `https://api.themoviedb.org/3/keyword/210024/movies?api_key=${apiKey}&language=en-US&page=1`
    );
    const data = await response.json();
    displayAnime(data.results.slice(0, 20));
  } catch (error) {
    console.error('Error fetching anime:', error);
    showErrorState(animeContainer);
  }
}

// Fetch and display Vivamax movies
async function fetchVivamaxMovies() {
  showLoadingState(vivamaxContainer);
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/company/${companyId}/movies?api_key=${apiKey}&language=en-US`
    );
    const data = await response.json();
    displayVivamax(data.results.slice(0, 20));
  } catch (error) {
    console.error('Error fetching Vivamax movies:', error);
    showErrorState(vivamaxContainer);
  }
}

// Show loading state for a container
function showLoadingState(container) {
  container.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const loadingCard = document.createElement("div");
    loadingCard.className = "swiper-slide loading-card";
    loadingCard.innerHTML = `
      <div class="poster-wrapper shimmer"></div>
      <div class="title-year-wrapper">
        <div class="title-shimmer shimmer"></div>
        <div class="year-shimmer shimmer"></div>
      </div>
    `;
    container.appendChild(loadingCard);
  }
}

// Show error state for a container
function showErrorState(container) {
  container.innerHTML = `
    <div class="error-message">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>Sorry, couldn't load content. Please try again later.</p>
    </div>
  `;
}

// Display popular movies
function displayMovies(movies) {
  moviesContainer.innerHTML = "";

  movies.forEach(async (movie) => {
    const rating = movie.vote_average;
    const card = await createMovieCard(movie, rating);
    moviesContainer.appendChild(card);
  });

  initializeSwiper(".swiper-popular");
}

// Display horror movies
function displayHorrorMovies(movies) {
  horrorContainer.innerHTML = "";

  movies.forEach(async (movie) => {
    const rating = movie.vote_average;
    const card = await createMovieCard(movie, rating);
    horrorContainer.appendChild(card);
  });

  initializeSwiper("#Horror .swiper-container");
}

// Display TV series
function displayTVSeries(tvSeries) {
  tvSeriesContainer.innerHTML = "";

  tvSeries.forEach(async (tv) => {
    const rating = tv.vote_average;
    const card = await createTVCard(tv, rating);
    tvSeriesContainer.appendChild(card);
  });

  initializeSwiper("#TVSeries .swiper-container");
}

// Display anime
function displayAnime(movies) {
  animeContainer.innerHTML = "";

  movies.forEach(async (movie) => {
    const rating = movie.vote_average;
    const card = await createMovieCard(movie, rating);
    animeContainer.appendChild(card);
  });

  initializeSwiper("#Anime .swiper-container");
}

// Display Vivamax movies
function displayVivamax(movies) {
  vivamaxContainer.innerHTML = "";

  movies.forEach(async (movie) => {
    const rating = movie.vote_average;
    const card = await createMovieCard(movie, rating);
    vivamaxContainer.appendChild(card);
  });

  initializeSwiper("#Vivamax .swiper-container");
}

// Fetch movie images for better quality backdrops
async function fetchMovieImages(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${apiKey}&language=en`
    );
    const data = await response.json();

    // Check if there are any English backdrops
    if (data.backdrops && data.backdrops.length > 0) {
      return data.backdrops[0].file_path;
    }

    // Fallback: fetch backdrops without specifying language
    const fallbackResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${apiKey}`
    );
    const fallbackData = await fallbackResponse.json();

    return fallbackData.backdrops && fallbackData.backdrops.length > 0
      ? fallbackData.backdrops[0].file_path
      : null;
  } catch (error) {
    console.error("Error fetching movie images:", error);
    return null;
  }
}

// Fetch TV series images
async function fetchTVImages(tvId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/images?api_key=${apiKey}&language=en`
    );
    const data = await response.json();

    // Check if there are any English backdrops
    if (data.backdrops && data.backdrops.length > 0) {
      return data.backdrops[0].file_path;
    }

    // Fallback: fetch backdrops without specifying language
    const fallbackResponse = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/images?api_key=${apiKey}`
    );
    const fallbackData = await fallbackResponse.json();

    return fallbackData.backdrops && fallbackData.backdrops.length > 0
      ? fallbackData.backdrops[0].file_path
      : null;
  } catch (error) {
    console.error("Error fetching TV images:", error);
    return null;
  }
}

// Create movie card with enhanced visuals
async function createMovieCard(movie, rating) {
  const card = document.createElement("div");
  card.className = "swiper-slide";

  const backdropPath = await fetchMovieImages(movie.id);
  let imageUrl;

  if (backdropPath) {
    imageUrl = `https://image.tmdb.org/t/p/w500${backdropPath}`;
  } else if (movie.backdrop_path) {
    imageUrl = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
  } else if (movie.poster_path) {
    imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  } else {
    imageUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-VLNDBGMO8xZGWlbLfDKXa2RCqhljShc38FN-h7tFSTRnBAdqvf-5m6GQp3dxhQozWbRAe7d2AHlBae3sII-p0w9tDHVY1_nvg45mAs6K9b-fNnmvGFyhOcTqxzuYxNEW1MoEbHdeNvNoTM4QG3XCe5S_QBhSLfjSXnl9EIL4Kns3t0B175ymTH6d/s1600/QQQ.jpg';
  }

  // Format release year safely
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA';

  card.innerHTML = `
    <a href='bold.html?movieId=${movie.id}'>
      <div class='poster-wrapper'>
        <div class='play-hover'>
          <div class='playBut'>
            <svg enable-background='new 0 0 213.7 213.7' height='100%' version='1.1' viewBox='0 0 213.7 213.7' width='100%' x='0px' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'>
              <polygon class='triangle' fill='none' points='73.5,62.5 148.5,105.8 73.5,149.1' stroke-linecap='round' stroke-linejoin='round' stroke-miterlimit='10' stroke-width='7'></polygon>
              <circle class='circle' cx='106.8' cy='106.8' fill='none' r='103.3' stroke-linecap='round' stroke-linejoin='round' stroke-miterlimit='10' stroke-width='7'></circle>
            </svg>
          </div>
        </div>
        <img alt='${movie.title}' src='${imageUrl}' loading="lazy"/>
      </div>

      <div class='circular-progress' style="--rating: ${rating}">
        <div class='inner-circle'></div>
        <p class='rating'>${rating ? rating.toFixed(1) : 'N/A'}</p>
      </div>

      <div class='title-year-wrapper'>
        <h3>${movie.title}</h3>
        <p class='released-year'>${releaseYear}</p>
      </div>
    </a>`;

  return card;
}

// Create TV card with enhanced visuals
async function createTVCard(tv, rating) {
  const card = document.createElement("div");
  card.className = "swiper-slide";

  const backdropPath = await fetchTVImages(tv.id);
  let imageUrl;

  if (backdropPath) {
    imageUrl = `https://image.tmdb.org/t/p/w500${backdropPath}`;
  } else if (tv.backdrop_path) {
    imageUrl = `https://image.tmdb.org/t/p/w500${tv.backdrop_path}`;
  } else if (tv.poster_path) {
    imageUrl = `https://image.tmdb.org/t/p/w500${tv.poster_path}`;
  } else {
    imageUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-VLNDBGMO8xZGWlbLfDKXa2RCqhljShc38FN-h7tFSTRnBAdqvf-5m6GQp3dxhQozWbRAe7d2AHlBae3sII-p0w9tDHVY1_nvg45mAs6K9b-fNnmvGFyhOcTqxzuYxNEW1MoEbHdeNvNoTM4QG3XCe5S_QBhSLfjSXnl9EIL4Kns3t0B175ymTH6d/s1600/QQQ.jpg';
  }

  // Format first air date year safely
  const airYear = tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : 'TBA';

  card.innerHTML = `
    <a href='bold.html?tvId=${tv.id}'>
      <div class='poster-wrapper'>
        <div class='play-hover'>
          <div class='playBut'>
            <svg enable-background='new 0 0 213.7 213.7' height='100%' version='1.1' viewBox='0 0 213.7 213.7' width='100%' x='0px' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'>
              <polygon class='triangle' fill='none' points='73.5,62.5 148.5,105.8 73.5,149.1' stroke-linecap='round' stroke-linejoin='round' stroke-miterlimit='10' stroke-width='7'></polygon>
              <circle class='circle' cx='106.8' cy='106.8' fill='none' r='103.3' stroke-linecap='round' stroke-linejoin='round' stroke-miterlimit='10' stroke-width='7'></circle>
            </svg>
          </div>
        </div>
        <img alt='${tv.name}' src='${imageUrl}' loading="lazy"/>
      </div>

      <div class='circular-progress' style="--rating: ${rating}">
        <div class='inner-circle'></div>
        <p class='rating'>${rating ? rating.toFixed(1) : 'N/A'}</p>
      </div>

      <div class='title-year-wrapper'>
        <h3>${tv.name}</h3>
        <p class='released-year'>${airYear}</p>
      </div>
    </a>`;

  return card;
}

// Initialize Swiper slider with enhanced options
function initializeSwiper(selector) {
  return new Swiper(selector, {
    slidesPerView: 'auto',
    spaceBetween: 15,
    grabCursor: true,
    loop: false,
    freeMode: true,
    freeModeMomentumRatio: 0.8,
    freeModeMomentumVelocityRatio: 0.8,
    freeModeMomentumBounceRatio: 1,
    mousewheel: {
      forceToAxis: true,
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 2,
        spaceBetween: 10,
      },
      480: {
        slidesPerView: 3,
        spaceBetween: 15,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 15,
      },
      992: {
        slidesPerView: 4,
        spaceBetween: 15,
      },
      1200: {
        slidesPerView: 5,
        spaceBetween: 15,
      },
      1400: {
        slidesPerView: 6,
        spaceBetween: 15,
      },
    },
    on: {
      init: function() {
        lazyLoadImages();
      },
      slideChange: function() {
        lazyLoadImages();
      }
    }
  });
}

// Search functionality
async function searchMedia() {
  const query = searchInput.value.trim();
  const mediaType = mediaSelect.value;

  if (query.length < 2) {
    searchResultsContainer.innerHTML = "";
    showMainSections();
    return;
  }

  hideMainSections();
  showSearchLoadingState();

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.results.length === 0) {
      showNoSearchResults(query);
    } else {
      displaySearchResults(data.results, mediaType);
    }
  } catch (error) {
    console.error("Error searching media:", error);
    searchResultsContainer.innerHTML = `
      <div class="search-error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Sorry, there was an error with your search. Please try again.</p>
      </div>
    `;
  }
}

// Display search results
function displaySearchResults(results, mediaType) {
  searchResultsContainer.innerHTML = `
    <div class="search-header">
      <h2>Search Results (${results.length})</h2>
      <button class="clear-search">Clear <i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="search-items"></div>
  `;

  const searchItems = searchResultsContainer.querySelector('.search-items');

  results.forEach(item => {
    if ((item.poster_path || item.backdrop_path) && item.vote_average >= 0) {
      const card = document.createElement('div');
      card.className = 'search-image';

      const imageUrl = item.poster_path ?
        `https://image.tmdb.org/t/p/w500${item.poster_path}` :
        (item.backdrop_path ?
          `https://image.tmdb.org/t/p/w500${item.backdrop_path}` :
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-VLNDBGMO8xZGWlbLfDKXa2RCqhljShc38FN-h7tFSTRnBAdqvf-5m6GQp3dxhQozWbRAe7d2AHlBae3sII-p0w9tDHVY1_nvg45mAs6K9b-fNnmvGFyhOcTqxzuYxNEW1MoEbHdeNvNoTM4QG3XCe5S_QBhSLfjSXnl9EIL4Kns3t0B175ymTH6d/s1600/QQQ.jpg'
        );

      const title = item.title || item.name;
      const year = mediaType === 'movie' ?
        (item.release_date ? new Date(item.release_date).getFullYear() : 'TBA') :
        (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'TBA');

      const rating = item.vote_average;

      card.innerHTML = `
        <a href='bold.html?${mediaType}Id=${item.id}'>
          <div class='search-poster-container'>
            <div class='play-hover'>
              <div class='playBut'>
                <svg enable-background='new 0 0 213.7 213.7' height='100%' version='1.1' viewBox='0 0 213.7 213.7' width='100%' x='0px' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'>
                  <polygon class='triangle' fill='none' points='73.5,62.5 148.5,105.8 73.5,149.1' stroke-linecap='round' stroke-linejoin='round' stroke-miterlimit='10' stroke-width='7'></polygon>
                  <circle class='circle' cx='106.8' cy='106.8' fill='none' r='103.3' stroke-linecap='round' stroke-linejoin='round' stroke-miterlimit='10' stroke-width='7'></circle>
                </svg>
              </div>
            </div>
            <img alt='${title}' src='${imageUrl}' loading="lazy"/>
          </div>

          <div class='circular-progress' style="--rating: ${rating}">
            <div class='inner-circle'></div>
            <p class='rating'>${rating ? rating.toFixed(1) : 'N/A'}</p>
          </div>

          <div class='search-title-year'>
            <h3 class='search-title'>${title}</h3>
            <h3 class='search-year'>${year}</h3>
          </div>
        </a>
      `;

      searchItems.appendChild(card);
    }
  });

  // Add clear search button functionality
  const clearBtn = searchResultsContainer.querySelector('.clear-search');
  clearBtn.addEventListener('click', () => {
    searchInput.value = "";
    searchResultsContainer.innerHTML = "";
    showMainSections();
  });
}

// Show search loading state
function showSearchLoadingState() {
  searchResultsContainer.innerHTML = `
    <div class="search-loading">
      <div class="spinner"></div>
      <p>Searching for movies and shows...</p>
    </div>
  `;
}

// Show no search results message
function showNoSearchResults(query) {
  searchResultsContainer.innerHTML = `
    <div class="no-results">
      <i class="fa-solid fa-video-slash"></i>
      <h3>No results found for "${query}"</h3>
      <p>Try a different search term or browse our categories below</p>
      <button class="clear-search">Clear Search</button>
    </div>
  `;

  const clearBtn = searchResultsContainer.querySelector('.clear-search');
  clearBtn.addEventListener('click', () => {
    searchInput.value = "";
    searchResultsContainer.innerHTML = "";
    showMainSections();
  });
}

// Hide main content sections during search
function hideMainSections() {
  document.querySelectorAll('.content-section, #backgroundWrapper').forEach(section => {
    section.style.display = 'none';
  });
}

// Show main content sections
function showMainSections() {
  document.querySelectorAll('.content-section, #backgroundWrapper').forEach(section => {
    section.style.display = 'block';
  });
}

// Lazy load images for better performance
function lazyLoadImages() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src || img.src;
    });
  }
}

// Optional: Add dynamic featured movie selection
function updateFeaturedMovie() {
  fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const featuredMovie = data.results[0];

        // Update hero banner with new featured movie
        const heroBackdrop = document.querySelector('.hero-backdrop .back');
        const heroTitle = document.querySelector('.movie-intro h1');
        const heroDescription = document.querySelector('.movie-description');
        const heroYear = document.querySelector('.meta-item:first-child');
        const heroGenre = document.querySelector('.meta-item:last-child');
        const heroWatchButton = document.querySelector('.btn-watch');

        if (featuredMovie.backdrop_path) {
          heroBackdrop.src = `https://image.tmdb.org/t/p/w1280${featuredMovie.backdrop_path}`;
        }

        heroTitle.textContent = featuredMovie.title;
        heroDescription.textContent = featuredMovie.overview;

        if (featuredMovie.release_date) {
          heroYear.textContent = new Date(featuredMovie.release_date).getFullYear();
        }

        // Update watch button link
        heroWatchButton.href = `bold.html?movieId=${featuredMovie.id}`;

        // Fetch genre information
        fetch(`https://api.themoviedb.org/3/movie/${featuredMovie.id}?api_key=${apiKey}`)
          .then(response => response.json())
          .then(movieData => {
            if (movieData.genres && movieData.genres.length > 0) {
              heroGenre.textContent = movieData.genres[0].name;
            }
          })
          .catch(error => console.error("Error fetching movie details:", error));
      }
    })
    .catch(error => console.error("Error updating featured movie:", error));
}

// Add to DOM ready function if you want to enable dynamic featured movie
// Uncomment the line below to enable:
// updateFeaturedMovie();
