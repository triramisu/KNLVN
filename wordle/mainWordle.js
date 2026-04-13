const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const msgEl = document.getElementById("msg");
const newGameBtn = document.getElementById("newGame");

let ALL_WORDS = [];

fetch("https://raw.githubusercontent.com/tabatkins/wordle-list/master/words")
  .then(res => res.text())
  .then(text => {
    ALL_WORDS = text.split("\n")
                    .map(w => w.trim().toUpperCase())
                    .filter(w => w.length === 5);
    
    const game = new GameWordle(boardEl, keyboardEl, msgEl);
    game.init();

    newGameBtn.addEventListener("click", () => game.init());
  })
  .catch(err => {
    msgEl.textContent = "Lỗi tải dữ liệu từ vựng!";
  });
