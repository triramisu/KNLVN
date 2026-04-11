class GameWordle {
  constructor(boardEl, keyboardEl, msgEl) {
    this.WORDS = [
      "APPLE","BRAVE","CRANE","DREAM","ELATE",
      "FRAME","GHOST","HOUSE","INPUT","JUDGE",
      "KNIFE","LIGHT","MONEY","NURSE","OPERA",
      "PRIDE","QUICK","ROAST","SWEET","TRAIN",
      "UNITY","VIVID","WORLD","YOUNG","ZEBRA",
      "GRAPE","PEARL","STONE","CHAIR","TABLE",
      "CANDY","BEACH","CLOUD","FLAME","GREEN",
      "WHITE","BLACK","MUSIC","DANCE","WATER",
      "EARTH","PLANT","FIGHT","HAPPY","LAUGH",
      "MAGIC","NIGHT","QUEEN","RIVER","SHINE",
      "STORM","TIGER","ANGEL","CHESS","GIANT",
      "HORSE","JOKER","LEMON","METAL","NOBLE",
      "OCEAN","PEACE","ROBOT","SNAKE","YOUTH",
      "ALBUM","ALIEN","ALIVE","BACON","BASIC",
      "BEAST","BLINK","BLOCK","BREAD","BRICK",
      "BROWN","BRUSH","CABLE","CAMEL","CATCH",
      "CHASE","CHIEF","CLEAN","CLOCK","CRUMB",
      "DIRTY","DONUT","EAGLE","EMPTY","EXTRA",
      "FAULT","FIELD","FLASH","GLASS","GLOVE",
      "GUESS","HEART","HOTEL","INDEX","JUICE",
      "KNOCK","LEAFY","LOGIC","LUCKY","MARCH",
      "MATCH","MOUSE","NOISE","ONION","PAINT",
      "PANDA","PAPER","PIZZA","POUND","QUIET",
      "RADIO","REACH","RIGHT","SALAD","SHEEP",
      "SKILL","SLEEP","SMILE","SOUND","SPACE",
      "SPOON","STAND","STORE","SUGAR","SWING",
      "TASTE","THICK","TOWEL","TRACK","UNCLE",
      "UNDER","VALUE","VOICE","WATCH","WHEEL",
      "WHERE","WOMAN","WRONG","YIELD","ZESTY"
    ];

    this.ROWS = 6;
    this.COLS = 5;
    this.boardEl = boardEl;
    this.keyboardEl = keyboardEl;
    this.msgEl = msgEl;

    this.solution = "";
    this.grid = [];
    this.curRow = 0;
    this.curCol = 0;
    this.gameOver = false;
    this.keyState = {};

    this.handleKeyDown = (e) => this.onKeyDown(e);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  init() {
    this.boardEl.innerHTML = "";
    this.keyboardEl.innerHTML = "";
    this.msgEl.textContent = "";
    this.msgEl.className = "";

    this.solution = this.WORDS[Math.floor(Math.random() * this.WORDS.length)].toUpperCase();
    this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(""));
    this.curRow = 0;
    this.curCol = 0;
    this.gameOver = false;
    this.keyState = {};

    for (let r = 0; r < this.ROWS; r++) {
      const row = document.createElement("div");
      row.className = "row";
      for (let c = 0; c < this.COLS; c++) {
        const t = document.createElement("div");
        t.className = "tile";
        t.dataset.r = r;
        t.dataset.c = c;
        row.appendChild(t);
      }
      this.boardEl.appendChild(row);
    }

    const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
    rows.forEach((keys, idx) => {
      const row = document.createElement("div");
      row.className = "keys";
      if (idx === 2) row.appendChild(this.mkKey("Enter", "Enter", "wide"));
      for (const ch of keys) row.appendChild(this.mkKey(ch));
      if (idx === 2) row.appendChild(this.mkKey("Back", "Back", "wide"));
      this.keyboardEl.appendChild(row);
    });
  }

  mkKey(label, action = label, extraClass = "") {
    const k = document.createElement("div");
    k.className = "key " + extraClass;
    k.textContent = label;
    k.dataset.key = action;
    k.addEventListener("click", () => this.handleInput(action));
    return k;
  }

  onKeyDown(e) {
    if (this.gameOver) return;
    let k = e.key;
    if (k === "Enter") this.handleInput("Enter");
    else if (k === "Backspace") this.handleInput("Back");
    else {
      k = k.toUpperCase();
      if (/^[A-Z]$/.test(k)) this.handleInput(k);
    }
  }

  handleInput(key) {
    if (this.gameOver) return;
    if (key === "Enter") return this.submitRow();
    if (key === "Back") return this.backspace();

    if (key.length === 1 && this.curCol < this.COLS) {
      this.grid[this.curRow][this.curCol] = key;
      this.updateTile(this.curRow, this.curCol, key);
      this.curCol++;
    }
  }

  updateTile(r, c, val) {
    const tile = this.boardEl.querySelector(`.tile[data-r="${r}"][data-c="${c}"]`);
    tile.textContent = val;
    tile.classList.toggle("filled", !!val);
  }

  backspace() {
    if (this.curCol > 0) {
      this.curCol--;
      this.grid[this.curRow][this.curCol] = "";
      this.updateTile(this.curRow, this.curCol, "");
    }
  }

  submitRow() {
    if (this.curCol < this.COLS) return this.showMessage("Chưa đủ 5 chữ!", 2000);
    const guess = this.grid[this.curRow].join("");
    
    if (!this.WORDS.includes(guess)) {
      this.showMessage("Từ không hợp lệ", 1500);
      for (let i = 0; i < this.COLS; i++) {
        this.grid[this.curRow][i] = "";
        this.updateTile(this.curRow, i, "");
      }
      this.curCol = 0;
      return;
    }

    const solArr = this.solution.split("");
    const guessArr = guess.split("");
    const result = Array(this.COLS).fill("absent");

    for (let i = 0; i < this.COLS; i++) {
      if (guessArr[i] === solArr[i]) {
        result[i] = "correct";
        solArr[i] = null;
      }
    }

    for (let i = 0; i < this.COLS; i++) {
      if (result[i] === "correct") continue;
      const idx = solArr.indexOf(guessArr[i]);
      if (idx !== -1) {
        result[i] = "present";
        solArr[idx] = null;
      }
    }

    this.revealRow(this.curRow, guessArr, result).then(() => {
      for (let i = 0; i < this.COLS; i++) {
        const ch = guessArr[i];
        const prev = this.keyState[ch];
        const state = result[i];
        if (!prev || prev === "absent" && state !== "absent" || prev === "present" && state === "correct") {
          this.keyState[ch] = state;
          const keyEl = [...document.querySelectorAll('.key')].find(k => k.dataset.key === ch);
          if (keyEl) {
            keyEl.classList.remove("absent", "present", "correct");
            keyEl.classList.add(state);
          }
        }
      }

      if (guess === this.solution) {
        this.gameOver = true;
        this.showMessage("Đoán đúng rồi!", 5000, "win");
      } else if (++this.curRow >= this.ROWS) {
        this.gameOver = true;
        this.showMessage(`Thua! Đáp án: ${this.solution}`, 4000, "lose");
      } else {
        this.curCol = 0;
      }
    });
  }

  revealRow(r, guessArr, resultArr) {
    return new Promise((resolve) => {
      for (let i = 0; i < this.COLS; i++) {
        setTimeout(() => {
          const tile = this.boardEl.querySelector(`.tile[data-r="${r}"][data-c="${i}"]`);
          tile.classList.add("revealed", resultArr[i]);
          if (i === this.COLS - 1) resolve();
        }, i * 250);
      }
    });
  }

  showMessage(text, time = 1500, cls = "") {
    this.msgEl.textContent = text;
    this.msgEl.className = cls;
    if (time > 0) setTimeout(() => {
      this.msgEl.textContent = "";
      this.msgEl.className = "";
    }, time);
  }

}
window.GameWordle = GameWordle;