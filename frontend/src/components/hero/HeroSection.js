import React, { useEffect, useState } from 'react';
import './HeroSection.css';
import ModeToggle from './ModeToggle';
import { COLORS } from '../../styles/colors';

// HeroSection
// WHAT: Bold landing hero with Cohere-style typography and highlighted phrase
// WHY: Drives focus to primary action (search) with strong brand presence
const HeroSection = ({ children }) => {
    const words = ['anything', 'anywhere', 'QnB'];
    const [index, setIndex] = useState(0);
    const [text, setText] = useState('');
    const [deleting, setDeleting] = useState(false);

    // Typing timing (slower for readability)
    const TYPE_SPEED_MS = 140;   // per character when typing
    const DELETE_SPEED_MS = 90;  // per character when deleting
    const HOLD_MS = 1800;        // pause when a word is fully typed

    useEffect(() => {
        const current = words[index % words.length];
        let timer;
        if (!deleting) {
            if (text.length < current.length) {
                timer = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_SPEED_MS);
            } else {
                timer = setTimeout(() => setDeleting(true), HOLD_MS);
            }
        } else {
            if (text.length > 0) {
                timer = setTimeout(() => setText(current.slice(0, text.length - 1)), DELETE_SPEED_MS);
            } else {
                setDeleting(false);
                setIndex((i) => (i + 1) % words.length);
            }
        }
        return () => { if (timer) clearTimeout(timer); };
    }, [text, deleting, index]);

    return (
        <section className="hero">
        <div className="hero-inner">
            <div className="hero-top-toggle">
                <ModeToggle />
            </div>
            <h1 className="hero-title">
                    Shop<span className="hero-highlight" style={{ background: `linear-gradient(90deg, ${COLORS.secondary}22, ${COLORS.accent}22)`, color: COLORS.primary }}>{text || '\u00A0'}</span>
                    <span className="hero-sep"> — </span>
                    <span className="hero-powered"> Powered by AI!</span>
                </h1>
                <p className="hero-subtitle">ShopQnB is where tough online shopping decisions are made.</p>
                {children}
            </div>
        </section>
    );
};

export default HeroSection;


