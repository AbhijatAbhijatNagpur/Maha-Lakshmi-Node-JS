const mongoose = require("mongoose");

const userMasterSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserMaster", default: null },

        coins: {
            type: Number,
            default: 0,
        },
        game_version: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const UserMaster = mongoose.model("UserMaster", userMasterSchema);
module.exports = { UserMaster };
