// import React from "react";
// import {
//     Table,
//     TableBody,
//     TableCaption,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "../ui/table";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { MoreHorizontal } from "lucide-react";
// import { useSelector } from "react-redux";
// import { toast } from "sonner";
// import axios from "axios";
// import { APPLICATION_API_ENDPOINT } from "@/utils/data";
// import { Badge } from "../ui/badge";

// const shortlistingStatus = ["Accepted", "Rejected"];

// const TopNTable = () => {
//     const { applicants } = useSelector((store) => store.application);

//     const statusHandler = async (status, id) => {
//         console.log("called");
//         try {
//             axios.defaults.withCredentials = true;
//             const res = await axios.post(
//                 `${APPLICATION_API_ENDPOINT}/status/${id}/update`,
//                 { status }
//             );
//             console.log(res);
//             if (res.data.success) {
//                 toast.success(res.data.message);
//             }
//         } catch (error) {
//             toast.error(error.response.data.message);
//         }
//     };

//     const filteredApplicants =
//         applicants && applicants?.applications
//             ?.filter((item) => item?.resumeAnalysis?.[0]?.overallScore >= 85)
//             ?.sort((a, b) => (b?.resumeAnalysis?.[0]?.overallScore || 0) - (a?.resumeAnalysis?.[0]?.overallScore || 0))
//             ?.slice(0, applicants?.position * 5) || [];


//     //   console.log("Score",applicants?.applications?.[0]?.resumeAnalysis?.[0]?.overallScore);

//     return (
//         <div>
//             <Table>
//                 <TableCaption></TableCaption>
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead>#</TableHead>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Email</TableHead>
//                         <TableHead>Contact</TableHead>
//                         <TableHead>Score</TableHead>
//                         <TableHead>Resume</TableHead>
//                         {/* <TableHead>Date</TableHead> */}
//                         <TableHead className="text-right">Status</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {filteredApplicants.map((item, index) => (
//                         <tr key={item._id}>
//                             <TableCell>{index + 1}</TableCell>
//                             <TableCell>{item?.applicant?.fullname}</TableCell>
//                             <TableCell>{item?.applicant?.email}</TableCell>
//                             <TableCell>{item?.applicant?.phoneNumber}</TableCell>
//                             <TableCell>{item?.resumeAnalysis[0]?.overallScore}</TableCell>
//                             <TableCell>
//                                 {item.applicant?.profile?.resume ? (
//                                     <a
//                                         className="text-blue-600 cursor-pointer"
//                                         href={item?.applicant?.profile?.resume}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                     >
//                                         Download
//                                         {/* {item?.applicant?.profile?.resume} */}
//                                     </a>
//                                 ) : (
//                                     <span>NA</span>
//                                 )}
//                             </TableCell>
//                             <TableCell className="float-right cursor-pointer">
//                                 <Badge variant="green" className="bg-green-50 text-green-700 border-green-200">
//                                     {/* <Users className="h-4 w-4 mr-[7px]" /> */}
//                                     Auto Shortlisted
//                                 </Badge>
//                             </TableCell>
//                         </tr>
//                     ))}
//                 </TableBody>
//             </Table>
//         </div>
//     );
// };

// export default TopNTable;

import React, { useState } from "react";
import emailjs from '@emailjs/browser';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import { cn } from "@/lib/utils";
import { MailCheck } from "lucide-react";

const shortlistingStatus = ["Accepted", "Rejected"];



const TopNTable = ({ job_title }) => {

    const [inviteSent, setInviteSent] = useState(false);

    const [inviteURL, setInviteURL] = useState("");

    const { applicants } = useSelector((store) => store.application);

    const statusHandler = async (status, id) => {
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(
                `${APPLICATION_API_ENDPOINT}/status/${id}/update`,
                { status }
            );
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    };



    const rejectedEmails =
        applicants?.applications
            ?.filter(
                (item) => item?.resumeAnalysis?.[0]?.overallScore < 85
            )
            ?.map((item) => item?.applicant?.email) || [];

    console.log("Rejected Emails", rejectedEmails);

    const shortlistedEmails =
        applicants?.applications
            ?.filter(
                (item) => item?.resumeAnalysis?.[0]?.overallScore >= 85
            )
            ?.sort(
                (a, b) =>
                    (b?.resumeAnalysis?.[0]?.overallScore || 0) -
                    (a?.resumeAnalysis?.[0]?.overallScore || 0)
            )
            ?.slice(0, (applicants?.position || 1) * 5)
            ?.map((item) => item?.applicant?.email) || [];

    const filteredApplicants =
        applicants?.applications
            ?.filter((item) => item?.resumeAnalysis?.[0]?.overallScore >= 85)
            ?.sort(
                (a, b) =>
                    (b?.resumeAnalysis?.[0]?.overallScore || 0) -
                    (a?.resumeAnalysis?.[0]?.overallScore || 0)
            )
            ?.slice(0, (applicants?.position || 1) * 5) || [];

    const sendEmail = async ({ inviteLink }) => {
        const templateParams = {
            email: shortlistedEmails.join(", "),
            invite_link: inviteLink,
            job_title: job_title,
        };

        try {
            const response = await emailjs.send(
                'service_axlphk9',    // Replace with your EmailJS service ID
                'template_mzikqph',   // Replace with your EmailJS template ID
                templateParams,
                'QLtddYK2wQXv_SbzA'     // Optional if not set globally
            );
            console.log('Email sent successfully:', response.status, response.text);
            toast.success("Interview links sent");
            return true;
        } catch (error) {
            console.error('Failed to send email:', error);
            toast.error("Failed to send interview links");
            return false;
        }
    };


    const sendRejectionEmail = async ({ rejectReason, reject_email }) => {
        const templateParams = {
            email: reject_email,
            job_title: job_title,
            reject_reason: rejectReason,
        };

        try {
            const response = await emailjs.send(
                'service_axlphk9',    // Replace with your EmailJS service ID
                'template_61tuz2y',   // Replace with your EmailJS template ID
                templateParams,
                'QLtddYK2wQXv_SbzA'     // Optional if not set globally
            );
            console.log('Email sent successfully:', response.status, response.text);
            return true;
        } catch (error) {
            console.error('Failed to send email:', error);
            return false;
        }
    };


    const sendRejectEmail = async (rejectedEmails) => {

        try {

            if (!Array.isArray(rejectedEmails) || rejectedEmails.length === 0) {
                console.error("No rejected candidates found");
                // toast.error("No rejected candidates found");
                return;
            }

            for (let index = 0; index < rejectedEmails.length; index++) {

                const email = rejectedEmails[index];

                // axios.defaults.withCredentials = true;
                // const rejectReason = await axios.post(`${APPLICATION_API_ENDPOINT}/reject-reason`, { email });

                console.log("Sending email:", email);
                const rejectReason = await axios.post(
                    "http://localhost:5011/api/application/reject-reason",
                    { email },
                    { withCredentials: true }
                );


                // console.log("Reject Reason", rejectReason.data.rejectReason);

                if (rejectReason.data.success) {
                    const reject_email = email;
                    await sendRejectionEmail({ rejectReason: rejectReason.data.rejectReason, reject_email });
                }

            }

            toast.success("Rejection emails sent");

        } catch (error) {

            console.error("Error sending rejection emails:", error);
            toast.error("Error sending rejection emails!");

        }


    }


    const handleNotifyCandidates = async (e) => {
        e.preventDefault();
        if (shortlistedEmails.length === 0) {
            toast.error("No shortlisted candidates found");
            return;
        }
        if (!inviteURL) {
            toast.error("Invite URL not found");
            return;
        }
        // await sendEmail(inviteURL);
        await sendEmail({ inviteLink: inviteURL });
        await sendRejectEmail(rejectedEmails);
        // toast.success("Interview links sent");
        // document.getElementById('my_modal_3').close();
        setInviteSent(true);
    };



    return (
        <div className="rounded-xl border shadow-sm overflow-hidden mt-4">
            <Table>
                {/* <TableCaption className="text-muted-foreground text-sm py-2">
          Top {applicants?.position * 5 || 5} applicants based on resume score
        </TableCaption> */}
                <TableHeader>
                    <TableRow className="hover:bg-white">
                        <TableCell colSpan={7} className="p-3">
                            <div className="flex items-center justify-between">
                                {/* <button className="btn h-8 btn-soft rounded-lg btn-accent"><MailCheck className="my-auto" size={20} /> Notify Candidates</button> */}
                                <button disabled={inviteSent || shortlistedEmails.length === 0 && rejectedEmails.length === 0} className="btn h-8 btn-soft rounded-lg btn-accent" onClick={() => document.getElementById('my_modal_3').showModal()}><MailCheck className="my-auto" size={20} /> Notify Candidates</button>
                                <dialog id="my_modal_3" className="modal">
                                    <div className="modal-box">
                                        <form method="dialog">
                                            {/* if there is a button in form, it will close the modal */}
                                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                        </form>
                                        <h2 className="font-bold text-lg">Notify Candidates !</h2>
                                        <div>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend">This action will send interview scheduling links to all shortlisted candidates, allowing them to choose their preferred time slots. Candidates who are not shortlisted will receive a formal rejection email.</legend>
                                                {/* <input type="text" className="input border-2 rounded-lg border-solid border-gray-300" placeholder="https://" /> */}
                                            </fieldset>
                                            <form onSubmit={(e) => { handleNotifyCandidates(e) }}>
                                                <div className="join w-full mt-1">
                                                    <input required onChange={(e) => setInviteURL(e.target.value.trim())} className="input border-2 border-r-0 border-solid border-[#00b29e] focus:outline-none join-item" placeholder="https://" />
                                                    <button className="btn btn-accent shadow-none join-item">Submit</button>
                                                </div>
                                            </form>
                                            <p className="mt-2 text-xs text-gray-500">Not scheduled an interview yet? <a target="_blank" className="text-blue-500 font-semibold underline hover:underline" href="http://localhost:3001/events">Schedule Now</a></p>
                                        </div>
                                    </div>
                                </dialog>
                                <div className="flex">
                                    {inviteSent && (
                                        <div className="ml-3 px-2 py-0.5 w-20 rounded-full text-center bg-green-100 text-green-600 text-xs font-medium animate-pulse">
                                            Notified
                                        </div>
                                    )}
                                    <div className="ml-3 px-2 py-0.5 w-24 rounded-full text-center bg-red-100 text-red-600 text-xs font-medium animate-pulse">
                                        AI-Selected
                                    </div>
                                </div>

                            </div>
                        </TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50">
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredApplicants.map((item, index) => (
                        <TableRow key={item._id} className="hover:bg-white">
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item?.applicant?.fullname}</TableCell>
                            <TableCell>{item?.applicant?.email}</TableCell>
                            <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                            <TableCell>
                                <span
                                    className={cn(
                                        "px-2 py-1 text-xs rounded-md font-medium",
                                        item?.resumeAnalysis?.[0]?.overallScore >= 90
                                            ? "text-green-700"
                                            : "text-yellow-700"
                                    )}
                                >
                                    {item?.resumeAnalysis?.[0]?.overallScore}
                                </span>
                            </TableCell>
                            <TableCell>
                                {item?.applicant?.profile?.resume ? (
                                    <a
                                        href={item?.applicant?.profile?.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"

                                    >
                                        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50">
                                            {/* <Users className="h-4 w-4 mr-[7px]" /> */}
                                            Download
                                        </Badge>
                                    </a>
                                ) : (
                                    <span className="text-muted-foreground">NA</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                >
                                    Auto Shortlisted
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TopNTable;
