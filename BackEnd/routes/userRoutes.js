const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { hashSessionToken, requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
    };
}

// REGISTER USER
router.post("/register", async (req, res) => {
    try {
        const { username, password, displayName } = req.body;

        if (typeof username !== "string" || typeof password !== "string" || typeof displayName !== "string" || !username.trim() || !password || !displayName.trim()) {
            return res.status(400).json({
                message: "Username, password, and display name are required."
            });
        }

        if (username.trim().length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters." });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        if (displayName.trim().length > 100) {
            return res.status(400).json({ message: "Display name must be 100 characters or fewer." });
        }

        const normalizedUsername = username.trim();
        const existingUser = await User.findOne({ username: normalizedUsername });

        if (existingUser) {
            return res.status(409).json({ message: "Username is already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            username: normalizedUsername,
            password: hashedPassword,
            displayName: displayName.trim()
        });

        res.status(201).json({
            message: "Registration successful. You can now log in.",
            user: publicUser(user)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username is already taken." });
        }

        console.error("Registration error:", error);
        res.status(500).json({ message: "Unable to register user." });
    }
});

// LOGIN USER
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        const user = await User.findOne({ username: username.trim() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const sessionToken = crypto.randomBytes(32).toString("hex");
        user.sessionTokenHash = hashSessionToken(sessionToken);
        user.sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
        user.loginCount += 1;
        user.lastLogin = new Date();
        await user.save();

        res.json({
            message: "Login successful.",
            token: sessionToken,
            user: publicUser(user)
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Unable to log in." });
    }
});

// GET THE AUTHENTICATED USER'S PROFILE
router.get("/me", requireAuth, (req, res) => {
    res.json({ user: publicUser(req.authUser) });
});

// UPDATE ONLY THE AUTHENTICATED USER'S PROFILE
router.patch("/me", requireAuth, async (req, res) => {
    try {
        const fields = ["displayName", "email", "phone", "address"];
        for (const field of fields) {
            if (req.body[field] !== undefined && typeof req.body[field] !== "string") {
                return res.status(400).json({ message: `${field} must be text.` });
            }
        }

        const updates = {
            displayName: req.body.displayName?.trim(),
            email: req.body.email?.trim().toLowerCase(),
            phone: req.body.phone?.trim(),
            address: req.body.address?.trim()
        };

        if (updates.displayName !== undefined && (!updates.displayName || updates.displayName.length > 100)) {
            return res.status(400).json({ message: "Display name is required and must be 100 characters or fewer." });
        }
        if (updates.email !== undefined && updates.email.length > 254) {
            return res.status(400).json({ message: "Email must be 254 characters or fewer." });
        }
        if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
            return res.status(400).json({ message: "Please provide a valid email address." });
        }
        if (updates.phone !== undefined && updates.phone.length > 50) {
            return res.status(400).json({ message: "Phone number must be 50 characters or fewer." });
        }
        if (updates.address !== undefined && updates.address.length > 500) {
            return res.status(400).json({ message: "Address must be 500 characters or fewer." });
        }

        for (const field of fields) {
            if (updates[field] !== undefined) req.authUser[field] = updates[field];
        }
        await req.authUser.save();

        res.json({ message: "Profile saved.", user: publicUser(req.authUser) });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Unable to save your profile." });
    }
});

// INVALIDATE THE ACTIVE SESSION
router.post("/logout", requireAuth, async (req, res) => {
    try {
        req.authUser.sessionTokenHash = null;
        req.authUser.sessionExpiresAt = null;
        await req.authUser.save();
        res.json({ message: "You have been logged out." });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Unable to log out." });
    }
});

module.exports = router;
