import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/image';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products');
      setProducts(data);
    } catch {
      setError('Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setMessage('Product deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete product.');
    }
  };

  return (
    <div className="admin-list-page">
      <div className="admin-list-header">
        <h2>Manage Products</h2>
        <Link to="/admin/add-product" className="secondary-btn">
          + Add Product
        </Link>
        
      </div>
      

      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      {loading && <p>Loading products...</p>}

      {!loading && products.length === 0 && <p>No products found.</p>}

      {!loading && products.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <img
                    src={getImageUrl(p.mainImg)}
                    alt={p.title}
                    onError={(e) => (e.target.src = 'https://placehold.co/60?text=No+Image')}
                    className="admin-table-img"
                  />
                </td>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>{p.discount || 0}%</td>
                <td className="admin-table-actions">
                  <Link to={`/admin/edit-products/${p._id}`} className="edit-btn">
                    Edit
                  </Link>
                  <button className="delete-btn" onClick={() => handleDelete(p._id, p.title)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProducts;