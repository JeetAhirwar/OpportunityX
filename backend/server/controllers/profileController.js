const Profile = require("../models/Profile");


exports.saveProfile = async (req, res) =>
{
    try
    {
        const existingProfile = await Profile.findOne({ user: req.user._id });

        // 👉 If resume uploaded, add its path into body
        if (req.file)
        {
            req.body.resumeUrl = req.file.path;
        }

        if (req.body.education)
        {
            req.body.education = JSON.parse(req.body.education);
        }

        if (existingProfile)
        {
            const updatedProfile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: req.body },
                { new: true, runValidators: true } // changed returnDocument to new
            );

            return res.json(updatedProfile);
        }

        const newProfile = await Profile.create({
            ...req.body,
            user: req.user._id,
        });

        res.status(201).json(newProfile);

    } catch (error)
    {
        console.error("Profile Save Error:", error);
        res.status(400).json({
            message: "Profile validation failed",
            error: error.message,
        });
    }
};



// GET profile
exports.getProfile = async (req, res) =>
{
    try
    {
        const profile = await Profile.findOne({ user: req.user._id });

        if (!profile)
            return res.status(404).json({ message: "Profile not found" });

        res.json(profile);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
    }
};