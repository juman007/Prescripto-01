import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AdminContextProvider from "./context/AdminContext.jsx";
import DoctorContextProvider from "./context/DoctorsContext.jsx";
import AppContextProvider from "./context/AppContext.jsx";

createRoot(document.getElementById("root")).render(
   <BrowserRouter>
      <AdminContextProvider>
         <DoctorContextProvider>
            <AppContextProvider>
               <App />
            </AppContextProvider>
         </DoctorContextProvider>
      </AdminContextProvider>
   </BrowserRouter>
);
