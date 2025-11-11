"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

function Cta() {
  const wrapper = useRef();
  const container = useRef();

  useGSAP(
    () => {
      gsap.fromTo(
        container.current,
        { opacity: 0, y: 200 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.2,
          scrollTrigger: {
            trigger: wrapper.current,
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
    <section ref={wrapper} className=" py-8">
      <div
        ref={container}
        className=" container-wrapper py-12 px-6 bg-[#1a1a1a] border border-[#757575] rounded-2xl will-change-transform"
      >
        <div className=" flex flex-col justify-center gap-2 items-center">
          <h1 className=" text-2xl sm:text-5xl font-manbold font-bold text-center py-1">
            <span className=" txt-grad ">Your health deserves more than </span> <br />
             guesswork
          </h1>

          <h1 className="text-2xl sm:text-5xl font-manbold font-bold text-center">
       
          </h1>

          <p className=" py-6 font-sfpro text-lg text-center max-w-3xl">
          Imagine having a solution tailored precisely to your needs—designed to save time, reduce stress, and deliver results. At ZoctorAI, we redefine care by putting cutting-edge AI and medical expertise at your fingertips. Don&apos;t wait—take control of your health now. Click &apos;Get Started&apos; today!
          </p>

          <a

            href="/signup"
            className="btn-main  px-4 py-1  rounded-2xl text-xl font-manbold mt-4"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}

export default Cta;
