const mongoose = require("mongoose")
require("mongoose-double")(mongoose)

const Schema = mongoose.Schema({
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Studio",
	},
	name: {
		type: String,
		required: true,
		unique: true,
	},
	image: {
		type: String,
		required: true,
	},
	genre: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	rating: {
		type: mongoose.Schema.Types.Double,
		required: true,
		default: 0,
	},
	ratings: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Rating" },
		],
	},
	comments: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
		],
	},
	wishedBy: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
		],
	},
	watchedBy: {
		type: [
			{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
		],
	},
})
/* 
Schema.pre("remove", async (doc, next) => {
	//Studio
	const studio = await Studio.findById(doc.creator)
	studio.movies.pull(doc._id)

	//Ratings
	let temp = [...doc.ratings]
	await Promise.all(temp.map(async (id) => await Rating.findByIdAndDelete(id)))

	//Comment
	temp = [...doc.comments]
	await Promise.all(temp.map(async (id) => await Comment.findByIdAndDelete(id)))

	//WishedBy
	await Promis.all(
		doc.wishedBy.map(async (id) => {
			let user = await User.findById(id)
			user.wishlist.pull(doc._id)
		})
	)

	//Watchlist
	await Promise.all(
		doc.watchedBy.map(async (id) => {
			let user = await User.findById(id)
			user.watched.pull(doc._id)
		})
	)
}) */
module.exports = mongoose.model("Movie", Schema)
