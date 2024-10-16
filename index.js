const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { connection } = require("./config/db");
const { registerUser } = require("./controller/user");
const { matchIdGenraotor } = require("./controller/matchController");
const { betWinnerHandler, currentmatchId, handlebet } = require("./controller/handelbet");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 6000;

// Timer state (You can customize this based on your previous code)
// Timer state (You can customize this based on your previous code)
let timerState = {
    duration: 20, // Timer duration in seconds
    isRunning: false, // Indicates if the timer is currently running
    stateFlag: true, // A flag used to control card generation and handling logic
    betFlag: true, // A flag to determine when betting is allowed
    dbFlag: false, // A flag to determine database operations (if any)
};

let isSpinState = {
    isSpin: false,
};

// Function to start the game timer (this will broadcast updates to all clients)
async function startGameTimer () {
    if (!timerState.isRunning) {
        timerState.isRunning = true;
        
        const matchId = await matchIdGenraotor(); // Generate match ID at the start
        console.log("line33", matchId)
        let ProperMatchID;
        ProperMatchID = matchId.toHexString() // Last 12 characters
        console.log("line 37",ProperMatchID)
        // console.log(twelveDigitString)

       


        setInterval(async() => {
            timerState.duration--;

            // Emit game state updates
            io.to("Funtarget").emit("gameUpdate", {
                gamestate: {
                    value: timerState.duration, // Countdown timer value
                    matchId: ProperMatchID, // Current match ID
                    
                },
                ispinstate: { value: isSpinState.isSpin }, // Spin state to avoid multiple spins
            });

            // Reset timer when it reaches 0
            if (timerState.duration <= 0) {
                timerState.duration = 20; // Reset duration for next round
                timerState.stateFlag = true;
                timerState.betFlag = true;
                isSpinState.isSpin = true; // Indicate that spinning can start
                // betWinnerHandler(currentmatchId.matchId); // Determine the winner and emit winning number and lowest bet
                const mmatchID = await matchIdGenraotor(); // Generate match ID at the start
                ProperMatchID = mmatchID.toHexString() // Last 12 characters
                console.log("line 64", ProperMatchID)

            }
        }, 1000); // Update every second
    }
}

// Handle connection to clients
const IOConnection = () => {
    io.on("connection", (socket) => {
        console.log("socket connected successfully");

        const userId = socket.handshake.query.userID; // Extract user ID from query parameters
        console.log("the userId", userId);

        socket.join("Funtarget"); // Join the user to the "Funtarget" room
        registerUser(userId, socket); // Register the user with the provided user ID
        handlebet(userId, socket); // Handle the betting logic for the user
        // updateUserAfterMatch(userId, socket); // Update user data after a win

        // Handle socket disconnection
        socket.on("disconnect", () => {
            console.log("socket disconnected successfully");
            // Clean up resources associated with the user ID when the socket disconnects
        });
    });
};

// Start the server

server.listen(PORT, async () => {
    try {
        await connection.then(() => {
            IOConnection(); // Initialize Socket.IO connection handling
            startGameTimer(); // Start the game timer
        });
        console.log("Connected to DB"); // Log successful database connection
        console.log(`Server is running on port ${PORT}`); // Log server running status
    } catch (error) {
        console.log(error); // Log any errors that occur during server setup
    }
});

