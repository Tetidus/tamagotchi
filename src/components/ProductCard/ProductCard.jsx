import React from 'react';
import coins from '../../assets/coin.png';
import './ProductCard.css';

const EFFECT_LABELS = {
  hunger:    v => v < 0 ? `-${Math.abs(v)} fame`    : null,
  happiness: v => v > 0 ? `+${v} felicità`           : null,
  weight:    v => v > 0 ? `+${v} peso` : v < 0 ? `${v} peso` : null,
};

function ProductCard({ product, isOwned, isEquipped, canAfford, onBuy, onEquip }) {
  const isPersistent = product.type === 'room' || product.type === 'accessory';

  const effectsText = product.effects
    ? Object.entries(product.effects)
        .map(([k, v]) => EFFECT_LABELS[k]?.(v))
        .filter(Boolean)
        .join(' · ')
    : product.type === 'medicine'
      ? 'Cura malattia · +30 salute'
      : '';

  return (
    <div className={`product-card ${isEquipped ? 'card-equipped' : ''}`}>
      <span className="product-emoji">{product.emoji}</span>
      <p className="product-name">{product.name}</p>
      {effectsText && <p className="product-effects">{effectsText}</p>}

      {/* Prezzo (non mostrato se è persistente già acquistato) */}
      {(!isPersistent || !isOwned) && (
        <div className="product-cost">
          <img src={coins} alt="coin" className="coin" />
          <span>{product.cost}</span>
        </div>
      )}

      {/* CTA */}
      {isPersistent ? (
        isOwned ? (
          <button
            className={`eightbit-btn ${isEquipped ? 'eightbit-btn--yellow' : 'eightbit-btn--black'}`}
            onClick={onEquip}
          >
            {isEquipped ? '✓ Attivo' : 'Equipaggia'}
          </button>
        ) : (
          <button
            className="eightbit-btn"
            onClick={onBuy}
            disabled={!canAfford}
            style={{ opacity: canAfford ? 1 : 0.4, cursor: canAfford ? 'pointer' : 'not-allowed' }}
          >
            Acquista
          </button>
        )
      ) : (
        <button
          className="eightbit-btn eightbit-btn--yellow"
          onClick={onBuy}
          disabled={!canAfford}
          style={{ opacity: canAfford ? 1 : 0.4, cursor: canAfford ? 'pointer' : 'not-allowed' }}
        >
          Usa
        </button>
      )}
    </div>
  );
}

export default ProductCard;
