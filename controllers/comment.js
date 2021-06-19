require("dotenv").config()
const mongoose = require("mongoose")

//Models
const User = require("../models/user")
const Movie = require("../models/movie")
const Comment = require("../models/comment")

// @method ---  GET
// @header --- user-token
// @params   ---  mid
const hasUserCommentedMovie = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid } = req.params

		//find-user-movie-comment-link
		const comment = await Comment.findOne({ movie: mid, commentedBy: id })
		if (!comment) return res.status(200).json({ value: false })

		res.status(200).json({ value: true, cid: comment._id })
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @body   ---
const getCommentsForUser = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find user and populate

		const user = await User.findById(id).populate({
			path: "comments",
			populate: { path: "movie", select: "name image rating" },
		})
		if (!user) return res.status(400).json({ error: "Error finding the user" })

		res.status(200).json(user.comments)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header ---
// @params   ---  mid
const getCommentsForMovie = async (req, res, next) => {
	try {
		const { mid } = req.params

		//find movie and populate
		const movie = await Movie.findById(mid).populate({
			path: "comments",
			populate: { path: "commentedBy", select: "image name" },
		})
		if (!movie)
			return res.status(400).json({ error: "Error finding the movie" })

		res.status(200).json(movie.comments)
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header --- user-token
// @body   --- mid,text
const addComment = async (req, res, next) => {
	try {
		const { id } = req.meta
		const { mid, text } = req.body

		//storing
		let cid = null

		//check if commented
		if ((await Comment.findOne({ movie: mid, commentedBy: id })) !== null)
			return res.status(400).json({ error: "Already commented by the user" })

		// find-movie
		const movie = await Movie.findById(mid)
		if (!movie)
			return res.status(400).json({ error: "Error finding the movie" })

		// find-user
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "Error finding the user" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//create comment
			const comment = new Comment({ text })

			//linking
			comment.commentedBy = id
			comment.movie = mid
			await comment.save({ session })
			cid = comment._id

			movie.comments.push(comment._id)
			user.comments.push(comment._id)

			await movie.save({ session })
			await user.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			console.log(err)
			return res.status(400).json({ error: "Error creating the comment" })
		}
		await session.commitTransaction()
		session.endSession()
		res.status(201).json({ message: "Comment added", cid: cid })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- user-token
// @body   --- cid,text
const modifyComment = async (req, res, next) => {
	try {
		const { cid, text } = req.body

		//find-rating
		const comment = await Comment.findById(cid)
		if (!comment)
			return res.status(400).json({ error: "Error finding the comment" })

		//modify
		comment.text = text
		comment.save()

		res.status(200).json({ message: "Comment Modified" })
	} catch (err) {
		next(err)
	}
}

// @method ---  DELETE
// @header --- user-token
// @params   --- cid
const deleteCommentById = async (req, res, next) => {
	try {
		const { cid } = req.params

		//find-rating
		const comment = await Comment.findById(cid)
		if (!comment)
			return res.status(400).json({ error: "Error finding the comment" })

		// find-movie
		const movie = await Movie.findById(comment.movie)
		if (!movie)
			return res.status(400).json({ error: "Error finding the movie" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//remove
			movie.comments.pull(comment._id)
			await movie.save({ session })
			await comment.remove({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error deleting the comment" })
		}
		await session.commitTransaction()
		session.endSession()

		res.status(202).json({ message: "Comment deleted" })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	hasUserCommentedMovie,
	getCommentsForMovie,
	getCommentsForUser,
	addComment,
	modifyComment,
	deleteCommentById,
}
