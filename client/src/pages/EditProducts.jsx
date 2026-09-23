import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../utils/image';
import { fallbackProducts } from '../assets/fallbackProducts';

const EditProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    mainImg: null,
    category: '',
    gender: '',
    price: '',
    discount: '',
    sizes: '',
  });

  const [existingImg, setExistingImg] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);

        setForm({
          title: data.title || '',
          description: data.description || '',
          mainImg: null,
          category: data.category || '',
          gender: data.gender || '',
          price: data.price ?? '',
          discount: data.discount ?? '',
          sizes: Array.isArray(data.sizes) ? data.sizes.join(', ') : '',
        });

        setExistingImg(data.mainImg || '');
      } catch (err) {
        const found = fallbackProducts.find((p) => String(p._id) === String(id));
        if (found) {
          setForm({
            title: found.title || '',
            description: found.description || '',
            mainImg: null,
            category: found.category || '',
            gender: found.gender || '',
            price: found.price ?? '',
            discount: found.discount ?? '',
            sizes: Array.isArray(found.sizes) ? found.sizes.join(', ') : '',
          });
          setExistingImg(found.mainImg || '');
        } else {
          setError(err.response?.data?.message || 'Could not load product.');
        }
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setForm({
        ...form,
        mainImg: file,
      });

      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();

      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('gender', form.gender);
      formData.append('price', form.price);
      formData.append('discount', form.discount || 0);

      formData.append(
        'sizes',
        JSON.stringify(form.sizes ? form.sizes.split(',').map((s) => s.trim()) : [])
      );

      if (form.mainImg) {
        formData.append('mainImg', form.mainImg);
      }

      await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Product updated successfully!');

      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="auth-page">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Edit Product</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          name="title"
          placeholder="Product Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <img
          src={
            preview
              ? preview
              : existingImg
              ? getImageUrl(existingImg)
              : 'https://placehold.co/180'
          }
          alt="Preview"
          style={{
            width: '180px',
            height: '180px',
            objectFit: 'cover',
            borderRadius: '10px',
            margin: '10px auto',
            display: 'block',
            border: '1px solid #ddd',
          }}
        />

        <input type="file" accept="image/*" onChange={handleImageChange} />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Electronics">Electronics</option>
          <option value="Sports-Equipment">Sports-Equipment</option>
          <option value="Fashion">Fashion</option>
          <option value="Groceries">Groceries</option>
        </select>

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Unisex">Unisex</option>
        </select>

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="discount"
          placeholder="Discount %"
          value={form.discount}
          onChange={handleChange}
        />

        <input
          type="text"
          name="sizes"
          placeholder="Sizes (S,M,L,XL)"
          value={form.sizes}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Updating Product...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};

export default EditProducts;