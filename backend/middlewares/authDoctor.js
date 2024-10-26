import jwt from "jsonwebtoken";

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
   try {
      const dToken = req.headers["dtoken"];

      if (!dToken) {
         return res.status(401).json({
            success: false,
            message: "Not Authorized. Please login again.",
         });
      }

      const token_decode = jwt.verify(dToken, process.env.JWT_SECRET);
      req.body.docId = token_decode.id;

      next();
   } catch (error) {
      console.log(error);
      res.status(401).json({
         success: false,
         message: "Invalid Token. Please login again.",
      });
   }
};


export default authDoctor;
