const mongoose = require("mongoose");

// Define the schema for handling bets in the game
const matchSchema = new mongoose.Schema({

    name: {
        type: String,
        default: "match"
    },
    winnerNumber: {
        type: String,
        
        
    },
    winnerUsers : {
    type : [String]
    }


}, { timestamps: true });

// Create the model from the schema
const matchModel = mongoose.model('matchSchema', matchSchema);

module.exports = {matchModel};
