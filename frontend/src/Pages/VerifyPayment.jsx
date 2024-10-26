import React, { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loader from "../Components/loader/Loader";
import { AppContext } from "../Context/AppContext";
import axios from "axios";

const VerifyPayment = () => {
   const { token, backendUrl } = useContext(AppContext);
   const navigate = useNavigate();
   const [serchParams, setSearchParams] = useSearchParams();
   const success = serchParams.get("success");
   const orderId = serchParams.get("orderId");

   const paymentVerify = async () => {
      const { data } = await axios.post(
         backendUrl + "/api/user/verify",
         { orderId, success },
         { headers: { token } }
      );

      if (data.success) {
         navigate("/my-appointments");
      } else {
         navigate("/");
      }
   };

   useEffect(() => {
      paymentVerify();
   }, []);

   return (
      <div className="min-h-screen">
         <Loader />
      </div>
   );
};

export default VerifyPayment;
