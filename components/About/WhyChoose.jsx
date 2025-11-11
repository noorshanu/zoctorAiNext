import React from "react";

function WhyChoose() {
  return (
    <section className=" py-4">
      <div className=" container-wrapper">
     

        <div className=" flex justify-between items-center flex-col sm:flex-row gap-3">
          <div className=" w-full sm:w-1/2 ">
            <h2 className="text-base font-manbold pb-2 font-medium  items-center gap-x-4  block  ">
              Healthcare When and Where You Need It Whether it’s a routine
              check-up, specialist consultation, or urgent care, ZoctorAI brings
              world-class medical expertise to your fingertips. Accessible
              anytime, anywhere.
            </h2>

            <h2 className="txt-grad font-bold   text-3xl pb-2">Our Vision</h2>
            <p className="text-lg txt-grad font-sfpro  text-center sm:text-start pb-1">
              Our vision is to transform healthcare globally by combining AI
              innovation with human care.
            </p>

            <ul className=" list-disc font-sfpro ml-6 py-1">
              <li>To eliminate barriers to healthcare accessibility.</li>
              <li>
                To empower users with tools to make informed decisions for
                better health outcomes.
              </li>
            </ul>

            <h2 className="txt-grad font-bold   text-3xl pb-2">Our Mission</h2>

            <p className="text-lg txt-grad font-sfpro  text-center sm:text-start pb-1">
              ZoctorAI’s mission is to revolutionize healthcare delivery by
              making it:
            </p>

            <ul className=" list-disc font-sfpro ml-6 py-1">
              <li>Smart: Using AI to provide tailored, efficient solutions.</li>
              <li>
                Accessible &  Reliable Bringing care to your fingertips and Building trust through quality and transparency.
              </li>
         
            </ul>

            <p className="text-base font-sfpro  pb-1">
              We aim to improve lives by offering timely, tech-enabled
              healthcare that doesn’t compromise on empathy or accuracy.
            </p>
          </div>
          <div className=" w-full sm:w-1/2 flex justify-center">
            <img
              src="images/about2.webp"
              alt=""
              className="h-[450px] shadow-md border border-[#ffffff00] rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChoose;
