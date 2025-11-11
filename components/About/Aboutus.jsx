import React from "react";

function Aboutus() {
  return (
    <section className="container-wrapper pt-[12rem]">
      <div className="">
        <h1 className=" text-center text-4xl font-bold font-mansemibold">
          Welcome to Zoctor AI
        </h1>

        <h2 className=" text-4xl sm:text-7xl font-bold text-center py-2">
          Revolutionizing Healthcare with Human-Centric AI
        </h2>

        <p className=" text-center font-sfpro text-xl  py-3">
          In today’s fast-paced world, navigating healthcare shouldn’t be a
          challenge. At ZoctorAI, we are on a mission to simplify and enhance
          how you access medical care. By merging the power of cutting-edge
          artificial intelligence with a deep understanding of human needs,
          we’ve redefined healthcare delivery to make it faster, smarter, and
          more accessible for everyone.
        </p>
        <div className="flex justify-center gap-4 items-center">
          <a href="/contactus" className="inline-block  shadow-xl   py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold   bg-[#005dff] hover:bg-[#0000] hover:border">
            Get Info
          </a>
          <a href="/signup" className="inline-block  shadow-xl   py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold   bg-[#005dff] hover:bg-[#0000] hover:border">
            Signup
          </a>
        </div>
      </div>
    </section>
  );
}

export default Aboutus;
