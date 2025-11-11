import { useGSAP } from "@gsap/react";
import Teams from "./Teams";
import gsap from "gsap";

function WhatotherSay() {
  useGSAP(
    () => {
      gsap.fromTo(
        "#teams-slider",
        { opacity: 0, y: 200 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.2,
          scrollTrigger: {
            trigger: "#teams",
            start: "top bottom",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    {
      dependencies: [],
      revertOnUpdate: true,
    }
  );

  return (
    <section className="relative py-10">
      <div className="css-we"></div>
      <img
        src="images/rightring.png"
        alt=""
        className=" absolute right-0 top-0 "
      />

      <div className="container-wrapper">
        <div id="header" className=" my-3">
          <h1 className="txt-grad text-2xl sm:text-4xl font-work font-bold font-64 text-center">
            What Patients says about us
          </h1>
          <div
            id="line"
            className="bg-white h-[3px] w-[300px] mx-auto mt-6 mb-5"
          >
            {" "}
          </div>

          {/* <p className="text-xl text-center text-white max-w-4xl mx-auto mb-8">
            we mention here what our Creators says . Here we will mention about
            #Feedback
          </p> */}
        </div>

        <div id="teams">
          <Teams />
        </div>
        {/* <div className=" flex justify-between items-center flex-col sm:flex-row my-4">
          <FeatureCard />

          <FeatureCard />
          <FeatureCard />
        </div> */}
      </div>
    </section>
  );
}

export default WhatotherSay;
