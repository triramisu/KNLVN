const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const msgEl = document.getElementById("msg");
const newGameBtn = document.getElementById("newGame");

const game = new GameWordle(boardEl, keyboardEl, msgEl);
game.init();

newGameBtn.addEventListener("click", () => game.init());
