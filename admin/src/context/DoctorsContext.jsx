import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
   const backendUrl = import.meta.env.VITE_BACKEND_URL;

   const [dToken, setDToken] = useState(
      localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
   );

   const [appointments, setAppointments] = useState([]);
   const [dashData, setDashData] = useState(false);
   const [profileData, setProfileData] = useState(false);

   const getAppointments = async () => {
      try {
         const { data } = await axios.get(
            backendUrl + "/api/doctor/appointments",
            {
               headers: { dToken },
            }
         );

         console.log(data);

         if (data.success) {
            setAppointments(data.appointments);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         console.error(error);
         toast.error(error.message);
      }
   };

   const completeAppointments = async (appointmentId) => {
      try {
         const { data } = await axios.post(
            backendUrl + "/api/doctor/complate-appointment",
            { appointmentId },
            { headers: { dToken } }
         );

         if (data.success) {
            toast.success(data.message);
            getAppointments();
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         console.error(error);
         toast.error(error.message);
      }
   };

   const cancelAppointments = async (appointmentId) => {
      try {
         const { data } = await axios.post(
            backendUrl + "/api/doctor/cancel-appointment",
            { appointmentId },
            { headers: { dToken } }
         );

         if (data.success) {
            toast.success(data.message);
            getAppointments();
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         console.error(error);
         toast.error(error.message);
      }
   };

   const getDashData = async () => {
      try {
         const { data } = await axios.get(
            backendUrl + "/api/doctor/dashboard",
            { headers: { dToken } }
         );

         if (data.success) {
            setDashData(data.dashData);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         console.error(error);
         toast.error(error.message);
      }
   };

   const getProfileData = async () => {
      try {
         const { data } = await axios.get(backendUrl + "/api/doctor/profile", {
            headers: { dToken },
         });

         if (data.success) {
            setProfileData(data.profileData);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         console.error(error);
         toast.error(error.message);
      }
   };

   const value = {
      backendUrl,
      dToken,
      setDToken,
      appointments,
      getAppointments,
      completeAppointments,
      cancelAppointments,
      dashData,
      setDashData,
      getDashData,
      profileData,
      setProfileData,
      getProfileData,
   };

   return (
      <DoctorContext.Provider value={value}>
         {props.children}
      </DoctorContext.Provider>
   );
};

export default DoctorContextProvider;