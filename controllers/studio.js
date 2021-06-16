const crypt = require("bcrypt")
const jwt = require("jsonwebtoken")
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
// @params   ---  email
const checkStudioEmailTaken = async (req, res, next) => {
	try {
		const { email } = req.params

		//find-user
		const studio = await Studio.findOne({ email })
		if (!studio) return res.status(200).json({ value: false })
		res.status(200).json({ value: true })
	} catch (err) {
		next(err)
	}
}
// @method ---  GET
// @header --- studio-token
// @body   ---
const getStudioDetails = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find-studio
		const studio = await Studio.findById(id, "-_id name email mobile image")
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		res.status(200).json(studio)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header ---
// @query [search]   --- q
const getAllStudios = async (req, res, next) => {
	try {
		//get search params
		const { q } = req.query

		//find-studio
		const studio = await Studio.find(
			{ name: { $regex: new RegExp(q + ".*", "i") } },
			"name image"
		)
		if (!studio || studio.length === 0)
			return res.status(202).json({ error: "No studios" })

		res.status(200).json(studio)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- studio-token
// @body   ---
const getStudioFollowers = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find-studio
		const studio = await Studio.findById(id, "-_id followers").populate(
			"followers",
			"name image"
		)
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		res.status(200).json(studio.followers)
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header ---
// @body   ---  name,email,mobile,password,image
const signup = async (req, res, next) => {
	try {
		//get image
		const { image } = res.locals

		//check email exists
		const { name, email, mobile, password } = req.body
		const exist = await Studio.findOne({ email })
		if (exist)
			return res.status(400).json({ error: "Email already exists" }).end()

		//hash passsword and save
		const hash = await crypt.hash(password, 10)
		const studio = new Studio({
			name,
			email,
			mobile,
			password: hash.toString(),
			image,
		})
		studio.save()

		//jwt-sign
		const token = jwt.sign({ id: studio._id, email }, process.env.JWT_KEY_2, {
			expiresIn: "24hrs",
		})
		if (token) res.status(201).json({ token })
		else
			res.status(500).json({
				error: "Studio created,token creaetion error,try logging in again",
			})
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header ---
// @body   --- email,password
const login = async (req, res, next) => {
	try {
		//check email exists
		const { email, password } = req.body
		const studio = await Studio.findOne({ email })
		if (!studio)
			return res.status(400).json({ error: "No studio found for this email" })

		//validate password
		const isValid = await crypt.compare(password, studio.password)
		if (!isValid) return res.status(400).json({ error: "Password is wrong" })

		//jwt-sign
		const token = jwt.sign({ id: studio._id, email }, process.env.JWT_KEY_2)
		if (token) res.status(200).json({ token })
		else res.status(500).json({ error: "Error Creating token" })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- studio-token
// @body   --- name,mobile
const updateDetails = async (req, res, next) => {
	try {
		//findStudio
		const { id } = req.meta
		const studio = await Studio.findById(id)
		if (!studio)
			return res.status(400).json({ error: "Error finding the studio" })

		//update and save
		for (const [key, value] of Object.entries(req.body)) studio[key] = value
		studio.save()

		res.status(200).json({ message: "Updated Details" })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- studio-token
// @body   --- image
const updateImage = async (req, res, next) => {
	try {
		//get image
		const { image } = res.locals

		// findStudio
		const { id } = req.meta
		const studio = await Studio.findById(id)
		if (!studio)
			return res.status(400).json({ error: "Error finding the studio" })

		//update and save
		studio.image = image
		studio.save()

		res.status(200).json({ message: "Updated Studio Logo" })
	} catch (err) {
		next(err)
	}
}

const deleteStudio = async (req, res, next) => {
	try {
		const { id } = req.meta

		//User
		const studio = await Studio.findById(id)
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//Followers-link
			await Promise.all(
				studio.followers.map(async (id) => {
					let user = await User.findById(id).session(session)
					user.following.pull(studio._id)
					await user.save({ session })
				})
			)
			//Movie-link
			let movies = studio.movies
			await Promise.all(
				movies.map(async (id) => {
					let movie = await Movie.findById(id)

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
							const user = await User.findById(comment.commentedBy).session(
								session
							)

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
					await movie.remove({ session })
				})
			)

			await studio.remove({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error deleting the studio" })
		}
		await session.commitTransaction()
		session.endSession()
		res.status(200).json({ message: "Studio Deleted" })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	checkStudioEmailTaken,
	getStudioDetails,
	getStudioFollowers,
	getAllStudios,
	login,
	signup,
	updateDetails,
	updateImage,
	deleteStudio,
}
