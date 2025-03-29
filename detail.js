// API Configuration
const apiKey = '47a1a7df542d3d483227f758a7317dff';
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');
const tvId = urlParams.get('tvId');

// DOM Elements
const coverElement = document.getElementById('cover');
const titleElement = document.getElementById('title');
const posterElement = document.getElementById('poster');
const overviewElement = document.getElementById('overview');
const genreElement = document.getElementById('genre');
const ratingElement = document.getElementById('rating');
const actorsElement = document.getElementById('actors');
const yearElement = document.getElementById('year');
const runtimeElement = document.getElementById('runtime');
const trailerElement = document.getElementById('trailer');
const streamingPlayer = document.getElementById('streaming');
const loadingElement = document.getElementById('loading');
const streamingTitleElement = document.getElementById('streaming-title');
const episodeInfoElement = document.getElementById('episode-info');

// State variables
let selectedServer = 'vidcc';
let seasonsData = [];
let selectedEpisode = 1;
let selectedSeason = 1;
let mediaTitle = '';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  init();
  initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
  // Stream button click
  document.querySelectorAll('.stream-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.stream-mode').classList.add('active');

      // Update streaming title
      if (mediaTitle) {
        streamingTitleElement.textContent = mediaTitle;
      }

      // If TV show, show episode info if available
      if (tvId && selectedSeason && selectedEpisode) {
        episodeInfoElement.textContent = ` - S${selectedSeason}:E${selectedEpisode}`;
      } else {
        episodeInfoElement.textContent = '';
      }
    });
  });

  // Stream back button
  document.querySelector('.stream-back').addEventListener('click', () => {
    document.querySelector('.stream-mode').classList.remove('active');
  });

  // Trailer button click
  document.querySelectorAll('.trailer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.trailer-container').classList.add('active');
    });
  });

  // Close trailer button
  document.querySelector('.close-trailer').addEventListener('click', () => {
    document.querySelector('.trailer-container').classList.remove('active');
    // Pause trailer by reloading it
    const currentSrc = trailerElement.src;
    trailerElement.src = '';
    setTimeout(() => {
      trailerElement.src = currentSrc;
    }, 100);
  });

  // Download button (optional functionality)
  document.querySelector('.download-btn').addEventListener('click', () => {
    alert('Download functionality is not implemented in this demo version.');
  });
}

// Main initialization function
function init() {
  if (movieId) {
    fetchMovieDetails(movieId);
    setStreamingEmbed(movieId, "movie");
    hideSeasonEpisodeSelection();
  } else if (tvId) {
    fetchTvDetails(tvId);
    setStreamingEmbed(tvId, "tv");
    showSeasonEpisodeSelection();
  } else {
    handleError("No valid media ID found in URL");
  }
}

// Hide season/episode panel for movies
function hideSeasonEpisodeSelection() {
  const seContainer = document.getElementById("season-episode-container");
  seContainer.style.display = "none";
}

// Show season/episode panel for TV shows
function showSeasonEpisodeSelection() {
  const seContainer = document.getElementById("season-episode-container");
  seContainer.style.display = "flex";
}

// Handle error states
function handleError(message) {
  coverElement.innerHTML = `
    <div class="error-message">
      <i class="fa-solid fa-circle-exclamation"></i>
      <h2>Something went wrong</h2>
      <p>${message}</p>
      <a href="https://christianzgaming.github.io/website/" class="btn btn-primary">
        <i class="fa-solid fa-home"></i> Go Home
      </a>
    </div>
  `;

  document.querySelector('.error-message').style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    padding: 30px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  `;

  document.querySelector('.error-message i').style.cssText = `
    font-size: 3rem;
    color: #e50914;
    margin-bottom: 15px;
  `;
}

// Fetch movie details
async function fetchMovieDetails(id) {
  try {
    const [movieData, credits, videos] = await Promise.all([
      fetchData(`movie/${id}`),
      fetchData(`movie/${id}/credits`),
      fetchData(`movie/${id}/videos`)
    ]);

    displayMovieDetails(movieData, credits, videos);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    handleError("Unable to load movie information. Please try again later.");
  }
}

// Fetch TV show details
async function fetchTvDetails(id) {
  try {
    const [tvData, credits, videos] = await Promise.all([
      fetchData(`tv/${id}`),
      fetchData(`tv/${id}/credits`),
      fetchData(`tv/${id}/videos`)
    ]);

    displayTvDetails(tvData, credits, videos);
    fetchSeasonsData(id);
  } catch (error) {
    console.error("Error fetching TV details:", error);
    handleError("Unable to load TV show information. Please try again later.");
  }
}

// Generic API fetch function
async function fetchData(endpoint) {
  const response = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=en-US`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

// Display movie details
function displayMovieDetails(data, credits, videos) {
  // Set state
  mediaTitle = data.title;

  // Update DOM
  titleElement.textContent = data.title;

  // Set rating
  const rating = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
  ratingElement.textContent = `${rating}/10`;

  // Set year
  if (data.release_date) {
    const releaseYear = new Date(data.release_date).getFullYear();
    yearElement.textContent = releaseYear;
  } else {
    yearElement.textContent = 'Unknown';
  }

  // Set runtime
  if (data.runtime) {
    const hours = Math.floor(data.runtime / 60);
    const minutes = data.runtime % 60;
    runtimeElement.textContent = `${hours}h ${minutes}m`;
  } else {
    runtimeElement.textContent = 'Unknown';
  }

  // Set genre
  if (data.genres && data.genres.length > 0) {
    genreElement.textContent = data.genres.map(genre => genre.name).join(", ");
  } else {
    genreElement.textContent = 'Unknown';
  }

  // Set overview
  overviewElement.textContent = data.overview || 'No overview available.';

  // Set poster
  if (data.poster_path) {
    posterElement.src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  } else {
    posterElement.src = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-VLNDBGMO8xZGWlbLfDKXa2RCqhljShc38FN-h7tFSTRnBAdqvf-5m6GQp3dxhQozWbRAe7d2AHlBae3sII-p0w9tDHVY1_nvg45mAs6K9b-fNnmvGFyhOcTqxzuYxNEW1MoEbHdeNvNoTM4QG3XCe5S_QBhSLfjSXnl9EIL4Kns3t0B175ymTH6d/s1600/QQQ.jpg';
  }

  // Set background
  if (data.backdrop_path) {
    coverElement.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`;
  }

  // Set cast
  if (credits.cast && credits.cast.length > 0) {
    const castNames = credits.cast.slice(0, 5).map(actor => actor.name).join(", ");
    actorsElement.textContent = castNames;
  } else {
    actorsElement.textContent = 'No cast information available.';
  }

  // Set trailer
  setTrailer(videos);
}

// Display TV show details
function displayTvDetails(data, credits, videos) {
  // Set state
  mediaTitle = data.name;

  // Update DOM
  titleElement.textContent = data.name;

  // Set rating
  const rating = data.vote_average ? data.vote_average.toFixed(1) : 'N/A';
  ratingElement.textContent = `${rating}/10`;

  // Set year
  if (data.first_air_date) {
    const firstAirYear = new Date(data.first_air_date).getFullYear();
    yearElement.textContent = data.last_air_date ?
      `${firstAirYear} - ${new Date(data.last_air_date).getFullYear()}` :
      firstAirYear;
  } else {
    yearElement.textContent = 'Unknown';
  }

  // Set runtime
  if (data.episode_run_time && data.episode_run_time.length > 0) {
    runtimeElement.textContent = `${data.episode_run_time[0]} min/ep`;
  } else {
    runtimeElement.textContent = 'Varies';
  }

  // Set genre
  if (data.genres && data.genres.length > 0) {
    genreElement.textContent = data.genres.map(genre => genre.name).join(", ");
  } else {
    genreElement.textContent = 'Unknown';
  }

  // Set overview
  overviewElement.textContent = data.overview || 'No overview available.';

  // Set poster
  if (data.poster_path) {
    posterElement.src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  } else {
    posterElement.src = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-VLNDBGMO8xZGWlbLfDKXa2RCqhljShc38FN-h7tFSTRnBAdqvf-5m6GQp3dxhQozWbRAe7d2AHlBae3sII-p0w9tDHVY1_nvg45mAs6K9b-fNnmvGFyhOcTqxzuYxNEW1MoEbHdeNvNoTM4QG3XCe5S_QBhSLfjSXnl9EIL4Kns3t0B175ymTH6d/s1600/QQQ.jpg';
  }

  // Set background
  if (data.backdrop_path) {
    coverElement.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${data.backdrop_path})`;
  }

  // Set cast
  if (credits.cast && credits.cast.length > 0) {
    const castNames = credits.cast.slice(0, 5).map(actor => actor.name).join(", ");
    actorsElement.textContent = castNames;
  } else {
    actorsElement.textContent = 'No cast information available.';
  }

  // Set trailer
  setTrailer(videos);
}

// Set trailer from videos data
function setTrailer(videos) {
  if (videos.results && videos.results.length > 0) {
    // Find trailer or use first video
    const trailer = videos.results.find(video =>
      video.type === 'Trailer' && video.site === 'YouTube'
    ) || videos.results[0];

    if (trailer && trailer.key) {
      trailerElement.src = `https://www.youtube.com/embed/${trailer.key}`;
    }
  }
}

// Fetch seasons data for TV show
async function fetchSeasonsData(tvId) {
  try {
    const data = await fetchData(`tv/${tvId}`);

    if (data.seasons && data.seasons.length > 0) {
      seasonsData = data.seasons;
      populateSeasons();
    }
  } catch (error) {
    console.error("Error fetching seasons data:", error);
  }
}

// Populate season dropdown
function populateSeasons() {
  const seasonSelect = document.getElementById("seasonSelect");
  seasonSelect.innerHTML = '';

  // Filter out seasons with 0 episodes
  const validSeasons = seasonsData.filter(season =>
    season.season_number > 0 && season.episode_count > 0
  );

  if (validSeasons.length === 0) {
    seasonSelect.innerHTML = '<option value="0">No Seasons Available</option>';
    return;
  }

  validSeasons.forEach(season => {
    const option = document.createElement("option");
    option.value = season.season_number;
    option.textContent = `Season ${season.season_number} (${season.episode_count} episodes)`;
    seasonSelect.appendChild(option);
  });

  // Set first valid season and update episodes
  selectedSeason = validSeasons[0].season_number;
  updateEpisodes();
}

// Update episodes based on selected season
async function updateEpisodes() {
  const seasonSelect = document.getElementById("seasonSelect");
  selectedSeason = parseInt(seasonSelect.value);
  const episodeSelect = document.getElementById("episodeSelect");

  // Clear previous episodes and show loading
  episodeSelect.innerHTML = `
    <div class="episodes-loading">
      <div class="spinner"></div>
      <p>Loading episodes...</p>
    </div>
  `;

  try {
    // Fetch episodes for the selected season
    const episodes = await fetchEpisodesData(tvId, selectedSeason);

    // Clear loading state
    episodeSelect.innerHTML = '';

    if (!episodes || episodes.length === 0) {
      episodeSelect.innerHTML = '<div class="no-episodes">No episodes available for this season</div>';
      return;
    }

    // Create episode cards
    episodes.forEach((episode, index) => {
      // Create episode container
      const episodeContainer = document.createElement("div");
      episodeContainer.classList.add("episode-container");

      // Episode title and number
      const episodeButton = document.createElement("button");
      episodeButton.classList.add("episode-button");
      episodeButton.textContent = `${episode.episode_number}. ${episode.name}`;

      // Add active class to first/selected episode
      if (index === 0 || episode.episode_number === selectedEpisode) {
        episodeButton.classList.add("active-episode");
        selectedEpisode = episode.episode_number;
      }

      // Episode image
      const episodeImage = document.createElement("div");
      episodeImage.classList.add("episode-image");

      let imageUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-VLNDBGMO8xZGWlbLfDKXa2RCqhljShc38FN-h7tFSTRnBAdqvf-5m6GQp3dxhQozWbRAe7d2AHlBae3sII-p0w9tDHVY1_nvg45mAs6K9b-fNnmvGFyhOcTqxzuYxNEW1MoEbHdeNvNoTM4QG3XCe5S_QBhSLfjSXnl9EIL4Kns3t0B175ymTH6d/s1600/QQQ.jpg';

      if (episode.still_path) {
        imageUrl = `https://image.tmdb.org/t/p/w500${episode.still_path}`;
      }

      episodeImage.innerHTML = `
        <img class="episode-image-bg" src="${imageUrl}" alt="${episode.name}">
        <div class="playhover">
          <div class="play-hover">
            <div class="playBut">
              <svg enable-background="new 0 0 213.7 213.7" height="100%" version="1.1" viewBox="0 0 213.7 213.7" width="100%" xmlns="http://www.w3.org/2000/svg">
                <polygon class="triangle" fill="none" points="73.5,62.5 148.5,105.8 73.5,149.1" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="7"></polygon>
                <circle class="circle" cx="106.8" cy="106.8" fill="none" r="103.3" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="7"></circle>
              </svg>
            </div>
          </div>
        </div>
      `;

      // Episode overview
      const episodeOverview = document.createElement("div");
      episodeOverview.classList.add("episode-overview");
      episodeOverview.textContent = episode.overview || "No overview available for this episode.";

      // Event listener for episode selection
      episodeContainer.addEventListener('click', () => {
        // Update active class
        document.querySelectorAll('.episode-button').forEach(btn => {
          btn.classList.remove('active-episode');
        });
        episodeButton.classList.add('active-episode');

        // Update selected episode
        selectedEpisode = episode.episode_number;

        // Update episode info in player title
        episodeInfoElement.textContent = ` - S${selectedSeason}:E${selectedEpisode}`;

        // Update player
        updatePlayer(selectedEpisode, selectedSeason);
      });

      // Append elements to episode container
      episodeContainer.appendChild(episodeButton);
      episodeContainer.appendChild(episodeImage);
      episodeContainer.appendChild(episodeOverview);

      // Append to episode select
      episodeSelect.appendChild(episodeContainer);
    });

    // Update player with first episode
    updatePlayer(selectedEpisode, selectedSeason);

  } catch (error) {
    console.error("Error updating episodes:", error);
    episodeSelect.innerHTML = '<div class="error-message">Error loading episodes</div>';
  }
}

// Fetch episodes data for a specific season
async function fetchEpisodesData(tvId, seasonNumber) {
  try {
    const data = await fetchData(`tv/${tvId}/season/${seasonNumber}`);
    return data.episodes;
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

// Update player based on selected media
function updatePlayer(episode, season) {
  // Show loading indicator
  loadingElement.style.display = "flex";

  // Set the streaming iframe source
  setStreamingEmbed(movieId || tvId, movieId ? "movie" : "tv", season, episode);

  // Listen for iframe load event
  streamingPlayer.onload = () => {
    loadingElement.style.display = "none";
  };

  // Fallback timeout in case onload doesn't fire
  setTimeout(() => {
    loadingElement.style.display = "none";
  }, 8000);
}

// Set streaming embed for various platforms
function setStreamingEmbed(id, type, season, episode) {
  const server = selectedServer;
  let embedUrl = '';

  if (type === "movie") {
    // Movie embed URLs
    switch (server) {
      case 'vidsrc':
        embedUrl = `https://vidsrc.to/embed/movie/${id}`;
        break;
      case 'vidlink':
        embedUrl = `https://vidlink.pro/movie/${id}?primaryColor=ff0044&secondaryColor=f788a6&iconColor=ff0044&title=false&poster=true&`;
        break;
      case 'vidcc':
        embedUrl = `https://vidsrc.cc/v2/embed/movie/${id}`;
        break;
      case 'pro':
        embedUrl = `https://vidbinge.dev/embed/movie/${id}`;
        break;
      case 'to':
        embedUrl = `https://vidsrc.to/embed/movie/${id}`;
        break;
      case 'super':
        embedUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;
        break;
      case 'prime':
        embedUrl = `https://www.primewire.tf/embed/movie?tmdb=${id}`;
        break;
      default:
        embedUrl = `https://vidsrc.cc/v2/embed/movie/${id}`;
    }
  } else if (type === "tv") {
    // TV embed URLs with season and episode
    switch (server) {
      case 'vidsrc':
        embedUrl = `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
        break;
      case 'vidlink':
        embedUrl = `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=ff0044&secondaryColor=f788a6&iconColor=ff0044&title=false&poster=true&`;
        break;
      case 'vidcc':
        embedUrl = `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
        break;
      case 'pro':
        embedUrl = `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`;
        break;
      case 'to':
        embedUrl = `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
        break;
      case 'super':
        embedUrl = `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        break;
      case 'prime':
        embedUrl = `https://www.primewire.tf/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        break;
      default:
        embedUrl = `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
    }
  }

  // Set iframe source
  streamingPlayer.src = embedUrl;
}

// Change streaming server
function changeServer() {
  selectedServer = document.getElementById("serverSelect").value;

  // Show loading indicator
  loadingElement.style.display = "flex";

  // Update player with current media information
  if (movieId) {
    setStreamingEmbed(movieId, "movie");
  } else if (tvId) {
    setStreamingEmbed(tvId, "tv", selectedSeason, selectedEpisode);
  }

  // Listen for iframe load event
  streamingPlayer.onload = () => {
    loadingElement.style.display = "none";
  };

  // Fallback timeout in case onload doesn't fire
  setTimeout(() => {
    loadingElement.style.display = "none";
  }, 8000);
}
