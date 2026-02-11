import { Link } from '../components/Link';

export function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-tag">Spring / Summer 2026</span>
            <h1 className="hero-title">The New Season Collection</h1>
            <p className="hero-subtitle">
              Effortless style meets modern design. Discover pieces crafted for
              everyday elegance.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/search" className="btn btn-primary btn-lg">
                Shop Now
              </Link>
              <Link to="/search" className="btn btn-outline btn-lg">
                Explore Lookbook
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/images/hero.jpg"
              alt="Spring Summer 2026 collection featuring elegant everyday fashion"
            />
          </div>
        </div>
      </section>

      {/* ===== RECOMMENDATIONS WIDGET ===== */}
      <div className="section">
        <div
          id="recommendations"
          className="widget-placeholder"
          data-widget="Personalized Recommendations"
        ></div>
      </div>

      {/* ===== TRENDING NOW ===== */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Trending Now</h2>
          <Link to="/search" className="section-link">
            View All &rarr;
          </Link>
        </div>
        <div className="product-grid">
          {[
            {
              name: 'Relaxed Wool Blazer',
              image: 'relaxed-wool-blazer',
              price: '$189.00',
            },
            {
              name: 'Silk Midi Dress',
              image: 'silk-midi-dress',
              price: '$245.00',
            },
            {
              name: 'Cotton Crew Tee',
              image: 'cotton-crew-tee',
              price: '$49.00',
            },
            {
              name: 'Tailored Trousers',
              image: 'tailored-trousers',
              price: '$135.00',
            },
            {
              name: 'Leather Crossbody Bag',
              image: 'leather-crossbody-bag',
              price: '$210.00',
            },
            {
              name: 'Oversized Linen Shirt',
              image: 'oversized-linen-shirt',
              price: '$89.00',
            },
            {
              name: 'Cashmere Cardigan',
              image: 'cashmere-cardigan',
              price: '$275.00',
            },
            { name: 'Denim Jacket', image: 'denim-jacket', price: '$165.00' },
          ].map((product) => (
            <Link to="/product" className="product-card" key={product.name}>
              <div className="product-card-image">
                <img
                  src={`/images/products/${product.image}.jpg`}
                  alt={product.name}
                />
              </div>
              <div className="product-card-info">
                <div className="product-card-name">{product.name}</div>
                <div className="product-card-price">{product.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
        </div>
        <div className="category-grid">
          {[
            { label: 'Women', image: 'women', alt: "Women's fashion" },
            { label: 'Men', image: 'men', alt: "Men's fashion" },
            { label: 'Accessories', image: 'accessories', alt: 'Accessories' },
            { label: 'Sale', image: 'sale', alt: 'Sale items' },
          ].map((category) => (
            <Link to="/search" className="category-card" key={category.label}>
              <img
                src={`/images/categories/${category.image}.jpg`}
                alt={category.alt}
              />
              <div className="category-card-overlay">
                <span className="category-card-label">{category.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
