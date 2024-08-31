const express = require("express");

const router = express.Router();

module.exports = router.get("/test", (req, res) => {
	res.send("Testing");
});

module.exports = router.post("/register", (req, res) => {});
