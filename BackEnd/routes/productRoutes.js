
const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// GET ALL AVAILABLE PRODUCTS
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({
            isAvailable: true
        }).sort({ name: 1 });

        res.json(products);

    } catch (error) {
        console.error("Fetch products error:", error);

        res.status(500).json({
            message: "Unable to retrieve products."
        });
    }
});

// GET A SINGLE PRODUCT BY SLUG
router.get("/:slug", async (req, res) => {
    try {
        const product = await Product.findOne({
            slug: req.params.slug,
            isAvailable: true
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found."
            });
        }

        res.json(product);

    } catch (error) {
        console.error("Fetch product error:", error);

        res.status(500).json({
            message: "Unable to retrieve product."
        });
    }
});

module.exports = router;
