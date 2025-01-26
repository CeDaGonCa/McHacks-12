import React from "react";
import { Link } from "react-router-dom";
import "../components/games/Games.css";

const Games = () => {
  const games = [
    {
      title: "Breathing Exercise",
      description: "A simple breathing exercise to help you relax",
      link: "/games/breathing",
    },
    {
      title: "Memory Match",
      description: "Test your memory by matching pairs of cards",
      link: "/games/memory-match",
    },
  ];

  return (
    <div className="page-content">
      <h1>Relaxation Activities</h1>
      <p>Choose an activity to help pass the time:</p>

      <div className="games-grid">
        {games.map((game) => (
          <div key={game.title} className="game-card">
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <Link to={game.link} className="play-button">
              Start
            </Link>
          </div>
        ))}
      </div>

      <div className="additional-resources">
        <h2>Additional Resources</h2>
        <ul>
          <li>
            <Link to="/cafeteria">Hospital Cafeteria Menu</Link>
          </li>
          <li>
            <Link to="/wifi">Free WiFi Access</Link>
          </li>
          <li>
            <Link to="/reading">Digital Reading Material</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Games;
