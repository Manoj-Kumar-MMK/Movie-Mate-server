module.exports = (dest) => (req, res, next) => {
	req.dest = dest
	console.log(req.body)
	next()
}
