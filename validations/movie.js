const yup = require("yup")

const movieSchema = {
	name: yup
		.string()
		.required("Movie Name is required")
		.min(5, "Movie Name must be at least 5 characters"),

	description: yup
		.string()
		.required("Description is required")
		.min(15, "Description must be at least 15 characters"),

	genre: yup
		.string()
		.required("Genre is required")
		.min(5, "Genre must be at least 5 characters"),
}

const movieModifySchema = {
	name: yup
		.string()
		.required("Movie Name is required")
		.min(5, "Movie Name must be at least 5 characters"),

	description: yup
		.string()
		.required("Description is required")
		.min(15, "Description must be at least 15 characters"),

	genre: yup
		.string()
		.required("Genre is required")
		.min(5, "Genre must be at least 5 characters"),
}

module.exports = { movieSchema, movieModifySchema }
