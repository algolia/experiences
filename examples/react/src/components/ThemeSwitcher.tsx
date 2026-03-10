import { useCallback, useEffect, useRef, useState } from 'react';

import { generateThemeCss } from '../../../../packages/theme/src/index';
import { AUTOCOMPLETE_VARIABLES } from '../../../../packages/theme/src/widgets/autocomplete';
import {
  modern,
  warmMinimal,
  boldBrand,
  softPastel,
} from '../../../shared/themes';

import type { ThemeOverrides } from '../../../../packages/theme/src/index';

const themes: Record<string, ThemeOverrides> = {
  default: {},
  modern,
  warmMinimal,
  boldBrand,
  softPastel,
};

const themeLabels: Record<string, string> = {
  default: 'Default',
  modern: 'Modern',
  warmMinimal: 'Warm Minimal',
  boldBrand: 'Bold Brand',
  softPastel: 'Soft Pastel',
};

type Mode = 'system' | 'light' | 'dark';

function setDarkClass(isDark: boolean) {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  }
}

export function ThemeSwitcher() {
  const [themeName, setThemeName] = useState('default');
  const [mode, setMode] = useState<Mode>('system');
  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Inject/update the theme style element
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = generateThemeCss(
      AUTOCOMPLETE_VARIABLES,
      themes[themeName]
    );
    // Re-append to win over middleware's injected styles
    document.head.appendChild(styleRef.current);
  }, [themeName]);

  // Keep our style element last in <head> whenever the runtime injects new styles
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (
        styleRef.current &&
        styleRef.current !== document.head.lastElementChild
      ) {
        document.head.appendChild(styleRef.current);
      }
    });
    observer.observe(document.head, { childList: true });
    return () => {
      observer.disconnect();
    };
  }, []);

  // Apply color mode
  const applyMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    if (newMode === 'system') {
      setDarkClass(darkMq.matches);
    } else {
      setDarkClass(newMode === 'dark');
    }
  }, []);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    const darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (mode === 'system') {
        setDarkClass(darkMq.matches);
      }
    };
    darkMq.addEventListener('change', handler);
    return () => {
      darkMq.removeEventListener('change', handler);
    };
  }, [mode]);

  // Apply system mode on mount
  useEffect(() => {
    applyMode('system');
  }, [applyMode]);

  return (
    <>
      <style>{themeSwitcherStyles}</style>
      <div className="theme-switcher">
        <select
          aria-label="Theme"
          value={themeName}
          onChange={(event) => {
            setThemeName(event.target.value);
          }}
        >
          {Object.keys(themes).map((key) => {
            return (
              <option key={key} value={key}>
                {themeLabels[key]}
              </option>
            );
          })}
        </select>
        <div
          className="theme-switcher-modes"
          role="radiogroup"
          aria-label="Color mode"
        >
          <button
            className={`theme-switcher-mode${mode === 'system' ? ' active' : ''}`}
            aria-label="System"
            title="System"
            onClick={() => {
              applyMode('system');
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8m-4-4v4" />
            </svg>
          </button>
          <button
            className={`theme-switcher-mode${mode === 'light' ? ' active' : ''}`}
            aria-label="Light"
            title="Light"
            onClick={() => {
              applyMode('light');
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          <button
            className={`theme-switcher-mode${mode === 'dark' ? ' active' : ''}`}
            aria-label="Dark"
            title="Dark"
            onClick={() => {
              applyMode('dark');
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

const themeSwitcherStyles = `
.theme-switcher {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
}
.theme-switcher select {
  appearance: none;
  padding: 5px 28px 5px 10px;
  border: none;
  border-radius: 7px;
  background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 5 3 3 3-3'/%3E%3C/svg%3E") right 8px center / 12px no-repeat;
  font: inherit;
  color: #333;
  cursor: pointer;
  outline: none;
}
.theme-switcher select:hover {
  background-color: #f5f5f5;
}
.theme-switcher select:focus-visible {
  box-shadow: 0 0 0 2px rgba(30,89,255,0.3);
}
.theme-switcher-modes {
  display: flex;
  gap: 1px;
  background: #e5e5e5;
  border-radius: 7px;
  padding: 1px;
}
.theme-switcher-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  padding: 0;
  border: none;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.theme-switcher-mode:first-child {
  border-radius: 6px 0 0 6px;
}
.theme-switcher-mode:last-child {
  border-radius: 0 6px 6px 0;
}
.theme-switcher-mode:hover {
  background: #f5f5f5;
  color: #333;
}
.theme-switcher-mode.active {
  background: #1a1a1a;
  color: #fff;
}
`;
