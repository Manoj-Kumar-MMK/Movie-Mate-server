const axios = require("axios")
require("dotenv").config()

const uploadImage = async (req, res, next) => {
	try {
		const result = await axios.post(process.env.IMAGE_URL, {
			file: req.body.image,
			upload_preset: process.env.IMAGE_PRESET,
		})
		res.locals.image = result.data.url
	} catch (err) {
		console.log(err)
		return res.status(400).json({ error: "Error uploading the image" })
	}
	next()
}

module.exports = uploadImage
