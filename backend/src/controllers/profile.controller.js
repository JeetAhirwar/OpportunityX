const Profile = require("../models/profile.model");
const { upsertParsedResumeFromUpload } = require("../services/ai.resume.service");
const cloudinaryService = require("../services/cloudinary.service");
const cloudinaryConfig = require("../config/cloudinary");

exports.saveProfile = async (req, res) => {
  let uploaded = null;
  let dbCommitted = false;
  try {
    const existingProfile = await Profile.findOne({ user: req.user._id });

    if (req.file) {
      uploaded = await cloudinaryService.uploadBuffer({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        folder: cloudinaryConfig.folders.resumes,
        resourceType: "raw",
      });
      req.body.resumeUrl = uploaded.secureUrl;
      req.body.resumePublicId = uploaded.publicId;
      req.body.resumeResourceType = uploaded.resourceType;
      req.body.resumeFormat = uploaded.format;
    }

    for (const field of [
      "education",
      "experience",
      "projects",
      "certifications",
      "preferredJobTypes",
      "preferredWorkModes",
      "preferredIndustries",
    ]) {
      if (typeof req.body[field] === "string") {
        req.body[field] = JSON.parse(req.body[field]);
      }
    }

    if (typeof req.body.socials === "string") {
      req.body.socials = JSON.parse(req.body.socials);
    }

    if (req.body.expectedSalaryMin !== undefined) {
      req.body.expectedSalaryMin = Number(req.body.expectedSalaryMin) || 0;
    }

    if (existingProfile) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      dbCommitted = true;

      if (req.file) {
        await upsertParsedResumeFromUpload({
          candidateId: req.user._id,
          resumeUrl: updatedProfile.resumeUrl,
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          fileName: req.file.originalname,
        });

        if (existingProfile.resumePublicId) {
          await cloudinaryService.safeDeleteAsset({
            publicId: existingProfile.resumePublicId,
            resourceType: existingProfile.resumeResourceType || "raw",
          });
        }
      }

      return res.json(updatedProfile);
    }

    const newProfile = await Profile.create({
      ...req.body,
      user: req.user._id,
    });
    dbCommitted = true;

    if (req.file) {
      await upsertParsedResumeFromUpload({
        candidateId: req.user._id,
        resumeUrl: newProfile.resumeUrl,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        fileName: req.file.originalname,
      });
    }

    res.status(201).json(newProfile);
  } catch (error) {
    if (uploaded && !dbCommitted) {
      await cloudinaryService.safeDeleteAsset({
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType || "raw",
      });
    }
    console.error("Profile Save Error:", error);
    res.status(400).json({
      message: "Profile validation failed",
      error: error.message,
    });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile?.resumeUrl) {
      return res.status(404).json({ message: "No resume to delete" });
    }

    if (profile.resumePublicId) {
      await cloudinaryService.safeDeleteAsset({
        publicId: profile.resumePublicId,
        resourceType: profile.resumeResourceType || "raw",
      });
    }

    profile.resumeUrl = "";
    profile.resumePublicId = "";
    profile.resumeResourceType = "";
    profile.resumeFormat = "";
    await profile.save();

    res.json({ message: "Resume deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
