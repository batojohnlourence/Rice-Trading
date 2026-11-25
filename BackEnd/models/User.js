
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3
        },

        password: {
            type: String,
            required: true
        },

        displayName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },

        phone: {
            type: String,
            trim: true,
            default: ""
        },

        address: {
            type: String,
            trim: true,
            default: ""
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        },

        loginCount: {
            type: Number,
            default: 0
        },

        lastLogin: {
            type: Date,
            default: null
        },

        sessionTokenHash: {
            type: String,
            default: null,
            select: false
        },

        sessionExpiresAt: {
            type: Date,
            default: null,
            select: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
