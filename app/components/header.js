"use client"; // Mark this file as a client component

import { useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for menu toggle

  return (
    <header className="bg-white shadow-md py-4 px-8 sticky top-0 z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold">
          <Link
            href="/"
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82C4] to-[#1A5276]"
          >
            Safe Haven
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <ul className="hidden md:flex space-x-8">
          <li>
            <Link
              href="/"
              className="text-[#154360] hover:text-[#3B82C4] font-medium transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/form"
              className="text-[#154360] hover:text-[#3B82C4] font-medium transition-colors"
            >
              Get Help
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-[#154360] hover:text-[#3B82C4] font-medium transition-colors"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className="text-[#154360] hover:text-[#3B82C4] font-medium transition-colors"
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-[#154360] hover:text-[#3B82C4] font-medium transition-colors"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/messaging"
              className="text-[#154360] hover:text-[#3B82C4] font-medium transition-colors"
            >
              Messages
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="text-[#154360] hover:text-[#3B82C4] font-medium transition-colors"
            >
              Login
            </Link>
          </li>
        </ul>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#F5F9FC] shadow-lg md:hidden">
            <ul className="px-4">
              <li>
                <Link
                  href="/"
                  className="block py-2 text-gray-700 hover:text-indigo-600"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/form"
                  className="block py-2 text-[#154360] hover:text-[#3B82C4]"
                >
                  Get Help
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2 text-[#154360] hover:text-[#3B82C4]"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="block py-2 text-[#154360] hover:text-[#3B82C4]"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block py-2 text-[#154360] hover:text-[#3B82C4]"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/messaging"
                  className="block py-2 text-[#154360] hover:text-[#3B82C4]"
                >
                  Messages
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="block py-2 text-[#154360] hover:text-[#3B82C4]"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}