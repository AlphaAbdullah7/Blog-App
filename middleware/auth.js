const JWT = require("../services/JWTService");
const User = require("../models/user");
const UserDto = require("../dto/user");

const auth = async (req, res, next) => {
	try {
		const { refreshToken, accessToken } = req.cookies;

		if (!refreshToken || !accessToken) {
			const error = {
				statu: 401,
				message: "Unauthorized User",
			};
			return next(error);
		}

		let id;
		try {
			id = JWT.verifyAccessToken(accessToken).id;
			console.log(`This is Id ${id}`);
		} catch (error) {
			next(error);
		}

		let user;
		try {
			user = await User.findOne({ _id: id });
		} catch (error) {
			next(error);
		}

		const userDto = new UserDto(user);
		req.user = userDto;
		next();
	} catch (error) {
		next(error);
	}
};

module.exports = auth;
