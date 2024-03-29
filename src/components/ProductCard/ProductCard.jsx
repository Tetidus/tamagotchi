// src/ProductCard.js
import React from 'react';
import coins from '../../assets/coin.png'

function ProductCard({ name, image, cost }) {
    return (
        <div className="product-card mb-10">
            <img src={image} alt={name} className="product-image mb-2" />
            <h3>{name}</h3>
            <div className="flex flex-row items-center justify-center">
            <img src={coins} className="coin mr-2" alt="coins" />
                <p>{cost}</p>
            </div>
        </div>
    );
}

export default ProductCard;
