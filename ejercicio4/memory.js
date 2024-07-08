class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    matches(otherCard) {
        return this.name === otherCard.name;
    }

    toggleFlip() {
        if (this.isFlipped) {
            this.#unflip();
        } else {
            this.#flip();
        }
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front">
                    <img src="img/posterior.png" alt="posterior">
                  </div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
        this.isFlipped = true;
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
        this.isFlipped = false;
    }

    flipDown() {
        this.#unflip();
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    shuffleCards() {
        const numberInterations = Math.floor(Math.random() * 2 + 2);
        for(let i=0; i<numberInterations; i++)
            this.#fisherYates();
    }

    #fisherYates() {
        const numberOfCards = this.cards.length;
        for (let i = numberOfCards - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, numCards));

        if (columns % 2 !== 0) {
            columns = columns === numCards-1 ? numCards : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        
    }
    
    reset() {
        this.shuffleCards();
        this.flipDownAllCards();
    }

    flipDownAllCards() {
        this.cards.forEach(card => card.flipDown());
    }
}

class MemoryGame {
    #count = 0;
    #secondsElapsed = 0;
    #gameOver = false;
    constructor(board, flipDuration = 500, countElement, timerElement) {
        this.countElement = countElement;
        this.timerElement = timerElement;
        this.board = board;
        this.#count = 0
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClicked = this.#handleCardClick.bind(this);
        this.board.reset();
        this.board.render();
        this.#timer();
        this.#checkGameOver();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);
        }
        if (this.flippedCards.length === 2) {
            this.#count++;
            this.countElement.textContent = `Contador de intentos: ${this.#count}`;
            setTimeout(() => this.checkForMatch(), this.flipDuration);
        }
    }

    resetGame() {
        this.#secondsElapsed = 0;
        this.timerElement.textContent = `Tiempo transcurrido: 00:00`;
        this.#count = 0;
        this.countElement.textContent = `Contador de intentos: 0`;
        this.#gameOver = false;
        this.flippedCards = [];
        this.matchedCards = [];
        this.board.reset();
    }

    checkForMatch() {
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];
        if (card1.matches(card2)) {
            this.matchedCards.push(card1);
            this.matchedCards.push(card2);
        } else {
            setTimeout(() => {
                card1.flipDown();
                card2.flipDown();
            }, this.flipDuration);
        }
        this.flippedCards = [];
    }

    async #timer(){
        while(!this.#gameOver) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.#secondsElapsed++;
            let seconds = this.#secondsElapsed % 60;
            let minutes = Math.floor(this.#secondsElapsed / 60);

            this.timerElement.textContent = `Tiempo transcurrido: ${minutes>9 ? minutes : `0${minutes}`}:${seconds>9 ? seconds : `0${seconds}`}`;
        }
    }

    async #checkGameOver() {
        while(true) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (this.matchedCards.length === this.board.cards.length) {
                this.#gameOver = true;
                Swal.fire({
                    title: `Felicidades GANASTE con ${this.#count} intentos.`,
                    width: 250,
                    padding: "1em",
                    color: "#716add",
                    background: "#fff url(https://sweetalert2.github.io/images/trees.png)",
                    backdrop: `
                        rgba(0,0,123,0.4)
                        url("img/big gran time.gif")
                        left top
                        no-repeat
                        `
                });
                break;
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const countElement = document.getElementById("count");
    const timerElement = document.getElementById("timer");
    const memoryGame = new MemoryGame(board, 1000, countElement, timerElement);
    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
