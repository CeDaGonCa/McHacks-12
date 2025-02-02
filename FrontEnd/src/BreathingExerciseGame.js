import React, { useState, useEffect } from 'react';
import './BreathingExerciseGame.css';

const BreathingExerciseGame = () => {
    const [phase, setPhase] = useState('breathIn');
    const [timeLeft, setTimeLeft] = useState(4);
    const [isActive, setIsActive] = useState(false);

    // Define phases with strict order
    const getNextPhase = (currentPhase) => {
        switch (currentPhase) {
            case 'breathIn':
                return 'holdBreath';  // After breathing in, we hold
            case 'holdBreath':
                return 'breathOut';   // After holding, we breathe out
            case 'breathOut':
                return 'breathIn';    // After breathing out, we start over
            default:
                return 'breathIn';
        }
    };

    const phases = {
        breathIn: { 
            duration: 4, 
            text: 'Breath IN', 
            order: 1 
        },
        holdBreath: { 
            duration: 4, 
            text: 'Hold Your Breath', 
            order: 2 
        },
        breathOut: { 
            duration: 4, 
            text: 'Breath OUT', 
            order: 3 
        }
    };

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        // Use the getNextPhase function to ensure correct order
                        setPhase((currentPhase) => {
                            const nextPhase = getNextPhase(currentPhase);
                            console.log(`Current: ${currentPhase} (${phases[currentPhase].order}) -> Next: ${nextPhase} (${phases[nextPhase].order})`);
                            return nextPhase;
                        });
                        return 4; // Reset timer to 4 seconds for next phase
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const toggleExercise = () => {
        setIsActive(!isActive);
        if (!isActive) {
            // Always start with Breath IN
            console.log('Starting exercise with Breath IN');
            setPhase('breathIn');
            setTimeLeft(4);
        }
    };

    const getCircleStyle = () => {
        let scale = 1;
        let backgroundColor = '#4285f4'; // Default blue color

        switch (phase) {
            case 'breathIn':
                scale = 1 + ((4 - timeLeft) / 4);
                backgroundColor = '#4285f4'; // Blue for breathing in
                break;
            case 'holdBreath':
                scale = 2;
                backgroundColor = '#FFD700'; // Gold color for holding breath
                break;
            case 'breathOut':
                scale = 2 - ((4 - timeLeft) / 4);
                backgroundColor = '#4285f4'; // Back to blue for breathing out
                break;
            default:
                scale = 1;
        }
        return {
            transform: `scale(${scale})`,
            transition: 'transform 1s ease-in-out, background-color 0.5s ease-in-out',
            backgroundColor
        };
    };

    return (
        <div className="breathing-exercise">
            <h2>Breathing Exercise</h2>
            <div className="breathing-circle" style={getCircleStyle()}>
                <div className="instruction">
                    <h3>{phases[phase].text}</h3>
                    <p>{timeLeft}</p>
                </div>
            </div>
            <button onClick={toggleExercise}>
                {isActive ? 'Stop' : 'Start'} Exercise
            </button>
        </div>
    );
};

export default BreathingExerciseGame;
