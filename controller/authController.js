const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// const passwordPattern = /^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]{8,}$/;

const authController = {
	async register(req, res, next) {
		const userRegisterSchema = Joi.object({
			name: Joi.string().min(5).max(25).required(),
			username: Joi.string().min(10).max(30).required(),
			email: Joi.string().email().required(),
			// password: Joi.string().pattern(passwordPattern).required(),
			password: Joi.string().required(),
			confirmPassword: Joi.ref("password"),
		});

		const { error } = userRegisterSchema.validate(req.body);

		if (error) {
			return next(error);
		}

		const { name, username, email, password } = req.body;

		try {
			const emailInUse = await User.exists({ email });
			const usernameInUse = await User.exists({ username });

			if (emailInUse) {
				const error = {
					status: 409,
					message: "Email Already in use",
				};
				return next(error);
			}

			if (usernameInUse) {
				const error = {
					status: 409,
					message: "Username Already in use",
				};
				return next(error);
			}
		} catch (error) {
			return next(error);
		}

		const hashPassword = await bcrypt.hash(password, 10);

		const userToRegister = new User({
			name,
			username,
			email,
			password: hashPassword,
		});

		const user = await userToRegister.save();

		return res.status(201).json({ user });
	},

	async login(req, res, next) {
		const userLoginSchema = Joi.object({
			username: Joi.string().min(10).max(30).required(),
			password: Joi.string().required(),
		});

		const { error } = userLoginSchema.validate(req.body);

		if (error) {
			return next(error);
		}

		const { username, password } = req.body;

		let user;
		try {
			user = await User.findOne({ username });

			if (!user) {
				const error = {
					status: 401,
					message: "Invalid Username",
				};
				return next(error);
			}

			const pass = await bcrypt.compare(password, user.password);

			if (!pass) {
				const error = {
					status: 401,
					message: "Invalid Password",
				};
				return next(error);
			}
		} catch (error) {
			return next(error);
		}

		return res.status(200).json({ user });
	},
};

module.exports = authController;
