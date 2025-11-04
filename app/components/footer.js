import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#154360] to-[#0C374A] text-white py-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-2xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82C4] to-[#1A5276]">
              Safe Haven
            </span>
          </h3>
          <p className="text-gray-300">Your home comfort awaits</p>
        </div>
        
        <div>
        <h3 className="text-xl font-semibold mb-4 text-[#5C9EE6]">
        Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/" className="text-[#BFD9F2] hover:text-[#3B82C4] hover:translate-x-1 transition-all flex items-center">
                <span className="hover:pl-2 transition-all">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-[#BFD9F2] hover:text-[#3B82C4] hover:translate-x-1 transition-all flex items-center">
                <span className="hover:pl-2 transition-all">About</span>
              </Link>
            </li>
            <li>
              <Link href="/services" className="text-[#BFD9F2] hover:text-[#3B82C4] hover:translate-x-1 transition-all flex items-center">
                <span className="hover:pl-2 transition-all">Services</span>
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[#BFD9F2] hover:text-[#3B82C4] hover:translate-x-1 transition-all flex items-center">
                <span className="hover:pl-2 transition-all">Contact</span>
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
        <h3 className="text-xl font-semibold mb-4 text-[#5C9EE6]">Contact Us</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center hover:translate-x-1 transition-all">
              <svg className="w-5 h-5 mr-3 text-[#3B82C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              info@safehaven.com
            </li>
            <li className="flex items-center hover:translate-x-1 transition-all">
              <svg className="w-5 h-5 mr-3 text-[#3B82C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              (123) 456-7890
            </li>
            <li className="flex items-center hover:translate-x-1 transition-all">
              <svg className="w-5 h-5 mr-3 text-[#3B82C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              123 Safe Street
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-gray-700">
      <p className="text-center text-[#BFD9F2]">
          © {new Date().getFullYear()} Safe Haven. All rights reserved.
        </p>
      </div>
    </footer>
  )
}