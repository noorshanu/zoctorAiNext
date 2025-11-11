"use client";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import About from "../sections/About";
import BelowSec from "../sections/BelowSec";

import Cta from "../sections/Cta";

import Hero2 from "../sections/Hero2";

import Services from "../sections/Services";
import MedicalTour from "../components/MedicalTour";
import WhatotherSay from "../sections/WhatotherSays";

function Home() {
  return (
    <>
      <div className=" overflow-hidden sm:overflow-x-clip ">
        <div className="css-1vx3a4p"></div>
        <Navbar />
        <Hero2 />
        <div className=" mb-4">
          <BelowSec />
        </div>
        <div className=" mb-4">
          <MedicalTour />
        </div>
        <About />

        <div className=" h-[30px]"></div>
        <Services />
        <div className=" h-[30px]"></div>
        <div>
          <Cta />
        </div>
        <div className=" py-8">
          <WhatotherSay />
        </div>
    
        <div className="">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Home;
