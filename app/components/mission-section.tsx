export default function MissionSection() {
  return (
    <section id="about" className="relative py-20 md:py-32 bg-secondary">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-2">Our Mission</p>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Celebrating African Excellence</h2>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto leading-relaxed">
            At Bosco Clothings, we believe that fashion is a powerful medium for cultural expression. We partner with
            artisans across Africa to create pieces that honor tradition while embracing contemporary design.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Authentic Craftsmanship",
              description:
                "Each piece is meticulously crafted by skilled artisans who bring generations of expertise to their work.",
            },
            {
              title: "Sustainable Luxury",
              description:
                "We source ethical materials and support fair trade practices to ensure our impact is positive.",
            },
            {
              title: "Cultural Pride",
              description: "Our designs celebrate the rich heritage and artistic traditions of African communities.",
            },
          ].map((value, idx) => (
            <div key={idx} className="bg-primary/5 p-8 rounded-lg hover:bg-primary/10 transition">
              <h3 className="text-xl font-semibold text-primary mb-3">{value.title}</h3>
              <p className="text-primary/70 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
