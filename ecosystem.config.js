module.exports = {
	apps: [
		{
			name: "Movie-Mate",
			script: "app.js",
			instances: "1",
			exec_mode: "cluster",
		},
	],
}
