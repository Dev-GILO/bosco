import Link from "next/link"

export default function CollectionsSection() {
  const collections = [
    {
      name: "Heritage Prints",
      description: "Bold, vibrant patterns inspired by traditional African textiles",
      image: "/african-heritage-print-fashion.jpg",
    },
    {
      name: "Elegance Series",
      description: "Sophisticated designs with subtle cultural accents",
      image: "/elegant-luxury-african-fashion.jpg",
    },
    {
      name: "Modern Tribal",
      description: "Contemporary fusion of tribal elements with modern aesthetics",
      image: "/modern-tribal-luxury-clothing.jpg",
    },
  ]

  return (
    <section id="collections" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-2">Collections</p>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Explore Our Curated Collections</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Each collection tells a unique story of cultural richness and artistic innovation.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {collections.map((collection, idx) => (
            <Link key={idx} href="/store" className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg mb-4 bg-muted h-96">
                <img
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">{collection.name}</h3>
              <p className="text-foreground/70 mb-4">{collection.description}</p>
              <div className="text-accent font-semibold text-sm group-hover:translate-x-2 transition">Explore →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
