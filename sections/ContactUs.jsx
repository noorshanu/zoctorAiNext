"use client";
import { useEffect, useState } from "react";

function ContactUs() {
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCountries() {
      try {
        setCountriesLoading(true);
        setCountriesError(null);
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );
        if (!res.ok) throw new Error("Failed to fetch countries");
        const data = await res.json();
        const mapped = data
          .map((c) => ({ code: c.cca2, name: c?.name?.common || c?.name?.official }))
          .filter((c) => c.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (isMounted) setCountries(mapped);
      } catch (err) {
        if (isMounted) setCountriesError(err?.message || "Failed to load countries");
      } finally {
        if (isMounted) setCountriesLoading(false);
      }
    }
    loadCountries();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <section className=" w-full relative" id="contact">
      <div className="css-we"></div>
      <img
        src="images/rightring.png"
        alt=""
        className=" absolute left-0 top-0 rotate-180 z-[-1]"
      />
      <div className=" container-wrapper">
        <div className=" flex justify-between flex-col  items-center ">
       

          <div>
            <div className=" bg-[#1a1a1a] border border-[#757575] rounded-2xl  p-4 shadow-lg ">
              <div className="max-w-md mx-auto  ">
           
                <form className=" text-[#000]">
                  <div className="mb-4">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-[#fff]"
                    >
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full p-2 border rounded-md text-[#000]"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-[#fff]"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="workEmail"
                      className="block text-sm font-medium text-[#fff]"
                    >
                      Email*
                    </label>
                    <input
                      type="email"
                      id="workEmail"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-[#fff]"
                    >
                      Location*
                    </label>
                    <select
                      id="location"
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="" disabled selected>
                        {countriesLoading
                          ? "Loading countries..."
                          : countriesError
                          ? "Failed to load countries"
                          : "Select your country"}
                      </option>
                      {!countriesLoading && !countriesError && countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="tasks"
                      className="block text-sm font-medium text-[#fff]"
                    >
                     How Can We Help You Today?
                    </label>
                    <textarea
                      id="tasks"
                      className="w-full p-1 border rounded-md"
                      rows="4"
                    ></textarea>
                  </div>
                <div className=" flex justify-center items-center">
                <button
                    type="submit"
                    className="inline-block  shadow-xl   py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold   bg-[#005dff] hover:bg-[#0000] hover:border text-[#fff]"
                  >
                 Submit
                  </button>
                </div>
                  <p className="text-xs text-center mt-4 text-[#fff]">
                    By clicking next, you agree to receive communications from
                   zoctorai in accordance with our Privacy Policy.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactUs;
