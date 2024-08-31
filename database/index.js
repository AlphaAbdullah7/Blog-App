const mongoose = require("mongoose");
const { MONGO_DB_URI } = require("../config");

const dbConnect = async () => {
	try {
		mongoose.set("strictQuery", false);
		const conn = await mongoose.connect(MONGO_DB_URI);
		console.log(`Database connected through host ${conn.connection.host}`);
	} catch (error) {
		console.log(`Error is: ${error}`);
	}
};

module.exports = dbConnect;
