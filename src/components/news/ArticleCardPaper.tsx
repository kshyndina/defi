"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Article } from "@/types/article";

interface ArticleCardPaperProps {
  article: Article;
  onClick?: () => void;
  href?: string;
  key?: string;
  index?: number;
  isFeatured?: boolean;
}

export function ArticleCardPaper({
  article,
  onClick,
  href,
  index = 0,
  isFeatured = false,
}: ArticleCardPaperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Handle mouse movement for magnetic cursor effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    // Update CSS custom properties for glow effect
    if (cardRef.current) {
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      cardRef.current.style.setProperty("--mouse-x", `${xPercent}%`);
      cardRef.current.style.setProperty("--mouse-y", `${yPercent}%`);
    }
    
    // Move the glow element to follow the cursor
    if (glowRef.current) {
      glowRef.current.style.left = `${x}px`;
      glowRef.current.style.top = `${y}px`;
    }
  };

  // Handle mouse leave to reset effects
  const handleMouseLeave = () => {
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  };

  // Handle mouse enter to show glow
  const handleMouseEnter = () => {
    if (glowRef.current) {
      glowRef.current.style.opacity = "1";
    }
  };

  // Create ripple effect on click
  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    card.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  const CardContent = (
    <div
      ref={cardRef}
      className={`paper-card relative overflow-visible group magnetic-cursor ${isFeatured ? 'breathing-glow' : ''}`}
      style={{
        transform: 'rotate(0deg)',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        minHeight: '380px',
        maxHeight: '100%',
        zIndex: 1,
        position: 'relative'
      }}
      onClick={createRipple}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Magnetic glow effect */}
      <div ref={glowRef} className="magnetic-glow"></div>
      
      {/* Paper layers for depth effect */}
      <div className="paper-layer paper-layer-1"></div>
      <div className="paper-layer paper-layer-2"></div>
      <div className="paper-layer paper-layer-3"></div>
      
      {/* Folded corner */}
      <div className="folded-corner"></div>
      
      {/* Card content */}
      <div className="relative z-10 p-6 h-full flex flex-col overflow-hidden">
        <div className="flex items-start justify-between mb-3 md:mb-4 flex-shrink-0">
          <span className="text-xs uppercase tracking-wider font-medium" style={{ color: '#d4a574' }}>
            {article.category}
          </span>
          {article.date && (
            <span className="text-xs font-mono" style={{ color: '#999' }}>
              {new Date(article.date).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="border-b border-dashed border-medium-text/30 mb-3 md:mb-4 pb-2 flex-shrink-0"></div>

        <h3 className="font-bubblegum text-lg md:text-xl font-semibold mb-2 md:mb-3 text-dark-text group-hover:text-warm-brown transition-colors text-reveal line-clamp-2 flex-shrink-0">
          {article.title}
        </h3>

        <p className="font-open-sans text-sm md:text-editorial-sm mb-3 md:mb-4 text-medium-text flex-grow overflow-hidden text-reveal" style={{
          display: '-webkit-box',
          WebkitLineClamp: '3',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {article.preview || article.content.substring(0, 150).replace(/&/g, '&').replace(/"/g, '"').replace(/'/g, "'").replace(/</g, '<').replace(/>/g, '>')}...
        </p>

        <div className="border-b border-dashed border-medium-text/30 mb-3 md:mb-4 pb-2 flex-shrink-0"></div>

        <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4 flex-shrink-0">
          {article.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="text-xs text-dark-text bg-white/50 px-2 md:px-3 py-1 rounded font-sans border border-medium-text/30"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 flex-shrink-0">
          <button className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/50 flex items-center justify-center group-hover:bg-warm-brown/30 transition-all">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-warm-brown group-hover:text-dark-text transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transform transition-transform duration-300 hover:scale-[1.02]">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
