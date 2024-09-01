const express = require("express");
const { PORT } = require("./config");
const dbConnect = require("./database");
const router = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.use(router);

dbConnect();

app.use(errorHandler);

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
