const router = require("express").Router()

//Middlewares
const auth = require("../middlewares/auth")

//Controllers
const {
	hasUserRatedMovie,
	getRatingsForMovie,
	getRatingsForUser,
	addRating,
	modifyRating,
	deleteRatingById,
} = require("../controllers/rating")

//    NO AUTH
router.get("/movie/:mid", getRatingsForMovie)

//       USER AUTH
router.use(auth("user"))

router.get("/is/:mid", hasUserRatedMovie)
router.get("/user", getRatingsForUser)

router.post("/", addRating)
router.patch("/", modifyRating)

router.delete("/:rid", deleteRatingById)

module.exports = router
