import { useEffect, useRef, useState } from 'react';

/**
 * Minimal & professional scroll reveal component.
 * Uses IntersectionObserver to trigger a smooth fade-in + micro-translate
 * once elements enter the viewport.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
  once = true,
  as: Component = 'div',
  ...rest
}) {
  // If IntersectionObserver is not available, default to visible immediately
  const [isVisible, setIsVisible] = useState(() => {
    return typeof IntersectionObserver === 'undefined';
  });
  const domRef = useRef(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentTarget = domRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [threshold, once]);

  // Motion direction offsets
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-5';
      case 'down':
        return '-translate-y-5';
      case 'left':
        return 'translate-x-5';
      case 'right':
        return '-translate-x-5';
      case 'none':
      default:
        return '';
    }
  };

  const hiddenState = `opacity-0 ${getInitialTransform()}`;
  const visibleState = 'opacity-100 translate-x-0 translate-y-0';

  return (
    <Component
      ref={domRef}
      className={`transition-all duration-700 ease-out will-change-[opacity,transform] ${
        isVisible ? visibleState : hiddenState
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}
