const Profile = require("../models/Profile");

// CREATE or UPDATE profile
exports.saveProfile = async (req, res) =>
{
    try
    {
        let profile = await Profile.findOne({ user: req.user._id });

        if (profile)
        {
            profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                req.body,
                { new: true }
            );
        }
        else
        {
            profile = await Profile.create({
                ...req.body,
                user: req.user._id
            });
        }

        res.json(profile);
    }
    catch (error)
    {
        res.status(500).json({ message: error.message });
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