/**
 * Micro-Interactions Components - AWWWARDS Level
 * Premium UI components with advanced animations
 */
'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// ============================================
// MAGNETIC BUTTON - Follows cursor on hover
// ============================================
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function MagneticButton({ 
  children, 
  className = '', 
  strength = 0.3,
  onClick,
  disabled,
  type = 'button'
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// ============================================
// TEXT REVEAL - Character by character
// ============================================
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function TextReveal({ 
  text, 
  className = '', 
  delay = 0,
  staggerDelay = 0.03 
}: TextRevealProps) {
  const words = text.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em]">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: delay + (wordIndex * word.length + charIndex) * staggerDelay,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
}

// ============================================
// ANIMATED COUNTER - Numbers counting up
// ============================================
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setDisplayValue(eased * value);
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

// ============================================
// ANIMATED BORDER - Gradient moving border
// ============================================
interface AnimatedBorderProps {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  duration?: number;
}

export function AnimatedBorder({
  children,
  className = '',
  borderWidth = 2,
  duration = 3,
}: AnimatedBorderProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-inherit"
        style={{
          padding: borderWidth,
          background: 'linear-gradient(90deg, var(--steganography), var(--watermarking), var(--video), var(--steganography))',
          backgroundSize: '300% 100%',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// STAGGER LIST - Items appear one by one
// ============================================
interface StaggerListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

export function StaggerList({
  children,
  className = '',
  staggerDelay = 0.1,
  initialDelay = 0,
}: StaggerListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.6,
            delay: initialDelay + index * staggerDelay,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// PARALLAX CONTAINER - Depth effect on mouse move
// ============================================
interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function ParallaxContainer({
  children,
  className = '',
  strength = 20,
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 100 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// GLOW CARD - Glowing effect following cursor
// ============================================
interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({
  children,
  className = '',
  glowColor = 'var(--steganography)',
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${glowColor}20, transparent 40%)`,
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

// ============================================
// CURSOR FOLLOWER - 60fps smooth like native cursor
// Uses requestAnimationFrame and CSS transforms for best performance
// ============================================
export function CursorFollower() {
  const mainRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: -100, y: -100 });
  const targetRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Lerp (linear interpolation) for smooth trailing
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    // Animation loop at 60fps
    const animate = () => {
      // Main cursor: follows immediately (no lerp or very high factor)
      positionRef.current.x = lerp(positionRef.current.x, targetRef.current.x, 0.35);
      positionRef.current.y = lerp(positionRef.current.y, targetRef.current.y, 0.35);

      // Apply transforms directly via DOM for maximum performance
      if (mainRef.current) {
        mainRef.current.style.transform = `translate3d(${targetRef.current.x}px, ${targetRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    // Pointer detection for interactive elements
    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.closest('label') !== null ||
        target.closest('[role="button"]') !== null ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(isInteractive);
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handlePointerOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handlePointerOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Calculate dynamic sizes
  const mainSize = isPointer ? 40 : isPressed ? 12 : 16;
  const ringSize = isPointer ? 60 : 40;

  return (
    <>
      {/* Main cursor dot - follows instantly */}
      <div
        ref={mainRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          width: mainSize,
          height: mainSize,
          willChange: 'transform',
          transition: 'width 0.15s ease-out, height 0.15s ease-out, opacity 0.15s ease-out',
          opacity: isHidden ? 0 : 1,
        }}
      >
        <div 
          className="w-full h-full bg-white rounded-full"
          style={{
            transform: isPressed ? 'scale(0.8)' : 'scale(1)',
            transition: 'transform 0.1s ease-out',
          }}
        />
      </div>
      
      {/* Outer ring - follows with slight lag for trail effect */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] border-2 border-white/40 rounded-full mix-blend-difference"
        style={{
          width: ringSize,
          height: ringSize,
          willChange: 'transform',
          transition: 'width 0.2s ease-out, height 0.2s ease-out, opacity 0.2s ease-out, border-color 0.2s ease-out',
          opacity: isHidden ? 0 : 0.6,
          borderColor: isPointer ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
        }}
      />
    </>
  );
}


// ============================================
// RIPPLE BUTTON - Ripple effect on click
// ============================================
interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function RippleButton({
  children,
  className = '',
  onClick,
  disabled,
  type = 'button',
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    
    onClick?.();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 40, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      {children}
    </button>
  );
}

// ============================================
// TYPEWRITER - Typing effect
// ============================================
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

export function Typewriter({
  text,
  className = '',
  speed = 50,
  delay = 0,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, index + 1));
        index++;
        if (index >= text.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 1000);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-current ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  );
}

// ============================================
// FLIP CARD - 3D flip on hover
// ============================================
interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className = '' }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ perspective: 1000 }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="absolute w-full h-full backface-hidden">{front}</div>
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
