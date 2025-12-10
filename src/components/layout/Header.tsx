import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/results', label: 'Results' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">RaceLab</h1>
        <nav className="hidden space-x-4 md:flex">
          {navLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              <a className={`rounded px-3 py-2 ${pathname === link.href ? 'bg-gray-900' : ''}`}>
                {link.label}
              </a>
            </Link>
          ))}
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              />
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="mt-2 md:hidden">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                <a
                  className={`block rounded px-3 py-2 ${pathname === link.href ? 'bg-gray-900' : ''}`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
