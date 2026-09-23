import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from './ProductCard';
import { fallbackProducts } from '../assets/fallbackProducts';

const RelatedProducts = ({ productId }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);

    const getFallbackRelated = () => {
      const current = fallbackProducts.find((p) => String(p._id) === String(productId));
      if (!current) return fallbackProducts.slice(0, 4);
      return fallbackProducts
        .filter((p) => String(p._id) !== String(productId) && p.category === current.category)
        .slice(0, 4);
    };

    if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
      setRelated(getFallbackRelated());
      setLoading(false);
    } else {
      api
        .get(`/products/${productId}/related`)
        .then(({ data }) => {
          if (Array.isArray(data) && data.length > 0) {
            setRelated(data);
          } else {
            setRelated(getFallbackRelated());
          }
        })
        .catch(() => setRelated(getFallbackRelated()))
        .finally(() => setLoading(false));
    }
  }, [productId]);

  if (loading || related.length === 0) return null;

  return (
    <div className="related-products">
      <h2 className="section-title">You might also like</h2>
      <div className="product-grid">
        {related.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;