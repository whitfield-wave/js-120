const readline = require('readline-sync');
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
    moveHistory: { wins: [], losses: [] },
    roundCount: 0,
    resetThreshold: 10,
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
    },

    countRound() {
      this.roundCount += 1;
    },

    shouldReset() {
      return this.roundCount > this.resetThreshold;
    },

    getWinningMoves() {
      let winCount = {}
      this.moveHistory.wins.forEach(winCount[ele] = winCount[ele] ? winCount[ele] + 1 : 1);
      for (move in winCount) {
        if (winCount[move] >= this.moveHistory.wins.length / 2) {
          return move;
        }
      }
    },

    getLosingMoves() {
      let loseCount = {}
      this.moveHistory.losses.forEach(loseCount[ele] = loseCount[ele] ? loseCount[ele] + 1 : 1);
      for (move in loseCount) {
        if (loseCount[move] >= this.moveHistory.losses.length / 2) {
          return move;
        }
      }
    },

    changeOdds() {
      for (let list in this.moveHistory) {
        for (let idx = 0; idx < VALID_CHOICES.length; idx++) {
          let count = this.moveHistory[list]
            .filter(ele => ele === VALID_CHOICES[idx]).length;
          if (this.moveHistory[list].length >= 5
            && count / this.moveHistory[list].length > 0.5) {
            let index = this.chanceMap
              .findIndex(ele => ele['choice'] === VALID_CHOICES[idx]);
            switch (list) {
              case 'wins':
                this.chanceMap[index].chance
                  += this.chanceMap[index].chance < 10 ?
                    1 : 0;
                break;
              case 'losses':
                this.chanceMap[index].chance
                  -= this.chanceMap[index].chance > 1 ?
                    1 : 0;
                break;
            }
          }
        }
      }
    },

    clearHistory() {
      this.moveHistory = { wins: [], losses: [] };
      this.roundCount = 0;
    },
  };

  return Object.assign(playerObject, computerObject);
}

function createHuman() {
  let playerObject = createPlayer();

  let humanObject = {

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
  winningScore: 5,
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
    console.log(`The scores are: player: ${this.human.score} | computer: ${this.computer.score}. First to ${this.winningScore} wins!`);
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

  matchLoop() {
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
      this.computer.countRound();

      // pauses before next round if winning score isn't reached
      if (this.human.score < this.winningScore &&
        this.computer.score < this.winningScore) this.pause();
    }
  },


  // MAIN PROGRAM
  play() {
    this.clear();
    this.displayWelcomeMessage();
    // GAME LOOP
    while (true) {
      this.human.resetScore();
      this.computer.resetScore();

      // MATCH LOOP
      this.matchLoop();

      this.determineGameWinner();
      this.displayGameWinner();

      // COMPUTER DECISION ADJUSTMENT
      this.computer.changeOdds();
      if (this.computer.shouldReset()) this.computer.clearHistory();

      if (!this.playAgain()) break;
    }
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();