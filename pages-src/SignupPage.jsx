
import Footer from '../components/Footer'
import SignUp from '../sections/signup/SignUp'
import NavbarLight from '../components/NavbarLight'

function SignupPage() {
  return (
 <div>
     <div className=" overflow-visible sm:overflow-x-clip ">
     <div className="css-1vx3a4p"></div>
     <NavbarLight/>
     <div className=' pt-[25%] sm:pt-20 pb-4 bg-[#0e0e0e] min-h-[calc(100vh-120px)]'>
        <SignUp/>

     </div>

     <Footer/>
     </div>
 </div>
  )
}

export default SignupPage