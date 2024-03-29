// src/ProductGrid.js
import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../src/components/ProductCard/ProductCard';

function ProductGrid() {
  const [category, setCategory] = useState('tutto');

  const products = [
    { id: 1, name: 'Stanza 1', image: 'https://via.placeholder.com/150', cost: '100', category: 'stanze' },
    { id: 2, name: 'Stanza 2', image: 'https://via.placeholder.com/150', cost: '200', category: 'stanze' },
    { id: 3, name: 'Stanza 3', image: 'https://via.placeholder.com/150', cost: '300', category: 'stanze' },
    { id: 4, name: 'Stanza 4', image: 'https://via.placeholder.com/150', cost: '400', category: 'stanze' },
    { id: 5, name: 'Accessorio 1', image: 'https://via.placeholder.com/150', cost: '10', category: 'accessori' },
    { id: 6, name: 'Accessorio 2', image: 'https://via.placeholder.com/150', cost: '20', category: 'accessori' },
    { id: 7, name: 'Accessorio 3', image: 'https://via.placeholder.com/150', cost: '30', category: 'accessori' },
    { id: 9, name: 'Accessorio 4', image: 'https://via.placeholder.com/150', cost: '40', category: 'accessori' },
    { id: 10, name: 'Musica 1', image: 'https://via.placeholder.com/150', cost: '40', category: 'musica' },
    { id: 11, name: 'Musica 2', image: 'https://via.placeholder.com/150', cost: '40', category: 'musica' },
    { id: 12, name: 'Musica 3', image: 'https://via.placeholder.com/150', cost: '40', category: 'musica' },
    { id: 13, name: 'Musica 4', image: 'https://via.placeholder.com/150', cost: '40', category: 'musica' },
  ];

  const filteredProducts = category === 'tutto' ? products : products.filter(product => product.category === category);

  return (
    <div className="container">
    <h1 className="text-2xl mt-10">SHOP</h1>
      <div className="filter-buttons mt-10 text-sm">
        <button className="eightbit-btn eightbit-btn--black mx-5 mb-5" onClick={() => setCategory('accessori')}>Accessori</button>
        <button className="eightbit-btn eightbit-btn--black mx-5 mb-5" onClick={() => setCategory('stanze')}>Stanze</button>
        <button className="eightbit-btn eightbit-btn--black mx-5 mb-5" onClick={() => setCategory('musica')}>Musica</button>
        <button className="eightbit-btn eightbit-btn--black mb-10" onClick={() => setCategory('tutto')}>Tutto</button>
      </div>
      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}

        <Link className="eightbit-btn eightbit-btn--red my-10" to={'/tamagotchi'}>Torna al gioco</Link>
      </div>
    </div>
  );
}

export default ProductGrid;

