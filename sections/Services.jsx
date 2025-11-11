"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

import { useTranslation } from 'react-i18next';

function Services() {
  const { t, i18n } = useTranslation();
  const isRTL = ['ar', 'ur'].includes(i18n.language);
  const wrapper = useRef();
  const text1 = useRef();
  const text2 = useRef();
  const text3 = useRef();

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.querySelectorAll(".service-card").forEach((card) => {
            card.classList.remove("no-transition");
          });
        },
        delay: 0.1,
        scrollTrigger: {
          trigger: wrapper.current,
          start: "top bottom",
          toggleActions: "play none none reverse",
          onLeaveBack: () => {
            document.querySelectorAll(".service-card").forEach((card) => {
              card.classList.add("no-transition");
            });
          },
        },
      });

      tl.fromTo(
        [text1.current, text2.current, text3.current],
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.3 }
      );

      tl.fromTo(
        ".service-card",
        { opacity: 0, y: 200 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
        "-=0.3"
      );
    },
    { dependencies: [], revertOnUpdate: true }
  );

  return (
    <div className="mt-20 relative py-8" id="whychoose" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="css-wee"></div>
      <div ref={wrapper} className="container-wrapper">
        <div>
          <p ref={text1} className="text-center text-prime font-sfpro">
            {t('services.subtitle')}
          </p>

          <h1
            ref={text2}
            className="text-center text-3xl sm:text-5xl font-manbold font-bold py-2 txt-grad"
          >
            {t('services.title')}
          </h1>

          <p ref={text3} className="text-center text-base font-sfpro py-2">
            {t('services.description')}
          </p>
        </div>

        <div className="mt-4 justify-center gap-6 items-center grid grid-cols-1 sm:grid-cols-3">
          <div className="will-change-transform service-card border-[#757575] border py-4 px-6 rounded-xl nft no-transition">
            <img
              src="images/ondemand.png"
              alt={t('services.cards.onDemand.alt')}
              className="mx-auto rounded-xl h-[100px]"
            />
            <h2 className="text-center text-xl font-manbold font-bold text-prime pb-2">
              {t('services.cards.onDemand.title')}
            </h2>
            <p className="text-start pb-1 font-light font-sfpro">
              {t('services.cards.onDemand.description')}
            </p>
            <div className="flex justify-center items-center py-3">
          
            </div>
          </div>

          <div className="will-change-transform service-card border-[#757575] border py-4 px-6 rounded-xl nft no-transition">
            <img
              src="images/24hour.png"
              alt={t('services.cards.assistance.alt')}
              className="mx-auto rounded-xl h-[80px]"
            />
            <h2 className="text-center text-xl font-inter font-bold text-prime pb-2">
              {t('services.cards.assistance.title')}
            </h2>
            <p className="text-start pb-1 font-light font-sfpro">
              {t('services.cards.assistance.description')}
            </p>
            <div className="flex justify-center items-center py-3">
     
            </div>
          </div>

          <div className="will-change-transform service-card border-[#757575] border py-4 px-6 rounded-xl nft no-transition">
            <img
              src="images/effort.png"
              alt=""
              className=" mx-auto rounded-xl h-[100px]"
            />
            <h2 className=" text-center text-xl font-manbold font-bold text-prime pb-2">
            Effortless Appointment Scheduling
            </h2>

            <p className=" text-start pb-1 font-sfpro">
            Book, manage, and track appointments for yourself or your loved ones seamlessly through our platform.
            </p>

        

            <div className="flex justify-center items-center  py-3">
      
            </div>
          </div>

          <div className="will-change-transform service-card border-[#757575] border py-4 px-6 rounded-xl nft no-transition">
            <img
              src="images/empower.png"
              alt=""
              className=" mx-auto rounded-xl h-[100px]"
            />
            <h2 className=" text-center text-xl font-manbold font-bold text-prime pb-2">
            Upto 80% Saving 

            </h2>

            <p className=" text-start pb-1 font-sfpro">
            We delivers up to 80% cost savings on medical treatment and facilitation compared to Western healthcare systems  without compromising quality. Our partner hospitals in India and other destinations provide internationally accredited care,  and highly skilled doctors with global expertise at a fraction of the cost
            </p>

          

            <div className="flex justify-center items-center py-3">
          
            </div>
          </div>

          <div className="will-change-transform service-card border-[#757575] border py-4 px-6 rounded-xl nft no-transition">
            <img
              src="images/aipower.png"
              alt=""
              className=" mx-auto rounded-xl h-[120px]"
            />
            <h2 className=" text-center text-2xl font-manbold font-bold text-prime pb-2">
            AI-Powered
            </h2>

            <p className=" text-start pb-1 font-sfpro">
            Experience smooth, secure AI experience designed with your convenience in mind.

            </p>

        
            <div className="flex justify-center items-center py-9">
   
            </div>
          </div>

          <div className="will-change-transform service-card border-[#757575] border py-4 px-6 rounded-xl nft no-transition">
            <img
              src="images/icons/influ.png"
              alt=""
              className=" mx-auto rounded-xl h-[100px]"
            />
            <h2 className=" text-center text-2xl font-manbold font-bold text-prime pb-2">
            Simplified Global Medical Access
            </h2>

            <p className=" text-start pb-1 font-sfpro">
             Need specialized treatment abroad? ZoctorAI connects you with top international healthcare providers, streamlining medical tourism.

            </p>

       
            <div className="flex justify-center items-center py-6">
        
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
