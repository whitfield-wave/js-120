const readline = require('readline-sync');
const WINNING_SCORE = 5;
const VALID_CHOICES = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
const VALID_MOVES = {
  rock: ['scissors', 'lizard'],
  paper: ['rock', 'spock'],
  scissors: ['paper', 'lizard'],
  lizard: ['paper', 'spock'],
  spock: ['rock', 'scissors']
};

function createPlayer(playerType) {
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

/* 
anaylze moveHistory to determine when any move is losing 50% of the games
anaylze moveHistory to determine when any move is winning 50% of the games
decrease chance of choosing losing choice
increase chance of choosing winning choice
*/

function createComputer() {
  let playerObject = createPlayer();

  let computerObject = {
    move: null,
    moveHistory: [],
    chanceMap: [
      { choice: 'rock', chance: 5 },
      { choice: 'paper', chance: 5 },
      { choice: 'scissors', chance: 5 },
      { choice: 'lizard', chance: 5 },
      { choice: 'spock', chance: 5 }
    ],

    choose() {
      const choices = this.chanceMap;
      let total = 0;
      choices.forEach(choiceProb => total += choiceProb.chance);
      let rand = Math.floor(Math.random() * total);

      for (let i = 0; i < choices.length; i++) {
        let attack = choices[i];
        if (rand < attack.chance) {
          this.move = attack.choice;
          break;
        }
        rand -= attack.chance;
      };
    },

    recordLoss(losingMove) {
      this.moveHistory.push(losingMove);
    },

    // ChangeOdds iterates through the five valid moves and checking moveHistory for more than 
    changeOdds() {
      console.log('\n changeOdds called')
      let choices = VALID_CHOICES;
      for (let i = 0; i < choices.length; i++) {
        let occurrence = this.moveHistory.filter(ele => ele === choices[i]).length;
        if (occurrence / this.moveHistory.length > 0.3) {
          let index = this.chanceMap.findIndex(ele => ele['choice'] === choices[i]);
          this.chanceMap[index].chance -= this.chanceMap[index] > 1 ? 1 : 0;
          console.log(this.chanceMap);
        }
      }
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

      while (true) {
        console.log(`Please choose ${choices.join(', ')}:`);
        choice = readline.question();
        if (choices.includes(choice)) break;
        console.log('Sorry, invalid choice.');
      }

      this.move = choice;
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



  displayWelcomeMessage() {
    console.log('Welcome to Rock, Paper, Scissors, Lizard, Spock!');
  },

  displayGoodbyeMessage() {
    console.log("Thanks for playing Rock, Paper, Scissors. Goodbye!");
  },

  determineRoundWinner() {
    let humanMove = this.human.move;
    let computerMove = this.computer.move;

    if (VALID_MOVES[humanMove].includes(computerMove)) {
      this.roundWinner = 'human';
    } else if (VALID_MOVES[computerMove].includes(humanMove)) {
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

    console.log(`You chose: ${this.human.move}`);
    console.log(`The computer chose: ${this.computer.move}`);

    if (roundWinner === 'human') {
      console.log('You win!');
    } else if (roundWinner === 'computer') {
      console.log('Computer wins!');
    } else {
      console.log("It's a tie");
    }
  },

  displayGameWinner() {
    let gameWinner = this.gameWinner;

    if (gameWinner === 'human') {
      console.log('You win the game!');
    } else if (gameWinner === 'computer') {
      console.log('The computer wins the game');
    }
  },

  updateScore() {
    if (this.roundWinner === 'human') {
      this.human.increaseScore();
    } else if (this.roundWinner === 'computer') {
      this.computer.increaseScore();
    }
  },

  displayScore() {
    console.log(`The scores: player ${this.human.score} | computer: ${this.computer.score} `);
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

  play() {
    this.displayWelcomeMessage();
    while (true) {
      this.human.resetScore();
      this.computer.resetScore();

      while (this.human.score < this.winningScore &&
        this.computer.score < this.winningScore) {
        this.human.choose();
        this.computer.choose();

        this.determineRoundWinner();
        this.updateScore();
        this.displayRoundWinner();
        this.displayScore();
        if (this.roundWinner === 'human') this.computer.recordLoss(this.computer.move);
        console.log(this.computer.moveHistory);
      }
      this.determineGameWinner();
      this.displayGameWinner();
      this.computer.changeOdds();
      if (!this.playAgain()) break;
    }
    this.displayGoodbyeMessage();
  },
};

RPSGame.play();

/*
Come up with some rules based on the history of moves to help the computer make its moves.
For instance, if the human tends to win over 60% of his hands when the computer chooses "rock," 
then decrease the likelihood that the computer will choose "rock." First, come up with an appropriate rule,
then implement some history analysis. Use the analysis to adjust the weight of each choice -- for instance,
increase the weight to increase the likelihood of choosing a particular move. Currently, the computer has a 
33% chance of making any given move -- it's those odds that you need to weight. Finally, have the computer 
consider the weight of each choice when choosing a move.

choice rule to implement
  if computer loses 50% when the human chooses rock, decrease the chance the computer chooses scissors or lizard
check history if rule condition has been met
change computer's chance of picking choice accordingly



*/