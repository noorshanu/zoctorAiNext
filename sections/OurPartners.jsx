import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React, { useRef } from "react";

function OurPartners() {
  const wrapper = useRef();
  const heading1 = useRef();

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.querySelectorAll(".partner-card").forEach((card) => {
            card.classList.remove("no-transition");
          });
        },
        delay: 0.1,
        scrollTrigger: {
          trigger: wrapper.current,
          start: "top bottom",
          toggleActions: "play none none reverse",
          onLeaveBack: () => {
            document.querySelectorAll(".partner-card").forEach((card) => {
              card.classList.add("no-transition");
            });
          },
        },
      });

      tl.fromTo(
        [heading1.current],
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.3 }
      );

      tl.fromTo(
        ".partner-card",
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
        "-=0.3"
      );
    },
    { dependencies: [], revertOnUpdate: true }
  );

  return (
    <section id="team">
      <div ref={wrapper} className=" container-wrapper">
        <div className=" py-3">
          <h1
            ref={heading1}
            className=" text-center text-3xl sm:text-5xl font-manbold font-bold py-2"
          >
            Our Team
          </h1>
        </div>
        <div className=" flex flex-col sm:flex-row justify-center  items-center gap-4">
          <div className="partner-card nft p-4 border border-[#bebebe] text-center h-full no-transition">
            <img src="images/sara.png" alt="" />

            <p>Sarah </p>

            <p className=" text-xs">Business Development Manager</p>
          </div>

          <div className="partner-card nft p-4 border border-[#bebebe] text-center h-full no-transition ">
            <img src="images/david.png" alt="" />

            <p>Ashish</p>

            <p>Marketing manager</p>
          </div>

          <div className="partner-card nft p-4 border border-[#bebebe] text-center h-full no-transition">
            <img src="images/gur.png" alt="" />
            <p>Gurpreet</p>

            <p> Co-Founder</p>
          </div>

          <div className="partner-card nft p-4 border border-[#bebebe] text-center h-full no-transition">
            
            <img src="images/david2.png" alt="" />
            <p>Ronnie</p>

            <p>Founder</p>
          </div>

          <div className="partner-card nft p-4 border border-[#bebebe] text-center h-full no-transition">
    
            <img src="images/noor2.png" alt="" />
            <p>David </p>

            <p> Partnership Manager</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurPartners;
