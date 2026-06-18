import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import AuthContext from '../authContext';
import ProductCard from '../components/ProductCard/ProductCard';
import coins from '../assets/coin.png';
import { PRODUCTS } from '../gameData';
import './Shop.css';

const CATEGORIES = ['tutto', 'cibo', 'medicine', 'accessori', 'stanze'];

function Shop() {
  const [category,        setCategory       ] = useState('tutto');
  const [coin,            setCoin           ] = useState(0);
  const [inventory,       setInventory      ] = useState({ rooms: {}, accessories: {}, medicines: 0 });
  const [activeRoom,      setActiveRoom     ] = useState(null);
  const [activeAccessory, setActiveAccessory] = useState(null);
  const [feedback,        setFeedback       ] = useState('');
  const [loading,         setLoading        ] = useState(true);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const statusRef    = ref(database, `users/${currentUser.uid}/status`);
    const inventoryRef = ref(database, `users/${currentUser.uid}/inventory`);

    Promise.all([get(statusRef), get(inventoryRef)]).then(([sSnap, iSnap]) => {
      const s = sSnap.val() || {};
      const i = iSnap.val() || { rooms: {}, accessories: {}, medicines: 0 };
      setCoin           (s.coin            ?? 50);
      setActiveRoom     (s.activeRoom      ?? null);
      setActiveAccessory(s.activeAccessory ?? null);
      setInventory(i);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentUser.uid]);

  const flash = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleBuy = useCallback(async (product) => {
    if (coin < product.cost) { flash('❌ Monete insufficienti!'); return; }

    const statusRef    = ref(database, `users/${currentUser.uid}/status`);
    const inventoryRef = ref(database, `users/${currentUser.uid}/inventory`);

    try {
      if (product.type === 'food') {
        const snap   = await get(statusRef);
        const status = snap.val() || {};
        await update(statusRef, {
          coin:      (status.coin      ?? 50)  - product.cost,
          hunger:    Math.max((status.hunger    ?? 0)   + (product.effects.hunger    ?? 0), 0),
          happiness: Math.min((status.happiness ?? 100) + (product.effects.happiness ?? 0), 100),
          weight:    Math.max(Math.min((status.weight ?? 50) + (product.effects.weight ?? 0), 100), 0),
          lastSeen:  Date.now(),
        });
        setCoin(c => c - product.cost);
        flash(`${product.emoji} ${product.name} usato! Effetti applicati.`);

      } else if (product.type === 'medicine') {
        const iSnap      = await get(inventoryRef);
        const inv        = iSnap.val() || {};
        const newCount   = (inv.medicines ?? 0) + 1;
        await Promise.all([
          update(statusRef,    { coin: coin - product.cost, lastSeen: Date.now() }),
          update(inventoryRef, { medicines: newCount }),
        ]);
        setCoin(c => c - product.cost);
        setInventory(p => ({ ...p, medicines: newCount }));
        flash(`💊 Medicina acquistata (hai ${newCount} in inventario)`);

      } else if (product.type === 'room') {
        await Promise.all([
          update(statusRef, { coin: coin - product.cost, lastSeen: Date.now() }),
          update(ref(database, `users/${currentUser.uid}/inventory/rooms`), { [product.id]: true }),
        ]);
        setCoin(c => c - product.cost);
        setInventory(p => ({ ...p, rooms: { ...p.rooms, [product.id]: true } }));
        flash(`${product.emoji} ${product.name} acquistata!`);

      } else if (product.type === 'accessory') {
        await Promise.all([
          update(statusRef, { coin: coin - product.cost, lastSeen: Date.now() }),
          update(ref(database, `users/${currentUser.uid}/inventory/accessories`), { [product.id]: true }),
        ]);
        setCoin(c => c - product.cost);
        setInventory(p => ({ ...p, accessories: { ...p.accessories, [product.id]: true } }));
        flash(`${product.emoji} ${product.name} acquistato!`);
      }
    } catch (err) {
      console.error('Purchase error:', err);
      flash('❌ Errore durante l\'acquisto.');
    }
  }, [coin, currentUser.uid]);

  const handleEquip = useCallback(async (product) => {
    const statusRef = ref(database, `users/${currentUser.uid}/status`);
    try {
      if (product.type === 'room') {
        const next = activeRoom === product.id ? null : product.id;
        await update(statusRef, { activeRoom: next });
        setActiveRoom(next);
        flash(next ? `${product.emoji} ${product.name} attivata!` : '🏠 Stanza default');
      } else if (product.type === 'accessory') {
        const next = activeAccessory === product.id ? null : product.id;
        await update(statusRef, { activeAccessory: next });
        setActiveAccessory(next);
        flash(next ? `${product.emoji} Accessorio equipaggiato!` : '✅ Accessorio rimosso');
      }
    } catch (err) {
      console.error('Equip error:', err);
    }
  }, [activeRoom, activeAccessory, currentUser.uid]);

  const filtered = category === 'tutto'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category);

  if (loading) return <div className="container mt-10"><p style={{ fontSize: 10 }}>Caricamento...</p></div>;

  return (
    <div className="container">
      <h1 className="text-2xl mt-10">SHOP</h1>

      {/* Coin + medicine */}
      <div className="shop-header mt-5">
        <div className="shop-coin-display">
          <img src={coins} alt="coin" className="coin" />
          <span>{coin}</span>
        </div>
        {inventory.medicines > 0 && (
          <span className="medicine-badge">💊 ×{inventory.medicines}</span>
        )}
      </div>

      {feedback && <div className="shop-feedback">{feedback}</div>}

      {/* Filtri */}
      <div className="filter-buttons mt-10 text-sm">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className="eightbit-btn eightbit-btn--black mx-3 mb-5"
            style={{ color: category === cat ? '#ffd700' : undefined }}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Prodotti */}
      <div className="product-grid">
        {filtered.map(product => {
          const isOwned    = product.type === 'room'
            ? !!inventory.rooms?.[product.id]
            : product.type === 'accessory'
              ? !!inventory.accessories?.[product.id]
              : false;
          const isEquipped = product.type === 'room'
            ? activeRoom      === product.id
            : product.type === 'accessory'
              ? activeAccessory === product.id
              : false;

          return (
            <ProductCard
              key={product.id}
              product={product}
              isOwned={isOwned}
              isEquipped={isEquipped}
              canAfford={coin >= product.cost}
              onBuy={() => handleBuy(product)}
              onEquip={() => handleEquip(product)}
            />
          );
        })}

        <Link className="eightbit-btn eightbit-btn--red my-10" to="/tamagotchi">
          Torna al gioco
        </Link>
      </div>
    </div>
  );
}

export default Shop;
