
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactUs from '../sections/ContactUs'

function Contact() {
  return (
    <>
    <div>
      <Navbar/>
      <h1 className=" font-inter font-bold text-xl txt-grad sm:text-4xl mb-4 text-center pt-28 ">
           Let&apos;s Connect
            </h1>
     <div className=' pb-8 flex flex-col sm:flex-row  items-center gap-10' >
   
        <div className=' w-full sm:w-1/2'>
            <ContactUs/>
        </div>
        <div className=' w-full sm:w-1/2'>
<img src="/images/contact.webp" alt="" className=' w-[500px] h-[500px] rounded-xl' />
        </div>
     </div>
      <Footer/>
    
    </div>
    </>
  )
}

export default Contact;