import { siteConfig } from "@/lib/config";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="bg-stone-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-4 text-lg text-gray-600">We would love to hear from you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="p-8 md:p-12 bg-[#1A1A1A] text-white">
              <h2 className="text-2xl font-bold mb-8">Get in Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Address</h3>
                    <p className="mt-1 text-gray-400">{siteConfig.address.street}<br/>{siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Phone</h3>
                    <a href={`tel:${siteConfig.phone}`} className="mt-1 text-gray-400 hover:text-white transition-colors">{siteConfig.phone}</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email</h3>
                    <a href={`mailto:${siteConfig.email}`} className="mt-1 text-gray-400 hover:text-white transition-colors">{siteConfig.email}</a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Hours</h3>
                    <p className="mt-1 text-gray-400">{siteConfig.hours.days}</p>
                    <p className="text-white font-medium">{siteConfig.hours.display}</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-10 pt-8 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-4">Follow us on social media</p>
                <div className="flex space-x-4">
                  <Link 
                    href={siteConfig.social.instagram} 
                    target="_blank"
                    className="w-10 h-10 bg-[#C41E3A] rounded-full flex items-center justify-center hover:bg-[#a01830] transition-colors"
                  >
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.465C6.103 2.218 6.83 2.049 7.894 2c1.024-.047 1.379-.06 3.808-.06zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.562a3.573 3.573 0 100 7.146 3.573 3.573 0 000-7.146zm5.338-2.862a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Order CTA */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Order?</h3>
              <p className="text-gray-600 mb-8">
                Skip the wait and order online for pickup or delivery. Fresh, authentic Indian cuisine ready when you are.
              </p>
              <div className="space-y-4">
                <Link 
                  href="/order" 
                  className="block w-full bg-[#C41E3A] text-white text-center py-4 rounded-lg font-semibold hover:bg-[#a01830] transition-colors"
                >
                  Order Online
                </Link>
                <a 
                  href={`tel:${siteConfig.phone}`}
                  className="block w-full bg-[#1A1A1A] text-white text-center py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Call to Order
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
