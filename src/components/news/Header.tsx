"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-hidden">
      <div className="liquid-mercury-nav">
        <Link href="/" className="liquid-mercury-logo flex items-center">
          <img
            src="/defi-update_logo.jpg"
            alt="DeFi Update"
            className="w-10 h-10 md:w-12 md:h-12 rounded"
            loading="lazy"
            width="40"
            height="40"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          <Link
            href="/"
            className="liquid-mercury-nav-item"
            style={{ fontSize: '14px' }}
          >
            Home
          </Link>
          {!loading && categories.length > 0 && (
            <div className="liquid-mercury-nav-items flex items-center space-x-1">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/categories/${encodeURIComponent(
                    category.toLowerCase().replace(/\s+/g, "-")
                  )}`}
                  className="liquid-mercury-nav-item"
                  style={{ fontSize: '14px' }}
                  dangerouslySetInnerHTML={{ __html: category }}
                />
              ))}
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5 md:h-6 md:w-6" />
          ) : (
            <Menu className="h-5 w-5 md:h-6 md:w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      />

      {/* Mobile Navigation Drawer */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-screen w-64 md:w-80 max-w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 60 }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 bg-white">
            <Link href="/" className="liquid-mercury-logo flex items-center" onClick={closeMenu}>
              <img
                src="/defi-update_logo.jpg"
                alt="DeFi Update"
                className="w-10 h-10 md:w-12 md:h-12 rounded"
                loading="lazy"
                width="40"
                height="40"
              />
            </Link>
            <button
              className="p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            <nav className="p-3 md:p-4">
              <div className="mb-4 md:mb-6">
                <Link
                  href="/"
                  className="flex items-center p-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px] md:min-h-[48px]"
                  onClick={closeMenu}
                >
                  <span className="text-base md:text-lg font-medium">Home</span>
                </Link>
              </div>

              {!loading && categories.length > 0 && (
                <div>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${encodeURIComponent(
                          category.toLowerCase().replace(/\s+/g, "-")
                        )}`}
                        className="flex items-center p-3 rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors min-h-[44px] md:min-h-[48px]"
                        onClick={closeMenu}
                        dangerouslySetInnerHTML={{ __html: category }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
