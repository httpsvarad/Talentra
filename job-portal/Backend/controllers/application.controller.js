import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    const { resumeScore, coverLetter, rejectReason } = req.body;
    if (!jobId) {
      return res
        .status(400)
        .json({ message: "Invalid job id", success: false });
    }
    // check if the user already has applied for this job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }
    //check if the job exists or not
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    // create a new application

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
      coverLetter: coverLetter,
      resumeAnalysis: [
        {
          overallScore: resumeScore,
          rejectReason: rejectReason || "",
          // skillsScore: skillsScore,
        },
      ],
    });
    job.applications.push(newApplication._id);
    await job.save();

    return res
      .status(201)
      .json({ message: "Application submitted", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: { path: "company", options: { sort: { createdAt: -1 } } },
      });
    if (!application) {
      return res
        .status(404)
        .json({ message: "No applications found", success: false });
    }

    return res.status(200).json({ application, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: { path: "applicant", options: { sort: { createdAt: -1 } } },
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return res.status(400).json({
        message: "status is required",
        success: false,
      });
    }

    // find the application by applicantion id
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    // update the status
    application.status = status.toLowerCase();
    await application.save();

    return res
      .status(200)
      .json({ message: "Application status updated", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// export const getRejectReason = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({
//         message: "Email is required",
//         success: false,
//       });
//     }

//     const application = await Application.findOne()
//       .populate({
//         path: "applicant",
//         match: { email: email }, // Filter based on email
//       })
//       .populate("job");

//     if (!application) {
//       return res.status(404).json({
//         message: "Application not found for the given email.",
//         success: false,
//       });
//     }

//     const rejectReason = application.resumeAnalysis[0].rejectReason;

//     if (!rejectReason) {
//       return res.status(404).json({
//         message: "No reject reason found for this application.",
//         success: false,
//       });
//     }

//     return res.status(200).json({ rejectReason, success: true });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", success: false });
//   }
// };




export const getRejectReason = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    // Step 1: Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Step 2: Find application where applicant matches user._id
    const application = await Application.findOne({ applicant: user._id });

    if (!application) {
      return res.status(404).json({
        message: "Application not found for this user.",
        success: false,
      });
    }

    const rejectReason = application.resumeAnalysis?.[0]?.rejectReason;

    if (!rejectReason) {
      return res.status(404).json({
        message: "No reject reason found for this application.",
        success: false,
      });
    }

    return res.status(200).json({ rejectReason, success: true });

  } catch (error) {
    console.error("Error in getRejectReason:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
