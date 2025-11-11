
import Footer from '../components/Footer'

import Login from '../sections/login/Login'
import NavbarLight from '../components/NavbarLight'

function LoginPage() {
  return (
    <div>
    <div className=" overflow-visible sm:overflow-x-clip ">
    <div className="css-1vx3a4p"></div>
  <NavbarLight/>
 
    <div className=' pt-12 pb-4 bg-[#fff]'>
      <Login/>

    </div>

    <Footer/>
    </div>
</div>
  )
}

export default LoginPage