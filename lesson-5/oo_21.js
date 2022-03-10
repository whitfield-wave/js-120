let readline = require('readline-sync');
class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}

class Deck {
  static suits = ['H', 'D', 'S', 'C'];
  static cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
  static shuffle(array) {
    for (let index = array.length - 1; index > 0; index--) {
      let otherIndex = Math.floor(Math.random() * (index + 1));
      [array[index], array[otherIndex]]
        = [array[otherIndex], array[index]];
    }
  }

  constructor() {
    this.cards = [];

    Deck.suits.forEach(suit => {
      Deck.cardValues.forEach(card => {
        this.cards.push(new Card(suit, card));
      });
    });

    Deck.shuffle(this.cards);
  }

  deal() {
    return this.cards.pop();
  }

  getCardCount() {
    return this.cards.length;
  }
}

class Participant {
  static TARGET_SCORE = 21;

  constructor() {
    this.hand = [];
    this.score = 0;
    this.busted = false;
  }

  checkIfBusted() {
    if (this.score > 21) {
      this.busted = true;
    }
  }

  getScore() {
    return this.score;
  }

  addCardToHand(card) {
    this.hand.push(card);
  }

  calculateScore() {
    let values = this.hand.map(card => card.getValue());
    let sum = 0;

    values.forEach(value => {
      if (value === 'Ace') {
        sum += 11;
      } else if (['Jack', 'Queen', 'King'].includes(value)) {
        sum += 10;
      } else {
        sum += Number(value);
      }
    });

    values.filter(value => value === 'Ace').forEach(_ => {
      if (sum > Participant.TARGET_SCORE) sum -= 10;
    });

    this.score = sum;
  }

  reset() {
    this.hand = [];
    this.score = 0;
    this.busted = false;
  }


  static joinOr(arr, separator = ', ', conj = 'or') {
    let final = '';
    switch (arr.length) {
      case 1:
        final = String(arr[0]);
        break;
      case 2:
        final = `${arr[0]} and ${arr[1]}`;
        break;
      default:
        final = `${arr.slice(0, arr.length - 1).join(separator)}, ${conj} ${arr[arr.length - 1]}`;
    }
    return final;
  }

  toString() {
    return this.constructor.name;
  }
}

class Player extends Participant {
  static INITIAL_MONEY = 5;
  constructor() {
    super();
    this.money = Player.INITIAL_MONEY;
  }

  getHand() {
    return Player.joinOr(this.hand.map(card => card.getValue()), ', ', 'and a');
  }

  getMoney() {
    return this.money;
  }

  gainMoney() {
    this.money += 1;
  }

  loseMoney() {
    this.money -= 1;
  }

  resetMoney() {
    this.money = 5;
  }
}

class Dealer extends Participant {
  static DEALER_BREAKPOINT = 17;
  constructor() {
    super();
  }

  revealHand() {
    return Player.joinOr(this.hand.map(card => card.getValue()), ', ', 'and a');
  }

  getHand() {
    let hand = this.hand.map(card => card.getValue());
    return `${hand.slice(1, hand.length).join(', ')} and an unknown card`;
  }

  shouldDealerHit() {
    return this.score < Dealer.DEALER_BREAKPOINT;
  }

}

class TwentyOneGame {
  constructor() {
    this.deck = new Deck();
    this.player = new Player();
    this.dealer = new Dealer();
    this.result = null;
  }

  start() {
    this.displayWelcomeMessage();
    while (true) {

      this.playGame();

      this.displayGameResult();

      if (!this.playAgain()) break;
      this.resetAll();
      console.clear();
    }
    this.displayGoodbyeMessage();
  }

  playerTurn() {
    while (true) {
      this.showCards();
      this.showParticipantScore(this.player);
      this.showPlayerMoney();

      let answer = this.wantToHit();
      if (answer === 'h') {
        this.playerHit();
      } else if (answer === 's') {
        this.playerStay();
        break;
      }
      if (this.isParticipantBusted(this.player)) {
        this.busted();
        break;
      }
    }
  }

  dealerTurn() {
    console.log('');
    console.log("DEALER'S TURN\n");
    while (this.dealer.shouldDealerHit() &&
      !this.isParticipantBusted(this.player)) {
      this.dealer.addCardToHand(this.deck.deal());
      this.dealerHit();
      this.updateScores();
      this.dealer.checkIfBusted();


      this.showParticipantHand(this.dealer);
      this.showParticipantScore(this.dealer);
    }
    if (this.isParticipantBusted(this.dealer)) {
      this.dealerBusted();
    } else if (!this.isParticipantBusted(this.player)) {
      this.dealerStay();
    }
  }

  playGame() {
    while (true) {
      this.dealCards();
      this.updateScores();

      this.playerTurn();
      this.dealerTurn();

      this.pickWinner();
      this.displayResult();
      this.resetRound();
      if (this.isDeckLow()) this.resetDeck();
      if (this.rich() || this.poor()) break;
      this.pause();
    }
  }

  dealCards() {
    for (let count = 1; count <= 2; count++) {
      this.player.addCardToHand(this.deck.deal());
      this.dealer.addCardToHand(this.deck.deal());
    }
  }

  busted() {
    console.log(`...and you busted with a score of ${this.player.getScore()}.`);
  }

  dealerBusted() {
    console.log(`The dealer busted with a score of ${this.dealer.getScore()}.`);
  }

  isParticipantBusted(player) {
    return player.busted;
  }

  wantToHit() {
    console.log("\nDo you want to hit or stay? (h/s)");
    let answer = readline.question().toLowerCase();
    while (true) {
      if (['h', 's'].includes(answer.toLowerCase())) break;
      console.log("Please enter 'h' for hit or 's' for stay: ");
      answer = readline.question().toLowerCase();
    }
    return answer;
  }

  playerHit() {
    console.log("You chose to hit.");
    this.player.addCardToHand(this.deck.deal());
    this.updateScores();
    this.player.checkIfBusted();
    console.clear();
  }

  playerStay() {
    console.log("You chose to stay.");
  }

  dealerHit() {
    console.log('The dealer chose to hit.');
    console.log('\n');
  }

  dealerStay() {
    console.log('The dealer chose to stay.');
    console.log('\n');
  }

  updateScores() {
    this.dealer.calculateScore();
    this.player.calculateScore();
  }

  pickWinner() {
    if (this.player.busted) {
      this.result = 'player_busted';
    } else if (this.dealer.busted) {
      this.result = 'dealer_busted';
    } else if (this.player.getScore() > this.dealer.getScore()) {
      this.result = 'player';
    } else if (this.player.getScore() < this.dealer.getScore()) {
      this.result = 'dealer';
    } else {
      this.result = 'tie';
    }
  }

  giveMoney() {
    this.player.gainMoney();
  }

  takeMoney() {
    this.player.loseMoney();
  }

  betResult() {
    console.log('\n');
    if (this.result === 'player_busted' || this.result === 'dealer') {
      this.takeMoney();
      console.log(`You lost $1.00. Your total winnings are now $${this.player.getMoney()}`);
    } else if (this.result === 'dealer_busted' || this.result === 'player') {
      this.giveMoney();
      console.log(`You earned $1.00. Your total winnings are now $${this.player.getMoney()}`);
    } else {
      console.log(`No change in money for a tie. Your winnings are $${this.player.getMoney()}`);
    }
  }

  rich() {
    return this.player.getMoney() === 10;
  }

  poor() {
    return this.player.getMoney() === 0;
  }

  showParticipantHand(participant) {
    console.log(`${participant.toString()}'s hand: ${participant.getHand()}`);
  }

  showPlayerMoney() {
    console.log(`Player has $${this.player.getMoney()}`);
  }

  showCards() {
    console.log('');
    this.showParticipantHand(this.dealer);
    this.showParticipantHand(this.player);
    console.log('');
  }

  showParticipantScore(participant) {
    console.log(`${participant.toString()}'s Score: ${participant.getScore()}`);
  }

  showScores() {
    this.showParticipantScore(this.player);
    this.showParticipantScore(this.dealer);

  }

  displayWelcomeMessage() {
    console.clear();
    console.log("Welcome to a game of Twenty-One!");
    console.log("You'll begin with $5 to bet. Each loss costs $1 and win earns $1.");
  }

  displayGoodbyeMessage() {
    console.log('');
    console.log("Thanks for playing! Goodbye.");
  }

  showFinalHandsAndScores() {
    console.log('\n\n');
    console.log('The final scores are:');
    console.log('\n');
    console.log(`Player's Score: ${this.player.getScore()}. Hand: ${this.player.getHand()}`);
    console.log(`Dealer's Score: ${this.dealer.getScore()}. Hand: ${this.dealer.revealHand()}`);
    console.log('\n');
  }

  displayResult() {
    this.showFinalHandsAndScores();
    switch (this.result) {
      case 'player_busted':
        console.log('You busted! Dealer wins!');
        break;
      case 'dealer_busted':
        console.log('Dealer busted! You win!');
        break;
      case 'player':
        console.log('You win!');
        break;
      case 'dealer':
        console.log('Dealer Wins!');
        break;
      case 'tie':
        console.log('The game ends in a tie');
        break;
    }
    this.betResult();
  }

  displayGameResult() {
    if (this.rich()) {
      console.log("Congratulations! You're rich and you won the game!");
    } else {
      console.log("Sucks to suck. You're poor and you lost the game.");
    }
  }

  pause() {
    console.log('\n');
    readline.question('Press the enter key to continue...');
    console.clear();
  }

  resetRound() {
    this.player.reset();
    this.dealer.reset();
  }

  resetPlayerMoney() {
    this.player.resetMoney();
  }

  resetAll() {
    this.resetRound();
    this.resetDeck();
    this.resetPlayerMoney();
  }

  resetDeck() {
    this.deck = new Deck();
  }

  isDeckLow() {
    return this.deck.getCardCount() < 15;
  }

  playAgain() {
    console.log('\n');
    console.log("Would you like to play again? We'll give you another $5. (y/n)");
    let answer = readline.question();
    while (!['y', 'n', 'N', 'Y'].includes(answer)) {
      console.log('Please enter y or n.');
      answer = readline.question();
    }
    return answer.toLowerCase()[0] === 'y';
  }
}

let game = new TwentyOneGame();
game.start();