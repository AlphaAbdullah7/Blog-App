const dotenv = require("dotenv").config();

const PORT = process.env.PORT;
const MONGO_DB_URI = process.env.MONGO_DB_URI;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

module.exports = {
	PORT,
	MONGO_DB_URI,
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET,
};
