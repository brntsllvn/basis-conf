import { useState, useEffect, useRef, useCallback } from 'react';
import './LandingPage.css';

const HOSTS = [
  { slug: 'speaker-shang-chou',          name: 'Shang Chou' },
  { slug: 'speaker-brent-sullivan-host', name: 'Brent Sullivan' },
  { slug: 'speaker-dave-nadig',          name: 'Dave Nadig' },
];

const SPEAKERS = [
  'speaker-rob-arnott',
  'speaker-savina-rizova',
  'speaker-meb-faber',
  'speaker-ryan-kirlin',
  'speaker-daniel-bunn',
  'speaker-andrew-beer',
  'speaker-joseph-liberman',
  'speaker-paul-bouchey',
  'speaker-alex-morris',
  'speaker-terry-cook',
  'speaker-robert-dupree',
  'speaker-nick-rosenthal',
  'speaker-dave-reynolds',
  'speaker-jim-carroll',
  'speaker-travis-burke',
  'speaker-mohsen-ghazi',
  'speaker-ally-jane-ayers',
  'speaker-jill-jensen',
  'speaker-katrina-difiglia',
  'speaker-erkko-etula',
  'speaker-andrew-berman',
  'speaker-michael-allison',
  'speaker-john-west',
  'speaker-vijay-boyapati',
  'speaker-nick-bruce',
  'speaker-roy-haya',
  'speaker-ralph-drybrough',
  'speaker-jim-dubeck',
  'speaker-matt-zenz',
  'speaker-tony-yang',
  'speaker-gavin-romm',
  'speaker-rafael-zayas',
  'speaker-izzy-slodowitz',
  'speaker-sam-meyer',
  'speaker-runik-mehtrota',
  'speaker-eric-golden',
  'speaker-chris-loveless',
  'speaker-ehren-stanhope',
  'speaker-jim-totten',
  'speaker-ted-pyne',
  'speaker-joe-giroux',
  'speaker-john-stanko',
  'speaker-tom-bratkovich',
  'speaker-elizabeth-chand',
  'speaker-john-chaffetz',
  'speaker-matt-crawford',
];

function slugToName(slug: string): string {
  return slug.replace('speaker-', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function SectionTitle({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`lp-section-title-row${light ? ' lp-section-title-row--light' : ''}`}>
      <span className="lp-section-title">{children}</span>
      <div className="lp-title-rule" />
    </div>
  );
}


type DayForecast = {
  date: string; label: string; high: number; low: number;
  dayDesc: string; dayEmoji: string; nightDesc: string; nightEmoji: string; precip: number;
};

function precipDesc(mm: number): string {
  if (mm < 1) return 'Dry';
  if (mm < 5) return 'Light rain';
  if (mm < 15) return 'Rain';
  return 'Heavy rain';
}

function weatherEmoji(wmo: number): string {
  if (wmo === 0) return '☀️';
  if (wmo <= 2) return '⛅';
  if (wmo <= 3) return '☁️';
  if (wmo <= 48) return '🌫️';
  if (wmo <= 67) return '🌧️';
  if (wmo <= 77) return '🌨️';
  if (wmo <= 82) return '🌦️';
  return '⛈️';
}

function wmoDesc(wmo: number): string {
  if (wmo === 0) return 'Clear';
  if (wmo <= 2) return 'Partly cloudy';
  if (wmo <= 3) return 'Overcast';
  if (wmo <= 48) return 'Foggy';
  if (wmo <= 55) return 'Drizzle';
  if (wmo <= 67) return 'Rain';
  if (wmo <= 77) return 'Snow';
  if (wmo <= 82) return 'Rain showers';
  return 'Thunderstorms';
}

function WeatherForecast() {
  const [days, setDays] = useState<DayForecast[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=47.6062&longitude=-122.3321' +
      '&temperature_unit=fahrenheit&precipitation_unit=inch' +
      '&timezone=America%2FLos_Angeles' +
      '&start_date=2026-05-27&end_date=2026-05-30' +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum' +
      '&hourly=weathercode';

    const LABELS = ['Wed · May 27', 'Thu · May 28', 'Fri · May 29', 'Sat · May 30'];
    const DATES  = ['2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30'];

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const hTimes: string[] = data.hourly.time;
        const hCodes: number[] = data.hourly.weathercode;

        function codeForWindow(date: string, startH: number, endH: number): number {
          const mid = Math.floor((startH + endH) / 2);
          const key = `${date}T${String(mid).padStart(2, '0')}:00`;
          const idx = hTimes.indexOf(key);
          return idx >= 0 ? hCodes[idx] : 1;
        }

        const d = data.daily;
        setDays(
          DATES.map((date, i) => ({
            date, label: LABELS[i],
            high: Math.round(d.temperature_2m_max[i]),
            low:  Math.round(d.temperature_2m_min[i]),
            precip: d.precipitation_sum[i],
            dayDesc:   wmoDesc(codeForWindow(date, 9, 17)),
            dayEmoji:  weatherEmoji(codeForWindow(date, 9, 17)),
            nightDesc: wmoDesc(codeForWindow(date, 20, 6)),
            nightEmoji: weatherEmoji(codeForWindow(date, 20, 6)),
          }))
        );
      })
      .catch(() => setError(true));
  }, []);

  if (error) return null;
  if (!days) return <div className="lp-weather-loading">Loading forecast…</div>;

  return (
    <div className="lp-weather-grid">
      {days.map(day => (
        <div key={day.date} className="lp-weather-card">
          <div className="lp-weather-label">{day.label}</div>
          <div className="lp-weather-row">
            <span className="lp-weather-period-icon">{day.dayEmoji}</span>
            <div className="lp-weather-period-info">
              <span className="lp-weather-period-label">Day</span>
              <span className="lp-weather-period-desc">{day.dayDesc}</span>
            </div>
            <span className="lp-weather-temp lp-weather-high">{day.high}°</span>
          </div>
          <div className="lp-weather-divider" />
          <div className="lp-weather-row lp-weather-row--night">
            <span className="lp-weather-period-icon">{day.nightEmoji}</span>
            <div className="lp-weather-period-info">
              <span className="lp-weather-period-label">Night</span>
              <span className="lp-weather-period-desc">{day.nightDesc}</span>
            </div>
            <span className="lp-weather-temp lp-weather-low">{day.low}°</span>
          </div>
          {day.precip > 0.05 && (
            <div className="lp-weather-precip">{precipDesc(day.precip)}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LandingPage() {
  const mosaicRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ slug: string; name: string } | null>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);

  useEffect(() => {
    const container = mosaicRef.current;
    if (!container) return;
    const tiles = container.querySelectorAll<HTMLElement>('.lp-speaker-tile');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('lp-speaker-tile--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    tiles.forEach((tile, i) => {
      tile.style.transitionDelay = `${i * 0.03}s`;
      observer.observe(tile);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp-root">
      <header className="lp-header">
        <div className="lp-header-inner">
          <div className="lp-presenting">
            <div className="lp-presenting-rule" />
            <span className="lp-presenting-label">Presented by</span>
            <img src="/canvas-logo.webp" alt="Canvas by Franklin Templeton" className="lp-canvas-logo" fetchPriority="high" />
            <div className="lp-presenting-rule" />
          </div>

          <div className="lp-title-lockup">
            <h1 className="lp-conf-name">Basis Northwest</h1>
            <span className="lp-conf-year">2026</span>
          </div>

          <div className="lp-header-rule" />

          <div className="lp-dateline">
            <span className="lp-dateline-days">May 28 · 29</span>
            <span className="lp-dateline-city">Seattle, Washington</span>
          </div>

          <div className="lp-header-ornament">✦ · ✦</div>

          <a
            className="lp-venue"
            href="https://maps.google.com/?q=Bell+Harbor+International+Conference+Center+2211+Alaskan+Way+Seattle"
            target="_blank"
            rel="noreferrer"
          >
            Bell Harbor International Conference Center · Pier 66
          </a>

          <a href="/northwest-2026/agenda" className="lp-cta">
            View Live Schedule →
          </a>
        </div>
      </header>

      <div className="lp-chapter-rule" />

      <div className="lp-parallax-hero">
        <div className="lp-parallax-bg" />
        <div className="lp-parallax-overlay" />
      </div>

      <section className="lp-section lp-about">
        <SectionTitle>About</SectionTitle>
        <div className="lp-about-body">
          <div className="lp-about-text-wrap">
            <p className="lp-about-lead">Taxable wealth takes center stage.</p>
            <p className="lp-about-text">
              Two days of big-stage presentations and small-group conversations for advisors who
              know that tax planning is central to the value they provide.
            </p>
            <ul className="lp-about-topics">
              <li>ETF innovation and tax efficiency</li>
              <li>Custom indexing and leveraged strategies</li>
              <li>Concentrated asset divesting</li>
              <li>Real assets</li>
              <li>Estate and gift planning</li>
              <li>Comprehensive wealth</li>
            </ul>
          </div>
          <div className="lp-about-host">
            <img src="/brent-sullivan.webp" alt="" className="lp-about-avatar" />
            <p className="lp-about-host-name">Brent Sullivan</p>
            <div className="lp-about-host-links">
              <a href="https://www.linkedin.com/in/brntsllvn/" target="_blank" rel="noreferrer" className="lp-about-host-link">LinkedIn</a>
              <a href="https://x.com/TaxAlphaInsider" target="_blank" rel="noreferrer" className="lp-about-host-link">X</a>
              <a href="https://www.taxalphainsider.com/" target="_blank" rel="noreferrer" className="lp-about-host-link">Tax Alpha Insider</a>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-attire">
        <SectionTitle>Attire</SectionTitle>
        <p className="lp-attire-text">
          Seattle Business Casual. No tie required.{' '}
          <span className="lp-attire-pull">A quality fleece is always appropriate.</span>{' '}
          Sweater vests are strongly encouraged & wool socks are a personal decision we respect.
          The forecast is partly cloudy with a chance of you being glad you brought a layer.
        </p>
      </section>

      <section className="lp-section lp-weather-section">
        <SectionTitle>Seattle Forecast</SectionTitle>
        <WeatherForecast />
      </section>

      <section className="lp-section lp-hosts-section">
        <SectionTitle>Hosts</SectionTitle>
        <div className="lp-hosts-grid">
          {HOSTS.map(h => (
            <div key={h.slug} className="lp-host-card">
              <img src={`/speaker-cards/${h.slug}.png`} alt={h.name} className="lp-speaker-img" fetchPriority="high" />
            </div>
          ))}
        </div>
      </section>

      <div className="lp-ornament">· · ·</div>

      <section className="lp-section lp-speakers-section">
        <SectionTitle>Speakers</SectionTitle>
        <div className="lp-speaker-mosaic" ref={mosaicRef}>
          {SPEAKERS.map(slug => (
            <div
              key={slug}
              className="lp-speaker-tile"
              onClick={() => setLightbox({ slug, name: slugToName(slug) })}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter') setLightbox({ slug, name: slugToName(slug) }); }}
            >
              <img
                src={`/speaker-cards/${slug}.png`}
                alt={slugToName(slug)}
                className="lp-speaker-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-sponsors-section">
        <SectionTitle light>Sponsors</SectionTitle>
        <img
          src="/basisconf-images/sponsor-grid.png"
          alt="Basis Northwest 2026 Sponsors"
          className="lp-sponsor-grid"
        />
      </section>

      <div className="lp-parallax-stripe">
        <div className="lp-parallax-stripe-bg" />
        <div className="lp-parallax-overlay" />
      </div>

      <footer className="lp-footer">
        <img src="/canvas-logo.webp" alt="Canvas by Franklin Templeton" className="lp-footer-logo" />
        <span>Basis Northwest 2026 · Bell Harbor International Conference Center · 2211 Alaskan Way, Pier 66, Seattle, Washington</span>
        <a
          className="lp-footer-map"
          href="https://maps.google.com/?q=Bell+Harbor+International+Conference+Center+2211+Alaskan+Way+Seattle+WA"
          target="_blank"
          rel="noreferrer"
        >
          Open in Google Maps →
        </a>
        <div className="lp-footer-legal">
          <a href="/northwest-2026/terms" className="lp-footer-terms">Terms of Attendance</a>
          <span className="lp-footer-copyright">© 2026 Basis Live, LLC</span>
        </div>
      </footer>

      {lightbox && (
        <div className="lp-lightbox" onClick={closeLightbox} role="dialog" aria-modal="true">
          <button className="lp-lightbox-close" onClick={closeLightbox} aria-label="Close">✕</button>
          <img
            src={`/speaker-cards/${lightbox.slug}.png`}
            alt={lightbox.name}
            className="lp-lightbox-img"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
