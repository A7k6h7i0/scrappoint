import { useEffect, useEffectEvent, useState } from 'react';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';

const showcaseSlides = [
  {
    title: 'City Metal Exchange',
    subtitle: 'Bulk iron, aluminum, and factory offcuts',
    location: 'Howrah industrial belt',
    metricLabel: 'Avg. pickup window',
    metricValue: '45 min',
    accent: '#d86b38',
    image:
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Wire & Copper Recovery',
    subtitle: 'Sorted cable lots with live rate tracking',
    location: 'Sealdah trade lane',
    metricLabel: 'Today rate update',
    metricValue: '6:15 AM',
    accent: '#78954f',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Neighborhood Recycle Hub',
    subtitle: 'Paper, plastic, cartons, and mixed home scrap',
    location: 'Salt Lake sector blocks',
    metricLabel: 'Active collectors',
    metricValue: '28',
    accent: '#396f86',
    image:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'E-Waste Drop Center',
    subtitle: 'Laptop boards, batteries, wiring, and appliance parts',
    location: 'Park Circus route',
    metricLabel: 'Verified drop points',
    metricValue: '12',
    accent: '#845ec2',
    image:
      'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Commercial Salvage Yard',
    subtitle: 'Demolition leftovers, beams, shutters, and reusable steel',
    location: 'Port-side logistics zone',
    metricLabel: 'Bulk deals this week',
    metricValue: '86',
    accent: '#c0a062',
    image:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Scrap Pickup Network',
    subtitle: 'Doorstep scheduling for homes, offices, and workshops',
    location: 'Across Kolkata metro',
    metricLabel: 'Routes running',
    metricValue: '24/7',
    accent: '#27856a',
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  },
];

function getWrappedOffset(index, activeIndex, length) {
  let offset = index - activeIndex;
  if (offset > length / 2) offset -= length;
  if (offset < -length / 2) offset += length;
  return offset;
}

export default function HeroSection({ onUseLocation, onAddShop }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [showHeading, setShowHeading] = useState(false);

  const advanceSlide = () => {
    setActiveIndex((current) => (current + 1) % showcaseSlides.length);
  };

  const handleUseLocation = () => {
    if (typeof onUseLocation === 'function') {
      onUseLocation();
      return;
    }
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToNextSlide = useEffectEvent(() => {
    advanceSlide();
  });

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = window.setInterval(() => {
      goToNextSlide();
    }, 1400);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowHeading(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="hero-page">
      <div className="hero-backdrop" aria-hidden="true">
        <span className="hero-orb hero-orb-left" />
        <span className="hero-orb hero-orb-right" />
        <span className="hero-orb hero-orb-bottom" />
      </div>

      <div className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker">
              <Sparkles className="h-4 w-4" />
              Scrap Point
            </p>

            <h1 className={`hero-title${showHeading ? ' hero-title-is-visible' : ''}`}>
              <span className="hero-title-part hero-title-part-left">
                <span className="hero-title-highlight">Scrap Point</span> helps you discover
              </span>{' '}
              <span className="hero-title-part hero-title-part-right">
                trusted local scrap buyers faster.
              </span>
            </h1>

            <div className="hero-actions">
              <button
                type="button"
                className="hero-button hero-button-primary"
                onClick={handleUseLocation}
              >
                <span>Use my location</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="hero-button hero-button-secondary"
                onClick={() => {
                  if (typeof onAddShop === 'function') {
                    onAddShop();
                    return;
                  }
                  handleUseLocation();
                }}
              >
                <span>Add shop</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className="hero-visual"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="hero-visual-frame">
              <div className="hero-carousel" aria-label="Featured scrap shop showcase">
                {showcaseSlides.map((slide, index) => {
                  const offset = getWrappedOffset(index, activeIndex, showcaseSlides.length);
                  const absOffset = Math.abs(offset);
                  const isVisible = absOffset <= 2;

                  return (
                    <article
                      key={slide.title}
                      className={`hero-carousel-card${offset === 0 ? ' is-active' : ''}`}
                      style={{
                        '--offset': offset,
                        '--abs-offset': absOffset,
                        '--accent-color': slide.accent,
                        zIndex: showcaseSlides.length - absOffset,
                        opacity: isVisible ? 1 : 0,
                        pointerEvents: offset === 0 ? 'auto' : 'none',
                      }}
                      aria-hidden={!isVisible}
                    >
                      <div className="hero-carousel-media">
                        <img src={slide.image} alt={slide.title} className="hero-carousel-image" />
                        <div className="hero-carousel-sheen" />
                      </div>

                      <div className="hero-carousel-content">
                        <div className="hero-carousel-topline">
                          <span className="hero-carousel-chip">Featured buyer</span>
                          <span className="hero-carousel-page">
                            {String(index + 1).padStart(2, '0')} / {String(showcaseSlides.length).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="hero-carousel-copy">
                          <p className="hero-carousel-subtitle">{slide.subtitle}</p>
                          <h3 className="hero-carousel-title">{slide.title}</h3>
                        </div>

                        <div className="hero-carousel-meta">
                          <span className="hero-carousel-location">
                            <MapPin className="h-3.5 w-3.5" />
                            {slide.location}
                          </span>
                          <div className="hero-carousel-metric">
                            <span>{slide.metricLabel}</span>
                            <strong>{slide.metricValue}</strong>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
