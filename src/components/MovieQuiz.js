import React, { useState, useEffect, useRef } from 'react';
import { fetchMovies } from '../api/tmdb';
import 'font-awesome/css/font-awesome.min.css';
import './MovieQuiz.css';

function MovieQuiz() {
    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [guess, setGuess] = useState('');
    const [message, setMessage] = useState(null);
    const [score, setScore] = useState(0);
    const [quizOver, setQuizOver] = useState(false);
    const [guessDirector, setGuessDirector] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600); // Initialize based on the initial window width

    useEffect(() => {
        // Function to handle window resize event
        const handleResize = () => {
            // Update isMobile based on the new window width
            setIsMobile(window.innerWidth <= 600); // Adjust the threshold as needed
        };

        // Add a resize event listener when the component mounts
        window.addEventListener('resize', handleResize);

        // Remove the resize event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        console.log(movies[currentIndex]);
    }, [currentIndex, movies]);

    useEffect(() => {
        const fetchMoviesFromAPI = async () => {
            const totalPagesToFetch = 5; // Number of pages to fetch
            const allMovies = [];

            for (let page = 1; page <= totalPagesToFetch; page++) {
                const data = await fetchMovies(page);
                allMovies.push(...data.results);
            }

            // Remove duplicate movies based on their unique IDs
            const uniqueMovies = removeDuplicates(allMovies, 'id');

            // Shuffle the unique movies randomly
            const shuffledMovies = shuffleArray(uniqueMovies);

            setMovies(shuffledMovies);
        };

        // Function to remove duplicates from an array of objects based on a key
        const removeDuplicates = (array, key) => {
            const seen = new Set();
            return array.filter((item) => {
                const keyValue = item[key];
                return seen.has(keyValue) ? false : seen.add(keyValue);
            });
        };

        // Function to shuffle an array randomly
        const shuffleArray = (array) => {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        };

        fetchMoviesFromAPI();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();  // Prevent the default form submission behavior
        checkGuess();
    };

    const timeoutRef = useRef(null);

    const checkGuess = () => {
        setMessage(null);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        const correctAnswer = guessDirector ?
            movies[currentIndex].director :
            movies[currentIndex].release_date.split('-')[0];
        const lastName = correctAnswer.split(' ').pop().toLowerCase();
        const isCorrect = guess.toLowerCase() === correctAnswer.toLowerCase() || (guessDirector && guess.toLowerCase() === lastName);
        const messageText = isCorrect ? `Riktig! Svaret var ${correctAnswer}` : `Feil. Svaret var ${correctAnswer}.`;
        setMessage({ text: messageText, color: isCorrect ? 'green' : 'red' });
        if (isCorrect) {
            setScore(score + 1);
        }
        setCurrentIndex(currentIndex + 1);  // Move to the next movie
        setGuess('');  // Clear the guess input field
        timeoutRef.current = setTimeout(() => setMessage(null), 5000);
        if (currentIndex === 19) {  // Check if it's the last movie
            setQuizOver(true);
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const restartQuiz = () => {
        setQuizOver(false);
        setScore(0);
        setCurrentIndex(0);
    };

    return (
        <div className="MovieQuiz">
            <h2 className="title">Filmquiz</h2>
            {quizOver ? (
                <div className="quiz-over">
                    <h3>Poeng: {score} / 20</h3>
                    <button onClick={restartQuiz}>Prøv igjen</button>
                </div>
            ) : (
                <>
                    {isMobile ? (
                        <div className="mobile-container">
                            <div className="current-movie">Film: {currentIndex + 1} / 20</div>
                            {movies.length > 0 && (
                                <div className="quiz-section">
                                    <div style={{ position: 'relative' }}>
                                        <a href={`https://www.imdb.com/title/${movies[currentIndex].imdb_id}`} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={`https://image.tmdb.org/t/p/w500${movies[currentIndex].poster_path}`}
                                                alt={`${movies[currentIndex].title} poster`}
                                                className="poster-image"
                                            />
                                        </a>
                                    </div>
                                    <h3>{movies[currentIndex].title}</h3>
                                    <p><i className="fa fa-star"></i> {movies[currentIndex].vote_average}</p>
                                </div>
                            )}
                            <div className="score">Poeng: {score}</div>
                            <div className="mode-section btn-group" role="group">
                                <button
                                    onClick={() => setGuessDirector(false)}
                                    className={`btn btn-primary ${!guessDirector ? 'active' : ''}`}
                                > Utgivelsesår
                                </button>
                                <button
                                    onClick={() => setGuessDirector(true)}
                                    className={`btn btn-primary ${guessDirector ? 'active' : ''}`}
                                > Regissør
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="input-section">
                                <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder={guessDirector ? 'Skriv en regissør' : 'Skriv et utgivelsesår'} />
                                <button className="submit-button" type="submit">Gjett</button>
                            </form>
                            {message && <div className={`message ${message.color}`}>{message.text}</div>}
                        </div>
                    ) : (
                        <div className="flex-container">
                            <div className="left-section">
                                <div className="current-movie">Film: {currentIndex + 1} / 20</div>
                                {movies.length > 0 && (
                                    <div className="quiz-section">
                                        <div style={{ position: 'relative' }}>
                                            <a href={`https://www.imdb.com/title/${movies[currentIndex].imdb_id}`} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w500${movies[currentIndex].poster_path}`}
                                                    alt={`${movies[currentIndex].title} poster`}
                                                    className="poster-image"
                                                />
                                            </a>
                                        </div>
                                        <h3>{movies[currentIndex].title}</h3>
                                        <p><i className="fa fa-star"></i> {movies[currentIndex].vote_average}</p>
                                    </div>
                                )}
                            </div>
                            <div className="right-section">
                                <div className="score">Poeng: {score}</div>
                                <div className="mode-section btn-group" role="group">
                                    <button
                                        onClick={() => setGuessDirector(false)}
                                        className={`btn btn-primary ${!guessDirector ? 'active' : ''}`}
                                    > Utgivelsesår
                                    </button>
                                    <button
                                        onClick={() => setGuessDirector(true)}
                                        className={`btn btn-primary ${guessDirector ? 'active' : ''}`}
                                    > Regissør
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="input-section">
                                    <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder={guessDirector ? 'Skriv en regissør' : 'Skriv et utgivelsesår'} />
                                    <button className="submit-button" type="submit">Gjett</button>
                                </form>
                                {message && <div className={`message ${message.color}`}>{message.text}</div>}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MovieQuiz;