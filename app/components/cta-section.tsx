import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-secondary">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Ready to Experience African Luxury?</h2>
        <p className="text-lg text-primary/70 mb-8 max-w-2xl mx-auto leading-relaxed">
          Explore our exclusive collections and discover pieces that celebrate heritage, artistry, and contemporary
          elegance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/store"
            className="px-8 py-4 bg-primary text-secondary font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            Start Shopping
          </Link>
          <Link
            href="/bookings"
            className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </section>
  )
}
