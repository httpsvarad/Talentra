import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Share2,
  Bookmark,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  Building2,
  FileText,
  Upload,
  IndianRupee,
  Ban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Badge } from "../ui/badge";
// import { Button } from "../ui/button";
import { useParams } from "react-router-dom";
import { JOB_API_ENDPOINT, APPLICATION_API_ENDPOINT } from "@/utils/data";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob } from "@/redux/jobSlice";
import { toast } from "sonner";
import Groq from 'groq-sdk';
import pdfToText from 'react-pdftotext';

const Description = () => {

  //apikey

  const groq = new Groq({
    dangerouslyAllowBrowser: true,
    apiKey: api,
  });

  const params = useParams();
  const jobId = params.id;

  const { singleJob } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((store) => store.auth);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const isIntiallyApplied =
    singleJob?.application?.some(
      (application) => application.applicant === user?._id
    ) || false;
  const [isApplied, setIsApplied] = useState(isIntiallyApplied);

  const [resumeFile, setResumeFile] = useState(null);

  const [coverLetter, setCoverLetter] = useState("");

  // const [overallScore, setOverallScore] = useState();

  // const [skillsMatchScore, setSkillsMatchScore] = useState();

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
    }
  };

  const getText = async (file) => {
    try {
      const text = await pdfToText(file);
      return text;
    } catch (error) {
      console.error('Failed to extract text from PDF:', error);
      return null;
    }
  }

  const getResumeAnalysis = async () => {

    if (!resumeFile) {
      alert('Please upload a resume file.');
      return;
    }

    setLoading(true);

    try {
      const resumeText = await getText(resumeFile);

      if (!resumeText.trim()) {
        toast.error('Error, Upload Resume Again', {
          // position: 'top-right',
        });
        setLoading(false);
        return;
      }

      const prompt = `
    You are an AI Resume Analyzer. Analyze the following resume against the provided job description and skill requirements and return a response in strict JSON format as per the schema below. Analyze the resume STRICTLY based on the job description. Return the overall score based on how well the resume matches the job description and requirements. The score should be a number between 0 and 100, where 0 means no match at all and 100 means a perfect match. Don't consider any other factors like formatting, education, etc. Focus only on the skills, requirements and job description.
    
    Respond ONLY with the JSON object. if the resume scores less than 85, include reason for rejection, otherwise return an empty string for rejectReason. The reason should be a conscise explanation of why the resume did not meet the requirements, such as missing key skills or qualifications and what could be improved.
    
    Schema:
    {
      "overall_score": number (0 to 100)
      "rejectReason": string (optional)
    }
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${singleJob.description}

    Requirements:
    ${singleJob.requirements.join(", ")}

    Note:
    - If the job description lists a requirement using "such as", "like", or "e.g." with multiple alternative tools/skills (e.g. "React, Angular, or Vue.js"), treat the requirement as satisfied if the resume includes ANY ONE of the listed options.
    `;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content);
      console.log('Analysis Result:', result);
      toast.success('Analysis complete.');
      return result; // ✅ return result

    } catch (error) {
      console.error('Failed to analyze resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // const applyJobHandler = async () => {
  //   try {
  //     getResumeAnalysis(); // returns { overall_score, skills_match_score }

  //     const res = await axios.post(
  //       `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
  //       {
  //         overall_score: analysisResult.overall_score,
  //         skills_match_score: analysisResult.skills_match_score,
  //         coverLetter: coverLetter,
  //       },
  //       { withCredentials: true }
  //     );
  //     // const res = await axios.get(
  //     //   `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
  //     //   { withCredentials: true }
  //     // );
  //     if (res.data.success) {
  //       setIsApplied(true);
  //       const updateSingleJob = {
  //         ...singleJob,
  //         applications: [...singleJob.applications, { applicant: user?._id }],
  //       };
  //       dispatch(setSingleJob(updateSingleJob));
  //       console.log(res.data);
  //       toast.success(res.data.message);
  //     }
  //   } catch (error) {
  //     console.log(error.message);
  //     toast.error(error.response.data.message);
  //   }
  // };

  const applyJobHandler = async () => {
    try {

      const analysis = await getResumeAnalysis();

      if (!analysis || analysis.overall_score == null) {
        toast.error("Analysis NULL!");
        return;
      }

      const res = await axios.post(
        `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
        {
          resumeScore: analysis.overall_score,
          rejectReason: analysis.rejectReason || "",
          coverLetter,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsApplied(true);
        const updateSingleJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updateSingleJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data?.message || 'Application failed.');
    }
  };


  useEffect(() => {
    const fetchSingleJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${JOB_API_ENDPOINT}/get/${jobId}`, {
          withCredentials: true,
        });
        console.log("API Response:", res.data);
        if (res.data.status) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job.applications.some(
              (application) => application.applicant === user?._id
            )
          );
        } else {
          setError("Failed to fetch jobs.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleJobs();
  }, [jobId, dispatch, user?._id]);

  // console.log("single jobs", singleJob);

  if (!singleJob) {
    return <div>Loading...</div>;
  }

  return (
    // <div>
    //   <div className="max-w-7xl mx-auto my-10 ">
    //     <div className="flex items-center justify-between">
    //       <div>
    //         <h1 className="font-bold text-xl ">{singleJob?.title}</h1>
    //         <div className=" flex gap-2 items-center mt-4 ">
    //           <Badge className={" text-blue-600 font-bold"} variant={"ghost"}>
    //             {singleJob?.position} Open Positions
    //           </Badge>
    //           <Badge className={" text-[#FA4F09] font-bold"} variant={"ghost"}>
    //             {singleJob?.salary}LPA
    //           </Badge>
    //           <Badge className={" text-[#6B3AC2]  font-bold"} variant={"ghost"}>
    //             {singleJob?.location}
    //           </Badge>
    //           <Badge className={" text-black font-bold"} variant={"ghost"}>
    //             {singleJob?.jobType}
    //           </Badge>
    //         </div>
    //       </div>
    //       <div>
    //         <Button
    //           onClick={isApplied ? null : applyJobHandler}
    //           disabled={isApplied}
    //           className={`rounded-lg ${
    //             isApplied
    //               ? "bg-gray-600 cursor-not-allowed"
    //               : "bg-[#6B3AC2] hover:bg-[#552d9b]"
    //           }`}
    //         >
    //           {isApplied ? "Already Applied" : "Apply"}
    //         </Button>
    //       </div>
    //     </div>
    //     <h1 className="border-b-2 border-b-gray-400 font-medium py-4">
    //       {singleJob?.description}
    //     </h1>
    //     <div className="my-4">
    //       <h1 className="font-bold my-1 ">
    //         Role:{" "}
    //         <span className=" pl-4 font-normal text-gray-800">
    //           {singleJob?.position} Open Positions
    //         </span>
    //       </h1>
    //       <h1 className="font-bold my-1 ">
    //         Location:{" "}
    //         <span className=" pl-4 font-normal text-gray-800">
    //           {" "}
    //           {singleJob?.location}
    //         </span>
    //       </h1>
    //       <h1 className="font-bold my-1 ">
    //         Salary:{" "}
    //         <span className=" pl-4 font-normal text-gray-800">
    //           {singleJob?.salary} LPA
    //         </span>
    //       </h1>
    //       <h1 className="font-bold my-1 ">
    //         Experience:{" "}
    //         <span className=" pl-4 font-normal text-gray-800">
    //           {singleJob?.experienceLevel} Years
    //         </span>
    //       </h1>
    //       <h1 className="font-bold my-1 ">
    //         Total Applicants:{" "}
    //         <span className=" pl-4 font-normal text-gray-800">
    //           {singleJob?.applications?.length}
    //         </span>
    //       </h1>
    //       <h1 className="font-bold my-1 ">
    //         Job Type:
    //         <span className=" pl-4 font-normal text-gray-800">
    //           {singleJob?.jobType}
    //         </span>
    //       </h1>
    //       <h1 className="font-bold my-1 ">
    //         Post Date:
    //         <span className=" pl-4 font-normal text-gray-800">
    //           {singleJob?.createdAt.split("T")[0]}
    //         </span>
    //       </h1>
    //     </div>
    //   </div>
    // </div>

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/jobs">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
              </Button>
            </a>
            <div className="flex items-center gap-2">
              {/* <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 className="h-4 w-4" />
                Share
              </Button> */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center gap-2 ${isBookmarked ? "bg-blue-50 text-blue-600 border-blue-200" : ""}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                {isBookmarked ? "Saved" : "Save"}
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  {/* <Avatar className="h-16 w-16 border-2 border-slate-200">
                    <AvatarImage src="https://placehold.co/100x100" alt="Logo" />
                    <AvatarFallback>{singleJob.title?.slice(0, 2)}</AvatarFallback>
                  </Avatar> */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900 mb-5">
                      {singleJob.title}
                    </h1>
                    {/* <div className="flex items-center gap-2 text-lg text-slate-600 mb-4">
                      <Building2 className="h-5 w-5" />
                      <span className="font-medium">Company Name</span>
                      <span className="text-slate-400">•</span>
                      <span>{singleJob.company?.name}</span>
                    </div> */}
                    <div className="flex flex-wrap gap-3 mb-3">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        {/* <Users className="h-4 w-4" /> */}
                        {singleJob.position} positions
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        {/* <DollarSign className="h-4 w-4" /> */}
                        {singleJob.salary} LPA
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                        {/* <MapPin className="h-4 w-4" /> */}
                        {singleJob.location}
                      </Badge>
                      <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                        {/* <Briefcase className="h-4 w-4" /> */}
                        {singleJob.jobType}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(singleJob.tags || []).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h2 className="text-xl mb-3 font-semibold text-slate-900">About this role</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-600">{singleJob.description}</p>
                {/* <Separator /> */}
                {singleJob.requirements?.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-slate-900">Requirements</h3>
                    <div className="flex gap-3 flex-wrap">
                      {singleJob.requirements.map((req, i) => (
                        <div key={i}>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {req}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {/* <Separator /> */}
                  </>
                )}

                <div>
                  <h3 className="text-lg py-3 font-semibold text-slate-900">Perks & Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Flexible Work Hours
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Health Insurance & Wellness Benefits
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Team Retreats and Development Budget
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* <Card className="border-0 shadow-lg top-24">
              <CardContent className="p-6">
                <Button
                  onClick={applyJobHandler}
                  disabled={isApplied || loading}
                  className={`w-full h-12 ${isApplied
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying...
                    </div>
                  ) : isApplied ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Applied
                    </div>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
              </CardContent>
            </Card> */}

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <h3 className="text-lg mb-3 font-semibold">Job Info</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>{singleJob.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee className="h-5 w-5 text-green-500" />
                  <span>{singleJob.salary} LPA</span>
                </div>
                {/* <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <span>{singleJob.experienceLevel} Years</span>
                </div> */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-orange-500" />
                  <span>{singleJob.applications?.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-teal-500" />
                  <span>{formatDate(singleJob.createdAt)}</span>
                </div>



                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {/* <FileText className="w-6 h-6 text-blue-600" /> */}
                    <h2 className="text-lg font-semibold">Upload Resume</h2>
                  </div>
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors duration-200">
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="sr-only"
                            onChange={handleResumeUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                  </div>
                  {resumeFile && (
                    <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Selected file: {resumeFile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {/* <Briefcase className="w-6 h-6 text-blue-600" /> */}
                    <h2 className="text-lg font-semibold">Cover Letter</h2>
                  </div>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    className="mt-2 p-2 block resize-none w-full rounded-xl border-[1px] border-gray-300 shadow-sm sm:text-sm"
                    placeholder="Provide your cover letter here - "
                  />
                </div>


                { singleJob.isActive==false ? (
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                      <Ban className="h-5 w-5 text-red-500" />
                      <span className="text-slate-700 font-semibold">Job Expired</span>
                    </div>
                  </div>
                ) : (
                  <Button
                  onClick={applyJobHandler}
                  disabled={isApplied || loading || !resumeFile || !coverLetter}
                  className={`w-full h-12 ${isApplied
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : isApplied ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Applied
                    </div>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
                )}



                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Description;








// import React, { useState } from "react";
// import {
//   ArrowLeft,
//   Share2,
//   Bookmark,
//   MapPin,
//   DollarSign,
//   Clock,
//   Users,
//   Briefcase,
//   Calendar,
//   CheckCircle,
//   Building2,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// // import { Separator } from "@/components/ui/separator";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { useSelector } from "react-redux";

// const JobDescription = () => {
//   const { singleJob } = useSelector((state) => state.job);
//   const { user } = useSelector((state) => state.auth);
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [isApplied, setIsApplied] = useState(
//     singleJob?.applications?.some((app) => app.applicant === user?._id) || false
//   );
//   const [loading, setLoading] = useState(false);

//   const handleApply = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setIsApplied(true);
//       setLoading(false);
//     }, 1000);
//   };

//   const formatDate = (dateString) =>
//     new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });


//   if (!singleJob) return <div>Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <Button variant="ghost" size="sm" className="flex items-center gap-2">
//               <ArrowLeft className="h-4 w-4" />
//               Back to Jobs
//             </Button>
//             <div className="flex items-center gap-2">
//               {/* <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => navigator.clipboard.writeText(window.location.href)}>
//                 <Share2 className="h-4 w-4" />
//                 Share
//               </Button> */}
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setIsBookmarked(!isBookmarked)}
//                 className={`flex items-center gap-2 ${isBookmarked ? "bg-blue-50 text-blue-600 border-blue-200" : ""}`}
//               >
//                 <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
//                 {isBookmarked ? "Saved" : "Save"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Job Header */}
//             <Card className="border-0 shadow-lg">
//               <CardContent className="p-8">
//                 <div className="flex items-start gap-6">
//                   {/* <Avatar className="h-16 w-16 border-2 border-slate-200">
//                     <AvatarImage src="https://placehold.co/100x100" alt="Logo" />
//                     <AvatarFallback>{singleJob.title?.slice(0, 2)}</AvatarFallback>
//                   </Avatar> */}
//                   <div className="flex-1">
//                     <h1 className="text-3xl font-bold text-slate-900 mb-5">
//                       {singleJob.title}
//                     </h1>
//                     {/* <div className="flex items-center gap-2 text-lg text-slate-600 mb-4">
//                       <Building2 className="h-5 w-5" />
//                       <span className="font-medium">Company Name</span>
//                       <span className="text-slate-400">•</span>
//                       <span>{singleJob.company?.name}</span>
//                     </div> */}
//                     <div className="flex flex-wrap gap-3 mb-3">
//                       <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
//                         {/* <Users className="h-4 w-4" /> */}
//                         {singleJob.position} positions
//                       </Badge>
//                       <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
//                         {/* <DollarSign className="h-4 w-4" /> */}
//                         {singleJob.salary} LPA
//                       </Badge>
//                       <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
//                         {/* <MapPin className="h-4 w-4" /> */}
//                         {singleJob.location}
//                       </Badge>
//                       <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
//                         {/* <Briefcase className="h-4 w-4" /> */}
//                         {singleJob.jobType}
//                       </Badge>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {(singleJob.tags || []).map((tag, index) => (
//                         <Badge key={index} variant="outline" className="text-xs">
//                           {tag}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Description */}
//             <Card className="border-0 shadow-lg">
//               <CardHeader>
//                 <h2 className="text-xl font-semibold text-slate-900">About this role</h2>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <p className="text-slate-600">{singleJob.description}</p>
//                 {/* <Separator /> */}
//                 {singleJob.requirements?.length > 0 && (
//                   <>
//                     <h3 className="text-lg font-semibold text-slate-900">Requirements</h3>
//                    <div className="flex gap-3 flex-wrap">
//                       {singleJob.requirements.map((req, i) => (
//                         <div key={i}>
//                           <Badge variant="secondary" className="whitespace-nowrap">
//                             {req}
//                           </Badge>
//                         </div>
//                       ))}
//                     </div>
//                     {/* <Separator /> */}
//                   </>
//                 )}

//                 <div>
//                   <h3 className="text-lg py-3 font-semibold text-slate-900">Perks & Benefits</h3>
//                   <ul className="space-y-3">
//                     <li className="flex items-start gap-3 text-slate-600">
//                       <CheckCircle className="h-5 w-5 text-green-500" />
//                       Flexible Work Hours
//                     </li>
//                     <li className="flex items-start gap-3 text-slate-600">
//                       <CheckCircle className="h-5 w-5 text-green-500" />
//                       Health Insurance & Wellness Benefits
//                     </li>
//                     <li className="flex items-start gap-3 text-slate-600">
//                       <CheckCircle className="h-5 w-5 text-green-500" />
//                       Team Retreats and Development Budget
//                     </li>
//                   </ul>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             <Card className="border-0 shadow-lg top-24">
//               <CardContent className="p-6">
//                 <Button
//                   onClick={handleApply}
//                   disabled={isApplied || loading}
//                   className={`w-full h-12 ${isApplied
//                       ? "bg-green-100 text-green-700 cursor-default"
//                       : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
//                     }`}
//                 >
//                   {loading ? (
//                     <div className="flex items-center gap-2">
//                       <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                       Applying...
//                     </div>
//                   ) : isApplied ? (
//                     <div className="flex items-center gap-2">
//                       <CheckCircle className="h-5 w-5" />
//                       Applied
//                     </div>
//                   ) : (
//                     "Apply Now"
//                   )}
//                 </Button>
//               </CardContent>
//             </Card>

//             <Card className="border-0 shadow-lg">
//               <CardHeader>
//                 <h3 className="text-lg font-semibold">Job Info</h3>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center gap-3">
//                   <MapPin className="h-5 w-5 text-blue-500" />
//                   <span>{singleJob.location}</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <DollarSign className="h-5 w-5 text-green-500" />
//                   <span>{singleJob.salary} LPA</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Clock className="h-5 w-5 text-purple-500" />
//                   <span>{singleJob.experienceLevel} yrs</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Users className="h-5 w-5 text-orange-500" />
//                   <span>{singleJob.applications?.length} applicants</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Calendar className="h-5 w-5 text-teal-500" />
//                   <span>{formatDate(singleJob.createdAt)}</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobDescription;
