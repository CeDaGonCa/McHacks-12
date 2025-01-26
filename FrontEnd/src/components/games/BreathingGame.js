import React, { useState, useEffect } from 'react';
import './Games.css';

const BreathingGame = () => {
    const [phase, setPhase] = useState('inhale');
    const [counter, setCounter] = useState(4);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setCounter((counter) => {
                    if (counter === 0) {
                        setPhase((currentPhase) => {
                            switch (currentPhase) {
                                case 'inhale':
                                    return 'hold';
                                case 'hold':
                                    return 'exhale';
                                case 'exhale':
                                    return 'inhale';
                                default:
                                    return 'inhale';
                            }
                        });
                        return phase === 'hold' ? 7 : 4;
                    }
                    return counter - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, phase]);

    const toggleExercise = () => {
        setIsActive(!isActive);
        if (!isActive) {
            setPhase('inhale');
            setCounter(4);
        }
    };

    return (
        <div className="breathing-game">
            <h1>Breathing Exercise</h1>
            <div className={`breathing-circle ${phase} ${isActive ? 'active' : ''}`}>
                <div className="instruction">
                    {phase === 'inhale' && 'Breathe In'}
                    {phase === 'hold' && 'Hold'}
                    {phase === 'exhale' && 'Breathe Out'}
                </div>
                <div className="counter">{counter}</div>
            </div>
            <button onClick={toggleExercise} className="control-button">
                {isActive ? 'Stop' : 'Start'} Exercise
            </button>
            <div className="instructions">
                <h2>How to Practice:</h2>
                <ol>
                    <li>Find a comfortable position</li>
                    <li>Click 'Start Exercise' to begin</li>
                    <li>Follow the breathing prompts</li>
                    <li>Continue for 2-3 minutes</li>
                </ol>
            </div>
        </div>
    );
};

export default BreathingGame; 