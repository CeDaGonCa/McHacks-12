import React, { useEffect } from "react";

const MemoryMatchGame = () => {
  useEffect(() => {
    // Embed the memory match game JavaScript logic here
    const icons = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍍", "🥝", "🍑"];
    const cards = [...icons, ...icons];
    cards.sort(() => Math.random() - 0.5);

    const gameContainer = document.getElementById("gameContainer");
    const message = document.getElementById("message");
    let flippedCards = [];
    let matchedPairs = 0;

    cards.forEach((icon) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.icon = icon;
      card.textContent = icon;
      card.addEventListener("click", handleCardClick);
      gameContainer.appendChild(card);
    });

    function handleCardClick(event) {
      const card = event.target;
      if (
        card.classList.contains("flipped") ||
        card.classList.contains("matched")
      ) {
        return;
      }
      card.classList.add("flipped");
      flippedCards.push(card);

      if (flippedCards.length === 2) {
        checkForMatch();
      }
    }

    function checkForMatch() {
      const [card1, card2] = flippedCards;
      if (card1.dataset.icon === card2.dataset.icon) {
        card1.classList.add("matched");
        card2.classList.add("matched");
        matchedPairs++;
        message.textContent = `Pairs matched: ${matchedPairs} / ${icons.length}`;
        if (matchedPairs === icons.length) {
          message.textContent = "Congratulations! You matched all pairs!";
        }
      } else {
        setTimeout(() => {
          card1.classList.remove("flipped");
          card2.classList.remove("flipped");
        }, 1000);
      }
      flippedCards = [];
    }
  }, []);

  return (
    <div>
      <div id="gameContainer" className="game-container"></div>
      <div id="message" className="message"></div>
    </div>
  );
};

export default MemoryMatchGame;
