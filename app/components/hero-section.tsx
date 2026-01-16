"use client"
import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  
  const words = ["Create", "Elevate", "Express"]

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const currentWord = words[wordIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseAfterComplete = 2000
    const pauseAfterDelete = 500

    if (!isDeleting && displayedText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseAfterComplete)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && displayedText === "") {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % words.length)
      const timeout = setTimeout(() => {}, pauseAfterDelete)
      return () => clearTimeout(timeout)
    }

    const timeout = setTimeout(() => {
      setDisplayedText((prev) => {
        if (isDeleting) {
          return currentWord.substring(0, prev.length - 1)
        } else {
          return currentWord.substring(0, prev.length + 1)
        }
      })
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, wordIndex])

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-0">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: "transform 0.1s ease-out"
        }}
      >
        <Image
          src="/hero.jpg"
          alt="Bosco Clothings Hero"
          fill
          priority
          className="object-cover scale-110"
          quality={90}
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-primary/60" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -mr-48 -mt-48 z-[1]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -ml-40 -mb-40 z-[1]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Main Heading with Typing Animation */}
        <h1
          className={`text-6xl md:text-7xl font-bold text-secondary mb-6 transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <span className="text-accent">
            {displayedText}
          </span>{" "}
          your style with Bosco Clothing
        </h1>

        {/* Subheading */}
        <p
          className={`text-lg md:text-xl text-secondary/80 max-w-2xl mx-auto mb-8 transition-all duration-1000 delay-100 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          Exquisite luxury fashion celebrating the richness of African culture. Every piece tells a story of tradition,
          artistry, and modern sophistication.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-200 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <Link
            href="/store"
            className="px-8 py-4 bg-accent text-primary font-semibold rounded-lg hover:bg-accent/90 transition flex items-center justify-center gap-2 group"
          >
            Shop Collection
            <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
          </Link>
          <Link
            href="#about"
            className="px-8 py-4 border-2 border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition"
          >
            Learn Our Story
          </Link>
        </div>
      </div>
    </section>
  )
}