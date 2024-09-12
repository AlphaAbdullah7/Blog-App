const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../config");
const RefreshToken = require("../models/token");

class JWTService {
	static signAccessToken(payload, expiry) {
		return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiry });
	}

	static signrefreshToken(payload, expiry) {
		return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiry });
	}

	static verifyAccessToken(token) {
		return jwt.verify(token, ACCESS_TOKEN_SECRET);
	}

	static verifyRefreshToken(token, userId) {
		return jwt.verify(token, REFRESH_TOKEN_SECRET);
	}

	static async storeRefreshToke(token) {
		try {
			const newToken = new RefreshToken({
				token,
				userId,
			});
			await newToken.save();
		} catch (error) {
			console.log(`Error saving token to db : ${error}`);
		}
	}
}

module.exports = JWTService;
