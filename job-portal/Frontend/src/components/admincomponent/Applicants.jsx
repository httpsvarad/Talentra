import React, { useEffect } from "react";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";
import { APPLICATION_API_ENDPOINT, JOB_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import { Badge } from "../ui/badge";
import { Users } from "lucide-react";
import Score85Table from "./Score85Table";
import { useState } from "react";
import TopNTable from "./TopNTable";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  const [showApplicants, setShowApplicants] = useState(true);
  const [showScore85, setShowScore85] = useState(false);
  const [showTopN, setShowTopN] = useState(false);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_ENDPOINT}/${params.id}/applicants`,
          { withCredentials: true }
        );
        dispatch(setAllApplicants(res.data.job));
        console.log(res.data.job);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllApplicants();
  }, []);

  // console.log("Positions", applicants?.position);

  return (
    <div className="mx-5">
      <Navbar />
      <div className="max-w-7xl mt-5 mx-auto">

        <div className="flex gap-3">

          <div onClick={() => { setShowApplicants(true); setShowScore85(false); setShowTopN(false) }} className="cursor-pointer">
          <Badge variant="secondary" className="bg-blue-50 text-[13px] text-blue-700 border-blue-200 hover:bg-blue-100">
            {/* <Users className="h-4 w-4 mr-[7px]" /> */}
            Total Applications [&nbsp;<em>{applicants?.applications?.length}</em>&nbsp;]
          </Badge>
        </div>

        <div onClick={() => { setShowScore85(true); setShowApplicants(false); setShowTopN(false) }} className="cursor-pointer">
          <Badge variant="secondary" className="bg-blue-50 text-[13px] text-blue-700 border-blue-200 hover:bg-blue-100">
          {/* <Users className="h-4 w-4 mr-[7px]" /> */}
          Score 85+
        </Badge>
        </div>

        <div onClick={() => { setShowTopN(true); setShowApplicants(false); setShowScore85(false) }} className="cursor-pointer">
          <Badge variant="secondary" className="bg-blue-50 text-[13px] text-blue-700 border-blue-200 hover:bg-blue-100">
          {/* <Users className="h-4 w-4 mr-[7px]" /> */}
          Top {applicants?.position * 5}
        </Badge>
        </div>

        </div>

        {showApplicants && <ApplicantsTable />}
        {showScore85 && <Score85Table />}
        {showTopN && <TopNTable job_title={applicants?.title} />}
      </div>
    </div>
  );
};

export default Applicants;
