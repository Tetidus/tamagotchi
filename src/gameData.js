export const PRODUCTS = [
  // ── Cibo (consumabile, effetto immediato) ────────────────────────────────
  {
    id: 'onigiri', name: 'Onigiri', emoji: '🍙', cost: 5,
    category: 'cibo', type: 'food',
    effects: { hunger: -20, happiness: 5, weight: 1 },
  },
  {
    id: 'candy', name: 'Caramella', emoji: '🍭', cost: 8,
    category: 'cibo', type: 'food',
    effects: { hunger: -10, happiness: 25, weight: 5 },
  },
  {
    id: 'salad', name: 'Insalata', emoji: '🥗', cost: 10,
    category: 'cibo', type: 'food',
    effects: { hunger: -30, happiness: 3, weight: -5 },
  },
  {
    id: 'pizza', name: 'Pizza', emoji: '🍕', cost: 15,
    category: 'cibo', type: 'food',
    effects: { hunger: -40, happiness: 15, weight: 8 },
  },

  // ── Medicine (va in inventario, usabile dal gioco) ───────────────────────
  {
    id: 'medicine', name: 'Medicina', emoji: '💊', cost: 25,
    category: 'medicine', type: 'medicine',
  },

  // ── Stanze (acquistabili una volta, poi equipaggiabili) ──────────────────
  {
    id: 'room_forest', name: 'Foresta', emoji: '🌿', cost: 100,
    category: 'stanze', type: 'room',
    bg: 'linear-gradient(180deg, #1a3a1a 0%, #0d1f0d 100%)',
  },
  {
    id: 'room_ocean', name: 'Mare', emoji: '🌊', cost: 200,
    category: 'stanze', type: 'room',
    bg: 'linear-gradient(180deg, #003366 0%, #001122 100%)',
  },
  {
    id: 'room_castle', name: 'Castello', emoji: '🏰', cost: 300,
    category: 'stanze', type: 'room',
    bg: 'linear-gradient(180deg, #2a0044 0%, #110022 100%)',
  },
  {
    id: 'room_space', name: 'Spazio', emoji: '🚀', cost: 400,
    category: 'stanze', type: 'room',
    bg: 'radial-gradient(ellipse at 50% 30%, #111133 0%, #000011 100%)',
  },

  // ── Accessori (acquistabili una volta, poi equipaggiabili) ───────────────
  { id: 'acc_hat',     name: 'Cappello', emoji: '🎩', cost: 50,  category: 'accessori', type: 'accessory' },
  { id: 'acc_glasses', name: 'Occhiali', emoji: '👓', cost: 30,  category: 'accessori', type: 'accessory' },
  { id: 'acc_bow',     name: 'Fiocco',   emoji: '🎀', cost: 40,  category: 'accessori', type: 'accessory' },
  { id: 'acc_crown',   name: 'Corona',   emoji: '👑', cost: 80,  category: 'accessori', type: 'accessory' },
];
