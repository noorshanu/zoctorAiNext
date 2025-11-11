import { IoIosArrowRoundForward } from "react-icons/io";
import { twMerge } from "tailwind-merge";

function SliderNavigationButton({ className, ...props }) {
  return (
    <button
      {...props}
      className={twMerge(
        "w-14 h-14 my-4 rounded-full bg-[#5470AE] flex items-center justify-center text-2xl disabled:bg-[#5470aeb0]",
        className
      )}
    >
      <IoIosArrowRoundForward />
    </button>
  );
}

export default SliderNavigationButton;
