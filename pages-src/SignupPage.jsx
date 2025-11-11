
import Footer from '../components/Footer'
import SignUp from '../sections/signup/SignUp'
import NavbarLight from '../components/NavbarLight'

function SignupPage() {
  return (
 <div>
     <div className=" overflow-visible sm:overflow-x-clip ">
     <div className="css-1vx3a4p"></div>
     <NavbarLight/>
     <div className=' pt-[25%] sm:pt-20 pb-4 bg-[#fff]'>
        <SignUp/>

     </div>

     <Footer/>
     </div>
 </div>
  )
}

export default SignupPage