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
        <header className="mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-6 shadow-sm sm:p-8">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-prime">
              Health insights
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Get clear answers from your reports
            </h1>
            <p className="mt-3 text-base leading-7 text-gray-600">
              Upload your medical reports, receive an instant summary, and ask questions to understand your health better.
            </p>
          </div>
        </header>
        <FileUpload userId={userId} />
      </div>
    </Layout>
  )
}

export default Reports