#!/usr/bin/env node
// Ensure this is the very first line with no preceding blank lines.
import { intro, outro, text, confirm, select } from '@clack/prompts';
import chalk from 'chalk';
import stripAnsi from 'strip-ansi';

// ------------------ Global Color Variables ------------------

// Color for Hearts and Diamonds (bright red)
const HEARTS_DIAMONDS_COLOR = chalk.redBright;

// Color for Clubs and Spades (bright blue)
const CLUBS_SPADES_COLOR = chalk.blueBright;

// ANSI Reset code
const RESET = "\x1b[0m";

// Winning highlight: black text on a green background.
const WIN_HIGHLIGHT = chalk.bgGreen.black;

// ------------------ End Global Colors ------------------

// ------------------ Welcome Banner ------------------
const WELCOME_BANNER = `
  ____   ___  _  _______ ____     ____ _     ___ 
 |  _ \\ / _ \\| |/ / ____|  _ \\   / ___| |   |_ _|
 | |_) | | | | ' /|  _| | |_) | | |   | |    | | 
 |  __/| |_| | . \\| |___|  _ <  | |___| |___ | | 
 |_|    \\___/|_|\\_\\_____|_| \\_\\  \\____|_____|___|
                                                  
`;
// ------------------ End Welcome Banner ------------------

// ---------------------------------------------------------
// Payout Table & Value Mapping
// ---------------------------------------------------------

const payoutTable = [
  { name: "Royal Flush",      multiplier: 250 },
  { name: "Straight Flush",   multiplier: 50 },
  { name: "Four of a Kind",   multiplier: 25 },
  { name: "Full House",       multiplier: 9 },
  { name: "Flush",            multiplier: 6 },
  { name: "Straight",         multiplier: 4 },
  { name: "Three of a Kind",  multiplier: 3 },
  { name: "Two Pair",         multiplier: 2 },
  { name: "Jacks or Better",  multiplier: 1 }
];

const valueMap = {
  '2': 2,  '3': 3,  '4': 4,  '5': 5,  '6': 6,  '7': 7,  '8': 8,
  '9': 9,  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// ---------------------------------------------------------
// Card, Deck, and ASCII Art Functions
// ---------------------------------------------------------

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }
  toString() {
    return `${this.value} of ${this.suit}`;
  }
}

class Deck {
  constructor() {
    this.cards = [];
    this.initializeDeck();
  }
  initializeDeck() {
    this.cards = [];
    for (const suit of suits) {
      for (const value of values) {
        this.cards.push(new Card(suit, value));
      }
    }
  }
  shuffle() {
    // Fisher–Yates shuffle algorithm.
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }
  deal(num) {
    return this.cards.splice(0, num);
  }
}

/**
 * Returns the ASCII art for a card with its suit color.
 * - Hearts and Diamonds use HEARTS_DIAMONDS_COLOR.
 * - Clubs and Spades use CLUBS_SPADES_COLOR.
 */
function getAsciiCard(card) {
  let colorFunc;
  if (card.suit === "Hearts" || card.suit === "Diamonds") {
    colorFunc = (str) => HEARTS_DIAMONDS_COLOR(str) + RESET;
  } else if (card.suit === "Clubs" || card.suit === "Spades") {
    colorFunc = (str) => CLUBS_SPADES_COLOR(str) + RESET;
  } else {
    colorFunc = (str) => str;
  }
  const val = card.value;
  const leftVal  = (val.length === 2 ? val : val + ' ');
  const rightVal = (val.length === 2 ? val : ' ' + val);
  const suitSymbol = card.suit === "Hearts" ? "♥" :
                     card.suit === "Diamonds" ? "♦" :
                     card.suit === "Clubs" ? "♣" :
                     card.suit === "Spades" ? "♠" : "?";
  let art = [
    '┌─────────┐',
    `│${leftVal}       │`,
    '│         │',
    `│    ${suitSymbol}    │`,
    '│         │',
    `│       ${rightVal}│`,
    '└─────────┘'
  ];
  return art.map(line => colorFunc(line));
}

// Combines the ASCII art for multiple cards so they appear side‑by‑side.
function displayHand(hand) {
  const cardsAscii = hand.map(card => getAsciiCard(card));
  const cardHeight = cardsAscii[0].length;
  let combined = '';
  for (let i = 0; i < cardHeight; i++) {
    const line = cardsAscii.map(cardLines => cardLines[i]).join('  ');
    combined += line + '\n';
  }
  return combined;
}

/**
 * Displays the hand with card indices below each card.
 * If any card indexes are specified in highlightIndexes, those cards are re‑rendered
 * using WIN_HIGHLIGHT (by stripping any existing ANSI codes and then applying WIN_HIGHLIGHT).
 */
function displayHandWithIndices(hand, highlightIndexes = []) {
  const cardsAscii = hand.map((card, index) => {
    let art = getAsciiCard(card);
    if (highlightIndexes.includes(index)) {
      art = art.map(line => String(WIN_HIGHLIGHT(stripAnsi(line))));
    }
    return art;
  });
  const cardHeight = cardsAscii[0].length;
  let combined = '';
  for (let i = 0; i < cardHeight; i++) {
    const line = cardsAscii.map(cardLines => cardLines[i]).join('  ');
    combined += line + '\n';
  }
  let indicesLine = '';
  for (let i = 0; i < hand.length; i++) {
    const indexStr = `(${i+1})`;
    const padded = indexStr.padStart(Math.floor((11 + indexStr.length) / 2), ' ')
                             .padEnd(11, ' ');
    indicesLine += padded + "  ";
  }
  combined += indicesLine + '\n';
  return combined;
}

/**
 * Displays the hand without indices.
 * If highlightedIndexes is provided, those cards are re‑rendered using WIN_HIGHLIGHT.
 */
function displayHandWithHighlights(hand, highlightIndexes = []) {
  const cardsAscii = hand.map((card, index) => {
    let art = getAsciiCard(card);
    if (highlightIndexes.includes(index)) {
      art = art.map(line => String(WIN_HIGHLIGHT(stripAnsi(line))));
    }
    return art;
  });
  const cardHeight = cardsAscii[0].length;
  let combined = '';
  for (let i = 0; i < cardHeight; i++) {
    const line = cardsAscii.map(cardLines => cardLines[i]).join('  ');
    combined += line + '\n';
  }
  return combined;
}

// ---------------------------------------------------------
// UI Display Helpers
// ---------------------------------------------------------

/**
 * Clears the screen and prints header info, the payout table, current credits,
 * and "Your Hand:" along with the current hand.
 *
 * @param {Card[]} hand - The hand to display.
 * @param {string} highlightHand - Name of winning hand to highlight in the payout table.
 * @param {number} win - The win amount (if any) for this hand.
 * @param {number} credits - Current credit total.
 * @param {string} message - Extra message to display.
 * @param {boolean} showIndices - If true, displays card indices (used during hold selection).
 * @param {number[]} highlightedIndexes - Array of card positions (0-indexed) to highlight.
 */
function printUI(hand, highlightHand, win, credits, message, showIndices = false, highlightedIndexes = []) {
  console.clear();
  console.log(WELCOME_BANNER);
  console.log(`Credits: ${credits}\n`);
  printPayoutTable(highlightHand);
  if (hand) {
    console.log("Your Hand:");
    if (showIndices) {
      console.log(displayHandWithIndices(hand, highlightedIndexes));
    } else if (highlightedIndexes.length > 0) {
      console.log(displayHandWithHighlights(hand, highlightedIndexes));
    } else {
      console.log(displayHand(hand));
    }
  }
  if (message) {
    console.log(message + "\n");
  }
  if (win > 0) {
    console.log(`Win for this hand: ${win} credits.\n`);
  }
}

// Prints the payout table at the top of the screen.
// If a winning hand is specified, that row is highlighted in green.
function printPayoutTable(highlightName = "") {
  console.log("Payout Table (Multiplier x Bet):");
  for (const row of payoutTable) {
    let line = `${row.name.padEnd(18)} : ${row.multiplier}`;
    if (row.name === highlightName) {
      line = chalk.green(line);
    }
    console.log(line);
  }
  console.log('---------------------------------------------------\n');
}

// ---------------------------------------------------------
// Hand Evaluation with Winning Card Indices
// ---------------------------------------------------------

/**
 * Evaluates a 5-card hand and returns an object:
 * { handName: string, multiplier: number, winningIndices: number[] }.
 * The winningIndices array contains the 0-indexed positions of the cards that contributed to the win.
 */
function evaluateHand(hand) {
  const numbers = hand.map(card => valueMap[card.value]).sort((a, b) => a - b);
  const suitsArr = hand.map(card => card.suit);
  const isFlush = suitsArr.every(s => s === suitsArr[0]);
  let isStraight = true;
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] !== numbers[i - 1] + 1) {
      isStraight = false;
      break;
    }
  }
  // Special case: Ace can be low in A-2-3-4-5.
  if (!isStraight &&
      numbers[0] === 2 &&
      numbers[1] === 3 &&
      numbers[2] === 4 &&
      numbers[3] === 5 &&
      numbers[4] === 14) {
    isStraight = true;
  }

  // Build a count map that includes indices.
  let countMap = {};
  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    if (!countMap[card.value]) {
      countMap[card.value] = { count: 0, indices: [] };
    }
    countMap[card.value].count++;
    countMap[card.value].indices.push(i);
  }

  // Check hand types from highest to lowest.
  if (isFlush && isStraight && numbers[0] === 10) {
    return { handName: "Royal Flush", multiplier: 250, winningIndices: [0, 1, 2, 3, 4] };
  }
  if (isFlush && isStraight) {
    return { handName: "Straight Flush", multiplier: 50, winningIndices: [0, 1, 2, 3, 4] };
  }
  for (let key in countMap) {
    if (countMap[key].count === 4) {
      return { handName: "Four of a Kind", multiplier: 25, winningIndices: countMap[key].indices };
    }
  }
  // Full House (highlight all cards)
  let hasThree = false, hasPair = false;
  for (let key in countMap) {
    if (countMap[key].count === 3) { hasThree = true; }
    if (countMap[key].count === 2) { hasPair = true; }
  }
  if (hasThree && hasPair) {
    return { handName: "Full House", multiplier: 9, winningIndices: [0, 1, 2, 3, 4] };
  }
  if (isFlush) {
    return { handName: "Flush", multiplier: 6, winningIndices: [0, 1, 2, 3, 4] };
  }
  if (isStraight) {
    return { handName: "Straight", multiplier: 4, winningIndices: [0, 1, 2, 3, 4] };
  }
  for (let key in countMap) {
    if (countMap[key].count === 3) {
      return { handName: "Three of a Kind", multiplier: 3, winningIndices: countMap[key].indices };
    }
  }
  // Two Pair: collect indices for both pairs.
  let pairIndices = [];
  for (let key in countMap) {
    if (countMap[key].count === 2) {
      pairIndices = pairIndices.concat(countMap[key].indices);
    }
  }
  if (pairIndices.length === 4) {
    return { handName: "Two Pair", multiplier: 2, winningIndices: pairIndices };
  }
  // Jacks or Better: check for a qualifying pair.
  for (let key in countMap) {
    if (countMap[key].count === 2 && valueMap[key] >= 11) {
      return { handName: "Jacks or Better", multiplier: 1, winningIndices: countMap[key].indices };
    }
  }
  return { handName: "No Win", multiplier: 0, winningIndices: [] };
}

// ---------------------------------------------------------
// Main Game Loop
// ---------------------------------------------------------

async function main() {
  // Display the welcome banner.
  console.log(WELCOME_BANNER);
  intro("Welcome to POKER CLI!");
  
  // Let the player select the bet at the beginning.
  const betSelection = await select({
    message: "Select your bet:",
    options: [
      { value: 5, label: "5" },
      { value: 10, label: "10" },
      { value: 20, label: "20" },
      { value: 30, label: "30" }
    ],
    initialValue: 5
  });
  let BET = betSelection;
  
  let credits = 100;
  
  while (credits >= BET) {
    printUI(null, "", 0, credits, `Bet: ${BET} credits per hand`);
    await text({ message: 'Press Enter to deal a hand...' });
    
    credits -= BET;
    
    const deck = new Deck();
    deck.shuffle();
    const initialHand = deck.deal(5);
    
    printUI(initialHand, "", 0, credits,
      "Select cards to hold by entering their numbers (e.g. 134 for cards 1, 3, and 4).\nPress Enter to hold none.",
      true
    );
    
    let holdInput = await text({ message: 'Enter card numbers to hold:' });
    if (!holdInput) {
      holdInput = "";
    }
    let holds = [];
    if (holdInput.trim() !== "") {
      if (holdInput.includes(",") || holdInput.includes(" ")) {
        holds = holdInput.split(/[, ]+/);
      } else {
        holds = holdInput.split("");
      }
      holds = holds.map(x => parseInt(x.trim()))
                   .filter(x => !isNaN(x) && x >= 1 && x <= 5)
                   .map(x => x - 1);
    }
    
    if (holds.length === 0) {
      console.log("No cards selected to hold. All cards will be replaced.");
      await text({ message: "Press Enter to continue drawing new cards." });
    }
    
    let finalHand = initialHand.slice();
    for (let i = 0; i < 5; i++) {
      if (!holds.includes(i)) {
        finalHand[i] = deck.deal(1)[0];
      }
    }
    
    const evalResult = evaluateHand(finalHand);
    let winAmount = (evalResult.multiplier > 0) ? BET * evalResult.multiplier : 0;
    
    printUI(finalHand, (evalResult.handName !== "No Win") ? evalResult.handName : "", winAmount, credits,
      (evalResult.multiplier > 0)
        ? `Final Hand: ${evalResult.handName}!`
        : "Final Hand: No winning combination.",
      false, evalResult.winningIndices
    );
    await text({ message: 'Press Enter to continue...' });
    
    if (winAmount > 0) {
      let gambleYes = await confirm({ message: `You won ${winAmount} credits! Do you want to gamble your win to double it?` });
      while (gambleYes && winAmount > 0) {
        const guess = await select({
          message: 'Gamble: Guess the card color:',
          options: [
            { value: 'red', label: 'Red' },
            { value: 'black', label: 'Black' }
          ]
        });
        const randomColor = Math.random() < 0.5 ? "red" : "black";
        if (guess === randomColor) {
          winAmount *= 2;
          printUI(finalHand, (evalResult.handName !== "No Win") ? evalResult.handName : "", winAmount, credits,
            `Gamble successful! The card was ${randomColor}. Your win is now ${winAmount} credits.`,
            false
          );
          gambleYes = await confirm({ message: `Do you want to gamble your win of ${winAmount} credits again?` });
        } else {
          winAmount = 0;
          printUI(finalHand, "", 0, credits,
            `Gamble failed! The card was ${randomColor}. You lose your win for this hand.`,
            false
          );
          await text({ message: 'Press Enter to continue...' });
          break;
        }
      }
    }
    
    credits += winAmount;
    
    if (credits < BET) {
      printUI(finalHand, "", 0, credits, "Not enough credits to play. Game over!", false);
      break;
    }
  }
  
  console.log(chalk.bold("*** YOU LOSE! ***"));
  outro("Game Over. Thanks for playing!");
}

main();
