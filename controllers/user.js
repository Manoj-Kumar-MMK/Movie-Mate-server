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
const checkUserEmailTaken = async (req, res, next) => {
	try {
		const { email } = req.params

		//find-user
		const user = await User.findOne({ email })
		if (!user) return res.status(200).json({ value: false })
		res.status(200).json({ value: true })
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @params   --- sid
const hasUserFollowedStudio = async (req, res, next) => {
	try {
		//get-details
		const { id } = req.meta
		const { sid } = req.params

		//find-user
		const user = await User.findById(id, "following")
		if (!user) return res.status(400).json({ error: "User not found" })

		//check-following
		if (user.following.indexOf(sid) === -1)
			return res.status(200).json({ value: false })

		res.status(200).json({ value: true })
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @body   ---
const getUserDetails = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find-user
		const user = await User.findById(id, "-_id name email mobile image")
		if (!user) return res.status(400).json({ error: "User not found" })

		res.status(200).json(user)
	} catch (err) {
		next(err)
	}
}

// @method ---  GET
// @header --- user-token
// @body   ---
const getFollowingStudios = async (req, res, next) => {
	try {
		const { id } = req.meta

		//find-user and populate
		const user = await User.findById(id, "-_id following").populate(
			"following",
			"name image"
		)
		if (!user) return res.status(400).json({ error: "User not found" })
		res.status(200).json(user.following)
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
		const exist = await User.findOne({ email })
		if (exist) return res.status(400).json({ error: "Email already exists" })

		//hash passsword and save
		const hash = await crypt.hash(password, 10)
		const user = new User({
			name,
			email,
			mobile,
			password: hash.toString(),
			image,
		})
		user.save()

		//jwt-sign
		const token = jwt.sign({ id: user._id, email }, process.env.JWT_KEY_1, {
			expiresIn: "24hrs",
		})
		if (token) res.status(201).json({ token })
		else
			res.status(500).json({
				error: "User Created,token creation error,try logging in again",
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
		const user = await User.findOne({ email })
		if (!user)
			return res.status(400).json({ error: "No user found for this email" })

		//validate password
		const isValid = await crypt.compare(password, user.password)
		if (!isValid) return res.status(400).json({ error: "Password is wrong" })

		//jwt-sign
		const token = jwt.sign({ id: user._id, email }, process.env.JWT_KEY_1)
		if (token) res.status(200).json({ token })
		else res.status(500).json({ error: "Error Creating token" })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- user-token
// @body   --- name,mobile
const updateDetails = async (req, res, next) => {
	try {
		//finduser
		const { id } = req.meta
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "Error finding the user" })

		//update and save
		for (const [key, value] of Object.entries(req.body)) user[key] = value
		user.save()

		res.status(200).json({ message: "Updated Details" })
	} catch (err) {
		next(err)
	}
}

// @method ---  PATCH
// @header --- user-token
// @body   --- image
const updateImage = async (req, res, next) => {
	try {
		//get image
		const { image } = res.locals

		// findUser
		const { id } = req.meta
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "Error finding the user" })

		//update and save
		user.image = image
		user.save()

		res.status(200).json({ message: "Updated Profile Picture" })
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header --- user-token
// @body   --- sid
const follow = async (req, res, next) => {
	try {
		//get-details
		const { id } = req.meta
		const { sid } = req.body

		// find-User
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "User not found" })

		// find-Studio
		const studio = await Studio.findById(sid)
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		//Check if following
		if (user.following.indexOf(sid) !== -1)
			return res
				.status(400)
				.json({ error: "You are already following this studio" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//link and save
			user.following.push(sid)
			studio.followers.push(id)
			await user.save({ session })
			await studio.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error following the studio" })
		}
		await session.commitTransaction()
		session.endSession()
		return res.status(200).json({ message: "Started following" })
	} catch (err) {
		next(err)
	}
}

// @method ---  POST
// @header --- user-token
// @body   ---  sid
const unfollow = async (req, res, next) => {
	try {
		//get-details
		const { id } = req.meta
		const { sid } = req.body

		// find-User
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "User not found" })

		// find-Studio
		const studio = await Studio.findById(sid)
		if (!studio) return res.status(400).json({ error: "Studio not found" })

		//Check if following
		if (user.following.indexOf(sid) === -1)
			return res
				.status(400)
				.json({ error: "You are not following this studio" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//link and save
			user.following.pull(sid)
			studio.followers.pull(id)
			await user.save({ session })
			await studio.save({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error unfollowing the studio" })
		}
		await session.commitTransaction()
		session.endSession()
		return res.status(200).json({ message: "Unfollowed" })
	} catch (err) {
		next(err)
	}
}

const deleteUser = async (req, res, next) => {
	try {
		const { id } = req.meta

		//User
		const user = await User.findById(id)
		if (!user) return res.status(400).json({ error: "User not found" })

		const session = await mongoose.startSession()
		try {
			session.startTransaction()

			//Rating-link
			let temp = [...user.ratings]
			await Promise.all(
				temp.map(async (id) => {
					const rating = await Rating.findById(id)
					let movie = await Movie.findById(rating.movie).session(session)

					movie.ratings.pull(rating._id)
					await movie.save({ session })
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
				})
			)

			//Comment-link
			temp = [...user.comments]
			await Promise.all(
				temp.map(async (id) => {
					const comment = await Comment.findById(id)
					const movie = await Movie.findById(comment.movie).session(session)

					movie.comments.pull(comment._id)
					await movie.save({ session })
					await comment.remove({ session })
				})
			)

			//Wishlist
			await Promise.all(
				user.wishlist.map(async (id) => {
					let movie = await Movie.findById(id).session(session)
					movie.wishedBy.pull(user._id)
					await movie.save({ session })
				})
			)

			//Watched
			await Promise.all(
				user.watched.map(async (id) => {
					let movie = await Movie.findById(id).session(session)
					movie.watchedBy.pull(user._id)
					await movie.save({ session })
				})
			)

			//Studio-following
			await Promise.all(
				user.following.map(async (id) => {
					let studio = await Studio.findById(id).session(session)
					studio.followers.pull(user._id)
					await studio.save({ session })
				})
			)

			await user.remove({ session })
		} catch (err) {
			await session.abortTransaction()
			session.endSession()
			return res.status(400).json({ error: "Error deleting the user" })
		}
		await session.commitTransaction()
		session.endSession()
		res.status(200).json({ message: "User Deleted" })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	checkUserEmailTaken,
	hasUserFollowedStudio,
	getUserDetails,
	getFollowingStudios,
	login,
	signup,
	updateImage,
	updateDetails,
	follow,
	unfollow,
	deleteUser,
}
