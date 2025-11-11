"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {  useRef } from "react";

const heading = [
  {
    text: "Unlock Exceptional Healthcare Experiences",
    className: "txt-grad font-bold text-center",
  },
  {
    text: "with ZoctorAI",
    className: "txt-grad font-bold text-center",
  },
];

function About() {
  const card = useRef();

  const para1 = useRef();
  const para2 = useRef();
  const para3 = useRef();
  const para4 = useRef(); 
  const button1 = useRef();

  useGSAP(
    () => {
      const letters = document.querySelectorAll(".about-heading-letter");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          toggleActions: "play none none reverse",
          onLeaveBack: () => card.current.classList.remove("nft"),
        },
      });

      tl.fromTo(
        card.current,
        { scale: 0, transformOrigin: "bottom" },
        {
          scale: 1,
          duration: 1,
          delay: 0.3,
          ease: "power2.out",
          onComplete: () => card.current.classList.add("nft"),
        }
      );

      tl.fromTo(
        letters,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: letters.length * 0.015,
          stagger: 0.02,
          ease: "power2.out",
        },
        "<"
      );

      tl.fromTo(
        [para1.current, para2.current, para3.current, para4.current, button1.current],
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.4,
          stagger: 0.4 / 3,
        },
        "-=0.35"
        );
    },
    { dependencies: [], revertOnUpdate: true }
  );

  return (
    <section className=" py-8 relative" id="about">
      <div className="css-we3"></div>
      <div className=" container-wrapper">
        <div className=" flex justify-between items-center flex-col sm:flex-row gap-3">
          <div className=" w-full sm:w-1/2 flex justify-center">
            <img
              src="images/abouti.jpg"
              alt=""
              className="h-[450px] shadow-md border border-[#ffffff00]"
              ref={card}
            />
          </div>

          <div className=" w-full sm:w-1/2">
            <h2 className="text-4xl sm:text-5xl font-manbold pb-4 font-medium sm:flex flex-wrap gap-x-4 text-center hidden ">
              {heading.map((part) =>
                part.text.split(" ").map((word, i) => (
                  <span key={i} className={`overflow-hidden`}>
                    {word.split("").map((letter, j, arr) => (
                      <span
                        key={j}
                        style={{
                          backgroundSize: `${arr.length * 100}%`,
                          backgroundPosition: `${j * 0.1 * 100}%`,
                        }}
                        className={`about-heading-letter inline-block text-center ${
                          part.className
                        } ${letter.toLowerCase() === "y" ? "-mr-[5px]" : ""}`}
                      >
                        {letter}
                      </span>
                    ))}
                  </span>
                ))
              )}
            </h2>
            <h2 className="text-4xl txt-grad sm:text-6xl font-manbold pb-4 font-medium  items-center gap-x-4 text-center block sm:hidden ">
              Unlock Exceptional Healthcare Experiences with ZoctorAI
            </h2>
            <p ref={para1} className="text-base text-center sm:text-start font-sfpro">
              World-Class Care, seamlessly delivered at ZoctorAI, we redefine
              healthcare by connecting you with a trusted network of specialist
              hospitals and expert providers. 
            </p>

            <p ref={para2} className="text-base font-sfpro text-center sm:text-start my-1">Our goal is to ensure your
              treatment journey is smooth, stress-free, and personalized to your
              needs. Here’s how we make it happen:</p>

            <p ref={para3} className=" text-base font-sfpro my-2 text-center sm:text-start">
            Access to Top Specialist Hospitals: From cutting-edge technology to renowned medical experts.
            </p>
       
            <p ref={para4} className=" text-base font-sfpro my-2 text-center sm:text-start">
            Seamless Treatment Coordination: From initial consultation to post-treatment follow-ups, ZoctorAI manages every detail, so you can focus on your health.
            </p>
            

            <div className=" flex justify-center sm:justify-start items-center">
              <a
                ref={button1}
                href="/signup"
                target="_blank"
                className="inline-block  shadow-xl   py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold   bg-[#005dff] hover:bg-[#0000] hover:border "
              >
                {" "}
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
