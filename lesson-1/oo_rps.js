const readline = require('readline-sync');
const WINNING_SCORE = 5;
const VALID_CHOICES = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
const WINNING_COMBOS = {
  rock: ['scissors', 'lizard'],
  paper: ['rock', 'spock'],
  scissors: ['paper', 'lizard'],
  lizard: ['paper', 'spock'],
  spock: ['rock', 'scissors']
};
const SHORTHAND = { r: 'rock', p: 'paper', s: 'scissors', l: 'lizard', sp: 'spock' };
// RESET_THRESHOLD determines how much data the computer
// acts on. A lower threshold creates a more dynamic
// computer response.
const RESET_THRESHOLD = 10;

function createPlayer() {
  return {
    move: null,
    score: 0,

    increaseScore() {
      this.score += 1;
    },

    resetScore() {
      this.score = 0;
    }
  };
}

function createComputer() {
  let playerObject = createPlayer();

  let computerObject = {
    move: null,
    moveHistory: { wins: [], losses: [], games: 0 },
    chanceMap: [
      { choice: 'rock', chance: 5 },
      { choice: 'paper', chance: 5 },
      { choice: 'scissors', chance: 5 },
      { choice: 'lizard', chance: 5 },
      { choice: 'spock', chance: 5 }
    ],

    // Computer chooses from the five choices based on weighted randomness.
    // Weights are initially equal.
    choose() {
      const choices = this.chanceMap;
      let total = 0;
      choices.forEach(choiceProb => total += choiceProb.chance);
      let rand = Math.floor(Math.random() * total);

      for (let idx = 0; idx < choices.length; idx++) {
        let attack = choices[idx];
        if (rand < attack.chance) {
          this.move = attack.choice;
          break;
        }
        rand -= attack.chance;
      }
    },

    recordMove(roundWinner) {
      if (roundWinner === 'human') {
        this.moveHistory.losses.push(this.move);
      } else if (roundWinner === 'computer') {
        this.moveHistory.wins.push(this.move);
      }
      this.moveHistory.games += 1;
    },

    // Decreases weight of any move that has caused at
    // least 50% of losses when method is called.
    // Weights of each move are constrained between 1 and 10.
    reduceLoss() {
      let choices = VALID_CHOICES;
      let losses = this.moveHistory.losses;

      for (let idx = 0; idx < choices.length; idx++) {
        let count = losses.filter(ele => ele === choices[idx]).length;
        if (losses.length >= 5 && count / losses.length >= 0.5) {
          let index = this.chanceMap
            .findIndex(ele => ele['choice'] === choices[idx]);
          this.chanceMap[index].chance -= this.chanceMap[index].chance > 1 ?
            1 : 0;
        }
      }
    },

    // Increases weight of any move that has caused at
    //least 50% of wins when method is called.
    increaseWin() {
      let choices = VALID_CHOICES;
      let wins = this.moveHistory.wins;

      for (let idx = 0; idx < choices.length; idx++) {
        let count = wins.filter(ele => ele === choices[idx]).length;
        if (wins.length >= 5 && count / wins.length > 0.5) {
          let index = this.chanceMap
            .findIndex(ele => ele['choice'] === choices[idx]);
          this.chanceMap[index].chance += this.chanceMap[index].chance < 10 ?
            1 : 0;
        }
      }
    },

    clearHistory() {
      this.moveHistory = { wins: [], losses: [], games: 0 };
    },
  };

  return Object.assign(playerObject, computerObject);
}

function createHuman() {
  let playerObject = createPlayer();

  let humanObject = {
    move: null,

    choose() {
      let choice;
      let choices = VALID_CHOICES;
      let shorthandChoices = Object.keys(SHORTHAND);

      while (true) {
        console.log('Please choose rock(r), paper(p), scissors(s), lizard(l), spock(sp):');
        choice = readline.question();
        if (choices.includes(choice) || shorthandChoices.includes(choice)) {
          break;
        }
        console.log('Sorry, invalid choice.');
      }
      this.move = choice.length > 2 ? choice : SHORTHAND[choice];
    },
  };

  return Object.assign(playerObject, humanObject);
}

const RPSGame = {
  human: createHuman(),
  computer: createComputer(),
  winningScore: WINNING_SCORE,
  roundWinner: null,
  gameWinner: null,
  gameHistory: { human: [], computer: [] },

  displayWelcomeMessage() {
    console.log('Welcome to Rock, Paper, Scissors, Lizard, Spock!\n');
  },

  displayGoodbyeMessage() {
    console.log("Thanks for playing Rock, Paper, Scissors. Goodbye!");
  },

  determineRoundWinner() {
    let humanMove = this.human.move;
    let computerMove = this.computer.move;

    if (WINNING_COMBOS[humanMove].includes(computerMove)) {
      this.roundWinner = 'human';
    } else if (WINNING_COMBOS[computerMove].includes(humanMove)) {
      this.roundWinner = 'computer';
    } else {
      this.roundWinner = 'tie';
    }
  },

  determineGameWinner() {
    if (this.human.score === this.winningScore) {
      this.gameWinner = 'human';
    } else if (this.computer.score === this.winningScore) {
      this.gameWinner = 'computer';
    }
  },

  displayRoundWinner() {
    let roundWinner = this.roundWinner;
    console.log('\n');
    console.log(`You chose: ${this.human.move}`);
    console.log(`The computer chose: ${this.computer.move}`);
    console.log('\n');
    if (roundWinner === 'human') {
      console.log('You win!');
    } else if (roundWinner === 'computer') {
      console.log('Computer wins.');
    } else {
      console.log("It's a tie");
    }
  },

  displayGameWinner() {
    let gameWinner = this.gameWinner;

    if (gameWinner === 'human') {
      console.log('You win the game!');
    } else if (gameWinner === 'computer') {
      console.log('The computer wins the game.');
    }
  },

  recordGame() {
    this.gameHistory.human.push(this.human.move);
    this.gameHistory.computer.push(this.computer.move);
  },

  updateScore() {
    if (this.roundWinner === 'human') {
      this.human.increaseScore();
    } else if (this.roundWinner === 'computer') {
      this.computer.increaseScore();
    }
  },

  displayScore() {
    console.log('\n');
    console.log(`The scores are: player: ${this.human.score} | computer: ${this.computer.score}. First to ${WINNING_SCORE} wins!`);
    console.log('\n');
  },

  playAgain() {
    console.log('Would you like to play again? (y/n)');
    let answer = readline.question();
    while (!['y', 'n', 'N', 'Y'].includes(answer)) {
      console.log('Please enter y or n.');
      answer = readline.question();
    }
    return answer.toLowerCase()[0] === 'y';
  },

  pause() {
    console.log('\n');
    console.log('Please hit enter to continue...');
    readline.question();
  },

  clear() {
    console.clear();
  },


  // MAIN PROGRAM
  play() {
    this.displayWelcomeMessage();
    // GAME LOOP
    while (true) {
      this.human.resetScore();
      this.computer.resetScore();

      // MATCH LOOP
      while (this.human.score < this.winningScore &&
        this.computer.score < this.winningScore) {

        if (this.roundWinner !== null) this.clear();
        this.human.choose();
        this.computer.choose();
        this.recordGame();

        this.determineRoundWinner();
        this.updateScore();
        this.displayRoundWinner();
        this.displayScore();
        this.computer.recordMove(this.roundWinner);
        if (this.human.score < this.winningScore &&
          this.computer.score < this.winningScore) this.pause();
      }

      this.determineGameWinner();
      this.displayGameWinner();

      // COMPUTER DECISION ADJUSTMENT
      this.computer.reduceLoss();
      this.computer.increaseWin();
      if (this.computer.moveHistory.games > RESET_THRESHOLD) {
        this.computer.clearHistory();
      }
      if (!this.playAgain()) break;
    }
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();