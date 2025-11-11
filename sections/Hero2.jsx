"use client";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import {  FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

const Hero2 = () => {
  const heading = useRef();
  const wrapper = useRef();
  const mobile = useRef();
  const span1 = useRef();
  const span2 = useRef();

  useEffect(() => {
    const tl = gsap.timeline();

    gsap.set([mobile.current], {
      top:
        wrapper.current.getBoundingClientRect().height -
        mobile.current.getBoundingClientRect().height,
      opacity: 0,
    });

    gsap.set([span1.current], {
      marginRight: "0.29em",
    });

    gsap.set([span1.current, span2.current], {
      translateZ: 140,
      rotateX: "70deg",
      opacity: 0,
    });

    tl.to([span1.current, span2.current], {
      rotateX: "0deg",
      opacity: 1,
      duration: 0.9,
      stagger: 0.35,
    });

    tl.to([span1.current, span2.current], {
      marginRight: 0,
      translateZ: 0,
      ease: "power3.out",
      duration: 2,
    });

    tl.to(
      mobile.current,
      {
        ease: "power3.out",
        duration: 1.25,
        top: "auto",
      },
      "<"
    );
    tl.to(
      mobile.current,
      { ease: "power3.out", duration: 0.4, opacity: 1 },
      "<"
    );
  }, []);

  const handleMouseMove = (e) => {
    gsap.to(heading.current, {
      x: -((e.clientX / window.innerWidth - 0.5) * 15),
      y: -((e.clientY / window.innerHeight - 0.5) * 15),
    });

    gsap.to([mobile.current], {
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={wrapper} className="flex flex-col w-full items-center pt-[40%] sm:pt-[15%]">
      <div className=" h-[30vh] sm:h-[86vh] w-full relative text-[min(13.5vw,220px)] sm:text-[min(14vw,220px)] lg:text-[min(12.5vw,220px)] -mb-[0.29em]">
      <div
          style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
          className=" -translate-y-1/2 w-full flex justify-center items-center"
        >
          <h1
            ref={heading}
            style={{ transformStyle: "preserve-3d" }}
            className="inter font-bold txt-grad leading-none whitespace-nowrap"
          >
            <span ref={span1} className="inline-block txt-grad">
              Meet
            </span>{" "}
            <span ref={span2} className="inline-block txt-grad">
              Zoctor AI
            </span>
          </h1>
        </div>
       
       
        <div className=" w-full flex items-center justify-center">
          <div
            ref={mobile}
            className="  z-10 w-full max-w-[220px] sm:max-w-[650px]  flex justify-center items-center isolate"
          >
            {/* <img
              draggable={false}
              src="/images/phone-screen.png"
              className="-z-10 absolute h-[97%] rounded-[15px]"
            /> */}
            <div className="video-container -z-10 h-auto  p-2 rounded-[70px] mt-[-5%]">
              <video muted autoPlay loop playsInline className="border-2 border-prime">
                <source src="/images/vdbg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
        
          </div>
        </div>

      </div>

      <div className="flex flex-col items-center text-center max-w-[1280px] px-[4vw] gap-8 mb-36 z-10">
        <p className="text-lg sm:text-xl font-manreg leading-[1.6] font-sfpro">
          Healthcare has entered a new era, and ZoctorAI is at the forefront,
          delivering cutting-edge AI-powered solutions that redefine how you
          access medical care. By combining speed, precision, and trust, we’re
          creating a smarter, more efficient healthcare experience.
        </p>

        <div className="flex gap-7 text-[42px]">
          <a
            target="_blank"
            href="https://www.instagram.com/"
            className="hover:text-prime transition-all duration-200"
          >
            <FaInstagram />
          </a>

          <a
            target="_blank"
            href="https://twitter.com/"
            className="hover:text-prime transition-all duration-200"
          >
            <FaTwitter />
          </a>

          <a
            target="_blank"
            href="https://t.me/Mo"
            className="hover:text-prime transition-all duration-200"
          >
            <FaTelegramPlane />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero2;
