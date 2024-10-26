import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorsModel.js";
import appointmentModel from "../models/appointmentModel.js";
// import razorpay from "razorpay";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API to register to user
const registerUser = async (req, res) => {
   try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
         return res.json({
            success: false,
            message: "Missing Details",
         });
      }

      // vaalidating email format
      if (!validator.isEmail(email)) {
         return res.json({
            success: false,
            message: "Please enter a valid email",
         });
      }

      // Validating strong password
      if (password.length < 8) {
         return res.json({
            success: false,
            message: "Password must be at least 8 characters long",
         });
      }

      // hashing user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userData = {
         name,
         email,
         password: hashedPassword,
      };

      const newUser = new userModel(userData);
      const user = await newUser.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      res.json({
         success: true,
         message: "User registered successfully",
         token,
      });
   } catch (error) {
      console.log(error);

      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API for user Login

const loginUser = async (req, res) => {
   try {
      const { email, password } = req.body;

      const user = await userModel.findOne({ email });

      if (!user) {
         return res.json({
            success: false,
            message: "User not found",
         });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
         res.json({
            success: true,
            message: "User logged in successfully",
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

// API to get user profile data
const getProfile = async (req, res) => {
   try {
      const { userId } = req.body;
      const userData = await userModel.findById(userId).select("-password");

      res.json({
         success: true,
         userData,
      });
   } catch (error) {
      console.log(error);

      res.json({
         success: false,
         message: error.message,
      });
   }
};

//API to update user profile

const updateProfile = async (req, res) => {
   try {
      const { userId, name, phone, address, dob, gender } = req.body;
      const imageFile = req.file;

      let parsedAddress;
      if (typeof address === "string") {
         try {
            parsedAddress = JSON.parse(address);
         } catch (error) {
            return res
               .status(400)
               .json({ success: false, message: "Invalid address format." });
         }
      }

      if (!name || !phone || !dob || !gender) {
         res.json({
            success: false,
            message: "Missing Details",
         });
      }

      await userModel.findByIdAndUpdate(userId, {
         name,
         phone,
         address: parsedAddress,
         dob,
         gender,
      });

      if (imageFile) {
         // upload image to cloudinary
         const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
         });
         const imageUrl = imageUpload.secure_url;

         await userModel.findByIdAndUpdate(userId, { image: imageUrl });
      }

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

// API to book appointments

// Function to convert 24-hour time to 12-hour format with AM/PM
// const formatTo12Hour = (time) => {
//    const [hours, minutes] = time.split(":").map(Number); // Split and convert to numbers
//    const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM/PM
//    const formattedHours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)
//    const formattedTime = `${formattedHours}:${minutes
//       .toString()
//       .padStart(2, "0")} ${ampm}`; // Format with leading zeros for minutes
//    return formattedTime;
// };

const bookAppointment = async (req, res) => {
   try {
      const { userId, docId, sloteTime, slotDate } = req.body;

      const docData = await doctorModel.findById(docId).select("-password");

      if (!docData.available) {
         return res.json({
            success: false,
            message: "Doctor is not available at the selected time slot",
         });
      }

      let slots_booked = docData.slots_booked;

      // checking  for slot availibility
      if (slots_booked[slotDate]) {
         if (slots_booked[slotDate].includes(sloteTime)) {
            return res.json({
               success: false,
               message: "Doctor is not available at the selected time slot",
            });
         } else {
            slots_booked[slotDate].push(sloteTime);
         }
      } else {
         slots_booked[slotDate] = [];
         slots_booked[slotDate].push(sloteTime);
      }

      const userData = await userModel.findById(userId).select("-password");
      delete docData.slots_booked;

      // const formattedSlotTime = formatTo12Hour(sloteTime);

      const appointmentData = {
         userId,
         docId,
         userData,
         docData,
         amount: docData.fees,
         slotTime: sloteTime,
         slotDate,
         date: Date.now(),
      };

      const newAppointment = new appointmentModel(appointmentData);
      await newAppointment.save();

      // save new slot data in docData
      await doctorModel.findByIdAndUpdate(docId, { slots_booked });

      res.json({
         success: true,
         message: "Appointment booked successfully",
      });
   } catch (error) {
      console.log(error);

      res.json({
         success: false,
         message: error.message,
      });
   }
};

// API to get user appointments
const listAppointments = async (req, res) => {
   try {
      const { userId } = req.body;
      const appointments = await appointmentModel.find({ userId });

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

// API to cancel appointment
const cancelAppointment = async (req, res) => {
   try {
      const { userId, appointmentId } = req.body;
      const appointmentData = await appointmentModel.findById(appointmentId);

      // verify appointment user

      if (appointmentData.userId !== userId) {
         return res.json({
            success: false,
            message: "You are not authorized to cancel this appointment",
         });
      }

      await appointmentModel.findByIdAndUpdate(appointmentId, {
         cancelled: true,
      });

      // releasing doctor slots
      const { docId, slotDate, slotTime } = appointmentData;

      const doctorData = await doctorModel.findById(docId);
      let slots_booked = doctorData.slots_booked;

      slots_booked[slotDate] = slots_booked[slotDate].filter(
         (e) => e !== slotTime
      );

      await doctorModel.findByIdAndUpdate(docId, { slots_booked });

      res.json({
         success: true,
         message: "Appointment cancelled successfully",
      });
   } catch (error) {
      console.log(error);

      res.json({
         success: false,
         message: error.message,
      });
   }
};

// const razorpayInstance = new razorpay({
//    key_id: process.env.RAZORPAY_KEY_ID,
//    key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// API to make payment pf appointment using rezorpay
// const paymentRazorpay = async (req, res) => {
//    const { appointmentId } = req.body;
//    const appointmentData = await appointmentModel.findById(appointmentId);

//    if (!appointmentData || appointmentData.cancelled) {
//       return res.json({
//          success: false,
//          message: "Invalid appointment or appointment is cancelled",
//       });
//    }

//    // Creating options for payment
//    const options = {
//       amount: appointmentData.amount * 100, // amount in paisa
//       currency: process.env.CURRENCY,
//       recepit: appointmentId,
//    };

//    // creation of an order
//    const order = await razorpayInstance.orders.create(options);
//    res.json({
//       success: true,
//       order,
//    });
// };

// API to make payment pf appointment using stripe
const paymentStripe = async (req, res) => {
   try {
      const frontend_url = "http://localhost:5173";
      const { appointmentId } = req.body;

      // Fetch appointment details from the database
      const appointmentData = await appointmentModel
         .findById(appointmentId)
         .populate("userData")
         .populate("docData");

      // Check if the appointment exists, is not cancelled, and payment is pending
      if (!appointmentData || appointmentData.cancelled) {
         return res.status(400).json({
            success: false,
            message: "Invalid appointment, cancelled, or already paid",
         });
      }

      // Extract data from appointment
      const { userData, docData } = appointmentData;
      const { name: patientName } = userData;
      const { name: doctorName, fees } = docData;

      // Create line items for Stripe checkout
      const line_items = [
         {
            price_data: {
               currency: "inr",
               product_data: {
                  name: `Consultation with ${doctorName}`,
                  description: `Appointment for ${patientName}`,
               },
               unit_amount: fees * 100, // Convert fees to paise (₹1 = 100 paise)
            },
            quantity: 1,
         },
      ];

      // Create a Stripe checkout session
      const session = await stripe.checkout.sessions.create({
         payment_method_types: ["card"],
         line_items: line_items,
         mode: "payment",
         success_url: `${frontend_url}/verify?success=true&orderId=${appointmentId}`,
         cancel_url: `${frontend_url}/verify?success=false&orderId=${appointmentId}`,
      });

      // Respond with the session URL for frontend redirection
      res.json({
         success: true,
         url: session.url,
      });
   } catch (error) {
      console.error("Payment creation failed:", error);
      res.status(500).json({
         success: false,
         message: "Failed to create payment session",
      });
   }
};

const verifyPayment = async (req, res) => {
   const { orderId, success } = req.body;
   try {
      if (success == "true") {
         await appointmentModel.findByIdAndUpdate(orderId, {
            payment: true,
         });
         res.json({
            success: true,
            message: "Payment successful",
         });
      } else {
         res.json({
            success: false,
            message: "Payment failed",
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

export {
   registerUser,
   loginUser,
   getProfile,
   updateProfile,
   bookAppointment,
   listAppointments,
   cancelAppointment,
   paymentStripe,
   verifyPayment,
};
