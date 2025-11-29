import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export default function Home() {
  return (
    <div className="bg-stone-50">
      {/* Hero Section */}
      <div className="relative h-[85vh] min-h-[600px] w-full">
        <Image
          src="/assets/OMIndianRestaurant_Hero.jpg"
          alt="Delicious Indian Food"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            The Taste of <span className="text-[#C41E3A]">Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl font-light">
            Authentic Indian flavors with a distinct, regional elegance
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/order" 
              className="bg-[#C41E3A] text-white px-10 py-4 rounded text-lg font-semibold hover:bg-[#a01830] transition-colors shadow-xl"
            >
              Order Online
            </Link>
            <Link 
              href="/menu" 
              className="bg-white/10 backdrop-blur-sm text-white border-2 border-white px-10 py-4 rounded text-lg font-semibold hover:bg-white hover:text-gray-900 transition-all"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Hours Banner */}
      <div className="bg-[#1A1A1A] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 text-center">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#C41E3A]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{siteConfig.hours.days}</span>
          </div>
          <div className="text-gray-300">
            Lunch: <span className="text-white font-medium">{siteConfig.hours.lunch}</span>
          </div>
          <div className="text-gray-300">
            Dinner: <span className="text-white font-medium">{siteConfig.hours.dinner}</span>
          </div>
          <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 text-[#C41E3A] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {siteConfig.phone}
          </a>
        </div>
      </div>

      {/* About Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-semibold text-[#C41E3A] uppercase tracking-wider mb-2">About Us</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                A Spiritual Symbol of Peace
              </h3>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <span className="text-[#C41E3A] font-semibold">OM</span> .....is a spiritual symbol that signifies peace and the essence of the ultimate consciousness. The meaning and connotation of the word OM varies.
                </p>
                <p>
                  <span className="text-[#C41E3A] font-semibold">OM</span> prides itself on creating a distinct, regional elegance from both popular and nostalgic Indian food traditions.
                </p>
                <p>
                  We at home strive to create an experience of classic yet unexplored charms of India's various regions. Expertly curated by our Executive Chef.
                </p>
              </div>
              <Link 
                href="/about" 
                className="inline-flex items-center gap-2 mt-8 text-[#C41E3A] font-semibold hover:gap-4 transition-all"
              >
                Learn More About Us
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="relative">
              <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="/assets/OMIndianRestaurant_TandoonChicken.jpg" 
                  alt="Tandoori Chicken"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-[#C41E3A] text-white p-6 rounded-xl shadow-xl">
                <p className="text-3xl font-bold">20+</p>
                <p className="text-sm opacity-90">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties Section */}
      <div className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-[#C41E3A] uppercase tracking-wider mb-2">Our Menu</h2>
            <h3 className="text-4xl font-bold text-gray-900">Signature Dishes</h3>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              OM focuses on long-forgotten unique regional and coastal subtleties, from prominent and nostalgic Indian food traditions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dish 1 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200">
              <div className="relative h-72 overflow-hidden">
                <Image 
                  src="/assets/OMIndianRestaurant_ChickenTikkaMasala.jpg" 
                  alt="Chicken Tikka Masala"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-bold">$18.95</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chicken Tikka Masala</h3>
                <p className="text-gray-600 text-sm">Grilled marinated chicken in a creamy tomato fenugreek sauce.</p>
              </div>
            </div>

            {/* Dish 2 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200">
              <div className="relative h-72 overflow-hidden">
                <Image 
                  src="/assets/OMIndianRestaurant_LambChops.jpg" 
                  alt="Lamb Chops"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-bold">$31.95</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Lamb Chops</h3>
                <p className="text-gray-600 text-sm">Marinated with a special house sauce and grilled to perfection.</p>
              </div>
            </div>

            {/* Dish 3 */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200">
              <div className="relative h-72 overflow-hidden">
                <Image 
                  src="/assets/OMIndianRestaurant_JumboPrawn.jpg" 
                  alt="Tandoori Shrimp"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-2xl font-bold">$25.95</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tandoori Shrimp</h3>
                <p className="text-gray-600 text-sm">Jumbo shrimp marinated in a spiced hung yogurt mixture.</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 rounded font-semibold hover:bg-[#C41E3A] transition-colors"
            >
              View Full Menu
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-[#1A1A1A]">
        <div className="absolute inset-0 opacity-20">
          <Image 
            src="/assets/OMIndianRestaurant_Hero.jpg" 
            alt="Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Order?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience authentic Indian cuisine from the comfort of your home
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/order" 
              className="bg-[#C41E3A] text-white px-10 py-4 rounded text-lg font-semibold hover:bg-[#a01830] transition-colors shadow-xl"
            >
              Order Online Now
            </Link>
            <a 
              href={`tel:${siteConfig.phone}`}
              className="bg-white text-gray-900 px-10 py-4 rounded text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Call {siteConfig.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
