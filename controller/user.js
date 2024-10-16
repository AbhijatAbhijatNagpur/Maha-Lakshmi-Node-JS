const { Funtarget } = require("../models/betmodel");
const { UserMaster } = require("../models/usermodel"); // Model for user data

// Function to register a user and initialize game state
const registerUser = async (userId, socket) => {
    try {
        // Check if userId is provided
        if (!userId) {
            console.log({ msg: "error in register user:- userId not found" });
            return;
        }
        console.log("line", userId)

        // Find the user in the UserMaster collection by their ID
        const user = await UserMaster.findOne({ _id: userId });
        console.log('user 16', user)


        // If the user is not found, log an error and emit a 'userNotFound' event to the client
        if (!user) {
            console.log({ msg: "error in register user:- user not found in game" });
            socket.emit("userNotFound", { msg: "User Not Found" });
            return;
        }

        // Find the user's bet in the AndarBaharBet collection by their userId
        let userbet = await Funtarget.findOne({ userId });

        // If no bet record is found for the user, create a new one
        if (!userbet) {
            userbet = new Funtarget({
                userId: userId,
            });
        }

        // Save the user and bet details in the database
        await user.save();
        console.log("user38", user)
        await userbet.save();

        // Emit 'userDetails' event to the client with the user's information
        socket.emit("userDetails", {
            user,
        });
    } catch (error) {
        // Log any errors that occur during the process
        console.log("Error initializing game state:", error);
    }
};

// Function to update user details after a win and send updated details to the client
const updateUserAfterMatch = (userId, socket) => {
    // Listen for 'getUpdatedUserDetails' event from the client
    socket.on("updateUserAfterMatch", async (data) => {
        const { matchId} = data;

        try {
            // Check if userId is provided
            if (!userId) {
                console.log({ msg: "user id not given" });
                return;
            }

            // Find the user in the UserMaster collection by their ID
            const user = await UserMaster.findOne({ _id: userId });
            

            // If the user is not found, log an error and return
            if (!user) {
                console.log({ msg: "user not found in this" });
                return;
            }

            // Emit 'userDetails' event to the client with the updated user's information
            socket.emit("userDetails", {
                user,
            });
        } catch (error) {
            // Log any errors that occur during the process
            console.log(error);
        }
    });
};

// Export the registerUser and updatedUserAfterWin functions for use in other parts of the application
module.exports = { registerUser, updateUserAfterMatch, };
