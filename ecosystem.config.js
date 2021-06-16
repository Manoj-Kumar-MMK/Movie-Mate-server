module.exports = {
	apps: [
		{
			name: "Movie-Mate",
			script: "app.js",
			instances: "max",
			exec_mode: "cluster",
		},
	],
}
