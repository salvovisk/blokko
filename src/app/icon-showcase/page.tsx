'use client';

import { useState } from 'react';

type IconStyle = 'geometric' | 'ascii' | 'outlined' | 'constructivist' | 'typographic';

interface IconSet {
  quotes: string | JSX.Element;
  builder: string | JSX.Element;
  templates: string | JSX.Element;
  settings: string | JSX.Element;
}

export default function IconShowcase() {
  const [selectedStyle, setSelectedStyle] = useState<IconStyle>('geometric');
  const [hoveredCard, setHoveredCard] = useState<IconStyle | null>(null);

  // Custom geometric icons as SVG components - Swiss Brutalist Design
  // All icons use thick strokes to ensure visibility on any background

  const GeometricQuotes = () => (
    <svg width="1em" height="1em" viewBox="0 0 32 32" fill="none" stroke="currentColor">
      {/* QUOTES: Stacked documents metaphor - 3 offset rectangles showing file stack */}
      <rect x="4" y="10" width="18" height="18" strokeWidth="3"/>
      <rect x="7" y="7" width="18" height="18" strokeWidth="3"/>
      <rect x="10" y="4" width="18" height="18" strokeWidth="3" fill="currentColor"/>
    </svg>
  );

  const GeometricBuilder = () => (
    <svg width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor">
      {/* BUILDER: Construction blocks metaphor - horizontal bars stacking up */}
      <rect x="4" y="4" width="24" height="5"/>
      <rect x="4" y="12" width="24" height="5"/>
      <rect x="4" y="20" width="24" height="5"/>
    </svg>
  );

  const GeometricTemplates = () => (
    <svg width="1em" height="1em" viewBox="0 0 32 32" fill="none" stroke="currentColor">
      {/* TEMPLATES: Duplication metaphor - overlapping copies */}
      <rect x="4" y="4" width="18" height="18" strokeWidth="3"/>
      <rect x="10" y="10" width="18" height="18" strokeWidth="3" fill="currentColor"/>
    </svg>
  );

  const GeometricSettings = () => (
    <svg width="1em" height="1em" viewBox="0 0 32 32" fill="currentColor">
      {/* SETTINGS: Configuration metaphor - geometric cross/gear shape */}
      <rect x="13" y="4" width="6" height="24"/>
      <rect x="4" y="13" width="24" height="6"/>
    </svg>
  );

  // Icon definitions for each style
  const iconStyles: Record<IconStyle, { name: string; description: string; icons: IconSet }> = {
    geometric: {
      name: 'GEOMETRIC BRUTALIST',
      description: 'Descriptive shapes representing function',
      icons: {
        quotes: <GeometricQuotes />,
        builder: <GeometricBuilder />,
        templates: <GeometricTemplates />,
        settings: <GeometricSettings />,
      },
    },
    ascii: {
      name: 'ASCII TERMINAL',
      description: 'Terminal-style descriptive characters',
      icons: {
        quotes: '⎘',
        builder: '≡',
        templates: '⊞',
        settings: '⚙',
      },
    },
    outlined: {
      name: 'OUTLINED MINIMAL',
      description: 'Thick strokes, maximum clarity',
      icons: {
        quotes: '□',
        builder: '▢',
        templates: '▭',
        settings: '⊞',
      },
    },
    constructivist: {
      name: 'CONSTRUCTIVIST',
      description: 'Layered geometry, Soviet-inspired',
      icons: {
        quotes: '◢◣',
        builder: '◤◥',
        templates: '▲▼',
        settings: '◀▶',
      },
    },
    typographic: {
      name: 'TYPOGRAPHIC BOLD',
      description: 'Letters as icons, type-first',
      icons: {
        quotes: 'Q',
        builder: 'B',
        templates: 'T',
        settings: 'S',
      },
    },
  };

  const pageInfo = [
    { key: 'quotes' as keyof IconSet, label: 'QUOTES', desc: 'Manage quotes' },
    { key: 'builder' as keyof IconSet, label: 'BUILDER', desc: 'Create quotes' },
    { key: 'templates' as keyof IconSet, label: 'TEMPLATES', desc: 'Reusable templates' },
    { key: 'settings' as keyof IconSet, label: 'SETTINGS', desc: 'Configuration' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        fontFamily: "'Courier New', Courier, monospace",
        padding: '0',
        margin: '0',
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: '#000000',
          color: '#FFFFFF',
          padding: '48px 32px',
          borderBottom: '8px solid #000000',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            fontSize: '240px',
            opacity: '0.05',
            fontWeight: 'bold',
            lineHeight: '1',
            pointerEvents: 'none',
          }}
        >
          ▦
        </div>
        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              margin: '0 0 16px 0',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            ICON SYSTEM
          </h1>
          <p
            style={{
              fontSize: '18px',
              margin: '0',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              opacity: '0.8',
            }}
          >
            BLOKKO Visual Identity Exploration
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 32px' }}>
        {/* Style Selection Grid */}
        <section style={{ marginBottom: '96px' }}>
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '48px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderBottom: '4px solid #000000',
              paddingBottom: '16px',
            }}
          >
            SELECT ICON STYLE
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            {(Object.keys(iconStyles) as IconStyle[]).map((styleKey) => {
              const style = iconStyles[styleKey];
              const isSelected = selectedStyle === styleKey;
              const isHovered = hoveredCard === styleKey;

              return (
                <button
                  key={styleKey}
                  onClick={() => setSelectedStyle(styleKey)}
                  onMouseEnter={() => setHoveredCard(styleKey)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    backgroundColor: isSelected ? '#000000' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#000000',
                    border: isHovered ? '6px solid #000000' : '4px solid #000000',
                    padding: '32px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'scale(1.02) translateY(-4px)' : 'scale(1)',
                    boxShadow: isHovered
                      ? '12px 12px 0 0 rgba(0, 0, 0, 0.3)'
                      : isSelected
                      ? '8px 8px 0 0 rgba(0, 0, 0, 0.2)'
                      : 'none',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '16px',
                      letterSpacing: '1px',
                      opacity: isSelected ? '0.8' : '0.6',
                    }}
                  >
                    {style.name}
                  </div>

                  {/* Icon Preview */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '24px',
                      fontSize: '48px',
                      justifyContent: 'center',
                    }}
                  >
                    {Object.values(style.icons).map((icon, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-block',
                          transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transitionDelay: `${idx * 0.05}s`,
                        }}
                      >
                        {icon}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      letterSpacing: '0.5px',
                      lineHeight: '1.6',
                      opacity: isSelected ? '0.9' : '0.7',
                    }}
                  >
                    {style.description}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Style Preview */}
        <section>
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '24px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderBottom: '4px solid #000000',
              paddingBottom: '16px',
            }}
          >
            PREVIEW: {iconStyles[selectedStyle].name}
          </h2>

          <div
            style={{
              backgroundColor: '#FAFAFA',
              border: '4px solid #000000',
              padding: '48px',
            }}
          >
            {/* Navigation Preview */}
            <div style={{ marginBottom: '64px' }}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '24px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  opacity: '0.6',
                }}
              >
                NAVIGATION SIDEBAR
              </h3>

              <div
                style={{
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  width: '280px',
                  border: '3px solid #000000',
                }}
              >
                {pageInfo.map((page, idx) => (
                  <div
                    key={page.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '20px 24px',
                      borderBottom: idx < pageInfo.length - 1 ? '2px solid #333' : 'none',
                      gap: '16px',
                      animation: `slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.1}s both`,
                    }}
                  >
                    <style>
                      {`
                        @keyframes slideInLeft {
                          from {
                            opacity: 0;
                            transform: translateX(-20px);
                          }
                          to {
                            opacity: 1;
                            transform: translateX(0);
                          }
                        }
                      `}
                    </style>
                    <span style={{ fontSize: '32px', lineHeight: '1' }}>
                      {iconStyles[selectedStyle].icons[page.key]}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.12em' }}>
                        {page.label}
                      </div>
                      <div style={{ fontSize: '10px', opacity: '0.6', marginTop: '4px' }}>
                        {page.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Icon Grid Display */}
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '24px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  opacity: '0.6',
                }}
              >
                INDIVIDUAL ICONS
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '24px',
                }}
              >
                {pageInfo.map((page, idx) => (
                  <div
                    key={page.key}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '4px solid #000000',
                      padding: '32px',
                      textAlign: 'center',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: `popIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.1}s both`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05) rotate(-2deg)';
                      e.currentTarget.style.boxShadow = '8px 8px 0 0 rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <style>
                      {`
                        @keyframes popIn {
                          from {
                            opacity: 0;
                            transform: scale(0.8);
                          }
                          to {
                            opacity: 1;
                            transform: scale(1);
                          }
                        }
                      `}
                    </style>
                    <div style={{ fontSize: '96px', marginBottom: '24px', lineHeight: '1' }}>
                      {iconStyles[selectedStyle].icons[page.key]}
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        letterSpacing: '1px',
                        marginBottom: '8px',
                      }}
                    >
                      {page.label}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        opacity: '0.6',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {page.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Matrix */}
        <section style={{ marginTop: '96px' }}>
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              marginBottom: '48px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              borderBottom: '4px solid #000000',
              paddingBottom: '16px',
            }}
          >
            STYLE COMPARISON
          </h2>

          <div
            style={{
              border: '4px solid #000000',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            {/* Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '180px repeat(4, 1fr)',
                backgroundColor: '#000000',
                color: '#FFFFFF',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderRight: '2px solid #333',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  letterSpacing: '1px',
                }}
              >
                STYLE
              </div>
              {pageInfo.map((page) => (
                <div
                  key={page.key}
                  style={{
                    padding: '16px',
                    borderRight: '2px solid #333',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    letterSpacing: '1px',
                  }}
                >
                  {page.label}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {(Object.keys(iconStyles) as IconStyle[]).map((styleKey, idx) => {
              const style = iconStyles[styleKey];
              return (
                <div
                  key={styleKey}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '180px repeat(4, 1fr)',
                    borderTop: '2px solid #000000',
                    backgroundColor: selectedStyle === styleKey ? '#FFFACD' : '#FFFFFF',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      selectedStyle === styleKey ? '#FFFACD' : '#FFFFFF';
                  }}
                >
                  <div
                    style={{
                      padding: '24px 16px',
                      borderRight: '2px solid #E0E0E0',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {style.name}
                  </div>
                  {pageInfo.map((page) => (
                    <div
                      key={page.key}
                      style={{
                        padding: '24px 16px',
                        borderRight: '2px solid #E0E0E0',
                        textAlign: 'center',
                        fontSize: '48px',
                      }}
                    >
                      {style.icons[page.key]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        {/* Design Notes */}
        <section
          style={{
            marginTop: '96px',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            padding: '48px',
            border: '4px solid #000000',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            DESIGN PRINCIPLES
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              {
                title: 'CLARITY',
                text: 'Icons must be instantly recognizable at any size',
              },
              {
                title: 'CONSISTENCY',
                text: 'Unified visual language across all touchpoints',
              },
              {
                title: 'BRUTALISM',
                text: 'Bold, uncompromising, honest design',
              },
              {
                title: 'SCALABILITY',
                text: 'Works from 16px to 256px without loss of meaning',
              },
            ].map((principle, idx) => (
              <div
                key={idx}
                style={{
                  borderLeft: '4px solid #FFFFFF',
                  paddingLeft: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    letterSpacing: '1px',
                  }}
                >
                  {principle.title}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.6',
                    opacity: '0.8',
                  }}
                >
                  {principle.text}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#000000',
          color: '#FFFFFF',
          padding: '32px',
          textAlign: 'center',
          borderTop: '8px solid #000000',
          marginTop: '96px',
        }}
      >
        <div style={{ fontSize: '12px', letterSpacing: '2px', opacity: '0.6' }}>
          BLOKKO ICON SYSTEM • SWISS BRUTALIST DESIGN
        </div>
      </footer>
    </div>
  );
}
