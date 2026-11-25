
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const Product = require("./models/Product");

const products = [
    {
        name: "Jasmine Rice",
        slug: "jasmine",
        image: "images/jasmine.jpg",
        description: "Fragrant, soft, and slightly sticky when cooked. Ideal for daily meals and Asian cuisine. Known for its delicate floral aroma.",
        pricePerKilo: 55,
        benefits: [
            { icon: "🌸", text: "Subtle Floral Aroma" },
            { icon: "☁️", text: "Soft, Fluffy Texture" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🚚", text: "Versatile Cooking" }
        ]
    },
    {
        name: "Black Rice",
        slug: "black",
        image: "images/black.jpg",
        description: "A nutritious whole-grain rice with a rich nutty flavor, chewy texture, and a distinctive dark color.",
        pricePerKilo: 80,
        benefits: [
            { icon: "🌰", text: "Rich Nutty Flavor" },
            { icon: "💚", text: "Nutrient Rich" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🥗", text: "Healthy Meal Option" }
        ]
    },
    {
        name: "Grain Rice",
        slug: "grain",
        image: "images/grain.jpg",
        description: "Wholesome grain rice with a natural taste and satisfying texture. Perfect for everyday family meals at an affordable price.",
        pricePerKilo: 42,
        benefits: [
            { icon: "🌾", text: "Natural Grain" },
            { icon: "🍃", text: "Natural Flavor" },
            { icon: "💰", text: "Budget Friendly" },
            { icon: "🚚", text: "Everyday Cooking" }
        ]
    },
    {
        name: "Glutinous Rice",
        slug: "glutinous",
        image: "images/glutinous.jpg",
        description: "Sticky rice with a soft and chewy texture. Perfect for traditional Filipino delicacies, kakanin, and desserts.",
        pricePerKilo: 75,
        benefits: [
            { icon: "🍡", text: "Perfect for Kakanin" },
            { icon: "☀️", text: "Soft, Sticky Texture" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🍰", text: "Dessert Favorite" }
        ]
    },
    {
        name: "Kuhako Rice",
        slug: "kuhako",
        image: "images/kuhako.jpg",
        description: "A versatile rice variety suitable for everyday meals and different cooking styles. Reliable quality for homes and businesses.",
        pricePerKilo: 75,
        benefits: [
            { icon: "🌱", text: "Quality Grains" },
            { icon: "☁️", text: "Soft Texture" },
            { icon: "🏅", text: "Premium Quality" },
            { icon: "🚚", text: "Everyday Cooking" }
        ]
    }
];

async function seedProducts() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing. Add it to BackEnd/.env before seeding products.");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully!");

        for (const product of products) {
            await Product.findOneAndUpdate(
                { slug: product.slug },
                product,
                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );
        }

        console.log("All five rice products have been seeded successfully!");

    } catch (error) {
        console.error("Product seeding error:", error.message || error);
        process.exitCode = 1;

    } finally {
        try {
            await mongoose.disconnect();
            console.log("MongoDB connection closed.");
        } catch (error) {
            console.error("MongoDB disconnect error:", error.message || error);
            process.exitCode = 1;
        }
    }
}

seedProducts().catch((error) => {
    console.error("Unexpected product seeding error:", error.message || error);
    process.exitCode = 1;
});
