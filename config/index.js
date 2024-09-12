const dotenv = require("dotenv").config();

const PORT = process.env.PORT;
const MONGO_DB_URI = process.env.MONGO_DB_URI;

module.exports = {
	PORT,
	MONGO_DB_URI,
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET,
};
