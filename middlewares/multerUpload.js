const multer = require("multer")
const uuid = require("uuid")

const multerUpload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, "uploads/" + req.dest)
			console.log("file", file)
		},
		filename: (req, file, cb) => {
			cb(null, uuid.v4().toString() + "." + file.type.split("/")[1])
		},
	}),
	fileFilter: (req, file, cb) => {
		switch (file.type) {
			case "image/jpeg":
			case "image/jpg":
			case "image/png":
				cb(null, true)
				break
			default:
				cb(null, false)
		}
	},
})

module.exports = multerUpload
