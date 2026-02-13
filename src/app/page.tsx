'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import BlockDemo from '@/components/landing/BlockDemo';
import { BuilderIcon, TemplatesIcon, QuotesIcon, SettingsIcon } from '@/components/icons/GeometricIcons';

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div style={{ background: '#FFF', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
          borderBottom: '3px solid #000',
        }}
      >
        {/* Language Switcher */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100,
          }}
        >
          <LanguageSwitcher />
        </div>

        <div style={{ maxWidth: '1200px', width: '100%', textAlign: 'center' }}>
          {/* Logo */}
          <div
            style={{
              marginBottom: '60px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(48px, 8vw, 96px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                lineHeight: 1,
                margin: 0,
                marginBottom: '12px',
              }}
            >
              {t.common.blokko}
            </h1>
            <div
              style={{
                fontSize: 'clamp(10px, 1.5vw, 14px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: '#666',
              }}
            >
              {t.common.tagline}
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              marginBottom: '40px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 48px)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                lineHeight: 1.3,
                marginBottom: '24px',
                maxWidth: '900px',
                margin: '0 auto 24px',
              }}
            >
              {t.landing.hero.title}
              <br />
              <span style={{ color: '#666' }}>{t.landing.hero.subtitle}</span>
            </h2>
            <p
              style={{
                fontSize: 'clamp(14px, 2vw, 18px)',
                fontWeight: 500,
                lineHeight: 1.7,
                color: '#666',
                maxWidth: '700px',
                margin: '0 auto',
                letterSpacing: '0.02em',
              }}
            >
              {t.landing.hero.description}
            </p>
          </div>

          {/* Coming Soon */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                border: '3px solid #000',
                padding: '20px 64px',
                background: '#000',
                color: '#FFF',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.15em',
              }}
            >
              COMING SOON
            </div>
          </div>

          {/* Interactive Block Demo */}
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
            }}
          >
            <BlockDemo />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '120px 20px',
          borderBottom: '3px solid #000',
          background: '#FAFAFA',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textAlign: 'center',
              marginBottom: '80px',
            }}
          >
            {t.landing.features.title}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              {
                title: t.landing.features.blockSystem.title,
                desc: t.landing.features.blockSystem.description,
                icon: <BuilderIcon />,
              },
              {
                title: t.landing.features.templates.title,
                desc: t.landing.features.templates.description,
                icon: <TemplatesIcon />,
              },
              {
                title: t.landing.features.pdfExport.title,
                desc: t.landing.features.pdfExport.description,
                icon: <QuotesIcon />,
              },
              {
                title: t.landing.features.swissDesign.title,
                desc: t.landing.features.swissDesign.description,
                icon: <SettingsIcon />,
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                style={{
                  border: '3px solid #000',
                  padding: '40px',
                  background: '#FFF',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '8px 8px 0 #000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '24px',
                    lineHeight: 1,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '16px',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#666',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        style={{
          padding: '120px 20px',
          borderBottom: '3px solid #000',
          background: '#FFF',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              textAlign: 'center',
              marginBottom: '80px',
            }}
          >
            {t.landing.howItWorks.title}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '48px',
            }}
          >
            {[
              {
                step: '01',
                title: t.landing.howItWorks.step1.title,
                desc: t.landing.howItWorks.step1.description,
              },
              {
                step: '02',
                title: t.landing.howItWorks.step2.title,
                desc: t.landing.howItWorks.step2.description,
              },
              {
                step: '03',
                title: t.landing.howItWorks.step3.title,
                desc: t.landing.howItWorks.step3.description,
              },
            ].map((step, i) => (
              <div key={step.step} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-block',
                    border: '3px solid #000',
                    padding: '16px 24px',
                    fontSize: '24px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    marginBottom: '32px',
                    background: '#000',
                    color: '#FFF',
                  }}
                >
                  {step.step}
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '16px',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#666',
                    fontWeight: 500,
                    maxWidth: '320px',
                    margin: '0 auto',
                    letterSpacing: '0.02em',
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        style={{
          padding: '120px 20px',
          borderBottom: '3px solid #000',
          background: '#000',
          color: '#FFF',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '40px',
            }}
          >
            {t.landing.benefits.title}
          </h2>
          <p
            style={{
              fontSize: 'clamp(18px, 3vw, 28px)',
              fontWeight: 500,
              lineHeight: 1.7,
              maxWidth: '800px',
              margin: '0 auto 60px',
              letterSpacing: '0.03em',
              color: '#CCC',
            }}
          >
            {t.landing.benefits.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
              marginTop: '60px',
            }}
          >
            {[
              { stat: '10x', label: t.landing.benefits.stats.faster },
              { stat: '100%', label: t.landing.benefits.stats.reusable },
              { stat: '0', label: t.landing.benefits.stats.issues },
              { stat: '∞', label: t.landing.benefits.stats.customization },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  border: '3px solid #FFF',
                  padding: '40px 24px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(36px, 5vw, 56px)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    marginBottom: '12px',
                  }}
                >
                  {item.stat}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#999',
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          padding: '120px 20px',
          borderBottom: '3px solid #000',
          background: '#FFF',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '32px',
              lineHeight: 1.2,
            }}
          >
            {t.landing.finalCta.title}
            <br />
            <span style={{ color: '#666' }}>{t.landing.finalCta.subtitle}</span>
          </h2>
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.7,
              color: '#666',
              marginBottom: '48px',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {t.landing.finalCta.description}
          </p>
          <div
            style={{
              display: 'inline-block',
              border: '3px solid #000',
              padding: '20px 64px',
              background: '#000',
              color: '#FFF',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            LAUNCHING SOON
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '60px 20px',
          background: '#000',
          color: '#FFF',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '32px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                marginBottom: '8px',
              }}
            >
              {t.common.blokko}
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#666',
              }}
            >
              {t.common.tagline}
            </div>
          </div>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#666',
            }}
          >
            LAUNCHING 2026
          </div>
        </div>

        <div
          style={{
            maxWidth: '1200px',
            margin: '40px auto 0',
            paddingTop: '40px',
            borderTop: '1px solid #333',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#666',
            textAlign: 'center',
          }}
        >
          © {new Date().getFullYear()} {t.common.blokko}. {t.landing.footer.copyright}
        </div>
      </footer>
    </div>
  );
}
