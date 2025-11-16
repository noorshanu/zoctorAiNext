"use client";

function Aboutus() {
  return (
    <section className="container-wrapper pt-[12rem]">
      <div className="">
        <h1 className=" text-center text-3xl font-bold font-mansemibold">
          Welcome to Zoctor AI
        </h1>

        <h2 className=" text-4xl sm:text-6xl font-bold text-center py-2">
          AI-powered clarity. World-class care. Anywhere.
        </h2>

        <p className=" text-center font-sfpro text-xl  py-3">
          ZoctorAI is a next-generation health platform built to make
          world-class healthcare accessible, affordable, and intelligent. We
          combine advanced medical AI with a global network of trusted hospitals
          and specialists—helping you get the right care, at the right time,
          anywhere in the world. Our mission is simple: remove the stress,
          delays, and uncertainty from medical journeys. Whether you need a fast
          second opinion, a full diagnostic report, or help finding the best
          hospital abroad, ZoctorAI delivers clarity within minutes and
          coordinates the rest seamlessly.
        </p>
        <div className="flex justify-center gap-4 items-center">
          <a
            href="/contactus"
            className="inline-block  shadow-xl   py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold   bg-[#005dff] hover:bg-[#0000] hover:border"
          >
            Get Info
          </a>
          <a
            href="/signup"
            className="inline-block  shadow-xl   py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold   bg-[#005dff] hover:bg-[#0000] hover:border"
          >
            Signup
          </a>
        </div>
      </div>
    </section>
  );
}

export default Aboutus;
