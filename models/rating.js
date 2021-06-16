const mongoose = require("mongoose")

//Model for middleware
const Movie = require("./movie")

const Schema = mongoose.Schema({
	ratedBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	movie: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Movie",
	},
	rating: {
		type: Number,
		required: true,
	},
})
/* 
Schema.post("save", async (doc, next) => {
	try {
		const session = await mongoose.startSession()
		try {
			session.startTransaction()
			//find movie
			const movie = await Movie.findById(doc.movie).populate("ratings")

			//calculate sum
			let sum = movie.ratings.reduce(
				(prev, curr) => {
					return { rating: prev.rating + curr.rating }
				},
				{ rating: 0 }
			)
			movie.rating = sum.rating / movie.ratings.length
			await movie.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error updating the rating value" })
		}
		await session.commitTransaction()
		session.endSession()
	} catch (err) {
		next(err)
	}
})

Schema.post("remove", async (doc, next) => {
	try {
		const session = await mongoose.startSession()
		try {
			session.startTransaction()
			//find movie
			const movie = await Movie.findById(doc.movie, { session }).populate(
				"ratings"
			)

			//calculate sum
			let sum = movie.ratings.reduce(
				(prev, curr) => {
					return { rating: prev.rating + curr.rating }
				},
				{ rating: 0 }
			)
			movie.rating = sum.rating / movie.ratings.length
			await movie.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error updating the rating value" })
		}
		await session.commitTransaction()
		session.endSession()
	} catch (err) {
		next(err)
	}
}) */

module.exports = mongoose.model("Rating", Schema)
