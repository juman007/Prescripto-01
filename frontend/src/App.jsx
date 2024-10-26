import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Doctors from "./Pages/Doctors";
import Login from "./Pages/Login";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import MyProfile from "./Pages/MyProfile";
import MyAppointmen from "./Pages/MyAppointmen";
import Appointment from "./Pages/Appointment";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VerifyPayment from "./Pages/VerifyPayment";

const App = () => {
   return (
      <div className="mx-4 sm:mx-[10%]">
         <ToastContainer />
         <Navbar />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:speciality" element={<Doctors />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/my-appointments" element={<MyAppointmen />} />
            <Route path="/appointment/:docId" element={<Appointment />} />
            <Route path="/verify" element={<VerifyPayment />} />
         </Routes>
         <Footer />
      </div>
   );
};

export default App;
