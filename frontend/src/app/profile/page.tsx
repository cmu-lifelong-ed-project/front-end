'use client'
import axios, { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WhoAmIResponse } from "../api/whoAmI/route";
import { redirect } from "next/dist/server/api-utils";

type CmuBasicInfo = {
  cmuitaccount_name: string;
  cmuitaccount: string;
  student_id?: string;
  prename_id?: string;
  prename_TH?: string;
  prename_EN?: string;
  firstname_TH: string;
  firstname_EN: string;
  lastname_TH: string;
  lastname_EN: string;
  organization_code: string;
  organization_name_TH: string;
  organization_name_EN: string;
  itaccounttype_id: string;
  itaccounttype_TH: string;
  itaccounttype_EN: string;
};

export default function MePage() {
  const router = useRouter();
  const [cmuBasicInfolist, setcmuBasicInfo] = useState<CmuBasicInfo[]>([]);
  const [fullName, setFullName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    //All cookies that belong to the current url will be sent with the request automatically
    //so we don't have to attach token to the request
    //You can view token (stored in cookies storage) in browser devtools (F12). Open tab "Application" -> "Cookies"
    axios
      .get<{}, AxiosResponse<WhoAmIResponse>, {}>("../api/whoAmI")
      .then((response) => {
        if (response.data.ok) {
          const cmuBasicInfoResponse = response.data.cmuBasicInfo;

          {cmuBasicInfoResponse.map((item:CmuBasicInfo) => {
           setFullName(item.firstname_EN + " " + item.lastname_EN);
          })};     

          setcmuBasicInfo(cmuBasicInfoResponse);
        }
      })
      .catch((error: AxiosError<WhoAmIResponse>) => {
        if (!error.response) {
          setErrorMessage(
            "Cannot connect to the network. Please try again later."
          );
        } else if (error.response.status === 401) {
          setErrorMessage("Authentication failed");
        } else if (error.response.data.ok === false) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Unknown error occurred. Please try again later");
        }
      });
  }, []);

  function signOut() {
    //Call sign out api without caring what is the result
    //It will fail only in case of client cannot connect to server
    //Redirect to the logout URL or default page
    //This is left as an exercise for you. Good luck.
    axios.post("../api/signOut").then((response) => {   
      if(response.data.ok) {
         const SignOut = process.env.CMU_ENTRAID_LOGOUT_URL;
         router.push(`${SignOut}`); 
      }else{
        router.push('../');  
      }   
    });
  }

  return (
    <div className="p-3">
        <h1>Hi, {fullName}</h1>
        <h3> CMUAccountBasicInfo_ResponseDto </h3>
        {cmuBasicInfolist.map((item:CmuBasicInfo,key) => {
        return<div key={key}>
                <p>cmuitaccount_name : {item.cmuitaccount_name}</p>
                <p>cmuitaccount : {item.cmuitaccount}</p>
                <p>student_id : {item.student_id? item.student_id : "No Student Id"}</p>
                <p>prename_id : {item.prename_id}</p>
                <p>prename_TH : {item.prename_TH}</p>
                <p>prename_EN : {item.prename_EN}</p>
                <p>firstname_TH : {item.firstname_TH}</p>
                <p>firstname_EN : {item.firstname_EN}</p>
                <p>lastname_TH : {item.lastname_TH}</p>
                <p>lastname_EN : {item.lastname_EN}</p>
                <p>organization_code : {item.organization_code}</p>
                <p>organization_name_TH : {item.organization_name_TH}</p>
                <p>organization_name_EN : {item.organization_name_EN}</p>
                <p>itaccounttype_id : {item.itaccounttype_id}</p>
                <p>itaccounttype_TH : {item.itaccounttype_TH}</p>
                <p>itaccounttype_EN : {item.itaccounttype_EN}</p>
              </div>
        })}
        <p className="text-danger">{errorMessage}</p>
        <button className="btn btn-danger mb-3" onClick={signOut}>
          {errorMessage ? "Go back" : "Sign out"}
        </button>
        <p className="text-muted fs-6">
          This is a protected route. You can try to view this page without token.
          It will fail.
        </p>

    </div>
  );
}
