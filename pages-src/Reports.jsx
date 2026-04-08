"use client";
/* eslint-disable no-unused-vars */

import Layout from '../components/Dashboard/Layout'
import FileUpload from '../components/Dashboard/FileUpload'

/**
 * Reports & AI chat (FastAPI: PDF extract + /api/v1/chat/summary, /api/v1/chat/reply).
 * `userId` may come from the URL; FileUpload falls back to localStorage `userId` from auth.
 */
function Reports({ userId }) {
  return (
    <Layout>
      <div className="text-[#000]">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 text-sm mt-1">
            Upload PDFs for AI summary, then ask follow-up questions (Zoctor FastAPI backend).
          </p>
        </header>
        <FileUpload userId={userId} />
      </div>
    </Layout>
  )
}

export default Reports