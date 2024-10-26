import doctorModel from "../models/doctorsModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
   try {
      const { docId } = req.body;

      const docData = await doctorModel.findById(docId);

      await doctorModel.findByIdAndUpdate(docData, {
         available: !docData.available,
      });

      res.json({
         success: true,
         message: "Availability status updated successfully",
      });
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

const doctorList = async (req, res) => {
   try {
      const doctors = await doctorModel
         .find({})
         .select(["-passwords", "-email"]);

      res.json({
         success: true,
         doctors,
      });
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API for doctor login
const loginDoctor = async (req, res) => {
   try {
      const { email, password } = req.body;
      const doctor = await doctorModel.findOne({ email });

      if (!doctor) {
         return res.json({
            success: false,
            message: "Doctor not found",
         });
      }

      const isMatch = await bcrypt.compare(password, doctor.password);

      if (isMatch) {
         const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);

         res.json({
            success: true,
            message: "Doctor logged in successfully",
            token,
         });
      } else {
         return res.json({
            success: false,
            message: "Invalid credentials",
         });
      }
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API to get doctors appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
   try {
      const { docId } = req.body;
      const appointments = await appointmentModel.find({ docId });

      res.json({
         success: true,
         appointments,
      });
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API to mark appointment completed

const appointmentComplete = async (req, res) => {
   try {
      const { docId, appointmentId } = req.body;

      const appointmentData = await appointmentModel.findById(appointmentId);

      if (appointmentData && appointmentData.docId === docId) {
         await appointmentModel.findByIdAndUpdate(appointmentId, {
            isComplated: true,
         });
         return res.json({
            success: true,
            message: "Appointment completed",
         });
      } else {
         return res.json({
            success: false,
            message: "Mark Failed",
         });
      }
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API to cancell appointment

const appointmentCancelled = async (req, res) => {
   try {
      const { docId, appointmentId } = req.body;

      const appointmentData = await appointmentModel.findById(appointmentId);

      if (appointmentData && appointmentData.docId === docId) {
         await appointmentModel.findByIdAndUpdate(appointmentId, {
            cancelled: true,
         });
         return res.json({
            success: true,
            message: "Appointment cancelled",
         });
      } else {
         return res.json({
            success: false,
            message: "Cancellation Failed",
         });
      }
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
   try {
      const { docId } = req.body;

      const appointments = await appointmentModel.find({ docId });

      let earnings = 0;

      appointments.map((item) => {
         if (item.appointments || item.payment) {
            earnings += item.amount;
         }
      });

      let patients = [];
      appointments.map((item) => {
         if (!patients.includes(item.userId)) {
            patients.push(item.userId);
         }
      });

      const dashData = {
         earnings,
         appointments: appointments.length,
         patients: patients.length,
         latestAppointments: appointments.reverse().slice(0, 5),
      };

      res.json({
         success: true,
         dashData,
      });
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API to Get doctor profile for doctor panel
const doctorProfile = async (req, res) => {
   try {
      const { docId } = req.body;
      const profileData = await doctorModel.findById(docId).select("-password");

      res.json({
         success: true,
         profileData,
      });
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API to update doctor profile for doctor panel
const upadateDoctorProfile = async (req, res) => {
   try {
      const { docId, fees, address, available } = req.body;

      await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

      res.json({
         success: true,
         message: "Profile updated successfully",
      });
   } catch (error) {
      console.log(error);
      res.json({
         success: false,
         message: error.message,
      });
   }
};

export {
   changeAvailability,
   doctorList,
   loginDoctor,
   appointmentsDoctor,
   appointmentComplete,
   appointmentCancelled,
   doctorDashboard,
   doctorProfile,
   upadateDoctorProfile,
};
