const yup = require("yup")

const validate = (shape) => async (req, res, next) => {
	next()
	/* try {
		let val = await yup.object().shape(shape).validate(req.body)
		console.log(val)
		next()
	} catch (err) {
		return res
			.status(400)
			.json({ error: "Invalid credentials", errors: err.errors })
	} */
}

module.exports = validate
