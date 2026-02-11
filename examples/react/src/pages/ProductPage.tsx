import { Link } from '../components/Link';

export function ProductPage() {
  return (
    <>
      {/* ===== PRODUCT DETAIL ===== */}
      <div className="product-detail">
        {/* GALLERY */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img
              src="/images/products/blazer-detail-1.jpg"
              alt="Relaxed Wool Blazer — front view"
            />
          </div>
          <div className="product-gallery-thumbs">
            <div className="product-gallery-thumb active">
              <img
                src="/images/products/blazer-detail-1.jpg"
                alt="Front view thumbnail"
              />
            </div>
            <div className="product-gallery-thumb">
              <img
                src="/images/products/blazer-detail-2.jpg"
                alt="Side view thumbnail"
              />
            </div>
            <div className="product-gallery-thumb">
              <img
                src="/images/products/blazer-detail-3.jpg"
                alt="Back view thumbnail"
              />
            </div>
            <div className="product-gallery-thumb">
              <img
                src="/images/products/blazer-detail-4.jpg"
                alt="Detail view thumbnail"
              />
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="product-info">
          <div className="product-breadcrumb">
            <Link to="/">Home</Link> / <Link to="/search">Women</Link> / Blazers
          </div>
          <h1 className="product-title">Relaxed Wool Blazer</h1>
          <div className="product-price">$189.00</div>
          <p className="product-description">
            Crafted from premium Italian wool blend, this relaxed-fit blazer
            combines tailored sophistication with everyday comfort. Features a
            single-button closure, patch pockets, and a soft shoulder
            construction for an effortlessly refined silhouette. Perfect for
            both office and weekend wear.
          </p>

          <div className="product-options">
            <div>
              <div className="product-option-label">Size</div>
              <div className="product-sizes">
                <button className="product-size">XS</button>
                <button className="product-size active">S</button>
                <button className="product-size">M</button>
                <button className="product-size">L</button>
                <button className="product-size">XL</button>
              </div>
            </div>
          </div>

          <button className="product-add-to-cart">Add to Cart</button>

          <div className="product-meta">
            <span>Free shipping on orders over $100</span>
            <span>Free returns within 30 days</span>
            <span>SKU: ACM-WBL-001</span>
          </div>
        </div>
      </div>

      {/* ===== RELATED PRODUCTS WIDGET ===== */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">You Might Also Like</h2>
        </div>
        <div
          id="related-products"
          className="widget-placeholder"
          data-widget="Related Products"
          style={{ minHeight: 200 }}
        ></div>
      </section>

      {/* ===== FREQUENTLY BOUGHT TOGETHER WIDGET ===== */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Frequently Bought Together</h2>
        </div>
        <div
          id="frequently-bought-together"
          className="widget-placeholder"
          data-widget="Frequently Bought Together"
          style={{ minHeight: 200 }}
        ></div>
      </section>
    </>
  );
}
