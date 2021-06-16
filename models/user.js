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
	following: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Studio" },
		],
	},
	watched: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Movie" },
		],
	},
	wishlist: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Movie" },
		],
	},
	comments: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
		],
	},
	ratings: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Rating" },
		],
	},
})

module.exports = mongoose.model("User", Schema)
