const router = require("express").Router()

//Middlewares
const dest = require("../middlewares/dest")
const uploadImage = require("../middlewares/uploadImage")
const auth = require("../middlewares/auth")
const validate = require("../middlewares/validate")

//Controllers
const {
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
	checkUserEmailTaken,
} = require("../controllers/user")

//Schemas
const {
	loginSchema,
	signupSchema,
	modifySchema,
} = require("../validations/user")

//   NO AUTH
router.get("/taken/:email", checkUserEmailTaken)

router.post("/signup", validate(signupSchema), uploadImage, signup)
router.post("/login", validate(loginSchema), login)

//   AUTH
router.use(auth("user"))

router.get("/isFollow/:sid", hasUserFollowedStudio)
router.get("/", getUserDetails)
router.get("/studios", getFollowingStudios)

router.patch("/", validate(modifySchema), updateDetails)
router.patch("/image", uploadImage, updateImage)

router.post("/follow", follow)
router.post("/unfollow", unfollow)

router.delete("/", deleteUser)

module.exports = router
