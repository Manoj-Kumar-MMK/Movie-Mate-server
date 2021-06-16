const yup = require("yup")

const loginSchema = {
	email: yup
		.string()
		.required("Email is required")
		.email("Please enter a valid email"),
	password: yup
		.string()
		.required("Password is required")
		.max(15, "Too long (8-15 characters allowed)")
		.matches(
			/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
			"Password must contain at least 8 characters, one uppercase, one number and one special case character"
		),
}

const signupSchema = {
	name: yup
		.string()
		.required("Name is required")
		.min(3, "Name must be at least 3 characters"),
	mobile: yup
		.number()
		.typeError("That doesn't look like a phone number")
		.positive("A phone number can't start with a minus")
		.integer("A phone number can't include a decimal point")
		.min(8)
		.required("A phone number is required"),
	email: yup
		.string()
		.required("Email is required")
		.email("Please enter a valid email"),
	password: yup
		.string()
		.required("Password is required")
		.max(15, "Too long (8-15 characters allowed)")
		.matches(
			/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
			"Password must contain at least 8 characters, one uppercase, one number and one special case character"
		),
}

const modifySchema = {
	name: yup
		.string()
		.required("Name is required")
		.min(3, "Name must be at least 3 characters"),
	mobile: yup
		.number()
		.typeError("That doesn't look like a phone number")
		.positive("A phone number can't start with a minus")
		.integer("A phone number can't include a decimal point")
		.min(8)
		.required("A phone number is required"),
}

module.exports = {
	loginSchema,
	signupSchema,
	modifySchema,
}
