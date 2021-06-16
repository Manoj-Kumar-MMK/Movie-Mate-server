const router = require("express").Router()
const multer = require("multer")
//Middlewares
const dest = require("../middlewares/dest")
const uploadImage = require("../middlewares/uploadImage")
const auth = require("../middlewares/auth")
const validate = require("../middlewares/validate")

//Controllers
const {
	getStudioDetails,
	getStudioFollowers,
	getAllStudios,
	login,
	signup,
	updateDetails,
	updateImage,
	deleteStudio,
	checkStudioEmailTaken,
} = require("../controllers/studio")

//Schemas
const {
	loginSchema,
	signupSchema,
	modifySchema,
} = require("../validations/studio")

//   NO AUTH
router.get("/taken/:email", checkStudioEmailTaken)
router.get("/search", getAllStudios)

router.post("/signup", validate(signupSchema), uploadImage, signup)
router.post("/login", validate(loginSchema), login)

//   AUTH
router.use(auth("studio"))

router.get("/", getStudioDetails)
router.get("/users", getStudioFollowers)

router.patch("/", validate(modifySchema), updateDetails)
router.patch("/image", uploadImage, updateImage)

router.delete("/", deleteStudio)

module.exports = router
