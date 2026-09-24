import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { fallbackProducts } from '../assets/fallbackProducts';

const categoryOptions = [
  { name: 'Mobiles', icon: '📱' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Sports-Equipment', icon: '⚽' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Groceries', icon: '🛒' },
];

const genderOptions = [
  { name: 'Men', icon: '👔' },
  { name: 'Women', icon: '👗' },
  { name: 'Unisex', icon: '🧑' },
];

const isCategoryMatch = (optionName, currentCategory) => {
  if (!optionName || !currentCategory) return false;
  const opt = String(optionName).trim().toLowerCase();
  const cur = String(currentCategory).trim().toLowerCase();
  if (opt === cur) return true;
  if ((opt === 'sports' || opt === 'sports-equipment') && (cur === 'sports' || cur === 'sports-equipment')) return true;
  return false;
};

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton-line w-3/4" />
      <div className="skeleton-line w-full" />
      <div className="skeleton-line w-1/2" />
      <div className="skeleton-btn" />
    </div>
  </div>
);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const sort = searchParams.get('sort') || 'popular';
  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let dataset = [];
        try {
          const params = {};
          if (category) params.category = category;
          if (gender) params.gender = gender;
          if (search) params.search = search;
          if (sort !== 'popular') params.sort = sort;
          const { data } = await api.get('/products', { params });
          dataset = Array.isArray(data) && data.length > 0 ? data : fallbackProducts;
        } catch {
          dataset = fallbackProducts;
        }

        // Strip any products that have no image before showing them
        let result = dataset.filter((p) => p.mainImg && String(p.mainImg).trim() !== '');
        if (category) result = result.filter((p) => isCategoryMatch(p.category, category));
        if (gender) result = result.filter((p) => p.gender && String(p.gender).toLowerCase() === gender.toLowerCase());
        if (search) {
          const q = search.toLowerCase().trim();
          result = result.filter((p) => 
            (p.title && String(p.title).toLowerCase().includes(q)) ||
            (p.description && String(p.description).toLowerCase().includes(q)) ||
            (p.category && String(p.category).toLowerCase().includes(q)) ||
            (p.gender && String(p.gender).toLowerCase().includes(q))
          );
        }
        if (sort === 'price_low') result = [...result].sort((a, b) => a.price - b.price);
        else if (sort === 'price_high') result = [...result].sort((a, b) => b.price - a.price);
        else if (sort === 'discount') result = [...result].sort((a, b) => (b.discount || 0) - (a.discount || 0));

        setProducts(result);
      } catch {
        setError('');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, gender, sort, search]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const activeFiltersCount = [category, gender, search, sort !== 'popular' ? sort : ''].filter(Boolean).length;

  const FiltersContent = () => (
    <>
      <div className="filters-header">
        <h2>Filters</h2>
        {activeFiltersCount > 0 && (
          <button className="clear-filter" onClick={clearFilters}>
            Clear {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
          </button>
        )}
      </div>

      <div className="filter-group">
        <h4>Sort By</h4>
        {[
          ['popular', '🔥 Popular'],
          ['price_low', '↓ Price: Low to High'],
          ['price_high', '↑ Price: High to Low'],
          ['discount', '💰 Best Discount'],
        ].map(([val, label]) => (
          <label key={val} className={sort === val ? 'active-filter' : ''}>
            <input type="radio" checked={sort === val} onChange={() => updateParam('sort', val)} />
            {label}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Category</h4>
        {categoryOptions.map((cat) => (
          <label key={cat.name} className={isCategoryMatch(cat.name, category) ? 'active-filter' : ''}>
            <input
              type="checkbox"
              checked={isCategoryMatch(cat.name, category)}
              onChange={() => updateParam('category', isCategoryMatch(cat.name, category) ? '' : cat.name)}
            />
            <span>{cat.icon} {cat.name}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Gender</h4>
        {genderOptions.map((g) => (
          <label key={g.name} className={gender === g.name ? 'active-filter' : ''}>
            <input
              type="checkbox"
              checked={gender === g.name}
              onChange={() => updateParam('gender', gender === g.name ? '' : g.name)}
            />
            <span>{g.icon} {g.name}</span>
          </label>
        ))}
      </div>
    </>
  );

  return (
    <div className="products-page">
      {/* Mobile filter toggle */}
      <button className="mobile-filter-toggle" onClick={() => setFilterOpen(true)}>
        <span>⚙ Filters</span>
        {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
      </button>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="filter-drawer-overlay" onClick={() => setFilterOpen(false)}>
          <aside className="filter-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setFilterOpen(false)}>✕</button>
            <FiltersContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="filters desktop-filters">
        <FiltersContent />
      </aside>

      <main className="product-list">
        <div className="product-list-header">
          <h1 className="page-title">
            {category ? category : search ? `Results: "${search}"` : 'All Products'}
          </h1>
          {!loading && (
            <span className="results-count">{products.length} item{products.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length === 0
            ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button className="shop-now-btn" onClick={clearFilters}>Clear Filters</button>
              </div>
            )
            : products.map((product) => <ProductCard key={product._id} product={product} />)
          }
        </div>
      </main>
    </div>
  );
};

export default Products;
