const mongoose = require("mongoose")

const Schema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	mobile: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	followers: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
		],
	},
	movies: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Movie" },
		],
	},
})

module.exports = mongoose.model("Studio", Schema)
