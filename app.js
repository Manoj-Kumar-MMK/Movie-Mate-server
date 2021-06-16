const express = require("express")
const mongoose = require("mongoose")
const morgan = require("morgan")
const path = require("path")
const multer = require("multer")()
const cors = require("cors")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(morgan("dev"))
app.use(express.json({ limit: "10mb" }))
app.use(express.static(path.join(__dirname, "uploads")))
app.use(cors())
//clear cache
app.disable("etag")

const userRouter = require("./routes/user")
const studioRouter = require("./routes/studio")
const movieRouter = require("./routes/movie")
const ratingRouter = require("./routes/rating")
const commentRouter = require("./routes/comment")

app.use("/api/user", userRouter)
app.use("/api/studio", studioRouter)
app.use("/api/movie", movieRouter)
app.use("/api/rating", ratingRouter)
app.use("/api/comment", commentRouter)

app.use((req, res, next) => {
	const error = new Error("Not found")
	error.status = 404
	next(error)
})

app.use((error, req, res, next) => {
	res.status(error.status || 500).json({
		error: error.message || "Internal Server Error",
	})
})

app.listen(PORT, () => console.log(`SERVER STARTED AT----${PORT}`))

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", () => console.log("Db connection error"))
db.once("open", () => console.log("Connected to database---"))
