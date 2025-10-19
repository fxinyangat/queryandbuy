import React, { useEffect, useRef } from 'react';
import { COLORS } from '../../styles/colors';
import './TrendBackground.css';

// TrendBackground
// WHAT: Faint animated trend lines behind the hero (reduced-motion aware)
// WHY: Adds discovery feel like Google Trends without stealing focus
const TrendBackground = () => {
    const ref = useRef(null);

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let frameId;
        let w = canvas.width = canvas.offsetWidth;
        let h = canvas.height = 360; // bolder wave height

        const handleResize = () => {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = 360;
        };
        window.addEventListener('resize', handleResize);

        const lines = [
            { color: COLORS.secondary, amp: 40, freq: 0.005, phase: 0 },
            { color: COLORS.primary, amp: 32, freq: 0.007, phase: 1.4 },
            { color: COLORS.accent, amp: 26, freq: 0.009, phase: 2.1 },
        ];

        const draw = (t) => {
            ctx.clearRect(0, 0, w, h);
            lines.forEach((ln, i) => {
                ctx.beginPath();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = hexToRgba(ln.color, 0.12);
                for (let x = 0; x <= w; x += 2) {
                    const y = h/2 + Math.sin((x * ln.freq) + (prefersReduced ? 0 : (t * 0.001 + ln.phase))) * ln.amp;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            });
            frameId = requestAnimationFrame(draw);
        };

        frameId = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(frameId); window.removeEventListener('resize', handleResize); };
    }, []);

    return (
        <div className="trend-bg">
            <canvas ref={ref} className="trend-canvas" aria-hidden="true" />
        </div>
    );
};

function hexToRgba(hex, alpha) {
    const c = hex.replace('#','');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default TrendBackground;


