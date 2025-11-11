import React from "react";

function TopBar() {
  return (
    <section>
      <div className=" border-t border-[#5f3420] relative mx-1 ">
        <img src="images/top-bg.png" alt="" className=" w-full mx-auto" />

        <div className=" absolute top-3 left-0 right-0 mx-auto">
          <h1 className=" font-archo text-xl font-semibold text-center text-white ">
            🔥 Be aware of scammers
          </h1>
        </div>
      </div>
    </section>
  );
}

export default TopBar;
