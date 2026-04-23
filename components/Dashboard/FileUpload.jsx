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
  /** Tier-1 Health Reveal (simulated payment in dev) */
  const [healthRevealPaymentId, setHealthRevealPaymentId] = useState(null);
  const [healthRevealBusy, setHealthRevealBusy] = useState(false);
  const [paidOrderMeta, setPaidOrderMeta] = useState(null);

  const chatContainerRef = useRef(null);
  const zoctorBackend = isZoctorFastApiBackend();
  const showChatPanel =
    userIdReady && !!effectiveUserId && (zoctorBackend || analysisResults.length > 0);

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
      status: 'pending' // pending, uploading, success, error
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
      // Cleanup preview URL
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.previewUrl) {
        URL.revokeObjectURL(removedFile.previewUrl);
      }
      return updatedFiles;
    });
  };

  // Add function to clear chat history
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

      // Clear existing chat history when analyzing new files
      clearChatHistory();

      // Validate all files
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

      setIsLoading(true);
      setErrorMessage("");

      // Get or create session ID
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
            const { text } = await zoctorExtractPdfText(fileObj.file);
            if (text && text.trim()) {
              textParts.push(`=== ${fileObj.file.name} ===\n${text}`);
            }
            setFileStatuses((prev) => ({ ...prev, [fileObj.id]: 'success' }));
            const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
            setFileProgress((prev) => ({ ...prev, [fileObj.id]: progress, total: progress }));
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

      // Upload files one by one using the new API
      const uploadResults = [];
      const fileInfo = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const fileObj = selectedFiles[i];
        
        try {
          // Update file status to uploading
          setFileStatuses(prev => ({ ...prev, [fileObj.id]: 'uploading' }));
          
          // Upload file using new API
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

          // Update progress
          const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
          setFileProgress(prev => ({
            ...prev,
            [fileObj.id]: progress,
            total: progress
          }));

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

      // Check if any uploads succeeded
      const successfulUploads = uploadResults.filter(r => r.success);
      
      if (successfulUploads.length === 0) {
        throw new Error("All file uploads failed. Please try again.");
      }

      // Set analysis results
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

    } catch (error) {
      console.error("Upload error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // 7. Specific Error Handling
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
        throw new Error("User is not authenticated. Please log in again.");
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

      // Create message and get stream_id
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
      
      // Update conversation ID if this is a new conversation
      if (chatResponse.conversation_id && !currentConversationId) {
        setCurrentConversationId(chatResponse.conversation_id);
      }
      
      // Check if stream_id exists
      if (!chatResponse.stream_id) {
        console.error("No stream_id in response:", chatResponse);
        setIsTyping(false);
        setIsLoading(false);
        setErrorMessage("Invalid response from server. Missing stream_id.");
        return;
      }

      // Create placeholder AI message for streaming
      const aiMessageId = Date.now();
      const newAIMessage = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, newAIMessage]);

      // Stream the response
      let fullResponse = '';
      const eventSource = streamChatResponse(
        chatResponse.stream_id,
        (word) => {
          // Append each word to the response
          fullResponse += (fullResponse ? ' ' : '') + word;
          // Update the AI message in real-time
          setChatHistory(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: fullResponse }
              : msg
          ));
        },
        () => {
          // Stream complete
          setIsTyping(false);
          setIsLoading(false);
        },
        (error) => {
          // Error occurred
          console.error("Stream error:", error);
          setIsTyping(false);
          setIsLoading(false);
          setErrorMessage(error || "Failed to get an answer to your question.");
          
          // Update the message to show error
          setChatHistory(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, type: 'error', content: error || "Failed to get response." }
              : msg
          ));
        }
      );

      // Store eventSource for cleanup if needed
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
    } catch (error) {
      console.error(error);
      setErrorMessage('Failed to generate PDF. Please try again.');
    }
  };

  const handleDownloadSummary = async (result) => {
    try {
      setErrorMessage('');
      await downloadSummaryPdf({
        summary: result?.summary,
        text_content: result?.text_content,
        patientInfo,
        filename: `ZoctorAI_free_summary_${new Date().toISOString().split('T')[0]}.pdf`,
      });
    } catch (error) {
      console.error('Error downloading summary:', error);
      setErrorMessage('Failed to generate PDF report. Please try again.');
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

  /** One step: backend still uses order/payment_id; no real card until you wire Stripe. */
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
        typeof res.message === 'string' ? res.message : 'Health Reveal PDF downloaded.'
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
          ? 'Premium report is temporarily unavailable due to AI service billing limits. You can still download the free summary PDF.'
          : raw || 'Health Reveal failed.'
      );
    } finally {
      setHealthRevealBusy(false);
    }
  };

  const handleHealthRevealDownloadOnly = async () => {
    if (!healthRevealPaymentId) return;
    setHealthRevealBusy(true);
    setErrorMessage('');
    try {
      await downloadPaidReportPdf(healthRevealPaymentId);
    } catch (e) {
      setErrorMessage(e?.message || 'Download failed.');
    } finally {
      setHealthRevealBusy(false);
    }
  };

  // Animation variants
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

  // Typing indicator component
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
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Section 1: File Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-prime flex items-center justify-center">
              <FiUpload className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Upload Your Medical Reports</h2>
          </div>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-prime"
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
              <span className="text-gray-600 font-medium text-center">
                {dragActive
                  ? "Drop your files here"
                  : "Drag and drop your PDF files here, or click to browse"}
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
            className={`mt-6 w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
              isLoading || selectedFiles.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-prime hover:bg-blue-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Files...
              </span>
            ) : (
              `Upload and Analyze ${selectedFiles.length} ${selectedFiles.length === 1 ? 'File' : 'Files'}`
            )}
          </button>
        </div>

        {/* PDF downloads: free + premium */}
        {userIdReady && effectiveUserId && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-prime/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Download PDFs</h2>
              <span className="text-xs text-gray-500">Authenticated session</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                <h3 className="font-semibold text-emerald-900 mb-1">Free summary PDF</h3>
                <p className="text-sm text-gray-600 mb-3">
                  One-click export of your AI summary.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadFreeSummaryQuick}
                  disabled={!getFreeSummaryForDownload()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiDownload className="w-5 h-5" />
                  Download free summary
                </button>
              </div>

              <div className="rounded-lg border border-prime/30 bg-blue-50/50 p-4">
                <h3 className="font-semibold text-gray-900 mb-1">Premium Health Reveal PDF</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Full Tier-1 styled report generated from the backend.
                </p>
                <button
                  type="button"
                  onClick={handleHealthRevealGenerateAndDownload}
                  disabled={
                    healthRevealBusy ||
                    !effectiveUserId ||
                    !zoctorBackend ||
                    getHealthRevealSourceText().length < 50
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-prime text-white font-medium hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  {healthRevealBusy ? "Working..." : "Download premium PDF"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Generated Summary */}
        {analysisResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <FiCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Analysis Summary</h2>
                  <p className="text-sm text-gray-500">Use the Download PDFs section above for the free summary button.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {analysisResults.map((result, index) => (
                <div key={result._id || index} className="bg-gray-50 rounded-xl p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Your Medical Report Analysis</h3>
                  </div>

                  <div className="prose prose-sm max-w-none bg-white p-6 rounded-lg border border-gray-200">
                    <div className="text-gray-700">
                      {result.summary ? (
                        <ReactMarkdown>{result.summary}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No AI summary text in this session. Use the FastAPI flow (Zoctor backend) on this page to
                          generate a summary, or open <strong>Download PDFs</strong> above after analyzing a PDF.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: AI Chat (Zoctor FastAPI: POST /api/v1/chat/reply) */}
        {showChatPanel && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 ml-3">Ask ZoctorAI</h2>
                </div>
                {zoctorBackend && analysisResults.length === 0 && (
                  <p className="text-sm text-gray-500 ml-11 max-w-xl">
                    Upload and analyze a PDF above to attach report text as context. You can still ask questions now—replies use your account without document context until a summary exists.
                  </p>
                )}
              </div>
              
              {chatHistory.length > 0 && (
                <motion.button
                  onClick={clearChatHistory}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear Chat</span>
                </motion.button>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 min-h-[400px] flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-grow space-y-6 overflow-y-auto mb-6 max-h-[500px] scroll-smooth"
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
                      className="space-y-6"
                    >
                      {message.type === 'user' ? (
                        <div className="flex justify-end items-start space-x-2">
                          <motion.div 
                            className="flex flex-col items-end"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          >
                            <div className="bg-[#0B84FE] text-[#fff] px-4 py-2 rounded-[20px] rounded-tr-[5px] max-w-[90%] shadow-sm">
                              <p className="text-[15px] leading-[1.4]">{message.content}</p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </motion.div>
                          <div className="w-8 h-8 rounded-full bg-[#6f6f6f] flex-shrink-0 flex items-center justify-center">
                            <span className="text-[#fff] font-bold text-sm">ZI</span>
                          </div>
                        </div>
                      ) : message.type === 'ai' ? (
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-full bg-[#9930da] flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#fff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                          <motion.div 
                            className="flex flex-col"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          >
                            <div className="bg-[#76ccf0] border px-4 py-2 rounded-[20px] rounded-tl-[5px] max-w-[min(80%,42rem)] shadow-sm prose prose-sm text-gray-800">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                            <span className="text-xs text-[#8d8d8d] mt-1">
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
                          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                            {message.content}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && <TypingIndicator />}
                </AnimatePresence>
              </div>

              {/* Question Input */}
              <motion.div 
                className="flex items-center space-x-3 bg-white rounded-full border border-gray-200 p-1 pl-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  className="flex-1 text-[15px] focus:outline-none bg-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading && userQuestion.trim()) {
                      handleAskQuestion();
                    }
                  }}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !userQuestion.trim()}
                  className={`px-4 py-2 rounded-full transition-all duration-200 ${
                    isLoading || !userQuestion.trim()
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#0B84FE] text-white hover:bg-blue-600"
                  }`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Ask"
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg max-w-md">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg max-w-md">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;