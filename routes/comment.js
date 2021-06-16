const router = require("express").Router()

//Middlewares
const auth = require("../middlewares/auth")

//Controllers
const {
	hasUserCommentedMovie,
	getCommentsForMovie,
	getCommentsForUser,
	addComment,
	modifyComment,
	deleteCommentById,
} = require("../controllers/comment")

//    NO AUTH
router.get("/movie/:mid", getCommentsForMovie)

//      USER AUTH
router.use(auth("user"))

router.get("/is/:mid", hasUserCommentedMovie)
router.get("/user", getCommentsForUser)

router.post("/", addComment)
router.patch("/", modifyComment)

router.delete("/:cid", deleteCommentById)

module.exports = router
