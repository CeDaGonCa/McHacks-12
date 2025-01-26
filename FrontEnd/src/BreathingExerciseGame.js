import React, { useEffect } from "react";

const BreathingExerciseGame = () => {
  useEffect(() => {
    const canvas = document.getElementById("breathingCanvas");
    const ctx = canvas.getContext("2d");
    const instructionText = document.getElementById("instruction");
    const timerText = document.getElementById("timer");

    canvas.width = 400;
    canvas.height = 400;

    let phase = "inhale";
    let startTime = Date.now();
    const inhaleTime = 4000;
    const holdTime = 4000;
    const exhaleTime = 4000;
    const minRadius = 50;
    const maxRadius = 150;
    let circleRadius = minRadius;

    function drawCircle() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, circleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#4682b4";
      ctx.fill();
      ctx.stroke();
    }

    function updateGame() {
      const elapsedTime = Date.now() - startTime;
      const currentPhaseTime = elapsedTime % (inhaleTime + holdTime + exhaleTime);

      if (currentPhaseTime < inhaleTime) {
        phase = "inhale";
        circleRadius = minRadius + ((maxRadius - minRadius) * currentPhaseTime) / inhaleTime;
        instructionText.textContent = "Inhale";
      } else if (currentPhaseTime < inhaleTime + holdTime) {
        phase = "hold";
        circleRadius = maxRadius;
        instructionText.textContent = "Hold";
      } else {
        phase = "exhale";
        const exhaleElapsedTime = currentPhaseTime - (inhaleTime + holdTime);
        circleRadius =
          maxRadius - ((maxRadius - minRadius) * exhaleElapsedTime) / exhaleTime;
        instructionText.textContent = "Exhale";
      }

      timerText.textContent = `${Math.ceil((inhaleTime + holdTime + exhaleTime - currentPhaseTime) / 1000)}s`;
      drawCircle();
    }

    function gameLoop() {
      updateGame();
      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }, []);

  return (
    <div className="game-container">
      <h1>Breathing Exercise</h1>
      <p id="instruction">Inhale</p>
      <canvas id="breathingCanvas"></canvas>
      <p id="timer">0s</p>
    </div>
  );
};

export default BreathingExerciseGame;
