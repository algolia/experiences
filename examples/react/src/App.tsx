import { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { SearchPage } from './pages/SearchPage';

const LOADER_SRC = '/dist/experiences.js';

function injectLoader() {
  const url = new URL(LOADER_SRC, window.location.origin);
  url.searchParams.set('appId', 'F4T6CUV2AH');
  url.searchParams.set('apiKey', '95d23095918f4e5c35e11d5e5e57b92d');
  url.searchParams.set('experienceId', '11e02c95-34ef-45c6-89c0-8e3cd5538a23');
  url.searchParams.set('env', 'beta');

  const script = document.createElement('script');
  script.src = url.toString();
  document.head.appendChild(script);
}

function Layout() {
  const location = useLocation();
  const loaderInjected = useRef(false);

  useEffect(() => {
    if (!loaderInjected.current) {
      // First mount: inject the loader script with config as URL params.
      // It auto-resolves the runtime, loads it, and calls run().
      injectLoader();
      loaderInjected.current = true;
    } else {
      // Subsequent route changes: re-run the already-loaded runtime.
      window.AlgoliaExperiences?.run();
    }

    return () => {
      window.AlgoliaExperiences?.dispose();
    };
  }, [location.pathname]);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            ACME Store
          </Link>

          <div className="nav-search-wrapper">
            <div id="autocomplete"></div>
          </div>

          <div className="nav-actions">
            <Link to="/search" className="nav-link">
              Shop
            </Link>
            <Link to="/search" className="nav-link">
              New In
            </Link>
            <Link to="/search" className="nav-link">
              Sale
            </Link>
            <button className="nav-cart" aria-label="Shopping cart">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <Outlet />

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-name">ACME Store</div>
              <p className="footer-brand-text">
                Curated fashion essentials designed for modern living. Quality
                materials, timeless style.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Shop</div>
              <ul className="footer-links">
                <li>
                  <Link to="/search">New Arrivals</Link>
                </li>
                <li>
                  <Link to="/search">Women</Link>
                </li>
                <li>
                  <Link to="/search">Men</Link>
                </li>
                <li>
                  <Link to="/search">Accessories</Link>
                </li>
                <li>
                  <Link to="/search">Sale</Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Sustainability</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Support</div>
              <ul className="footer-links">
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">Shipping &amp; Returns</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Size Guide</a>
                </li>
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">
              &copy; 2026 ACME Store. All rights reserved.
            </div>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <div className="chat-float">
        <div className="chat-container">
          <div id="chat"></div>
        </div>
      </div>
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="product" element={<ProductPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
