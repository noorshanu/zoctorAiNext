import React from "react";

function Story() {
  return (
    <section className=" py-4">
      <div className=" container-wrapper">
        <div className=" flex justify-between items-center flex-col sm:flex-row gap-3">
          <div className=" w-full sm:w-1/2 flex justify-center">
            <img
              src="assets/aidia.jpg"
              alt=""
              className="h-[570px] w-full shadow-md border border-[#ffffff00] rounded-xl mt-4"
            />
          </div>

          <div className=" w-full sm:w-1/2 ">
            <h2 className="text-2xl txt-grad sm:text-4xl font-manbold pb-4 font-medium  items-center gap-x-4  block  ">
              Why ZoctorAI Exists
            </h2>
            <p>
              Millions of people struggle with long wait times, expensive
              treatment, confusing medical reports, and limited access to
              specialists. We created ZoctorAI to solve exactly that by blending
              intelligent automation with verified medical expertise.
            </p>
            <p className="text-lg txt-grad  text-center sm:text-start py-2">
              What Makes Us Different
            </p>
            <ul className=" list-disc ml-6 pt-2 text-base font-sfpro">
              <li className="mb-2">
                <p className="text-lg font-sfpro">
                  <span className="txt-grad">AI built for healthcare</span>
                </p>
                <p>
                  Our medical-grade AI instantly summarizes complex reports, identifies risks,
                  and guides you toward the right treatment pathways.
                </p>
              </li>
              <li className="mb-2">
                <p className="text-lg font-sfpro">
                  <span className="txt-grad">Global medical access—simplified</span>
                </p>
                <p>
                  From India to the UAE and beyond, we connect you with internationally
                  accredited hospitals, skilled surgeons, and specialized treatment centers.
                </p>
              </li>
              <li className="mb-2">
                <p className="text-lg font-sfpro">
                  <span className="txt-grad">Transparent, affordable options</span>
                </p>
                <p>
                  ZoctorAI helps you compare treatments and costs—often up to 70–80% more affordable
                  than Western countries—without compromising on quality.
                </p>
              </li>
              <li>
                <p className="text-lg font-sfpro">
                  <span className="txt-grad">Patient-first philosophy</span>
                </p>
                <p>
                  Every feature in ZoctorAI is designed around one goal: empowering you to make
                  confident, informed medical decisions.
                </p>
              </li>
            </ul>
            <p className="text-lg txt-grad  text-center sm:text-start py-2">
              Our Commitment
            </p>
            <p className="text-base  text-start pt-1">
              We stand for accuracy, transparency, and compassion. Healthcare is personal,
              and so is our approach.
            </p>
            <p className="text-xl font-manbold text-center sm:text-start pt-3">
              ZoctorAI — Healthcare, simplified. Access made global. Decisions made smarter.
            </p>

            
          </div>
        </div>
      </div>
    </section>
  );
}

export default Story;
