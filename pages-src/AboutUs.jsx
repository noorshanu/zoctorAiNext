"use client";
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Aboutus from '../components/About/Aboutus'
import Story from '../components/About/Story'
import WhyChoose from '../components/About/WhyChoose'
import AboutCta from '../components/About/AboutCta'

export default function AboutUs() {
  return (
   <>
   <div>
   <div className="css-1vx3a4p"></div>
  <Navbar/>

  <div>
    <Aboutus/>
  </div>
  <div className=' mt-16'>
    <Story/>

  </div>
  <div className=' mt-16'>
   <WhyChoose/>

  </div>
  <div className=' mt-16'>
  <AboutCta/>

  </div>

  <div>
    <Footer/>
  </div>
   </div>
   </>
  )
}