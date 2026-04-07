import { useEffect, useEffectEvent, useState } from 'react';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';

const heroImages = {
  metal:
    'https://images.unsplash.com/photo-1722695694560-f452b0919d3a?auto=format&fit=crop&w=1400&q=80',
  auto:
    'https://images.unsplash.com/photo-1767341372202-89cbaa6b5c87?auto=format&fit=crop&w=1400&q=80',
  plastic:
    'https://images.unsplash.com/photo-1743342716826-1fb32cc467d9?auto=format&fit=crop&w=1400&q=80',
  ewaste:
    'https://images.unsplash.com/photo-1755016388369-62f9c1a5133d?auto=format&fit=crop&w=1400&q=80',
  pickup:
    'https://images.unsplash.com/photo-1761479578277-b11d0092699d?auto=format&fit=crop&w=1400&q=80',
};

const showcaseSlides = [
  {
    title: 'City Metal Exchange',
    subtitle: 'Bulk iron, aluminum, and factory offcuts',
    location: 'Howrah industrial belt',
    metricLabel: 'Avg. pickup window',
    metricValue: '45 min',
    accent: '#d86b38',
    image: heroImages.metal,
  },
  {
    title: 'Wire & Copper Recovery',
    subtitle: 'Sorted cable lots with live rate tracking',
    location: 'Sealdah trade lane',
    metricLabel: 'Today rate update',
    metricValue: '6:15 AM',
    accent: '#78954f',
    image: heroImages.ewaste,
  },
  {
    title: 'Neighborhood Recycle Hub',
    subtitle: 'Paper, plastic, cartons, and mixed home scrap',
    location: 'Salt Lake sector blocks',
    metricLabel: 'Active collectors',
    metricValue: '28',
    accent: '#396f86',
    image: heroImages.plastic,
  },
  {
    title: 'E-Waste Drop Center',
    subtitle: 'Laptop boards, batteries, wiring, and appliance parts',
    location: 'Park Circus route',
    metricLabel: 'Verified drop points',
    metricValue: '12',
    accent: '#845ec2',
    image: heroImages.ewaste,
  },
  {
    title: 'Commercial Salvage Yard',
    subtitle: 'Demolition leftovers, beams, shutters, and reusable steel',
    location: 'Port-side logistics zone',
    metricLabel: 'Bulk deals this week',
    metricValue: '86',
    accent: '#c0a062',
    image: heroImages.auto,
  },
  {
    title: 'Scrap Pickup Network',
    subtitle: 'Doorstep scheduling for homes, offices, and workshops',
    location: 'Across Kolkata metro',
    metricLabel: 'Routes running',
    metricValue: '24/7',
    accent: '#27856a',
    image: heroImages.pickup,
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
