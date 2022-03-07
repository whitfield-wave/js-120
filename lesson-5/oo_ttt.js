let readline = require("readline-sync");

class Square {
  static UNUSED_SQUARE = " ";
  static HUMAN_MARKER = "X";
  static COMPUTER_MARKER = "O";

  constructor(marker = Square.UNUSED_SQUARE) {
    this.marker = marker;
  }

  toString() {
    return this.marker;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  isUnused() {
    return this.marker === Square.UNUSED_SQUARE;
  }

  getMarker() {
    return this.marker;
  }
}

class Board {
  constructor() {
    this.squares = {};
    for (let counter = 1; counter <= 9; counter++) {
      this.squares[String(counter)] = new Square();
    }
  }

  display() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.squares["1"]}  |  ${this.squares["2"]}  |  ${this.squares["3"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["4"]}  |  ${this.squares["5"]}  |  ${this.squares["6"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["7"]}  |  ${this.squares["8"]}  |  ${this.squares["9"]}`);
    console.log("     |     |");
    console.log("");
  }

  markSquareAt(key, marker) {
    this.squares[key].setMarker(marker);
  }

  unusedSquares() {
    let keys = Object.keys(this.squares);
    return keys.filter(key => this.squares[key].isUnused());
  }

  isFull() {
    return this.unusedSquares().length === 0;
  }

  countMarkersFor(player, keys) {
    let markers = keys.filter(key => {
      return this.squares[key].getMarker() === player.getMarker();
    });
    return markers.length;
  }

  displayWithClear() {
    console.clear();
    console.log('');
    this.display();
  }
}

class Player {
  constructor(marker) {
    this.marker = marker;
  }

  getMarker() {
    return this.marker;
  }

}

class Human extends Player {
  constructor() {
    super(Square.HUMAN_MARKER);
  }
}

class Computer extends Player {
  constructor() {
    super(Square.COMPUTER_MARKER);
  }
}

class TTTGame {
  constructor() {
    this.board = new Board();
    this.human = new Human();
    this.computer = new Computer();
  }

  static POSSIBLE_WINNING_ROWS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["1", "4", "7"],
    ["2", "5", "8"],
    ["3", "6", "9"],
    ["1", "5", "9"],
    ["3", "5", "7"],
  ]

  static joinOr(arr, separator = ', ', conj = 'or') {
    let final = '';
    switch (arr.length) {
      case 1:
        final = String(arr[0]);
        break;
      case 2:
        final = `${arr[0]} or ${arr[1]}`;
        break;
      default:
        final = `${arr.slice(0, arr.length - 1).join(separator)}, ${conj} ${arr[arr.length - 1]}`
    }
    return final;
  }

  play() {
    console.clear();
    this.displayWelcomeMessage();
    this.board.display();

    while (true) {

      this.playRound();

      this.board.displayWithClear();
      this.displayResults();

      if (!this.playAgain()) break;
      this.resetBoard();
      this.clearScreen();
      this.board.displayWithClear()
    }

    // game closure
    this.clearScreen();
    this.displayGoodbyeMessage();
  }

  playRound() {
    while (true) {

      this.detectThreat()

      this.humanMoves();
      if (this.gameOver()) break;

      this.computerMoves();
      if (this.gameOver()) break;

      this.board.displayWithClear();
    }
  }

  humanMoves() {
    let choice;

    while (true) {
      let validChoices = this.board.unusedSquares();
      const prompt = `Choose a square (${TTTGame.joinOr(validChoices)}): `;
      choice = readline.question(prompt);

      if (validChoices.includes(choice)) break;

      console.log("Sorry, that's not a valid choice.");
      console.log("");
    }

    this.board.markSquareAt(choice, this.human.getMarker());
  }

  computerMoves() {
    let validChoices = this.board.unusedSquares();
    let choice;

    if (validChoices.includes('5')) {
      choice = '5';
    } else {
      choice = this.detectWin() || this.detectThreat();
    }

    if (!choice) {
      do {
        choice = Math.floor((9 * Math.random()) + 1).toString();
      } while (!validChoices.includes(choice));
    }
    this.board.markSquareAt(choice, this.computer.getMarker());
  }

  detectThreat() {
    for (let idx = 0; idx < TTTGame.POSSIBLE_WINNING_ROWS.length; idx++) {
      if (this.board.countMarkersFor(this.human, TTTGame.POSSIBLE_WINNING_ROWS[idx]) === 2 &&
        this.board.countMarkersFor(this.computer, TTTGame.POSSIBLE_WINNING_ROWS[idx]) === 0) {
        return this.atRiskSquare(TTTGame.POSSIBLE_WINNING_ROWS[idx]);
      }
    }
    return null;
  }

  detectWin() {
    for (let idx = 0; idx < TTTGame.POSSIBLE_WINNING_ROWS.length; idx++) {
      if (this.board.countMarkersFor(this.human, TTTGame.POSSIBLE_WINNING_ROWS[idx]) === 0 &&
        this.board.countMarkersFor(this.computer, TTTGame.POSSIBLE_WINNING_ROWS[idx]) === 2) {
        return this.atRiskSquare(TTTGame.POSSIBLE_WINNING_ROWS[idx]);
      }
    }
    return null;
  }


  atRiskSquare(row) {
    for (let idx = 0; idx < row.length; idx++) {
      if (this.board.squares[row[idx]].isUnused()) return row[idx];
    }
  }

  displayWelcomeMessage() {
    console.clear();
    console.log("Welcome to Tic Tac Toe!");
  }

  displayGoodbyeMessage() {
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  }

  displayResults() {
    if (this.isWinner(this.human)) {
      console.log("You won! Congratulations!");
    } else if (this.isWinner(this.computer)) {
      console.log("I won! I won! Take that, human!");
    } else {
      console.log("A tie game. How boring.");
    }
  }

  gameOver() {
    return this.board.isFull() || this.someoneWon();
  }

  boardIsFull() {
    let unusedSquares = this.board.unusedSquares();
    return unusedSquares.length === 0;
  }

  someoneWon() {
    return this.isWinner(this.human) || this.isWinner(this.computer);
  }

  isWinner(player) {
    return TTTGame.POSSIBLE_WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  }

  playAgain() {
    console.log('Would you like to play again? (y/n)');
    let answer = readline.question();
    while (!['y', 'n', 'N', 'Y'].includes(answer)) {
      console.log('Please enter y or n.');
      answer = readline.question();
    }
    return answer.toLowerCase()[0] === 'y';
  }

  resetBoard() {
    this.board = new Board();
  }

  clearScreen() {
    console.clear();
  }

}

let game = new TTTGame();
game.play();