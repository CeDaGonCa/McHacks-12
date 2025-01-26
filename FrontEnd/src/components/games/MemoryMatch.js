import React, { useState, useEffect } from 'react';
import './Games.css';

const CARD_PAIRS = [
    { id: 1, content: '🌸' },
    { id: 2, content: '🌺' },
    { id: 3, content: '🌻' },
    { id: 4, content: '🌷' },
    { id: 5, content: '🌹' },
    { id: 6, content: '🍀' },
];

const MemoryMatch = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const duplicatedCards = [...CARD_PAIRS, ...CARD_PAIRS]
            .sort(() => Math.random() - 0.5)
            .map((card, index) => ({ ...card, uniqueId: index }));
        setCards(duplicatedCards);
        setFlipped([]);
        setSolved([]);
    };

    const handleClick = (index) => {
        if (disabled) return;
        if (flipped.length === 0) {
            setFlipped([index]);
            return;
        }
        if (flipped.length === 1) {
            setDisabled(true);
            const firstCard = cards[flipped[0]];
            const secondCard = cards[index];
            
            if (firstCard.id === secondCard.id) {
                setSolved([...solved, firstCard.id]);
                setFlipped([]);
                setDisabled(false);
            } else {
                setFlipped([...flipped, index]);
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        }
    };

    const isFlipped = (index) => {
        return flipped.includes(index) || solved.includes(cards[index].id);
    };

    return (
        <div className="memory-game">
            <h1>Memory Match</h1>
            <div className="game-board">
                {cards.map((card, index) => (
                    <div
                        key={card.uniqueId}
                        className={`card ${isFlipped(index) ? 'flipped' : ''}`}
                        onClick={() => !isFlipped(index) && handleClick(index)}
                    >
                        <div className="card-inner">
                            <div className="card-front">?</div>
                            <div className="card-back">{card.content}</div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={initializeGame} className="reset-button">
                New Game
            </button>
        </div>
    );
};

export default MemoryMatch; 