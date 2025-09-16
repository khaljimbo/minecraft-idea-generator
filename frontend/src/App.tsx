import React, { useLayoutEffect, useRef, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import { gsap } from 'gsap'
import './App.css'
import heroImg from './assets/minecraft-background.png'
import logoImg from './assets/minecraft-idea-generator-logo.png'

type IdeaResponse = {
  idea?: string
  error?: string
}

export default function App() {
  const [theme, setTheme] = useState('medieval')
  const [complexity, setComplexity] = useState('easy')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IdeaResponse | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const resultRef = useRef<HTMLDivElement | null>(null)
  // Animate result card in when a new idea is shown
  useEffect(() => {
    if (result && result.idea && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }
      )
    }
  }, [result?.idea])

  useLayoutEffect(() => {
    if (!boxRef.current) return

    // animate into view, then remove any inline styles GSAP added so the element
    // returns to CSS-managed styling (avoids persistent low-opacity overlays)
    const tween = gsap.fromTo(
      boxRef.current,
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          // clear inline properties GSAP set so we don't leave a strange state
          try {
            gsap.set(boxRef.current, { clearProps: 'all' })
          } catch {
            /* ignore */
          }
        },
      },
    )

    return () => {
      tween.kill()
      try {
        gsap.set(boxRef.current, { clearProps: 'all' })
      } catch {
        /* ignore */
      }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const payload = { theme, complexity }
      const resp = await axios.post('/api/GenerateIdea', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // Handle both possible response shapes
      let idea = resp.data?.Idea || resp.data?.idea
      if (!idea && resp.data?.result?.response) {
        idea = resp.data.result.response
      }
      if (idea) {
        setResult({ idea })
      } else if (resp.data?.error) {
        setResult({ error: resp.data.error })
      } else {
        setResult({ error: 'No idea returned from API.' })
      }
      // simple GSAP highlight
      if (boxRef.current) {
        gsap.fromTo(boxRef.current, { scale: 0.98 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.6)' })
      }
    } catch (err: any) {
      setResult({ error: err?.response?.data?.error || err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      {/* Hero image top half */}
      <div className="w-full relative" style={{ height: '50vh' }}>
        <img src={heroImg} alt="Minecraft hero" className="w-full h-full object-cover" style={{ height: '100%' }} />
        <img
          src={logoImg}
          alt="Minecraft Idea Generator Logo"
          className="absolute left-1/2 top-1/2 w-2/3 h-full -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none"
          style={{ zIndex: 2 }}
        />
      </div>
      {/* Main content area below hero */}
      {/* Centered card overlay */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="rounded-lg shadow-2xl border-4 border-stone-700 p-8 max-w-md w-[90vw] text-center bg-[url('./assets/minecraft-card-background.png')] bg-contain bg-center">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="theme" className="block mb-1 text-slate-300 minecraft-label">Choose a theme</label>
              <input
                id="theme"
                type="text"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                className="border border-stone-500 px-2 py-1 w-full bg-stone-600 text-white rounded-md"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="complexity" className="block mb-1 text-slate-300 minecraft-label">How hard do you want it?</label>
              <select
                id="complexity"
                value={complexity}
                onChange={e => setComplexity(e.target.value)}
                className="border border-stone-500 px-2 py-1 w-full bg-stone-600 text-white rounded-md"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 w-full border bg-stone-700 border-stone-500 rounded-md text-slate-300 hover:bg-stone-600 transition minecraft-label overflow-hidden relative"
                style={{ position: 'relative' }}
              >
                {loading ? 'Generating...' : 'Generate Idea'}
                {loading && <span className="generating-bar" />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Result output below card, above footer */}
      {result && (
        <div className="w-full flex flex-col items-center mt-[15vh] mb-72 z-20 relative">
          <div
            ref={resultRef}
            className="bg-stone-800/90 border border-stone-600 rounded-lg px-6 py-4 w-2/3 text-center shadow-lg"
            style={{ opacity: 0 }}
          >
            {result.idea && (
              <div className="font-semibold text-lg text-lime-200 minecraft-label text-left" style={{whiteSpace: 'pre-line'}}>
                <ReactMarkdown>{result.idea}</ReactMarkdown>
              </div>
            )}
            {result.error && <div className="text-red-500 minecraft-label">{result.error}</div>}
          </div>
        </div>
      )}
    {/* Footer overlay info and GitHub link */}
    <div style={{
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100vw',
      height: '100px',
      zIndex: 70,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }}>
      <div
        style={{
          background: 'rgba(30, 30, 30, 0.85)',
          color: '#d1fa99',
          fontFamily: 'Press Start 2P, monospace',
          fontSize: '0.85rem',
          borderRadius: '8px 8px 0 0',
          padding: '10px 24px 6px 24px',
          marginBottom: '12px',
          boxShadow: '0 0 8px #000a',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <span>Minecraft Build Idea Generator &copy; {new Date().getFullYear()}</span>
        <a
          href="https://github.com/khaljimbo/minecraft-idea-generator"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#8ecaff', textDecoration: 'underline', fontWeight: 700 }}
        >
          View on GitHub
        </a>
      </div>
    </div>
    <div className="minecraft-footer"></div>
  </div>
  )
}
