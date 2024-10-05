const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const userDto = require("../dto/user");
const JWTService = require("../services/JWTService");
const RefreshToken = require("../models/token");
const auth = require("../middleware/auth");
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
			const usernameInUse = await User.exists({ username });
			const emailInUse = await User.exists({ email });

			if (usernameInUse) {
				const error = {
					status: 409,
					message: "Username Already in use",
				};
				return next(error);
			}

			if (emailInUse) {
				const error = {
					status: 409,
					message: "Email Already in use",
				};
				return next(error);
			}
		} catch (error) {
			return next(error);
		}

		const hashPassword = await bcrypt.hash(password, 10);

		let accessToken;
		let refreshToken;
		let user;

		try {
			const userToRegister = new User({
				name,
				username,
				email,
				password: hashPassword,
			});

			user = await userToRegister.save();
			accessToken = JWTService.signAccessToken({ id: user.id }, "30m");

			refreshToken = JWTService.signRefreshToken({ id: user.id }, "60m");
		} catch (error) {
			return next(error);
		}

		res.cookie("accessToken", accessToken, {
			maxAge: 1000 * 60 * 60 * 24,
			httpOnly: true,
		});

		res.cookie("refreshToken", refreshToken, {
			maxAge: 1000 * 60 * 60 * 24,
			httpOnly: true,
		});

		await JWTService.storeRefreshToken(refreshToken, user.id);

		const registerUser = new userDto(user);

		return res.status(201).json({ registerUser, auth: true });
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

		const accessToken = JWTService.signAccessToken({ id: user.id }, "30m");
		const refreshToken = JWTService.signRefreshToken({ id: user.id }, "60m");

		try {
			await RefreshToken.updateOne(
				{
					userId: user.id,
				},
				{ token: refreshToken },
				{ upsert: true }
			);
		} catch (error) {
			return next(error);
		}

		res.cookie("accessToken", accessToken, {
			maxAge: 24 * 60 * 60 * 1000,
			httpOnly: true,
		});

		res.cookie("refreshToken", refreshToken, {
			maxAge: 7 * 24 * 60 * 60 * 1000,
			httpOnly: true,
		});

		const loginUser = new userDto(user);

		return res.status(200).json({ loginUser, auth: true });
	},

	async logout(req, res, next) {
		const { refreshToken } = req.cookies;

		try {
			await RefreshToken.deleteOne({ token: refreshToken });
		} catch (error) {
			return next(error);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");

		return res.status(200).json({ user: null, auth: false });
	},

	async refresh(req, res, next) {
		const originalRefreshToken = req.cookies.refreshToken;
		console.log(`This is Refresh Token from Cookies ${originalRefreshToken}`);

		let id;
		try {
			id = JWTService.verifyRefreshToken(originalRefreshToken).id;
			console.log(`This is current id ${id}`);
		} catch (e) {
			const error = {
				status: 401,
				message: "Unauthorized",
			};
			return next(error);
		}

		try {
			const match = RefreshToken.findOne({
				_id: id,
				token: originalRefreshToken,
			});

			if (!match) {
				const error = {
					status: 401,
					message: "Unauthorized",
				};
				return next(error);
			}
		} catch (error) {
			return next(error);
		}

		try {
			const accessToken = JWTService.signAccessToken({ id }, "30m");
			const refreshToken = JWTService.signRefreshToken({ id }, "60m");

			await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

			res.cookie("accessToken", accessToken, {
				maxAge: 24 * 60 * 60 * 1000,
				httpOnly: true,
			});

			res.cookie("refreshToken", refreshToken, {
				maxAge: 7 * 24 * 60 * 60 * 1000,
				httpOnly: true,
			});
		} catch (error) {
			return next(error);
		}

		const user = await User.findOne({ _id: id });
		console.log(`This is User key ${user}`);
		const UserDto = new userDto(user);

		res.status(200).json({ user: UserDto, auth: true });
	},
};

module.exports = authController;
