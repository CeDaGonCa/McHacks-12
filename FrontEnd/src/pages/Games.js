import React from 'react';
import './Games.css';

const Games = () => {
    const games = [
        {
            title: "Breathing Exercise",
            description: "A simple breathing exercise to help you relax",
            link: "/games/breathing"
        },
        {
            title: "Color Meditation",
            description: "Calming color visualization exercise",
            link: "/games/meditation"
        },
        {
            title: "Word Search",
            description: "Find hidden words to keep your mind engaged",
            link: "/games/wordsearch"
        },
        {
            title: "Peaceful Puzzle",
            description: "Simple jigsaw puzzles with calming images",
            link: "/games/puzzle"
        }
    ];

    return (
        <div className="page-content">
            <h1>Relaxation Activities</h1>
            <p>Choose an activity to help pass the time:</p>
            
            <div className="games-grid">
                {games.map(game => (
                    <div key={game.title} className="game-card">
                        <h3>{game.title}</h3>
                        <p>{game.description}</p>
                        <a href={game.link} className="play-button">Start</a>
                    </div>
                ))}
            </div>

            <div className="additional-resources">
                <h2>Additional Resources</h2>
                <ul>
                    <li><a href="/cafeteria">Hospital Cafeteria Menu</a></li>
                    <li><a href="/wifi">Free WiFi Access</a></li>
                    <li><a href="/reading">Digital Reading Material</a></li>
                </ul>
            </div>
        </div>
    );
};

export default Games;
