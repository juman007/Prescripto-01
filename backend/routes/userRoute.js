import express from "express";
import {
   bookAppointment,
   cancelAppointment,
   getProfile,
   listAppointments,
   loginUser,
   paymentStripe,
   registerUser,
   updateProfile,
   verifyPayment,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
   "/update-profile",
   upload.single("image"),
   authUser,
   updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointments);
userRouter.post("/cancel-appointments", authUser, cancelAppointment);
userRouter.post("/payment-stripe", authUser, paymentStripe);
userRouter.post("/verify", authUser, verifyPayment);

export default userRouter;
