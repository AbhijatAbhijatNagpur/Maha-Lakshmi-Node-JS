const { matchModel } = require("../models/matchmodel")

const matchIdGenraotor = async (req, res) => {


    // Generate a unique match ID
    const createdMatchId = await matchModel.create({ name: "funtarget" })



    return createdMatchId._id


}

module.exports = { matchIdGenraotor } 