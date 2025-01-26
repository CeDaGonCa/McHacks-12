import React, { useState, useEffect } from 'react';
import './BreathingExerciseGame.css';

const BreathingExerciseGame = () => {
    const [phase, setPhase] = useState('breatheIn');
    const [count, setCount] = useState(4);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setCount(prevCount => {
                    // When count reaches 0, switch to next phase
                    if (prevCount <= 1) {
                        setPhase(currentPhase => {
                            switch (currentPhase) {
                                case 'breatheIn':
                                    return 'hold';
                                case 'hold':
                                    return 'breatheOut';
                                case 'breatheOut':
                                    return 'breatheIn';
                                default:
                                    return 'breatheIn';
                            }
                        });
                        return 4; // Reset count for next phase
                    }
                    return prevCount - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isActive]);

    const toggleExercise = () => {
        if (!isActive) {
            // Starting new exercise
            setPhase('breatheIn');
            setCount(4);
        }
        setIsActive(!isActive);
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'breatheIn':
                return 'Breathe In';
            case 'hold':
                return 'Hold';
            case 'breatheOut':
                return 'Breathe Out';
            default:
                return 'Breathe In';
        }
    };

    return (
        <div className="breathing-exercise">
            <h2>Breathing Exercise</h2>
            <div className="circle-container">
                <div className={`breathing-circle ${phase} ${isActive ? 'active' : ''}`}>
                    <div className="instruction">
                        {getPhaseText()}
                    </div>
                    <div className="count">{count}</div>
                </div>
            </div>
            <button onClick={toggleExercise}>
                {isActive ? 'Stop' : 'Start'} Exercise
            </button>
        </div>
    );
};

export default BreathingExerciseGame; 