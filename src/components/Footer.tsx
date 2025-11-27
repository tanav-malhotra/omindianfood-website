import Link from "next/link";
import { siteConfig } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-[#2A2A2A] text-white">
      {/* Map Section */}
      <div className="w-full h-64 md:h-72">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.2!2d-73.9527!3d40.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c258c1f0e3c8c7%3A0x7b4f4b4f4b4f4b4f!2s1531+York+Ave%2C+New+York%2C+NY+10028!5e0!3m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Restaurant Location"
        ></iframe>
      </div>
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-white">{siteConfig.name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              OM prides itself on creating a distinct, regional elegance from both popular 
              and nostalgic Indian food traditions. Expertly curated by our Executive Chef.
            </p>
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

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#C41E3A]">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-[#C41E3A] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-300 text-sm">{siteConfig.address.street}<br/>{siteConfig.address.city}, {siteConfig.address.state} {siteConfig.address.zip}</p>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-[#C41E3A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href={`tel:${siteConfig.phone}`} className="text-gray-300 text-sm hover:text-white transition-colors">{siteConfig.phone}</a>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-[#C41E3A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href={`mailto:${siteConfig.email}`} className="text-gray-300 text-sm hover:text-white transition-colors">{siteConfig.email}</a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#C41E3A]">Hours</h3>
            <div className="space-y-2">
              <p className="text-white font-medium">{siteConfig.hours.days}</p>
              <div className="text-gray-300 text-sm space-y-1">
                <p>Lunch: {siteConfig.hours.lunch}</p>
                <p>Dinner: {siteConfig.hours.dinner}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-6 text-center bg-[#1A1A1A]">
        <p className="text-gray-500 text-sm">Copyright © OM INDIAN FOOD {new Date().getFullYear()} All rights reserved</p>
      </div>
    </footer>
  );
}
