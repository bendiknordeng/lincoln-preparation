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

    useEffect(() => {
        console.log(movies[currentIndex]);
    }, [currentIndex, movies]);

    useEffect(() => {
        fetchMovies('movie/top_rated').then(data => {
            const shuffledMovies = data.results.sort(() => Math.random() - 0.5);
            setMovies(shuffledMovies.slice(0, 20));  // Take the first 20 shuffled movies
        });
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
                </>
            )}
        </div>
    );
}

export default MovieQuiz;