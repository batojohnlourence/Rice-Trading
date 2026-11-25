const express = require("express");
const Inquiry = require("../models/Inquiry");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// SUBMIT A NEW INQUIRY FOR THE AUTHENTICATED USER
router.post("/", requireAuth, async (req, res) => {
    try {
        const { name, email, message, product } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof message !== "string" ||
            typeof product !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !message.trim() ||
            !product.trim()
        ) {
            return res.status(400).json({
                message: "Name, email, message, and product are required."
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({ message: "Please provide a valid email address." });
        }

        if (
            name.trim().length > 100 ||
            email.trim().length > 254 ||
            message.trim().length > 3000 ||
            product.trim().length > 100
        ) {
            return res.status(400).json({ message: "One or more fields exceed the allowed length." });
        }

        const inquiry = await Inquiry.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            product: product.trim(),
            userId: req.authUser._id
        });

        res.status(201).json({
            message: "Your message has been submitted successfully.",
            inquiryId: inquiry._id
        });
    } catch (error) {
        console.error("Submit inquiry error:", error);
        res.status(500).json({ message: "Unable to submit your message." });
    }
});

// RETURN ONLY INQUIRIES OWNED BY THE AUTHENTICATED USER
router.get("/mine", requireAuth, async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ userId: req.authUser._id })
            .select("-userId")
            .sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        console.error("Fetch user inquiries error:", error);
        res.status(500).json({ message: "Unable to retrieve your inquiries." });
    }
});

module.exports = router;
