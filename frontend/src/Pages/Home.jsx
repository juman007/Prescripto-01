import React from "react";
import Header from "../Components/Header";
import SpecialityMenu from "../Components/SpecialityMenu";
import TopDoctor from "../Components/TopDoctor";
import Banner from "../Components/Banner";

const Home = () => {
   return (
      <div>
         <Header />
         <SpecialityMenu />
         <TopDoctor />
         <Banner />
      </div>
   );
};

export default Home;
