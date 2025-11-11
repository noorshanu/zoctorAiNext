"use client";
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { AiOutlineHeart } from 'react-icons/ai'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'

//

const MedicalTour = () => {
  const audioRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  // progress/time omitted in this design
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.9)
  const [level, setLevel] = useState(0)

  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const dataArrayRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = isMuted
  }, [isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      stopVisualizer()
    } else {
      // Lazily create audio context/visualizer on user gesture
      if (!audioContextRef.current) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext
          audioContextRef.current = new AudioCtx()
          analyserRef.current = audioContextRef.current.createAnalyser()
          analyserRef.current.fftSize = 256
          dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
          sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
          // Connect source -> analyser -> speakers so sound is audible
          sourceRef.current.connect(analyserRef.current)
          analyserRef.current.connect(audioContextRef.current.destination)
        } catch {
          // Fail silently; visualizer is optional
        }
      }
      try {
        // Some browsers require resuming the AudioContext after user interaction
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        await audio.play()
        setIsPlaying(true)
        startVisualizer()
      } catch {
        setIsPlaying(false)
      }
    }
  }


  const startVisualizer = () => {
    if (!analyserRef.current || !dataArrayRef.current) return
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current
    const tick = () => {
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
      const avg = sum / dataArray.length
      setLevel(Math.min(1, avg / 255))
      rafRef.current = requestAnimationFrame(tick)
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }

  const stopVisualizer = () => {
    cancelAnimationFrame(rafRef.current)
    setLevel(0)
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <section id="medical-tour-podcast" className="relative py-16 md:py-24  overflow-hidden">
      {/* <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" /> */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-14"
        >
       
          <h2 className="text-4xl txt-grad sm:text-6xl font-manbold pb-4 font-medium  items-center tracking-tight text-slate-900">
            Medical Tourism Podcast
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Insights and stories from around the world of Medical Tourism.
          </p>
        </motion.div>

        {/* Centered image card with overlay controls only */}
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-2xl"
          >
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-blue-500/25 blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden bg-[#0f1420] border border-blue-400/30 shadow-[0_28px_70px_-18px_rgba(59,130,246,0.45)]">
              <img
                src="/podcast.png"
                alt="Podcast cover"
                className="w-full h-[420px] object-cover opacity-90"
                loading="lazy"
              />

              {/* Reactive glow */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(600px 220px at 30% 30%, rgba(37,99,235,0.18), transparent), radial-gradient(500px 200px at 70% 70%, rgba(6,182,212,0.18), transparent)'
                }}
                animate={{ opacity: isPlaying ? 0.6 + level * 0.3 : 0.35 }}
                transition={{ duration: 0.2 }}
              />

              {/* Center play/pause */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="group relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-900 ring-2 ring-white/70 shadow-[0_10px_30px_rgba(59,130,246,0.35)] backdrop-blur-md hover:scale-105 transition z-10"
                >
                  {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} className="pl-0.5" />}
                  {isPlaying && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-white/40"
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: [0.5, 0.15, 0.5], scale: [1, 1.12, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </button>
              </div>

              {/* Heart + menu */}
              <div className="absolute top-8 left-8 text-white/90">
                <AiOutlineHeart size={26} className="drop-shadow-md" />
              </div>
              <div className="absolute top-8 right-8 text-white/90">
                <HiOutlineDotsHorizontal size={28} className="drop-shadow-md" />
              </div>

              {/* Volume button + hover slider */}
              <div className="absolute bottom-6 right-6">
                <div className="group inline-flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted((v) => !v)}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 ring-1 ring-slate-200 shadow-[0_8px_22px_rgba(2,6,23,0.35)]"
                  >
                    {isMuted || level === 0 ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
                  </button>
                  <div className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const audio = audioRef.current
                        if (!audio) return
                        const val = parseFloat(e.target.value)
                        setVolume(val)
                        if (val === 0) {
                          !isMuted && setIsMuted(true)
                        } else if (isMuted) {
                          setIsMuted(false)
                        }
                        audio.volume = val
                      }}
                      className="w-36 h-2 accent-blue-600 bg-white/60 rounded-full appearance-none [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow [&::-moz-range-progress]:bg-blue-600 [&::-moz-range-progress]:h-2"
                      style={{
                        background: `linear-gradient(to right, #2563eb ${Math.max(0, Math.min(100, Math.round((isMuted ? 0 : volume) * 100)))}%, rgba(255,255,255,0.6) ${Math.max(0, Math.min(100, Math.round((isMuted ? 0 : volume) * 100)))}%)`
                      }}
                      aria-label="Volume"
                    />
                  </div>
                </div>
              </div>

              {/* Hidden audio */}
              <audio ref={audioRef} src="/med.wav" preload="metadata" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default MedicalTour
