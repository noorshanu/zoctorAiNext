import React from 'react'

function Story() {
  return (
  <section className=' py-4'>
    <div className=' container-wrapper'>


    <div className=" flex justify-between items-center flex-col sm:flex-row gap-3">
          <div className=" w-full sm:w-1/2 flex justify-center">
            <img
              src="images/about.webp"
              alt=""
              className="h-[450px] shadow-md border border-[#ffffff00] rounded-xl"
             
            />
          </div>

          <div className=" w-full sm:w-1/2 ">
          <h2 className="text-2xl txt-grad sm:text-4xl font-manbold pb-4 font-medium  items-center gap-x-4  block  ">
          ZoctorAI is more than just a name; it’s a vision for the future of healthcare.

            </h2>
            <p  className="text-lg txt-grad  text-center sm:text-start pb-2 font-sfpro">
            1. A Fusion of "Zoom" and "Doctor"
            </p>
            <p  className=" text-lg  text-start font-sfpro">
            The name  <span className='txt-grad '>ZoctorAI </span> reflects our commitment to delivering real-time medical expertise:

            </p>

            <ul className=' list-disc ml-6 pt-2 text-base font-sfpro'>
              <li>
           <p className='text-lg font-sfpro'>
           Zoom symbolizes speed and accessibility, ensuring healthcare reaches you instantly, wherever you are.
           </p>
              </li>
              <li>
            <p className='text-lg font-sfpro'>  Doctor embodies care, trust, and professionalism—the cornerstone of healthcare.</p>
              </li>
            </ul>
            <p  className="text-base  text-start pt-1">
            Together, ZoctorAI merges speed, precision, and empathy to bring you the next generation of medical solutions.
            </p>

            <p  className="text-lg txt-grad  text-center sm:text-start py-2">
            2. Innovation Meets Tradition
            </p>
            <p  className="text-base  text-start pt-1">
            The "Z" conveys forward-thinking innovation, while "Doctor" respects the timeless role of medical professionals. ZoctorAI harmonizes cutting-edge technology with the warmth of human care.
            </p>
          </div>
          </div>

    </div>
  </section>
  )
}

export default Story