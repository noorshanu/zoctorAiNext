"use client";
/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { FiUpload, FiFile, FiX, FiCheck, FiAlertCircle, FiDownload } from "react-icons/fi";
import { AiOutlineFilePdf } from "react-icons/ai";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { downloadSummaryPdf } from "../../utils/summaryPdfExport";
import {
  createChatMessage,
  streamChatResponse,
  uploadFile,
  updateDocumentSummary,
  API_BASE_URL,
  isZoctorFastApiBackend,
  zoctorExtractPdfText,
  zoctorGenerateSummary,
  zoctorChatReply,
  initiatePaidReport,
  confirmPaidReport,
  downloadPaidReportPdf,
  getMyPaidOrderStatus,
} from "../../utils/api";

const FileUpload = ({ userId: userIdProp }) => {
  const router = useRouter();
  const [effectiveUserId, setEffectiveUserId] = useState(userIdProp || '');
  const [userIdReady, setUserIdReady] = useState(!!userIdProp);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileProgress, setFileProgress] = useState({});
  const [fileStatuses, setFileStatuses] = useState({});
  const [patientInfo, setPatientInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [healthRevealPaymentId, setHealthRevealPaymentId] = useState(null);
  const [healthRevealBusy, setHealthRevealBusy] = useState(false);
  const [paidOrderMeta, setPaidOrderMeta] = useState(null);
  
  // Flow stages: "upload" | "analyzing" | "results"
  const [flowStage, setFlowStage] = useState("upload");
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const chatContainerRef = useRef(null);
  const zoctorBackend = isZoctorFastApiBackend();
  const showChatPanel =
    userIdReady && !!effectiveUserId && (zoctorBackend || analysisResults.length > 0);

  const formatAssistantMessage = useCallback((text) => {
    if (!text || typeof text !== "string") return "";
    let formatted = text.replace(/\r\n/g, "\n").trim();

    // Ensure clear section breaks before markdown headers.
    formatted = formatted.replace(/\n(#{1,6}\s)/g, "\n\n$1");
    // Keep bullet and numbered points visually separated from previous paragraphs.
    formatted = formatted.replace(/\n((?:[-*]\s)|(?:\d+\.\s))/g, "\n\n$1");
    // Improve readability when model returns dense prose in one block.
    formatted = formatted.replace(/([.!?])\s+(?=[A-Z][^a-z])/g, "$1\n\n");

    return formatted;
  }, []);

  useEffect(() => {
    if (userIdProp) {
      setEffectiveUserId(userIdProp);
      setUserIdReady(true);
      return;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userId');
      setEffectiveUserId(stored || '');
    }
    setUserIdReady(true);
  }, [userIdProp]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!userIdReady) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    if (!effectiveUserId) {
      router.push("/dashboard");
    }
  }, [userIdReady, effectiveUserId, router]);

  useEffect(() => {
    const fetchPatientInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/users/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPatientInfo(response.data);
      } catch (error) {
        console.error('Error fetching patient info:', error);
      }
    };

    if (effectiveUserId) {
      fetchPatientInfo();
    }
  }, [effectiveUserId]);

  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedHistory = localStorage.getItem(`chat_history_${effectiveUserId}`);
        if (savedHistory) {
          setChatHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    if (effectiveUserId) {
      loadChatHistory();
    }
  }, [effectiveUserId]);

  useEffect(() => {
    if (effectiveUserId && chatHistory.length > 0) {
      localStorage.setItem(`chat_history_${effectiveUserId}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, effectiveUserId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    const newFiles = pdfFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));

    if (files.length !== pdfFiles.length) {
      setErrorMessage("Only PDF files are allowed");
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setFileStatuses(prev => ({
      ...prev,
      ...Object.fromEntries(newFiles.map(f => [f.id, 'pending']))
    }));
    setFileProgress(prev => ({
      ...prev,
      ...Object.fromEntries(newFiles.map(f => [f.id, 0]))
    }));
  };

  const handleRemoveFile = (fileId) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.previewUrl) {
        URL.revokeObjectURL(removedFile.previewUrl);
      }
      return updatedFiles;
    });
  };

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
    localStorage.removeItem(`chat_history_${effectiveUserId}`);
  }, [effectiveUserId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      if (selectedFiles.length === 0) {
        setErrorMessage("Please select at least one file");
        return;
      }

      clearChatHistory();

      for (const fileObj of selectedFiles) {
        if (!fileObj.file.type || fileObj.file.type !== 'application/pdf') {
          setErrorMessage(`${fileObj.file.name} is not a PDF file`);
          return;
        }

        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (fileObj.file.size > MAX_FILE_SIZE) {
          setErrorMessage(`${fileObj.file.name} exceeds 10MB limit`);
          return;
        }
      }

      const token = localStorage.getItem("accessToken");
      if (!token || !effectiveUserId) {
        setErrorMessage("Authentication required");
        router.push("/login");
        return;
      }

      setFlowStage("analyzing");
      setIsLoading(true);
      setErrorMessage("");
      setAnalysisProgress(0);

      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('sessionId', sessionId);
      }

      if (zoctorBackend) {
        const textParts = [];
        for (let i = 0; i < selectedFiles.length; i++) {
          const fileObj = selectedFiles[i];
          setFileStatuses((prev) => ({ ...prev, [fileObj.id]: 'uploading' }));
          try {
            setAnalysisProgress(Math.round(((i + 0.5) / selectedFiles.length) * 60));
            const { text } = await zoctorExtractPdfText(fileObj.file);
            if (text && text.trim()) {
              textParts.push(`=== ${fileObj.file.name} ===\n${text}`);
            }
            setFileStatuses((prev) => ({ ...prev, [fileObj.id]: 'success' }));
            const progress = Math.round(((i + 1) / selectedFiles.length) * 60);
            setFileProgress((prev) => ({ ...prev, [fileObj.id]: progress, total: progress }));
            setAnalysisProgress(progress);
          } catch (err) {
            console.error(err);
            setFileStatuses((prev) => ({ ...prev, [fileObj.id]: 'error' }));
            throw err;
          }
        }
        const combined = textParts.join('\n\n').trim();
        if (combined.length < 50) {
          throw new Error('Could not read enough text from PDFs. Try text-based PDFs or re-export from your lab portal.');
        }
        if (typeof window !== 'undefined' && effectiveUserId) {
          sessionStorage.setItem(`zoctor_report_raw_${effectiveUserId}`, combined);
        }
        setAnalysisProgress(75);
        const summaryPayload = await zoctorGenerateSummary({
          user_id: effectiveUserId,
          raw_text: combined,
          session_id: sessionId,
          location: 'New Delhi',
          region: 'India',
        });
        const summaryText = summaryPayload.summary || '';
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`zoctor_report_context_${effectiveUserId}`, summaryText);
        }
        setAnalysisProgress(100);
        const filesSnapshot = [...selectedFiles];
        setAnalysisResults([
          {
            _id: `analysis_${Date.now()}`,
            summary: summaryText,
            rawSummaryPayload: summaryPayload,
            timestamp: new Date().toISOString(),
          },
        ]);
        setSuccessMessage('Analysis completed successfully.');
        setSelectedFiles([]);
        setFileStatuses({});
        setFileProgress({});
        setFlowStage("results");
        setIsLoading(false);
        (async () => {
          for (const fileObj of filesSnapshot) {
            try {
              const up = await uploadFile(fileObj.file, sessionId);
              if (up?.id && summaryText) {
                await updateDocumentSummary(up.id, summaryText);
              }
            } catch (e) {
              console.warn('Could not save report to Your Reports library:', e);
            }
          }
        })();
        return;
      }

      const uploadResults = [];
      const fileInfo = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const fileObj = selectedFiles[i];
        
        try {
          setFileStatuses(prev => ({ ...prev, [fileObj.id]: 'uploading' }));
          
          const uploadResponse = await uploadFile(fileObj.file, sessionId);
          
          uploadResults.push({
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            documentId: uploadResponse.id,
            gcsUri: uploadResponse.gcs_uri,
            success: true
          });

          fileInfo.push({
            name: fileObj.file.name,
            size: fileObj.file.size,
            id: uploadResponse.id
          });

          const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
          setFileProgress(prev => ({
            ...prev,
            [fileObj.id]: progress,
            total: progress
          }));
          setAnalysisProgress(progress);

          setFileStatuses(prev => ({ ...prev, [fileObj.id]: 'success' }));
        } catch (error) {
          const errorDetail = error?.response?.data?.detail || error?.response?.data?.error_message || error?.message || 'Upload failed';
          console.error(`Error uploading ${fileObj.file.name}:`, {
            error,
            detail: errorDetail,
            response: error?.response?.data,
            status: error?.response?.status
          });
          setFileStatuses(prev => ({ ...prev, [fileObj.id]: 'error' }));
          uploadResults.push({
            fileId: fileObj.id,
            fileName: fileObj.file.name,
            success: false,
            error: errorDetail
          });
        }
      }

      const successfulUploads = uploadResults.filter(r => r.success);
      
      if (successfulUploads.length === 0) {
        throw new Error("All file uploads failed. Please try again.");
      }

      setAnalysisResults([{
        _id: `analysis_${Date.now()}`,
        files: fileInfo,
        uploadResults: uploadResults,
        timestamp: new Date().toISOString()
      }]);

      setSuccessMessage(`Uploaded ${successfulUploads.length} of ${selectedFiles.length} file(s) successfully.`);
      setSelectedFiles([]);
      setFileStatuses({});
      setFileProgress({});
      setFlowStage("results");

    } catch (error) {
      console.error("Upload error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      const errorHandler = {
        400: "Invalid file format or request",
        401: () => {
          setErrorMessage("Session expired. Please log in again.");
          router.push("/login");
        },
        403: () => {
          setErrorMessage("Access denied. Please check your permissions.");
          router.push("/login");
        },
        413: "File size too large. Maximum size is 10MB.",
        500: "Server error. Please try again later.",
        ECONNABORTED: "Request timed out. Please try again.",
      };

      const errorMessage = typeof errorHandler[error.response?.status] === 'function'
        ? errorHandler[error.response?.status]()
        : errorHandler[error.response?.status] || errorHandler[error.code] ||
          "Error uploading file. Please try again.";

      setErrorMessage(errorMessage);
      setFlowStage("upload");

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach(fileObj => {
        if (fileObj.previewUrl) {
          URL.revokeObjectURL(fileObj.previewUrl);
        }
      });
    };
  }, []);

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) {
      setErrorMessage("Please enter a question.");
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage("");
      
      const questionText = userQuestion.trim();
      const newUserMessage = {
        type: 'user',
        content: questionText,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, newUserMessage]);
      setUserQuestion("");
      
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Please sign in again to continue.");
      }

      setIsTyping(true);

      if (zoctorBackend) {
        try {
          const sessionId = localStorage.getItem('sessionId') || undefined;
          let context = '';
          if (typeof window !== 'undefined') {
            context = sessionStorage.getItem(`zoctor_report_context_${effectiveUserId}`) || '';
          }
          if (!context && analysisResults.length > 0) {
            context = analysisResults[0].summary || '';
          }
          const { reply } = await zoctorChatReply({
            user_id: effectiveUserId,
            message: questionText,
            context,
            session_id: sessionId,
            location: 'New Delhi',
            region: 'India',
          });
          setChatHistory((prev) => [
            ...prev,
            {
              type: 'ai',
              content: reply,
              timestamp: new Date().toISOString(),
            },
          ]);
        } catch (err) {
          const errorMsg = err?.message || 'Chat request failed.';
          setErrorMessage(errorMsg);
          setChatHistory((prev) => [
            ...prev,
            {
              type: 'error',
              content: errorMsg,
              timestamp: new Date().toISOString(),
            },
          ]);
        } finally {
          setIsTyping(false);
          setIsLoading(false);
        }
        return;
      }

      let chatResponse;
      try {
        chatResponse = await createChatMessage(questionText, currentConversationId);
      } catch (error) {
        console.error("Error creating chat message:", error);
        setIsTyping(false);
        setIsLoading(false);
        const errorMsg = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        "Failed to send message.";
        setErrorMessage(errorMsg);
        
        const errorMessage = {
          type: 'error',
          content: errorMsg,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => [...prev, errorMessage]);
        return;
      }
      
      if (chatResponse.conversation_id && !currentConversationId) {
        setCurrentConversationId(chatResponse.conversation_id);
      }
      
      if (!chatResponse.stream_id) {
        console.error("No stream_id in response:", chatResponse);
        setIsTyping(false);
        setIsLoading(false);
        setErrorMessage("Invalid response from server. Missing stream_id.");
        return;
      }

      const aiMessageId = Date.now();
      const newAIMessage = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, newAIMessage]);

      let fullResponse = '';
      const eventSource = streamChatResponse(
        chatResponse.stream_id,
        (word) => {
          fullResponse += (fullResponse ? ' ' : '') + word;
          setChatHistory(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullResponse }
              : msg
          ));
        },
        () => {
          setIsTyping(false);
          setIsLoading(false);
        },
        (error) => {
          console.error("Stream error:", error);
          setIsTyping(false);
          setIsLoading(false);
          setErrorMessage(error || "Failed to get an answer to your question.");
          
          setChatHistory(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, type: 'error', content: error || "Failed to get response." }
              : msg
          ));
        }
      );

      return () => {
        eventSource.close();
      };

    } catch (error) {
      console.error("Error asking question:", error);
      setIsTyping(false);
      setIsLoading(false);
      setErrorMessage(error.message || "Failed to get an answer to your question.");
      
      const errorMessage = {
        type: 'error',
        content: error.message || "Failed to get an answer to your question.",
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  const formatFileSize = (size) => {
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index++;
    }
    return `${size.toFixed(2)} ${units[index]}`;
  };

  const FileStatusIndicator = ({ status, progress }) => {
    const statusConfig = {
      pending: { color: 'text-gray-400', icon: FiFile },
      uploading: { color: 'text-blue-500', icon: FiUpload },
      success: { color: 'text-green-500', icon: FiCheck },
      error: { color: 'text-red-500', icon: FiAlertCircle }
    };

    const StatusIcon = statusConfig[status].icon;

    return (
      <div className="flex items-center">
        <StatusIcon className={`w-5 h-5 ${statusConfig[status].color}`} />
        {status === 'uploading' && progress !== undefined && (
          <span className="ml-2 text-sm text-gray-600">{progress}%</span>
        )}
      </div>
    );
  };

  const getFreeSummaryForDownload = useCallback(() => {
    const withSummary = analysisResults.find((x) => x?.summary && String(x.summary).trim());
    if (withSummary) return withSummary;
    if (typeof window !== 'undefined' && effectiveUserId) {
      const t = sessionStorage.getItem(`zoctor_report_context_${effectiveUserId}`);
      if (t && t.trim()) return { summary: t, text_content: t };
    }
    return null;
  }, [analysisResults, effectiveUserId]);

  const handleDownloadFreeSummaryQuick = async () => {
    const payload = getFreeSummaryForDownload();
    if (!payload) {
      setErrorMessage('No summary to export yet. Upload and analyze a PDF first.');
      return;
    }
    try {
      setErrorMessage('');
      await downloadSummaryPdf({
        summary: payload.summary,
        text_content: payload.text_content,
        patientInfo,
        filename: `ZoctorAI_free_summary_${new Date().toISOString().split('T')[0]}.pdf`,
      });
      setSuccessMessage('Free summary downloaded successfully.');
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to generate PDF. Please try again.');
    }
  };

  const getHealthRevealSourceText = useCallback(() => {
    if (typeof window !== 'undefined' && effectiveUserId) {
      const raw = sessionStorage.getItem(`zoctor_report_raw_${effectiveUserId}`);
      if (raw && raw.trim().length >= 50) return raw.trim();
      const sum = sessionStorage.getItem(`zoctor_report_context_${effectiveUserId}`);
      if (sum && sum.trim().length >= 50) return sum.trim();
    }
    const s = analysisResults[0]?.summary;
    if (s && String(s).trim().length >= 50) return String(s).trim();
    return '';
  }, [effectiveUserId, analysisResults]);

  useEffect(() => {
    if (typeof window === 'undefined' || !effectiveUserId) return;
    const stored = sessionStorage.getItem(`health_reveal_payment_id_${effectiveUserId}`);
    if (stored) setHealthRevealPaymentId(stored);
  }, [effectiveUserId]);

  useEffect(() => {
    if (!zoctorBackend || !healthRevealPaymentId) {
      setPaidOrderMeta(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const st = await getMyPaidOrderStatus(healthRevealPaymentId);
        if (!cancelled) setPaidOrderMeta(st);
      } catch {
        if (!cancelled) setPaidOrderMeta(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [zoctorBackend, healthRevealPaymentId]);

  const handleHealthRevealGenerateAndDownload = async () => {
    if (!effectiveUserId) return;
    const reportText = getHealthRevealSourceText();
    if (reportText.length < 50) {
      setErrorMessage('Need at least 50 characters of report text. Upload and analyze a PDF above first.');
      return;
    }
    setHealthRevealBusy(true);
    setErrorMessage('');
    try {
      let pid = healthRevealPaymentId;
      if (!pid) {
        const initRes = await initiatePaidReport(effectiveUserId, {
          tier: 'tier_1',
          profile_id: `${effectiveUserId}_self`,
          skip_report_check: true,
        });
        const rawId = initRes.payment_id;
        if (!rawId) throw new Error('No payment_id returned');
        pid = String(rawId);
        setHealthRevealPaymentId(pid);
        sessionStorage.setItem(`health_reveal_payment_id_${effectiveUserId}`, pid);
      }
      const res = await confirmPaidReport(effectiveUserId, {
        payment_id: pid,
        confirmation: 'confirm payment',
        profile_id: `${effectiveUserId}_self`,
        report_text: reportText,
        patient_name: 'Patient',
      });
      if (res.success === false) {
        throw new Error(
          typeof res.message === 'string'
            ? res.message
            : typeof res.error === 'string'
              ? res.error
              : 'Generation failed'
        );
      }
      setSuccessMessage(
        typeof res.message === 'string' ? res.message : 'Premium report downloaded successfully.'
      );
      try {
        const st = await getMyPaidOrderStatus(pid);
        setPaidOrderMeta(st);
      } catch {
        /* ignore */
      }
      await downloadPaidReportPdf(pid);
    } catch (e) {
      const raw = String(e?.message || '');
      const lowCredit =
        /credit balance is too low|plans & billing|purchase credits/i.test(raw);
      setErrorMessage(
        lowCredit
          ? 'Premium report is temporarily unavailable right now. You can still download the free summary.'
          : "We couldn't create the premium report. Please try again."
      );
    } finally {
      setHealthRevealBusy(false);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const TypingIndicator = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-start space-x-2"
    >
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="bg-white border border-gray-200 px-4 py-2 rounded-[20px] rounded-tl-[5px]">
        <div className="flex space-x-1">
          <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 p-3 sm:p-5">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Stage 1: Upload Section */}
        {flowStage === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-prime shadow-lg shadow-blue-200 flex items-center justify-center">
                  <FiUpload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload your medical reports</h2>
                  <p className="mt-1 text-sm text-gray-600">Add PDF reports to create a clear summary and unlock downloads.</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 shadow-inner"
                    : "border-gray-300 bg-gray-50/60 hover:border-prime hover:bg-blue-50/30"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf"
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiUpload className={`w-12 h-12 mb-4 ${
                    dragActive ? "text-blue-500" : "text-gray-400"
                  }`} />
                  <span className="text-gray-700 font-semibold text-center">
                    {dragActive
                      ? "Drop your files here"
                      : "Drag and drop your PDF reports here, or click to browse"}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    Maximum 10 files, 10MB each
                  </span>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  {selectedFiles.map(fileObj => (
                    <div
                      key={fileObj.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <AiOutlineFilePdf className="w-8 h-8 text-red-500" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 truncate">
                            {fileObj.file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(fileObj.file.size)}
                          </p>
                        </div>
                        <FileStatusIndicator
                          status={fileStatuses[fileObj.id]}
                          progress={fileProgress[fileObj.id]}
                        />
                      </div>
                      {fileStatuses[fileObj.id] !== 'uploading' && (
                        <button
                          onClick={() => handleRemoveFile(fileObj.id)}
                          className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading || selectedFiles.length === 0}
                className={`mt-6 w-full py-3.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 ${
                  isLoading || selectedFiles.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-prime hover:bg-blue-600 shadow-lg shadow-blue-200 hover:shadow-xl"
                }`}
              >
                {selectedFiles.length === 0
                  ? "Select reports to continue"
                  : `Analyze ${selectedFiles.length} ${selectedFiles.length === 1 ? 'report' : 'reports'}`}
              </button>
            </div>
          </motion.div>
        )}

        {/* Stage 2: Analyzing Animation */}
        {flowStage === "analyzing" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6"
          >
            <div className="w-full max-w-md">
              <motion.div
                className="mb-8 flex justify-center"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-prime to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </motion.div>

              <div className="text-center space-y-4">
                <motion.h3
                  className="text-2xl font-bold text-gray-900"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Analyzing your reports
                </motion.h3>
                <p className="text-gray-600">
                  Our AI is reviewing your medical documents and preparing a comprehensive summary...
                </p>
                
                <div className="mt-8 space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-prime to-indigo-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${analysisProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center">{analysisProgress}% complete</p>
                </div>

                <motion.div
                  className="flex justify-center gap-2 pt-6"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {['Reading documents', 'Extracting insights', 'Generating summary'].map((text, i) => (
                    <motion.div
                      key={text}
                      className="text-xs text-gray-500 px-3 py-1.5 bg-gray-100 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
                    >
                      {text}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Results (Summary + Downloads + Chat) */}
        {flowStage === "results" && (
          <>
            {/* Compact summary with downloads */}
            {analysisResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-100 shrink-0">
                    <FiCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Your summary is ready</h2>
                    <p className="text-sm text-gray-600 mt-1">Review below and download in your preferred format.</p>
                  </div>
                </div>

                {/* Download cards */}
                <div className="grid gap-3 md:grid-cols-2 mb-6">
                  <button
                    type="button"
                    onClick={handleDownloadFreeSummaryQuick}
                    disabled={!getFreeSummaryForDownload()}
                    className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 text-left hover:border-emerald-300 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
                        <FiDownload className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-emerald-900">Free summary</h3>
                        <p className="text-xs text-gray-600 mt-0.5">Quick PDF export</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleHealthRevealGenerateAndDownload}
                    disabled={
                      healthRevealBusy ||
                      !effectiveUserId ||
                      !zoctorBackend ||
                      getHealthRevealSourceText().length < 50
                    }
                    className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 text-left hover:border-blue-300 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-prime flex items-center justify-center shadow-md">
                        <FiDownload className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Premium report</h3>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {healthRevealBusy ? "Generating..." : "Professionally formatted"}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Summary content */}
                <div className="rounded-2xl bg-gray-50/80 p-5 ring-1 ring-gray-100">
                  <div className="prose prose-sm max-w-none bg-white p-5 rounded-xl border border-gray-200">
                    <div className="text-gray-700">
                      {analysisResults[0]?.summary ? (
                        <ReactMarkdown>{analysisResults[0].summary}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Your summary will appear here once processing is complete.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFlowStage("upload");
                    setAnalysisResults([]);
                    clearChatHistory();
                  }}
                  className="mt-4 text-sm text-gray-600 hover:text-prime font-medium"
                >
                  ← Upload new reports
                </button>
              </motion.div>
            )}

            {/* Chat Section */}
            {showChatPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 via-white to-pink-50 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Ask questions</h2>
                        <p className="text-sm text-gray-600">Get personalized insights about your health data</p>
                      </div>
                    </div>
                    
                    {chatHistory.length > 0 && (
                      <motion.button
                        onClick={clearChatHistory}
                        className="px-3 py-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear
                      </motion.button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-200 p-5 min-h-[420px] flex flex-col">
                    <div 
                      ref={chatContainerRef}
                      className="flex-grow space-y-5 overflow-y-auto mb-5 max-h-[480px] scroll-smooth pr-2"
                    >
                      <AnimatePresence>
                        {chatHistory.map((message, index) => (
                          <motion.div
                            key={message.timestamp + index}
                            layout
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={messageVariants}
                          >
                            {message.type === 'user' ? (
                              <div className="flex justify-end items-start gap-2">
                                <motion.div 
                                  className="flex flex-col items-end"
                                  initial={{ x: 20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                  <div className="bg-prime text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                                  </div>
                                  <span className="text-xs text-gray-400 mt-1">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                </motion.div>
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                                  <span className="text-white font-bold text-xs">You</span>
                                </div>
                              </div>
                            ) : message.type === 'ai' ? (
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                </div>
                                <motion.div 
                                  className="flex flex-col"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                  <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[min(85%,45rem)] shadow-sm">
                                    <ReactMarkdown
                                      components={{
                                        p: ({ children }) => <p className="text-[15px] leading-7 text-gray-800 mb-4 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4 last:mb-0 text-[15px] leading-7 text-gray-800">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4 last:mb-0 text-[15px] leading-7 text-gray-800">{children}</ol>,
                                        li: ({ children }) => <li className="leading-7">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                        h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mb-3">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-bold text-gray-900 mb-3">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{children}</h3>,
                                      }}
                                    >
                                      {formatAssistantMessage(message.content)}
                                    </ReactMarkdown>
                                  </div>
                                  <span className="text-xs text-gray-400 mt-1">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                  </span>
                                </motion.div>
                              </div>
                            ) : (
                              <motion.div 
                                className="flex justify-center"
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 10, opacity: 0 }}
                              >
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">
                                  {message.content}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      <AnimatePresence>
                        {isTyping && <TypingIndicator />}
                      </AnimatePresence>
                    </div>

                    <motion.div 
                      className="flex items-center gap-3 bg-white rounded-2xl border-2 border-gray-200 p-1.5 pl-4 focus-within:border-prime transition-colors"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <input
                        type="text"
                        placeholder="Ask anything about your results..."
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        className="flex-1 text-[15px] focus:outline-none bg-transparent placeholder:text-gray-400"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isLoading && userQuestion.trim()) {
                            handleAskQuestion();
                          }
                        }}
                      />
                      <button
                        onClick={handleAskQuestion}
                        disabled={isLoading || !userQuestion.trim()}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                          isLoading || !userQuestion.trim()
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-prime text-white hover:bg-blue-600 shadow-md shadow-blue-200"
                        }`}
                      >
                        {isLoading ? (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          "Send"
                        )}
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl shadow-xl max-w-md"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-xl shadow-xl max-w-md"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FileUpload;
