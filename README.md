# GUILTY - A Mystery Deduction Game

A Wordle-style daily mystery game where players deduce the culprit by analyzing suspect traits and patterns. Built by a non-programmer using Claude AI to demonstrate how AI enables anyone to create sophisticated web applications.

## Play the Game

🎮 **[Play GUILTY online](https://witness-game-[something].onrender.com)** (Link will be updated after deployment)

## About the Game

GUILTY is a daily mystery game inspired by Wordle but focused on deductive reasoning:

- **Daily Mysteries**: Three rotating crime scenarios (Museum Heist, TechCorp Breach, Restaurant Poisoning)
- **Pattern Matching**: 15 suspects with 15 different traits to analyze
- **Visual Feedback**: Color-coded clues guide your deduction (green = exact match, yellow = close, gray = wrong)
- **Progressive Difficulty**: Easy (8 guesses), Medium (6 guesses), Hard (4 guesses)
- **Stats Tracking**: Win streaks, success rates, and shareable results

## Key Features

- **15 Trait Categories**: Access Level, Timing, Knowledge, Motive, Behavior, Physical Evidence, and more
- **Smart Suspect Generation**: Logically consistent suspect profiles
- **Detailed Crime Scenarios**: Rich narratives with multiple clues and red herrings
- **Mobile Responsive**: Works perfectly on phones, tablets, and desktops
- **No Login Required**: Play instantly, stats saved locally

## The Story Behind This Game

This game was created by someone with no programming experience to prove that AI can empower anyone to build real, functional applications. Using Claude AI as a coding partner, we built:

- A complete Node.js/Express backend
- Claude API integration for dynamic content
- Sophisticated game logic and state management
- Professional UI/UX design
- Deployment-ready architecture

## Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **AI Integration**: Claude API (Anthropic)
- **Deployment**: Render (free tier)

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Add your Claude API key to `.env`: `ANTHROPIC_API_KEY=your_key_here`
4. Run the server: `npm start`
5. Open http://localhost:3000

## Deployment

The game is designed to run on any Node.js hosting platform. The free tier of Render.com works perfectly for demo purposes.

---

**Built with ❤️ and AI to show that anyone can code** 