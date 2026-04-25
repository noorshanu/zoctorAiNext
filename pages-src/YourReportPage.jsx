"use client";
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Layout from '../components/Dashboard/Layout';
import api, { API_BASE_URL } from '../utils/api';
import { downloadSummaryPdf } from '../utils/summaryPdfExport';
import { FiFileText, FiDownload, FiEye, FiAlertCircle, FiX, FiTrash2 } from 'react-icons/fi';
import { FiFilePlus } from "react-icons/fi";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

async function fetchDocumentBlob(docId) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const base = String(API_BASE_URL).replace(/\/$/, "");
  const res = await fetch(
    `${base}/api/documents/${encodeURIComponent(docId)}/download/`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    }
  );
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Download failed (${res.status})`);
  }
  return res.blob();
}

// Add LoadingAnimation component
const LoadingAnimation = () => {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const circleVariants = {
    start: {
      y: "0%",
    },
    end: {
      y: "100%",
    },
  };

  const circleTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
  };

  return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        className="flex gap-2"
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="w-4 h-4 rounded-full bg-prime"
            variants={circleVariants}
            transition={circleTransition}
          />
        ))}
      </motion.div>
      <motion.div
        className="ml-4 text-lg font-medium text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading Reports...
      </motion.div>
    </div>
  );
};

function YourReportPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, reportId: null });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      console.log("Debug - Auth Info:", { 
        hasToken: !!token, 
        tokenPreview: token ? `${token.slice(0, 10)}...` : 'no token'
      });

      const response = await api.get("/api/documents/");

      console.log("Debug - API Response:", {
        status: response.status,
        hasData: !!response.data,
        documentsCount: response.data?.documents?.length,
        rawData: response.data,
      });

      if (response.data && response.data.documents) {
        setReports(
          response.data.documents.map((doc) => ({
            id: doc.id,
            filename: doc.filename,
            uploaded_at: doc.uploaded_at,
            summary: doc.summary || "",
            gcs_uri: doc.gcs_uri,
            size_bytes: doc.size_bytes,
          }))
        );
      } else {
        setReports([]);
      }
      setIsLoading(false);

      console.log("Debug - Reports State:", {
        reportsCount: response.data?.documents?.length,
        firstReport: response.data?.documents?.[0],
      });

    } catch (error) {
      console.error("Debug - Error Details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params
        }
      });

      if (error.response?.status === 404) {
        setError("No reports found. The reports endpoint might have changed.");
      } else {
        setError(
          error.response?.data?.message || 
          error.message || 
          "Failed to load reports. Please try again later."
        );
      }
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewReport = async (report) => {
    const fileUrl = report?.gcs_uri || report?.fileUrl;
    if (fileUrl && String(fileUrl).startsWith("http")) {
      window.open(fileUrl, "_blank");
      return;
    }
    const id = report?.id;
    if (!id) return;
    try {
      const blob = await fetchDocumentBlob(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not open report file.");
    }
  };

  const handleDownloadReport = async (report) => {
    const fileUrl = report?.gcs_uri || report?.fileUrl;
    const fileName =
      report?.filename || report?.fileName || "report";
    if (fileUrl && String(fileUrl).startsWith("http")) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const id = report?.id;
    if (!id) return;
    try {
      const blob = await fetchDocumentBlob(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName.replace(/^\d+_/, "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not download report.");
    }
  };

  const handleViewSummary = (report) => {
    console.log("Opening summary for:", report);
    // Note: Summary may not be available yet - could be generated via /api/summaries/generate/
    if (!report) return;
    setSelectedReport(report);
    setShowSummaryModal(true);
  };

  const handleDownloadSummaryPdf = async (report) => {
    const text = report?.summary || report?.text_content;
    if (!text || String(text).trim().length < 2) {
      setError("No summary text to export. Open the summary after analysis completes.");
      return;
    }
    try {
      setError(null);
      const base = (report?.filename || "report").replace(/^\d+_/, "").replace(/\.[^.]+$/i, "") || "report";
      await downloadSummaryPdf({
        summary: text,
        filename: `ZoctorAI_free_summary_${base}.pdf`,
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not create summary PDF.");
    }
  };

  const SummaryModal = ({ report, onClose }) => {
    if (!report) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-b border-gray-200 p-5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-prime shadow-md flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-white" />
              </div>
              Report summary
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] bg-white">
            <div className="mb-5 pb-4 border-b border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">File name</p>
              <p className="text-gray-900 font-medium">{(report.filename || report.fileName || 'Unknown').replace(/^\d+_/, '')}</p>
            </div>
            
            <div className="prose prose-sm prose-blue max-w-none">
              <ReactMarkdown>{report.summary || report.text_content || 'Your summary will appear here once processing is complete.'}</ReactMarkdown>
            </div>
          </div>

          <div className="bg-gray-50 border-t border-gray-200 p-5 flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={() => handleDownloadSummaryPdf(report)}
              disabled={!(report.summary || report.text_content)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiDownload className="w-4 h-4" />
              Download summary
            </button>
            <a
              href="/reports"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-prime text-prime text-sm font-semibold hover:bg-prime hover:text-white transition-all"
            >
              Create full report
            </a>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
        >
          <div className="flex items-center justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
              <FiTrash2 className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Delete this report?
          </h3>
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            This action cannot be undone. Your report and its summary will be permanently removed.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-red-200"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const SuccessAlert = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed top-4 right-4 bg-white border-2 border-green-500 text-gray-900 px-5 py-3.5 rounded-xl shadow-xl z-50 flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="font-semibold">Report deleted successfully</span>
    </motion.div>
  );

  const handleDeleteReport = (reportId) => {
    setDeleteConfirmation({ show: true, reportId });
  };

  const confirmDelete = async () => {
    const reportId = deleteConfirmation.reportId;
    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError("Authentication required");
        return;
      }

      await api.delete(`/api/documents/${reportId}/`);

      // Remove the deleted report from the state
      setReports(prev => prev.filter(report => report.id !== reportId));
      
      // Show success alert
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);

    } catch (error) {
      console.error("Delete error:", error);
      setError(
        error.response?.data?.error || 
        "Failed to delete report. Please try again."
      );
    } finally {
      setDeleteConfirmation({ show: false, reportId: null });
    }
  };

  const tableRowActions = (report) => (
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
      <button 
        onClick={() => handleViewSummary(report)}
        className="text-purple-600 hover:text-purple-900"
        data-tooltip-id="action-tooltip"
        data-tooltip-content="View Summary"
      >
        <FiFilePlus className='w-5 h-5' />  
      </button>
      {!!(report.summary || report.text_content) && (
        <button 
          onClick={() => handleDownloadSummaryPdf(report)}
          className="text-emerald-600 hover:text-emerald-900"
          data-tooltip-id="action-tooltip"
          data-tooltip-content="Free summary PDF"
        >
          <FiDownload className="w-5 h-5" />
        </button>
      )}
      <button 
        onClick={() => handleViewReport(report)}
        className="text-blue-600 hover:text-blue-900"
        data-tooltip-id="action-tooltip"
        data-tooltip-content="View original file"
      >
        <FiEye className="w-5 h-5" />
      </button>
      <button 
        onClick={() => handleDownloadReport(report)}
        className="text-green-600 hover:text-green-900"
        data-tooltip-id="action-tooltip"
        data-tooltip-content="Download original upload"
      >
        <FiDownload className="w-5 h-5" />
      </button>
      <button 
        onClick={() => handleDeleteReport(report.id || report._id)}
        className="text-red-600 hover:text-red-900"
        data-tooltip-id="action-tooltip"
        data-tooltip-content="Delete Report"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
      <Tooltip id="action-tooltip" />
    </td>
  );

  const mobileActions = (report) => (
    <div className="flex justify-end space-x-3">
      <button 
        onClick={() => handleViewSummary(report)}
        className="p-2 text-purple-600 hover:bg-purple-50 rounded"
        data-tooltip-id="mobile-action-tooltip"
        data-tooltip-content="View Summary"
      >
        <FiFilePlus className="w-5 h-5" />
      </button>
      {!!(report.summary || report.text_content) && (
        <button 
          onClick={() => handleDownloadSummaryPdf(report)}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
          data-tooltip-id="mobile-action-tooltip"
          data-tooltip-content="Free summary PDF"
        >
          <FiDownload className="w-5 h-5" />
        </button>
      )}
      <button 
        onClick={() => handleViewReport(report)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
        data-tooltip-id="mobile-action-tooltip"
        data-tooltip-content="View original file"
      >
        <FiEye className="w-5 h-5" />
      </button>
      <button 
        onClick={() => handleDownloadReport(report)}
        className="p-2 text-green-600 hover:bg-green-50 rounded"
        data-tooltip-id="mobile-action-tooltip"
        data-tooltip-content="Download original upload"
      >
        <FiDownload className="w-5 h-5" />
      </button>
      <button 
        onClick={() => handleDeleteReport(report.id || report._id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded"
        data-tooltip-id="mobile-action-tooltip"
        data-tooltip-content="Delete Report"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
      <Tooltip id="mobile-action-tooltip" />
    </div>
  );

  console.log("Debug - Render State:", {
    isLoading,
    hasError: !!error,
    reportsCount: reports.length,
    reports // temporary, remove in production
  });

  return (
    <Layout>
      <div className="flex flex-col p-4 sm:p-6 lg:p-8 text-[#000]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Your Reports
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage all your medical reports
          </p>
          <p className="mt-2 text-sm text-gray-500">
            For a full downloadable report, go to{' '}
            <a href="/reports" className="text-prime underline font-medium">
              Reports
            </a>{' '}
            after you complete an analysis.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-center">
            <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Add the modal */}
        {showSummaryModal && (
          <SummaryModal
            report={selectedReport}
            onClose={() => {
              setShowSummaryModal(false);
              setSelectedReport(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation.show && (
          <DeleteConfirmationModal
            onClose={() => setDeleteConfirmation({ show: false, reportId: null })}
            onConfirm={confirmDelete}
          />
        )}

        {/* Loading State */}
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          /* Reports Table/Cards */
          <div className="overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block bg-[#fff] shadow-xl rounded-b-lg border border-[#bababa]">
              <table className="min-w-full divide-y divide-[#b7b7b7] rounded-lg ">
                <thead className="bg-[#f8fafc] rounded-lg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report, index) => (
                    <tr 
                      key={report.id || index} 
                      className="hover:bg-[#f8fafc]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiFileText className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                          <p>{report?.filename?.replace(/^\d+_/, '') || report?.fileName?.replace(/^\d+_/, '') || 'No filename'}</p>

                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.uploaded_at || report.createdAt || report.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {report.summary ? 'Analyzed' : 'Uploaded'}
                        </span>
                      </td>
                      {tableRowActions(report)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {reports.map((report, index) => (
                <div
                  key={report.id || index}
                  className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FiFileText className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-medium text-gray-900">
                      <p>{report?.filename?.replace(/^\d+_/, '') || report?.fileName?.replace(/^\d+_/, '') || 'No filename'}</p>
                      </span>
                    </div>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {report.summary ? 'Analyzed' : 'Uploaded'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {formatDate(report.uploaded_at || report.createdAt || report.uploadDate)}
                  </div>
                  {mobileActions(report)}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {reports.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No reports yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your first medical report to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        {showSuccessAlert && <SuccessAlert />}
      </AnimatePresence>
    </Layout>
  );
}

export default YourReportPage;