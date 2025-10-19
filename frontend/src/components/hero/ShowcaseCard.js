import React, { useEffect, useRef, useState } from 'react';
import './ShowcaseCard.css';
import img from '../../assets/imgages/img8.jpg';
import { COLORS } from '../../styles/colors';

const ShowcaseCard = () => {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0); // 0..1

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.6; // start growing when card enters 60% from top
      const end = vh * 0.2;   // full-screen when card is at 20% from top
      const p = 1 - Math.min(1, Math.max(0, (rect.top - end) / (start - end)));
      setProgress(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const isFullScreen = progress > 0.5; // Consider full screen when 50% progress
  
  // Calculate actual dimensions instead of scaling
  const baseWidth = 600; // Base card width
  const baseHeight = 400; // Base card height
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  const currentWidth = baseWidth + (progress * (screenWidth - baseWidth));
  const currentHeight = baseHeight + (progress * (screenHeight - baseHeight));
  
  // Debug logging
  console.log('Progress:', progress.toFixed(2), 'isFullScreen:', isFullScreen, 'width:', Math.round(currentWidth), 'height:', Math.round(currentHeight));

  return (
    <section className="showcase-wrapper" ref={containerRef}>
      <div 
        className="showcase-card" 
        style={{
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          transition: 'width 0.1s ease-out, height 0.1s ease-out'
        }}
      >
        <div className="showcase-brand">ShopQnB</div>
        <div className="showcase-image">
          <img src={img} alt="Showcase" />
          <div 
            className="showcase-overlay" 
            style={{ 
              zIndex: 10
            }}
          >
            <div 
              className="shop-text"
              style={{
                fontSize: `${32 + (progress * 88)}px`,
                opacity: isFullScreen ? 1 : 0,
                transform: isFullScreen ? 'translateY(0)' : 'translateY(20px)',
                color: COLORS.primary,
              }}
            >
              Shop
            </div>
            <div 
              className="smarter-text"
              style={{
                fontSize: `${32 + (progress * 88)}px`,
                opacity: isFullScreen ? 1 : 0,
                transform: isFullScreen ? 'translateY(0)' : 'translateY(20px)',
                color: COLORS.primary,
              }}
            >
              Smarter
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseCard;


