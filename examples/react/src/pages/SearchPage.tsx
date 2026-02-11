export function SearchPage() {
  return (
    <div className="search-layout">
      <aside className="search-sidebar">
        <div className="search-sidebar-title">Filters</div>
        <div
          id="refinement-list-category"
          className="widget-placeholder"
          data-widget="Category Filter"
        ></div>
        <div
          id="refinement-list-brand"
          className="widget-placeholder"
          data-widget="Brand Filter"
        ></div>
        <div
          id="price-range"
          className="widget-placeholder"
          data-widget="Price Range"
        ></div>
      </aside>

      <main className="search-main">
        <div className="search-top-bar">
          <div className="search-top-bar-left">
            <div
              id="search-box"
              className="widget-placeholder"
              data-widget="Search Box"
            ></div>
          </div>
          <div
            id="sort-by"
            className="widget-placeholder"
            data-widget="Sort By"
            style={{ minWidth: 180 }}
          ></div>
        </div>

        <div
          id="current-refinements"
          className="widget-placeholder"
          data-widget="Current Refinements"
        ></div>

        <div
          id="hits"
          className="widget-placeholder"
          data-widget="Product Hits"
          style={{ minHeight: 400 }}
        ></div>

        <div
          id="pagination"
          className="widget-placeholder"
          data-widget="Pagination"
        ></div>
      </main>
    </div>
  );
}
