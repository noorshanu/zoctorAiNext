import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-creative";

import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css/pagination";

// import required modules
import { EffectCreative } from "swiper/modules";
import TeamCard from "../components/TeamCard";

function Teams() {
  return (
    <>
      <Swiper
        id="teams-slider"
        grabCursor={true}
        effect={"creative"}
        creativeEffect={{
          prev: {
            shadow: true,
            origin: "left center",
            translate: ["-5%", 0, -200],
            rotate: [0, 100, 0],
          },
          next: {
            origin: "right center",
            translate: ["5%", 0, -200],
            rotate: [0, -100, 0],
          },
        }}
        speed={1000}
        pagination={{
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 2500,

          disableOnInteraction: false,
        }}
        modules={[EffectCreative, Autoplay, Pagination]}
        className="mySwiper6"
      >
        <SwiperSlide>
          <TeamCard
          title=' ZoctorAI is simply incredible! I uploaded my medical reports, and within minutes, the AI provided a detailed understanding and connected me to the right specialist for my condition. It’s like having a personal medical assistant who works tirelessly for you. This is the future of healthcare, and I’m glad I found it'
          name='JAdetokunbo Olayemi (Nigeria)'
          Desi='Patient'
          
          />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard 
          title='I was skeptical about using an AI platform for healthcare, but ZoctorAI exceeded my expectations. It connected me to the best specialists in minutes and even managed my follow-ups seamlessly. A truly modern healthcare solution for busy professionals.'
         name='Fatima Al-Nuaimi (UAE)'
         Desi='Patient'
         />
        </SwiperSlide>
        <SwiperSlide>
          <TeamCard 
          title='From scheduling appointments to keeping track of my medical history, ZoctorAI has simplified everything. The AI recommendations are incredibly accurate, and the customer support is outstanding. Highly recommend this for anyone seeking convenient and reliable healthcare.'
          name='Ananya Menon (India)'
          Desi='Patient'
          />
        </SwiperSlide>
        <SwiperSlide>
        <TeamCard
          title='I never imagined healthcare could be this simple and effective. ZoctorAI helped me find a specialist for my condition and took care of all the details. It’s not just convenient—it’s revolutionary. I feel well-cared-for and confident in my health decisions.'
          name='Elchin Mammadov (Azerbaijan)'
          Desi='Patient'
          
          />
        </SwiperSlide>
        <SwiperSlide>
        <TeamCard 
          title='Finding quality care used to be stressful, but ZoctorAI has changed that. It’s fast, reliable, and the AI-powered insights gave me confidence in my treatment plan. I finally feel in control of my health, and I can’t thank ZoctorAI enough.'
          name='Masika Koffi (Liberia)'
          Desi='Patient'
          />
        </SwiperSlide>
        <SwiperSlide>
        <TeamCard 
          title='ZoctorAI made my healthcare journey smooth and stress-free. I quickly got connected with a specialist and received top-notch care. The platform is intuitive and efficient, and I love how personalized it feels. I would recommend it to everyone in need of quality medical solutions.'
          name='Omar Belhaj (Libya)'
          Desi='Patient'
          />
        </SwiperSlide>
      </Swiper>
    </>
  );
}

export default Teams;
