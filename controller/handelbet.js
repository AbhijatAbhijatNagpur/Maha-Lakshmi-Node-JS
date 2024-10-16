// const { AndarBaharBet } = require("../models/gameBetModel"); // Model for handling bets in the game
const { Funtarget } = require("../models/betmodel");
const { UserMaster } = require("../models/usermodel"); // Model for user data
const { matchModel } = require("../models/matchmodel"); // Model for user data



// Store all bets for the current round
let bets = {}; // This will store bets for each number (1-10)
const currentmatchId = { matchId: null }


const handlebet = (userId, socket) => {
    // Event listener for placing a bet
    socket.on("bet", async (data) => {
        const { matchId, betType, betAmount } = data; // Destructure data sent from the client
        console.log("line 17", data)

        currentmatchId.matchId = matchId;
        console.log("line 19", typeof (betAmount))


        try {
            // Step 1: Find the user in the database
            const user = await UserMaster.findOne({ _id: userId });
            if (!user) {
                socket.emit("betError", { msg: "User not found" });
                return;
            }

            // Step 2: Check if the user has enough coins to place the bet
            if (user.coins <= 0 || betAmount <= 0 || user.coins - betAmount < 0) {
                socket.emit("noBet", { msg: "Insufficient Balance" });
                return;
            }

            // Step 3: Find the existing bet for the user in this match, or create a new one
            let userBet = await Funtarget.findOne({ matchId,userId });
            if (!userBet) {
                // If no previous bet exists, create a new bet record
                userBet = new Funtarget({
                    userId: userId,
                    matchId: matchId,
                    betType: betType,
                    betAmount: betAmount,
                });
            }
            // else {
            //     // If the user has already placed a bet, update the bet amount
            //     userBet.totalBet += betAmount;
            //     userBet.betAmount = betAmount;
            // }

            // Step 4: Save the updated bet to the database
            await userBet.save();
            console.log("userbet", userBet)

            // Step 5: Deduct the bet amount from the user's coin balance
            user.coins -= betAmount;
            await user.save();
            console.log(user)



            // Store all bets for the current round


            // Step 6: Store the bet amount in the `bets` object
            if (!bets[betType]) {
                bets[betType] = 0; // Initialize if the betType hasn't been bet on yet
            }
            bets[betType] += betAmount;


            // console.log(`User bet on number ${number} with ${betAmount} coins.`);

            // Step 7: Emit success event back to the user with updated balance
            socket.emit("userDetails", {
                user
            });

            // Step 8: Check if any bets have been placed
            if (Object.keys(bets).length === 0) {
                console.log("No bets placed");
                return;
            }

            // Step 9: Determine the number with the lowest total bet
            let winnerNumber = null;
            let lowestBet = Infinity;
            console.log("line 89",betType)

            for (const betType in bets) {
                if (bets[betType] < lowestBet) {
                    lowestBet = bets[betType];
                    winnerNumber = betType;

                }

            }
            const winnerUser = await Funtarget.find({ matchId: matchId ,betType: winnerNumber })
            console.log("winner user", winnerUser)
            console.log("winnerNumber", winnerNumber)
            console.log("lowesbet", lowestBet)
            
            const winnerUserIds = winnerUser.map((user) => user.userId);

            const updateMatchDocument = await matchModel.findOneAndUpdate({ _id: matchId }, { winnerNumber: winnerNumber, winnerUsers: winnerUserIds })

            // Step 10: Emit the winning number and lowest bet to all clients
            socket.emit("game_result", { number: winnerNumber, amount: lowestBet });

            // Step 11: Reset the bets for the next round
            bets = {};

        } catch (error) {
            // Handle any errors that occur during the bet placement process
            console.error("Error placing bet:", error);
            socket.emit("betError", { msg: "Error placing bet, please try again." });
        }


    });
}



// Event listener for ending the round and determining the winner
const betWinnerHandler = async (data) => {
    console.log("runiinng or not")
    try {
        const { matchId } = data;

        // Find the match data based on matchId
        const matchData = await matchModel.findOne({ _id: matchId });
        const users = matchData.winnerUsers;

        const userIds = users.map(user => user._id); // Extract the user IDs

        // Query Funtarget model to find bet amounts for the users in the array
        const funtargets = await Funtarget.find({ userId: { $in: userIds } });

        // Loop through funtargets and update the user's coins
        for (const funtarget of funtargets) {
            const updatingUser = await UserMaster.findOne({ _id: funtarget.userId });

            if (updatingUser) {
                // Update the user's coins based on the betAmount
                updatingUser.coins += (funtarget.betAmount * 1.98).toFixed(2);
                await updatingUser.save();
            }
        }

    } catch (error) {
        console.error("Error in handling winner coins:", error);
    }
}

module.exports = { handlebet, betWinnerHandler, currentmatchId };
