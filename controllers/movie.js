require("dotenv").config()
const mongoose = require("mongoose")

//Models
const User = require("../models/user")
const Studio = require("../models/studio")
const Movie = require("../models/movie")
const Rating = require("../models/rating")
const Comment = require("../models/comment")

// @method ---  GET
// @header ---
// @params --- name
const checkNameTaken = async (req, res, next) => {
	try {
		const { name } = req.params

		//find movie
		const movie = await Movie.findOne(name)
		if (!movie) return res.status(400).json({ value: false })

		res.status(200).json({ value: true })
	} catch (err) {
		next(err)
	}
}
// @method ---  GET
// @header ---
// @params --- mid
const getMovieById = async (req, res, next) => {
	try {
		const { mid } = req.params

		//find movie
		const movie = await Movie.findById(
			mid,
			"name genre description image rating"
		)
		if (!movie) return res.status(400).json({ error: "Movie does not exist" })

		res.status(200).json(movie)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header ---
// @params --- sid
const getStudioMoviesById = async (req, res, next) => {
	try {
		const { sid } = req.params

		//find movie
		const studio = await Studio.findById(sid, "movies").populate(
			"movies",
			"name image"
		)
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		res.status(200).json(studio.movies)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- studio-token
// @body   ---
const getStudioMovies = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find-studio
		const studio = await Studio.findById(id, "movies").populate(
			"movies",
			"name image"
		)
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		res.status(200).json(studio.movies)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @body   ---
const getWishlist = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find-user
		const user = await User.findById(id, "wishlist").populate(
			"wishlist",
			"name image genre description rating"
		)
		if (!user) return res.status(400).json({ error: "User not found" })

		res.status(200).json(user.wishlist)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @body   ---
const getWatched = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find-user
		const user = await User.findById(id, "watched").populate(
			"watched",
			"name image genre rating description"
		)
		if (!user) return res.status(400).json({ error: "User not found" })

		res.status(200).json(user.watched)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @params   --- mid
const isInWishlist = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.params

		//find-user
		const user = await User.findById(id, "wishlist")
		if (!user) return res.status(400).json({ error: "User not found" })

		if (user.wishlist.indexOf(mid) === -1)
			return res.status(200).json({ value: false })

		res.status(200).json({ value: true })
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @params   --- mid
const isInWatched = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.params

		//find-user
		const user = await User.findById(id, "watched")
		if (!user) return res.status(400).json({ error: "User not found" })

		if (user.watched.indexOf(mid) === -1)
			return res.status(200).json({ value: false })

		res.status(200).json({ value: true })
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header --- studio-token
// @body   --- name,description,genre,image
const addMovie = async (req, res, next) => {
	try {
		//get details
		const { image } = res.locals
		const { name, genre, description } = req.body

		//check if already exists
		if ((await Movie.findOne({ name: req.body.name })) !== null)
			return res.status(400).json({ error: "Movie name already exists exists" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()
			// find-studio
			const { id } = req.meta
			const studio = await Studio.findById(id)
			if (!studio)
				return res.status(400).json({ error: "Studio does not exist" })

			//create movie
			const movie = new Movie({
				name,
				genre,
				description,
				image,
			})

			//linking
			movie.creator = studio._id
			await movie.save({ session })
			studio.movies.push(movie._id)
			await studio.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error creating the movie" })
		}
		await session.commitTransaction()
		session.endSession()

		res.status(201).json({ message: "Movie added" })
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header --- user-token
// @body   --- mid
const addToWishlist = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.body

		//find-user
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "User not found" })

		//Check if already in wishlist
		if (user.wishlist.indexOf(mid) !== -1)
			return res.status(200).json({ message: "Movie Already in wishlist" })

		//find-movie
		const movie = await Movie.findById(mid)
		if (!movie) return res.status(400).json({ error: "Movie not found" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//link
			user.wishlist.push(mid)
			movie.wishedBy.push(id)
			await user.save({ session })
			await movie.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error adding to wishlist" })
		}
		await session.commitTransaction()
		session.endSession()
		res.status(201).json({ message: "Added to Wishlist" })
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header --- user-token
// @body   --- mid
const addToWatched = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.body

		//find-user
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "User not found" })

		//Check if already in wishlist
		if (user.watched.indexOf(mid) !== -1)
			return res.status(200).json({ message: "Movie Already watched" })

		//find-movie
		const movie = await Movie.findById(mid)
		if (!movie) return res.status(400).json({ error: "Movie not found" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//link
			user.watched.push(mid)
			movie.watchedBy.push(id)
			await user.save({ session })
			await movie.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error adding to watched" })
		}
		await session.commitTransaction()
		session.endSession()

		res.status(201).json({ message: "Added to Watched" })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- studio-token
// @body   --- description,genre
// @params --- mid
const modifyMovieById = async (req, res, next) => {
	try {
		const { mid } = req.params

		//find movie
		const movie = await Movie.findById(mid)
		if (!movie) return res.status(400).json({ error: "Movie does not exist" })

		//update details
		for (const [key, value] of Object.entries(req.body)) movie[key] = value

		movie.save()

		res.status(200).json({ message: "Movie Details Updated" })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- studio-token
// @body   --- image
// @params --- mid
const modifyMovieImageById = async (req, res, next) => {
	try {
		const { mid } = req.params

		//get image
		const { image } = res.locals

		//find movie
		const movie = await Movie.findById(mid)
		if (!movie) return res.status(400).json({ error: "Movie does not exist" })

		//update details
		movie.image = image
		movie.save()

		res.status(200).json({ message: "Movie Thumbnail Updated" })
	} catch (err) {
		next(err)
	}
}

// @method ---  DELETE
// @header --- user-token
// @params   --- mid
const deleteFromWishList = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.params

		// find-User
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "User not found" })

		//find-movie
		const movie = await Movie.findById(mid)
		if (!movie) return res.status(400).json({ error: "Movie not found" })

		//Check if in wishlist
		if (user.wishlist.indexOf(mid) === -1)
			return res.status(400).json({ error: "Movie not in wishlist" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//delete and save
			user.wishlist.pull(mid)
			movie.wishedBy.pull(id)
			await user.save({ session })
			await movie.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error deleting from wishlist" })
		}
		await session.commitTransaction()
		session.endSession()

		return res.status(202).json({ message: "Deleted from Wishlist" })
	} catch (err) {
		next(err)
	}
}

// @method ---  DELETE
// @header --- user-token
// @params   --- mid
const deleteFromWatched = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.params

		// find-User
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "User not found" })

		//find-movie
		const movie = await Movie.findById(mid)
		if (!movie) return res.status(400).json({ error: "Movie not found" })

		//Check if in watched
		if (user.watched.indexOf(mid) === -1)
			return res.status(400).json({ error: "Movie not in watched" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//delete and save
			user.watched.pull(mid)
			movie.watchedBy.pull(id)
			await user.save({ session })
			await movie.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error deleting from watched" })
		}
		await session.commitTransaction()
		session.endSession()

		return res.status(202).json({ message: "Deleted from Watched" })
	} catch (err) {
		next(err)
	}
}

const deleteMovieById = async (req, res, next) => {
	try {
		const { mid } = req.params

		//Movie
		const movie = await Movie.findById(mid)
		if (!movie) return res.status(400).json({ error: "Movie not found" })

		//Studio
		const studio = await Studio.findById(movie.creator)
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//Rating-link
			let temp = [...movie.ratings]
			await Promise.all(
				temp.map(async (id) => {
					const rating = await Rating.findById(id)
					const user = await User.findById(rating.ratedBy).session(session)

					user.ratings.pull(rating._id)
					await user.save({ session })
					await rating.remove({ session })
				})
			)

			//Comment-link
			temp = [...movie.comments]
			await Promise.all(
				temp.map(async (id) => {
					const comment = await Comment.findById(id)
					const user = await User.findById(comment.commentedBy).session(session)

					user.comments.pull(comment._id)
					await user.save({ session })
					await comment.remove({ session })
				})
			)
			//WishedBy
			await Promise.all(
				movie.wishedBy.map(async (id) => {
					let user = await User.findById(id).session(session)
					user.wishlist.pull(movie._id)
					await user.save({ session })
				})
			)

			//Watchlist
			await Promise.all(
				movie.watchedBy.map(async (id) => {
					let user = await User.findById(id).session(session)
					user.watched.pull(movie._id)
					await user.save({ session })
				})
			)

			//Studio-link
			studio.movies.pull(movie._id)
			await studio.save({ session })

			await movie.remove({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error deleting the movie" })
		}
		await session.commitTransaction()
		session.endSession()
		res.status(200).json({ message: "Movie Deleted" })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	checkNameTaken,
	getMovieById,
	getStudioMovies,
	getStudioMoviesById,
	isInWatched,
	isInWishlist,
	getWatched,
	getWishlist,
	addMovie,
	addToWishlist,
	addToWatched,
	modifyMovieById,
	modifyMovieImageById,
	deleteFromWishList,
	deleteFromWatched,
	deleteMovieById,
}
