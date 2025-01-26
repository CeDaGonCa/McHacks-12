import React, { useState, useEffect } from 'react';
import './BreathingExerciseGame.css';

const BreathingExerciseGame = () => {
    const [phase, setPhase] = useState('breathIn');
    const [timeLeft, setTimeLeft] = useState(4);
    const [isActive, setIsActive] = useState(false);

    const phases = {
        breathIn: { duration: 4, text: 'Breath IN', next: 'holdBreath' },
        holdBreath: { duration: 4, text: 'Hold Your Breath', next: 'breathOut' },
        breathOut: { duration: 4, text: 'Breath OUT', next: 'breathIn' }
    };

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        // Move to next phase
                        setPhase((currentPhase) => {
                            console.log(`Transitioning from ${currentPhase} to ${phases[currentPhase].next}`);
                            return phases[currentPhase].next;
                        });
                        return phases[phases[currentPhase].next].duration;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, phase]);

    const toggleExercise = () => {
        setIsActive(!isActive);
        if (!isActive) {
            console.log('Starting exercise with Breath IN');
            setPhase('breathIn');
            setTimeLeft(phases.breathIn.duration);
        }
    };

    const getCircleStyle = () => {
        let scale = 1;
        let backgroundColor = '#4285f4'; // Default blue color

        switch (phase) {
            case 'breathIn':
                scale = 1 + ((phases.breathIn.duration - timeLeft) / phases.breathIn.duration);
                backgroundColor = '#4285f4'; // Blue for breathing in
                break;
            case 'holdBreath':
                scale = 2;
                backgroundColor = '#FFD700'; // Gold color for holding breath
                break;
            case 'breathOut':
                scale = 2 - ((phases.breathOut.duration - timeLeft) / phases.breathOut.duration);
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