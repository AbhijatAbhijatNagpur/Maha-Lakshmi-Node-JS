const mongoose = require('mongoose');

// Define the schema for handling bets in the game
const funtargetschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserMaster',
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,

    },
    betAmount: {
        type: Number,
        // required: true
    },
    betType: {
        type: Number,
        // required: true
    },
    
   
}, {
    timestamps :true
});

// Create the model from the schema
const Funtarget = mongoose.model('Funtarget', funtargetschema);

module.exports = { Funtarget };
