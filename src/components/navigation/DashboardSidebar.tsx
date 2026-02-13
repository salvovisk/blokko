'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Tooltip } from '@mui/material';
import { QuotesIcon, TemplatesIcon, SettingsIcon } from '@/components/icons/GeometricIcons';

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'QUOTES',
    icon: <QuotesIcon />,
    href: '/quotes',
    description: 'View and manage all your quotes'
  },
  {
    label: 'TEMPLATES',
    icon: <TemplatesIcon />,
    href: '/templates',
    description: 'Reusable quote templates (coming soon)'
  },
  {
    label: 'SETTINGS',
    icon: <SettingsIcon />,
    href: '/settings',
    description: 'Account and application settings'
  },
];

const EXPANDED_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('blokko-sidebar-collapsed');
    if (saved !== null) {
      try {
        setIsCollapsed(JSON.parse(saved));
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileOpen]);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('blokko-sidebar-collapsed', JSON.stringify(newState));
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}
          </style>
        </div>
      )}

      {/* Mobile Hamburger Button */}
      {isMobile && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          style={{
            position: 'fixed',
            top: '80px',
            left: '16px',
            zIndex: 999,
            width: '48px',
            height: '48px',
            background: '#000',
            border: '3px solid #000',
            color: '#FFF',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFF';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000';
            e.currentTarget.style.color = '#FFF';
          }}
        >
          ☰
        </button>
      )}

      <nav
        aria-label="Main navigation"
        style={{
          width: isMobile ? EXPANDED_WIDTH : (isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH),
          height: '100vh',
          background: '#000',
          color: '#FFF',
          borderRight: '3px solid #000',
          display: isMobile && !mobileOpen ? 'none' : 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          zIndex: 999,
          transition: 'width 0.2s ease-in-out',
          flexShrink: 0,
          transform: isMobile && mobileOpen ? 'translateX(0)' : isMobile ? 'translateX(-100%)' : 'translateX(0)',
          animation: isMobile && mobileOpen ? 'slideIn 0.3s ease-in-out' : 'none',
        }}
      >
        <style>
          {`
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}
        </style>
      {/* Navigation Items */}
      <div style={{ flex: 1, paddingTop: '24px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const hovered = hoveredItem === item.href;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '20px 0' : '20px 24px',
                background: active || hovered ? '#FFF' : '#000',
                color: active || hovered ? '#000' : '#FFF',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease-in-out',
                borderBottom: '2px solid #333',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  marginRight: isCollapsed ? 0 : '16px',
                  lineHeight: 1,
                }}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
            </Link>
          );

          return isCollapsed ? (
            <Tooltip
              key={item.href}
              title={
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '11px' }}>{item.description}</div>
                </div>
              }
              placement="right"
              arrow
              enterDelay={200}
              slotProps={{
                tooltip: {
                  sx: {
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: '3px solid #000000',
                    padding: '12px',
                    boxShadow: '4px 4px 0 0 rgba(0, 0, 0, 0.3)',
                    maxWidth: '240px',
                  },
                },
                arrow: {
                  sx: {
                    color: '#000000',
                    '&::before': {
                      border: '3px solid #000000',
                    },
                  },
                },
              }}
            >
              {linkContent}
            </Tooltip>
          ) : (
            linkContent
          );
        })}
      </div>

      {/* Toggle Button - Hide on mobile */}
      {!isMobile && (
        <button
          onClick={toggleCollapsed}
          aria-expanded={!isCollapsed}
          aria-label="Toggle sidebar"
          style={{
            padding: '20px',
            background: '#000',
            border: 'none',
            borderTop: '2px solid #333',
            color: '#FFF',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFF';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#000';
            e.currentTarget.style.color = '#FFF';
          }}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      )}
    </nav>
    </>
  );
}
