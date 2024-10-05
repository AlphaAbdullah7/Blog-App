const express = require("express");
const authController = require("../controller/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
	res.send("Welcome here");
});

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post("/logout", auth, authController.logout);

router.get("/refresh", authController.refresh);

module.exports = router;
