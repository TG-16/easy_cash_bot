const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = 3000;

// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/telegram_bot')
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log('MongoDB connection error:', err));

// Define user schema and model
const userSchema = new mongoose.Schema({
  chatId: { type: Number, required: true, unique: true },
  username: String,
  tokens: { type: Number, default: 10 },
});

const User = mongoose.model('User', userSchema);

// Telegram Bot setup
const botToken = 'TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(botToken, { polling: true });

// Express setup for serving web app
app.use(express.static('public'));

// Register users and store in MongoDB
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  const user = await User.findOne({ chatId });

  if (!user) {
    const newUser = new User({ chatId, username });
    await newUser.save();
    bot.sendMessage(chatId, "You have been registered! Your token balance is 10.");
  } else {
    bot.sendMessage(chatId, `Welcome back! Your token balance is ${user.tokens}.`);
  }
});

// Handle token top-ups (simulating payment process)
bot.onText(/\/topup/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await User.findOne({ chatId });

  if (!user) {
    return bot.sendMessage(chatId, "Please register first.");
  }

  // Simulate payment success and top-up
  user.tokens += 10; // Adding 10 tokens for simplicity
  await user.save();

  bot.sendMessage(chatId, `Your tokens have been topped up! Your new balance is ${user.tokens}.`);
});

// Handle game requests (play game)
// Handle game requests (play game)
bot.onText(/\/play/, async (msg) => {
    const chatId = msg.chat.id;
  
    // Find the user in the database
    const user = await User.findOne({ chatId });
    if (!user) {
      return bot.sendMessage(chatId, "You need to register first using /start.");
    }
  
    // Inform the user that the game is ready and provide a link to the web app
    const webAppLink = "http://localhost:3000"; // Change this to your hosted URL
  
    bot.sendMessage(chatId, `Game started! Please play the game by clicking on the link below:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Play Game', url: webAppLink }],
        ]
      }
    });
  });
  
// Handle the callback data (user's move)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const move = query.data;

  // Store the player's move in the game state
  const opponentMove = getRandomMove(); // You can implement a real multiplayer game logic here

  // Determine the winner
  const winner = determineWinner(move, opponentMove);

  // Respond to the user
  bot.sendMessage(chatId, `You chose ${move}. Opponent chose ${opponentMove}. ${winner}`);

  // Update the player's token based on the result (not implemented here)
  if (winner === "You win!") {
    const user = await User.findOne({ chatId });
    user.tokens += 5;
    await user.save();
  } else if (winner === "You lose!") {
    const user = await User.findOne({ chatId });
    user.tokens -= 2;
    await user.save();
  }
});

// Helper functions for the game
function getRandomMove() {
  const moves = ['Rock', 'Paper', 'Scissors'];
  return moves[Math.floor(Math.random() * moves.length)];
}

function determineWinner(playerMove, opponentMove) {
  if (playerMove === opponentMove) return "It's a draw!";
  if (
    (playerMove === 'Rock' && opponentMove === 'Scissors') ||
    (playerMove === 'Scissors' && opponentMove === 'Paper') ||
    (playerMove === 'Paper' && opponentMove === 'Rock')
  ) return "You win!";
  return "You lose!";
}

// Express endpoint to display the web app
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server and bot
app.listen(port, () => {
  console.log(`Web server is running at http://localhost:${port}`);
});

// Starting the bot
bot.startPolling();
