const express = require("express");
const { PORT } = require("./config");
const dbConnect = require("./database");
const router = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(router);

app.get("/", (req, res) => {
	res.send("Hello World");
});

dbConnect();

app.use(errorHandler);

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
