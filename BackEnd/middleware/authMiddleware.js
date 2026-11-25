const crypto = require("crypto");
const User = require("../models/User");

function hashSessionToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

async function requireAuth(req, res, next) {
    const authorization = req.get("authorization") || "";
    const match = authorization.match(/^Bearer\s+([a-f\d]{64})$/i);

    if (!match) {
        return res.status(401).json({ message: "Please log in to continue." });
    }

    try {
        const user = await User.findOne({
            sessionTokenHash: hashSessionToken(match[1]),
            sessionExpiresAt: { $gt: new Date() }
        }).select("+sessionTokenHash +sessionExpiresAt");

        if (!user) {
            return res.status(401).json({ message: "Your session has expired. Please log in again." });
        }

        req.authUser = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ message: "Unable to verify your session." });
    }
}

module.exports = { hashSessionToken, requireAuth };
