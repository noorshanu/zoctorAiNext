"use client";
/* eslint-disable no-unused-vars */

import Layout from '../components/Dashboard/Layout'
import FileUpload from '../components/Dashboard/FileUpload'

function Reports({ userId }) {
  return (
    <>
    <Layout>
      <div className='text-[#000]'>

        <FileUpload userId={userId}/>

      </div>

    </Layout>
    </>
  )
}

export default Reports