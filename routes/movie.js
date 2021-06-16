const router = require("express").Router()

//Middlewares
const dest = require("../middlewares/dest")
const uploadImage = require("../middlewares/uploadImage")
const auth = require("../middlewares/auth")
const validate = require("../middlewares/validate")

//Controllers
const {
	checkNameTaken,
	getMovieById,
	getStudioMovies,
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
} = require("../controllers/movie")

//Schemas
const { movieSchema, movieModifySchema } = require("../validations/movie")

//    NO   AUTH
router.get("/id/:mid", getMovieById)
router.get("/taken/:name", checkNameTaken)

//  STUDIO AUTH

router.get("/studio", auth("studio"), getStudioMovies)

router.post("/", validate(movieSchema), auth("studio"), uploadImage, addMovie)

router.patch(
	"/id/:mid",
	validate(movieModifySchema),
	auth("studio"),
	modifyMovieById
)
router.patch(
	"/id/image/:mid",
	auth("studio"),
	uploadImage,
	modifyMovieImageById
)

router.delete("/:mid", auth("studio"), deleteMovieById)

//   USER AUTH
router.use(auth("user"))

router.get("/wishlist", getWishlist)
router.get("/watched", getWatched)
router.get("/isWishlist/:mid", isInWishlist)
router.get("/isWatched/:mid", isInWatched)

router.post("/wishlist", addToWishlist)
router.post("/watched", addToWatched)

router.delete("/wishlist/:mid", deleteFromWishList)
router.delete("/watched/:mid", deleteFromWatched)

module.exports = router
