"use client"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-primary text-secondary py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">BOSCO</h3>
            <p className="text-secondary/70 text-sm leading-relaxed">
              Celebrating African heritage through luxury fashion and artisanal craftsmanship.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/store" className="text-secondary/70 hover:text-accent transition">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/store" className="text-secondary/70 hover:text-accent transition">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/store" className="text-secondary/70 hover:text-accent transition">
                  Sale
                </Link>
              </li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#about" className="text-secondary/70 hover:text-accent transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-secondary/70 hover:text-accent transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className="text-secondary/70 hover:text-accent transition">
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>
          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-secondary/70 hover:text-accent transition">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="text-secondary/70 hover:text-accent transition">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="text-secondary/70 hover:text-accent transition">
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-secondary/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-secondary/70">
          <p>&copy; {currentYear} Bosco Clothings. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/" className="hover:text-accent transition">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-accent transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}