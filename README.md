# POKER CLI

**POKER CLI** is a terminal-based video poker game built with Node.js. It simulates a classic video poker machine—dealing a hand of 5 cards, letting you choose which cards to hold, evaluating your hand against a standard payout table, and offering a gamble feature to double your winnings. All the game graphics are rendered in colorful ASCII art.

## Features

- **Classic Video Poker Gameplay:**  
  Deal a hand of 5 cards, select which cards to hold, and draw replacements for unheld cards.

- **Hand Evaluation:**  
  Your final hand is evaluated using standard poker rules with a payout table to determine your win multiplier.

- **Gamble Feature:**  
  After a winning hand, you can gamble your win to double it by guessing the card color (using left/right key selection via a confirm prompt).

- **Colorful ASCII Art:**  
  Cards are displayed using ASCII art with color-coded suits (red for Hearts/Diamonds, blue for Clubs/Spades) and winning cards highlighted with a green background.

- **Terminal-Based:**  
  Enjoy the game entirely in your terminal without any graphical interface.

## Requirements

- **Node.js** (v12 or higher is recommended)  
- The following npm packages:
  - `@clack/prompts`
  - `chalk`
  - `strip-ansi`

## Installation

1. **Clone or Download the Repository:**

   ```bash
   git clone <repository_url>
   cd poker-cli
   ```

2. **Install the Dependencies:**

   ```bash
   npm install
   ```

   *Alternatively, if you are starting from scratch, you can install the required packages manually:*

   ```bash
   npm install @clack/prompts chalk strip-ansi
   ```

3. **Ensure your `package.json` includes `"type": "module"`** (if using a `.js` file) so that ES modules work correctly.

## How to Run

In your terminal, run:

```bash
node poker.js
```

*Or, if you have a start script defined in your `package.json`:*

```bash
npm run start
```

## How to Play

1. **Welcome Screen:**  
   The game starts by displaying a welcome banner with the POKER CLI logo.

2. **Bet Selection:**  
   You'll be prompted to select your bet (options are 5, 10, 20, or 30 credits).

3. **Dealing a Hand:**  
   Press Enter to deal a new hand. Five cards are displayed in ASCII art.

4. **Holding Cards:**  
   Enter the card numbers (e.g., "134") to hold those cards. Press Enter without input to replace all cards.

5. **Hand Evaluation:**  
   The program evaluates your final hand and highlights winning cards with a green background.

6. **Gamble Feature:**  
   If you win, you can choose to gamble your win. A confirm prompt will ask you to press left (Yes for RED) or right (No for BLACK). Your choice is compared to a randomly drawn color; a match doubles your win, otherwise you lose your win for that hand.

7. **Game End:**  
   The game continues until you run out of credits (i.e., credits fall below your bet). When this happens, the game displays a losing banner.

## Customization

- **Color Customization:**  
  Modify the global color variables in the source code (e.g., `HEARTS_DIAMONDS_COLOR`, `CLUBS_SPADES_COLOR`, and `WIN_HIGHLIGHT`) to change the appearance of the cards and highlights.

- **Payout Table:**  
  Adjust the `payoutTable` array in the code to change the multipliers for each poker hand.

## Contributing

Contributions are welcome! Feel free to fork this repository and open a pull request with improvements, additional features, or bug fixes.

## License

This project is licensed under the [MIT License](LICENSE).
