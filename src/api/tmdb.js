const API_KEY = '8e58fc9809c00599bc7356eda814473c';
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchMovies = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}?api_key=${API_KEY}&region=US`);
    if (!response.ok) {
      throw new Error(`Network response was not ok ${response.statusText}`);
    }
    const data = await response.json();
    const moviesWithDetails = await Promise.all(
      data.results.map(async movie => {
        const detailsResponse = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`);
        const details = await detailsResponse.json();

        const creditsResponse = await fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`);
        const credits = await creditsResponse.json();
        const director = credits.crew.find(person => person.job === 'Director').name;
        return { ...movie, imdb_id: details.imdb_id, director: director};
      })
    );
    return { ...data, results: moviesWithDetails };
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    throw error;
  }
};