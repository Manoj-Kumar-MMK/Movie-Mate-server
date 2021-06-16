require("dotenv").config()
const mongoose = require("mongoose")

//Models
const User = require("../models/user")
const Movie = require("../models/movie")
const Rating = require("../models/rating")

// @method ---  GET
// @header --- user-token
// @params   ---  mid
const hasUserRatedMovie = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.params

		//find-user-movie-rating link
		const rating = await Rating.findOne({ movie: mid, ratedBy: id })
		if (!rating) return res.status(200).json({ value: false })

		res.status(200).json({ value: true, rid: rating._id })
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @body   ---
const getRatingsForUser = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find user and populate
		const user = await User.findById(id).populate({
			path: "ratings",
			populate: { path: "movie", select: "name image rating" },
		})
		if (!user) return res.status(400).json({ error: "Error finding the user" })

		res.status(200).json(user.ratings)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header ---
// @params   --- mid
const getRatingsForMovie = async (req, res, next) => {
	try {
		const { mid } = req.params

		//find movie and populate
		const movie = await Movie.findById(mid).populate({
			path: "ratings",
			populate: { path: "ratedBy", select: "image name" },
		})
		if (!movie)
			return res.status(400).json({ error: "Error finding the movie" })

		res.status(200).json(movie.ratings)
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header --- user-token
// @body   --- mid,ratingValue
const addRating = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid, ratingValue } = req.body

		//storing
		let rid = null

		//check if rated
		if ((await Rating.findOne({ movie: mid, ratedBy: id })) !== null)
			return res.status(400).json({ error: "Already rated by the user" })

		// find-movie
		let movie = await Movie.findById(mid)
		if (!movie)
			return res.status(400).json({ error: "Error finding the movie" })

		// find-user
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "Error finding the user" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//create rating
			const rating = new Rating({ rating: ratingValue })

			//linking
			rating.ratedBy = id
			rating.movie = mid
			await rating.save({ session })
			rid = rating._id

			user.ratings.push(rating._id)
			movie.ratings.push(rating._id)

			await user.save({ session })
			await movie.save({ session })

			//calculate rating
			movie = await Movie.findById(rating.movie)
				.populate("ratings")
				.session(session)

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
			return res.status(400).json({ error: "Error creating the rating" })
		}
		await session.commitTransaction()
		session.endSession()
		res.status(201).json({ message: "Rating added", rid: rid })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- user-token
// @body   --- rid,ratingValue
const modifyRating = async (req, res, next) => {
	try {
		const { rid, ratingValue } = req.body

		//find-rating
		const rating = await Rating.findById(rid).populate("movie")
		if (!rating)
			return res.status(400).json({ error: "Error finding the rating" })

		let movie = await Movie.findById(rating.movie)
		if (!movie)
			return res.status(400).json({ error: "Error finding the movie" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//modify rating and save
			rating.rating = ratingValue
			rating.save({ session })

			//calculate rating
			movie = await Movie.findById(rating.movie)
				.populate("ratings")
				.session(session)

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
			return res.status(400).json({ error: "Error modifying the rating" })
		}
		await session.commitTransaction()
		session.endSession()

		res.status(200).json({ message: "Rating Modified" })
	} catch (err) {
		next(err)
	}
}

// @method ---  DELETE
// @header --- user-token
// @params   --- rid
const deleteRatingById = async (req, res, next) => {
	try {
		const { rid } = req.params

		//find-rating
		const rating = await Rating.findById(rid).populate("movie ratedBy")
		if (!rating)
			return res.status(400).json({ error: "Error finding the rating" })

		let movie = await Movie.findById(rating.movie)
		if (!movie)
			return res.status(400).json({ error: "Error finding the movie" })

		let user = await User.findById(rating.ratedBy)
		if (!user) return res.status(400).json({ error: "Error finding the user" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//remove
			movie.ratings.pull(rating._id)
			await movie.save({ session })
			user.ratings.pull(rating._id)
			await user.save({ session })

			//calculate rating
			movie = await Movie.findById(rating.movie)
				.populate("ratings")
				.session(session)

			await rating.remove({ session })

			if (movie.ratings.length == 0) movie.rating = 0
			else {
				let sum = movie.ratings.reduce(
					(prev, curr) => {
						return { rating: prev.rating + curr.rating }
					},
					{ rating: 0 }
				)
				movie.rating = sum.rating / movie.ratings.length
			}
			await movie.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error modifying the rating" })
		}
		await session.commitTransaction()
		session.endSession()

		res.status(202).json({ message: "Rating deleted" })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	hasUserRatedMovie,
	getRatingsForMovie,
	getRatingsForUser,
	addRating,
	modifyRating,
	deleteRatingById,
}
