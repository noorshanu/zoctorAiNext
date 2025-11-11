import { BsTelegram } from "react-icons/bs";
import {  FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

function Footer() {
  return (
    <section className=" relative mt-1">
      <div className=" container-wrapper border-t border-[#005eff9d]">
        <div className=" flex justify-between flex-col sm:flex-row items-center mt-4 ">
          <div>
            <img src="images/logo.png" alt="" className=" h-[140px]" />
          </div>

          <div className=" flex items-center justify-center flex-col sm:flex-row gap-2">
          <a href="/terms-condition" target="_blank" className=" text-center text-sm font-thin text-[#ddd]">
          Terms & Condition
        </a>
        <a href="/privacy-policy" target="_blank" className=" text-center text-sm font-thin text-[#ddd]">
        Privacy & Policy
        </a>
          </div>

          <div>
            <div className="flex gap-7 text-[42px]">
              <a
                target="_blank"
                href="https://www.instagram.com/zoctorai/"
                className="hover:text-prime transition-all duration-200"
              >
                <FaInstagram />
              </a>

              <a
                target="_blank"
                href="https://x.com/zoctor_ai"
                className="hover:text-prime transition-all duration-200"
              >
                <FaTwitter />
              </a>

              {/* <a
                target="_blank"
                href="#"
                className="hover:text-prime transition-all duration-200"
              >
                <BsTelegram />
              </a> */}

        
            </div>
          </div>
        </div>
      </div>

      <div>
    
      </div>
      <p className=" text-center font-thin text-[#ddd]">
          © 2025 ZoctorAI. All rights reserved
        </p>
    </section>
  );
}

export default Footer;
