// import React from "react";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../ui/table";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { MoreHorizontal } from "lucide-react";
// import { useSelector } from "react-redux";
// import { toast } from "sonner";
// import axios from "axios";
// import { APPLICATION_API_ENDPOINT } from "@/utils/data";

// const shortlistingStatus = ["Accepted", "Rejected"];

// const Score85Table = () => {
//   const { applicants } = useSelector((store) => store.application);

//   const statusHandler = async (status, id) => {
//     console.log("called");
//     try {
//       axios.defaults.withCredentials = true;
//       const res = await axios.post(
//         `${APPLICATION_API_ENDPOINT}/status/${id}/update`,
//         { status }
//       );
//       console.log(res);
//       if (res.data.success) {
//         toast.success(res.data.message);
//       }
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   };

// //   console.log("Score",applicants?.applications?.[0]?.resumeAnalysis?.[0]?.overallScore);

//   return (
//     <div>
//       <Table>
//         <TableCaption></TableCaption>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Name</TableHead>
//             <TableHead>Email</TableHead>
//             <TableHead>Contact</TableHead>
//             <TableHead>Score</TableHead>
//             <TableHead>Resume</TableHead>
//             {/* <TableHead>Date</TableHead> */}
//             <TableHead className="text-right">Action</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {applicants && applicants?.applications?.[0]?.resumeAnalysis?.[0]?.overallScore >= 85 && 
//             applicants?.applications?.map((item) => (
//               <tr key={item._id}>
//                 <TableCell>{item?.applicant?.fullname}</TableCell>
//                 <TableCell>{item?.applicant?.email}</TableCell>
//                 <TableCell>{item?.applicant?.phoneNumber}</TableCell>
//                 <TableCell>{item?.resumeAnalysis[0]?.overallScore}</TableCell>
//                 <TableCell>
//                   {item.applicant?.profile?.resume ? (
//                     <a
//                       className="text-blue-600 cursor-pointer"
//                       href={item?.applicant?.profile?.resume}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       Download
//                       {/* {item?.applicant?.profile?.resume} */}
//                     </a>
//                   ) : (
//                     <span>NA</span>
//                   )}
//                 </TableCell>
//                 {/* <TableCell>{item?.applicant?.createdAt.split("T")[0]}</TableCell> */}
//                 <TableCell className="float-right cursor-pointer">
//                   <Popover>
//                     <PopoverTrigger>
//                       <MoreHorizontal />
//                     </PopoverTrigger>
//                     <PopoverContent className="w-32">
//                        {shortlistingStatus.map((status, index) => {
//                           return (
//                             <div
//                               onClick={() => statusHandler(status, item?._id)}
//                               key={index}
//                               className="flex w-fit items-center my-2 cursor-pointer"
//                             >
//                               <input
//                                 type="radio"
//                                 name="shortlistingStatus"
//                                 value={status}
//                                 className="mr-2"
//                               />
//                               <span className="mb-[3px]">{status}</span>
//                             </div>
//                           );
//                         })}
//                       </PopoverContent>
//                   </Popover>
//                 </TableCell>
//               </tr>
//             ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default Score85Table;



import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

const shortlistingStatus = ["Accepted", "Rejected"];

const Score85Table = () => {
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

  const filteredApplicants =
    applicants?.applications?.filter(
      (item) => item?.resumeAnalysis?.[0]?.overallScore >= 85
    ) || [];

  return (
    <div className="rounded-xl border shadow-sm overflow-hidden mt-4">
      <Table>
        {/* <TableCaption className="text-muted-foreground text-sm py-2">
          Applicants with score 85 and above
        </TableCaption> */}
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredApplicants.map((item) => (
            <TableRow key={item._id} className="hover:bg-white">
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
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 rounded-md hover:bg-muted transition">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Update Status
                    </div>
                    {shortlistingStatus.map((status, index) => (
                      <button
                        key={index}
                        onClick={() => statusHandler(status, item._id)}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded-md hover:bg-muted transition text-sm",
                          "flex items-center space-x-2"
                        )}
                      >
                        <span className="h-2 w-2 rounded-full bg-gray-400" />
                        <span>{status}</span>
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Score85Table;

