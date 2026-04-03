import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-stone-50">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src="/assets/OMIndianRestaurant_Hero.jpg"
          alt="Restaurant Interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">ABOUT US</h1>
        </div>
      </div>

      {/* Content */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              <span className="text-[#C41E3A] font-bold text-2xl">OM</span> .....is a spiritual symbol that signifies peace and the essence of the ultimate consciousness. The meaning and connotation of the word <span className="text-[#C41E3A] font-bold">OM</span> varies.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              <span className="text-[#C41E3A] font-bold">OM</span> prides itself on creating a distinct, regional elegance from both popular and nostalgic Indian food traditions.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              We at home strive to create an experience of classic yet unexplored charms of India&apos;s various regions. Expertly curated by our Executive Chef.
            </p>

            <div className="bg-[#1A1A1A] text-white p-8 rounded-2xl my-12">
              <h2 className="text-2xl font-bold mb-4 text-[#C41E3A]">The Taste of Experience!</h2>
              <p className="text-gray-300 leading-relaxed">
                <span className="text-white font-semibold">OM</span> focuses on long-forgotten unique regional and coastal subtleties, from prominent and nostalgic Indian food traditions.
              </p>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16">
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image 
                src="/assets/OMIndianRestaurant_ChickenTikkaMasala.jpg" 
                alt="Chicken Tikka Masala"
                fill
                className="object-cover hover:scale-110 transition-transform duration-200"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image 
                src="/assets/OMIndianRestaurant_LambRojhanjosh.jpg" 
                alt="Lamb Rogan Josh"
                fill
                className="object-cover hover:scale-110 transition-transform duration-200"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image 
                src="/assets/OMIndianRestaurant_TandoonPaneer.jpg" 
                alt="Tandoori Paneer"
                fill
                className="object-cover hover:scale-110 transition-transform duration-200"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image 
                src="/assets/OMIndianRestaurant_GarlicNaan.jpg" 
                alt="Garlic Naan"
                fill
                className="object-cover hover:scale-110 transition-transform duration-200"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image 
                src="/assets/OMIndianRestaurant_GulabJamun.jpg" 
                alt="Gulab Jamun"
                fill
                className="object-cover hover:scale-110 transition-transform duration-200"
              />
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image 
                src="/assets/OMIndianRestaurant_SalmonTikka.jpg" 
                alt="Salmon Tikka"
                fill
                className="object-cover hover:scale-110 transition-transform duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
