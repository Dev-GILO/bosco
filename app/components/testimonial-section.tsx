export default function TestimonialSection() {
  const testimonials = [
    {
      text: "Bosco Clothings captures the essence of African elegance. Every piece is a work of art.",
      author: "Amara K.",
      title: "Fashion Enthusiast",
    },
    {
      text: "I love that each purchase supports artisans directly. The quality is impeccable.",
      author: "Kwesi M.",
      title: "Sustainable Fashion Advocate",
    },
    {
      text: "These pieces make me feel connected to my heritage while looking absolutely stunning.",
      author: "Zainab A.",
      title: "Customer",
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-primary">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-2">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6">Loved by Our Community</h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-secondary/10 p-8 rounded-lg border border-accent/30 hover:border-accent/60 transition"
            >
              <p className="text-secondary/90 text-lg mb-6 leading-relaxed italic">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-secondary">{testimonial.author}</p>
                <p className="text-accent text-sm">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
