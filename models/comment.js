const mongoose = require("mongoose")

const Schema = mongoose.Schema(
	{
		commentedBy: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		movie: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Movie",
		},
		text: {
			type: String,
			required: true,
		},
	},
	{ timestamp: true }
)

module.exports = mongoose.model("Comment", Schema)
