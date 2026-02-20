const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            match: [/^[0-9]{10}$/, "Enter valid 10 digit phone number"],
        },

        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },

        bio: {
            type: String,
            required: [true, "Bio is required"],
            minlength: 20,
        },

        skills: {
            type: [String],
            required: true,
            validate: {
                validator: function (val)
                {
                    return val.length > 0;
                },
                message: "At least one skill is required",
            },
        },

        education: [
            {
                school: {
                    type: String,
                    required: true,
                },
                degree: {
                    type: String,
                    required: true,
                },
                year: {
                    type: String,
                    required: true,
                },
            },
        ],

        experience: [
            {
                company: String,
                role: String,
                duration: String,
                description: String,
            },
        ],

        projects: [
            {
                name: String,
                url: String,
                description: String,
            },
        ],

        socials: {
            linkedin: String,
            github: String,
            portfolio: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);