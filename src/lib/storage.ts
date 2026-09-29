import { Product, StockAdjustment, Sale, Settings } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'cellar_pos_products',
  ADJUSTMENTS: 'cellar_pos_adjustments',
  SALES: 'cellar_pos_sales',
  SETTINGS: 'cellar_pos_settings',
  INITIALIZED: 'cellar_pos_initialized_v1',
};

const DEFAULT_CATEGORIES = [
  'Spirits',
  'Wine',
  'Beer',
  'Cider/RTD',
  'Mixers & Soft Drinks',
  'Other',
];

const DEFAULT_SETTINGS: Settings = {
  shop_name: 'The Cellar Wines & Spirits',
  shop_phone: '+254 722 890 123',
  shop_location: 'Argwings Kodhek Rd, Kilimani, Nairobi',
  till_number: 'Buy Goods Till: 894521',
  low_stock_threshold: 5,
  categories: DEFAULT_CATEGORIES,
  next_receipt_no: 1001,
};

// Initial realistic catalogue of wines and spirits retail products in Kenya (KSh prices)
const INITIAL_PRODUCTS: Product[] = [
  // Spirits
  {
    id: 'prod-sp-01',
    name: 'Gilbeys Special Dry Gin 750ml',
    category: 'Spirits',
    price: 1450,
    qty: 18,
    low_stock_threshold: 5,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-02',
    name: 'Gilbeys Special Dry Gin 250ml',
    category: 'Spirits',
    price: 450,
    qty: 24,
    low_stock_threshold: 6,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-03',
    name: 'Chrome Vodka 750ml',
    category: 'Spirits',
    price: 850,
    qty: 14,
    low_stock_threshold: 5,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-04',
    name: 'Chrome Vodka 250ml',
    category: 'Spirits',
    price: 320,
    qty: 3, // Low stock demo!
    low_stock_threshold: 5,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-05',
    name: 'Jameson Irish Whiskey 750ml',
    category: 'Spirits',
    price: 2800,
    qty: 9,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-06',
    name: 'Jameson Irish Whiskey 350ml',
    category: 'Spirits',
    price: 1500,
    qty: 12,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-07',
    name: 'Johnnie Walker Black Label 750ml',
    category: 'Spirits',
    price: 3800,
    qty: 2, // Low stock demo!
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-08',
    name: 'Johnnie Walker Red Label 750ml',
    category: 'Spirits',
    price: 2200,
    qty: 8,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-09',
    name: 'Captain Morgan Gold Rum 750ml',
    category: 'Spirits',
    price: 1350,
    qty: 11,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-10',
    name: 'Hennessy VS Cognac 750ml',
    category: 'Spirits',
    price: 5900,
    qty: 4,
    low_stock_threshold: 2,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-11',
    name: "Gordon's London Dry Gin 750ml",
    category: 'Spirits',
    price: 1950,
    qty: 7,
    low_stock_threshold: 3,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-sp-12',
    name: 'Smirnoff Vodka Red 750ml',
    category: 'Spirits',
    price: 1400,
    qty: 15,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Beer
  {
    id: 'prod-br-01',
    name: 'Tusker Lager 500ml Can',
    category: 'Beer',
    price: 250,
    qty: 48,
    low_stock_threshold: 12,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-br-02',
    name: 'Tusker Malt 330ml Can',
    category: 'Beer',
    price: 260,
    qty: 36,
    low_stock_threshold: 10,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-br-03',
    name: 'White Cap Lager 500ml Can',
    category: 'Beer',
    price: 260,
    qty: 40,
    low_stock_threshold: 12,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-br-04',
    name: 'Guinness Foreign Extra 500ml Can',
    category: 'Beer',
    price: 280,
    qty: 24,
    low_stock_threshold: 8,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-br-05',
    name: 'Balozi Lager 500ml',
    category: 'Beer',
    price: 240,
    qty: 0, // Out of stock demo!
    low_stock_threshold: 6,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Wine
  {
    id: 'prod-wn-01',
    name: 'Four Cousins Sweet Red 750ml',
    category: 'Wine',
    price: 1150,
    qty: 16,
    low_stock_threshold: 5,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-wn-02',
    name: 'Four Cousins Sweet White 750ml',
    category: 'Wine',
    price: 1150,
    qty: 12,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-wn-03',
    name: 'Robertson Winery Natural Sweet Red 750ml',
    category: 'Wine',
    price: 1200,
    qty: 14,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-wn-04',
    name: 'Nederburg Cabernet Sauvignon 750ml',
    category: 'Wine',
    price: 1850,
    qty: 6,
    low_stock_threshold: 3,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-wn-05',
    name: 'Casillero del Diablo Cabernet 750ml',
    category: 'Wine',
    price: 2100,
    qty: 5,
    low_stock_threshold: 3,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Cider/RTD
  {
    id: 'prod-cd-01',
    name: 'Savanna Dry Cider 330ml',
    category: 'Cider/RTD',
    price: 280,
    qty: 26,
    low_stock_threshold: 6,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-cd-02',
    name: 'Hunters Dry Cider 330ml',
    category: 'Cider/RTD',
    price: 270,
    qty: 18,
    low_stock_threshold: 6,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-cd-03',
    name: 'Smirnoff Ice Black Guarana 330ml Can',
    category: 'Cider/RTD',
    price: 240,
    qty: 30,
    low_stock_threshold: 8,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Mixers & Soft Drinks
  {
    id: 'prod-mx-01',
    name: 'Krest Bitter Lemon 500ml',
    category: 'Mixers & Soft Drinks',
    price: 100,
    qty: 32,
    low_stock_threshold: 8,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-mx-02',
    name: 'Schweppes Tonic Water 500ml',
    category: 'Mixers & Soft Drinks',
    price: 120,
    qty: 24,
    low_stock_threshold: 6,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-mx-03',
    name: 'Coca Cola 500ml',
    category: 'Mixers & Soft Drinks',
    price: 90,
    qty: 48,
    low_stock_threshold: 12,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-mx-04',
    name: 'Red Bull Energy Drink 250ml',
    category: 'Mixers & Soft Drinks',
    price: 250,
    qty: 18,
    low_stock_threshold: 6,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Other
  {
    id: 'prod-ot-01',
    name: 'Cocktail Ice Bag 2kg',
    category: 'Other',
    price: 150,
    qty: 12,
    low_stock_threshold: 4,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-ot-02',
    name: 'Plastic Cups (Pack of 25)',
    category: 'Other',
    price: 200,
    qty: 15,
    low_stock_threshold: 3,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initial historical sample adjustments
const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj-01',
    product_id: 'prod-sp-01',
    product_name: 'Gilbeys Special Dry Gin 750ml',
    delta: 12,
    reason: 'Restock',
    notes: 'Weekly distributor delivery (Invoice #4401)',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'adj-02',
    product_id: 'prod-br-01',
    product_name: 'Tusker Lager 500ml Can',
    delta: -1,
    reason: 'Breakage',
    notes: 'Dropped during shelf restocking',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'adj-03',
    product_id: 'prod-wn-01',
    product_name: 'Four Cousins Sweet Red 750ml',
    delta: 6,
    reason: 'Restock',
    notes: 'Counter replenishment',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

// Initial demo sales to populate reconciliation dashboard and weekly revenue chart immediately
const INITIAL_SALES: Sale[] = [
  // Today's sales
  {
    id: 'sale-1001',
    receipt_no: 1001,
    ts: new Date(Date.now() - 4 * 3600000).toISOString(),
    subtotal: 1700,
    total: 1700,
    payment_method: 'M-Pesa',
    reference: 'QKD8291KL0',
    status: 'completed',
    items: [
      {
        id: 'item-1',
        sale_id: 'sale-1001',
        product_id: 'prod-sp-01',
        name: 'Gilbeys Special Dry Gin 750ml',
        category: 'Spirits',
        price: 1450,
        qty: 1,
        line_total: 1450,
      },
      {
        id: 'item-2',
        sale_id: 'sale-1001',
        product_id: 'prod-mx-04',
        name: 'Red Bull Energy Drink 250ml',
        category: 'Mixers & Soft Drinks',
        price: 250,
        qty: 1,
        line_total: 250,
      },
    ],
  },
  {
    id: 'sale-1002',
    receipt_no: 1002,
    ts: new Date(Date.now() - 2 * 3600000).toISOString(),
    subtotal: 750,
    total: 750,
    payment_method: 'Cash',
    cash_received: 1000,
    change: 250,
    status: 'completed',
    items: [
      {
        id: 'item-3',
        sale_id: 'sale-1002',
        product_id: 'prod-br-01',
        name: 'Tusker Lager 500ml Can',
        category: 'Beer',
        price: 250,
        qty: 3,
        line_total: 750,
      },
    ],
  },
  {
    id: 'sale-1003',
    receipt_no: 1003,
    ts: new Date(Date.now() - 45 * 60000).toISOString(),
    subtotal: 2800,
    total: 2800,
    payment_method: 'M-Pesa',
    reference: 'RKF9102PX4',
    status: 'completed',
    items: [
      {
        id: 'item-4',
        sale_id: 'sale-1003',
        product_id: 'prod-sp-05',
        name: 'Jameson Irish Whiskey 750ml',
        category: 'Spirits',
        price: 2800,
        qty: 1,
        line_total: 2800,
      },
    ],
  },

  // 1 Day Ago (Yesterday)
  {
    id: 'sale-1004',
    receipt_no: 998,
    ts: new Date(Date.now() - 1 * 86400000 - 5 * 3600000).toISOString(),
    subtotal: 1200,
    total: 1200,
    payment_method: 'Cash',
    cash_received: 1500,
    change: 300,
    status: 'completed',
    items: [
      {
        id: 'item-1004-1',
        sale_id: 'sale-1004',
        product_id: 'prod-br-01',
        name: 'Tusker Lager 500ml Can',
        category: 'Beer',
        price: 250,
        qty: 4,
        line_total: 1000,
      },
      {
        id: 'item-1004-2',
        sale_id: 'sale-1004',
        product_id: 'prod-mx-01',
        name: 'Krest Bitter Lemon 500ml',
        category: 'Mixers & Soft Drinks',
        price: 100,
        qty: 2,
        line_total: 200,
      },
    ],
  },
  {
    id: 'sale-1005',
    receipt_no: 999,
    ts: new Date(Date.now() - 1 * 86400000 - 2 * 3600000).toISOString(),
    subtotal: 2200,
    total: 2200,
    payment_method: 'M-Pesa',
    reference: 'QHL89201ZZ',
    status: 'completed',
    items: [
      {
        id: 'item-1005-1',
        sale_id: 'sale-1005',
        product_id: 'prod-sp-08',
        name: 'Johnnie Walker Red Label 750ml',
        category: 'Spirits',
        price: 2200,
        qty: 1,
        line_total: 2200,
      },
    ],
  },
  {
    id: 'sale-1006',
    receipt_no: 1000,
    ts: new Date(Date.now() - 1 * 86400000 - 1 * 3600000).toISOString(),
    subtotal: 1710,
    total: 1710,
    payment_method: 'M-Pesa',
    reference: 'QJZ77166XX',
    status: 'completed',
    items: [
      {
        id: 'item-1006-1',
        sale_id: 'sale-1006',
        product_id: 'prod-wn-01',
        name: 'Four Cousins Sweet Red 750ml',
        category: 'Wine',
        price: 1150,
        qty: 1,
        line_total: 1150,
      },
      {
        id: 'item-1006-2',
        sale_id: 'sale-1006',
        product_id: 'prod-cd-01',
        name: 'Savanna Dry Cider 330ml',
        category: 'Cider/RTD',
        price: 280,
        qty: 2,
        line_total: 560,
      },
    ],
  },

  // 2 Days Ago
  {
    id: 'sale-1007',
    receipt_no: 995,
    ts: new Date(Date.now() - 2 * 86400000 - 4 * 3600000).toISOString(),
    subtotal: 1690,
    total: 1690,
    payment_method: 'Cash',
    cash_received: 2000,
    change: 310,
    status: 'completed',
    items: [
      {
        id: 'item-1007-1',
        sale_id: 'sale-1007',
        product_id: 'prod-sp-01',
        name: 'Gilbeys Special Dry Gin 750ml',
        category: 'Spirits',
        price: 1450,
        qty: 1,
        line_total: 1450,
      },
      {
        id: 'item-1007-2',
        sale_id: 'sale-1007',
        product_id: 'prod-mx-02',
        name: 'Schweppes Tonic Water 500ml',
        category: 'Mixers & Soft Drinks',
        price: 120,
        qty: 2,
        line_total: 240,
      },
    ],
  },
  {
    id: 'sale-1008',
    receipt_no: 996,
    ts: new Date(Date.now() - 2 * 86400000 - 2 * 3600000).toISOString(),
    subtotal: 5900,
    total: 5900,
    payment_method: 'M-Pesa',
    reference: 'QGB11823AA',
    status: 'completed',
    items: [
      {
        id: 'item-1008-1',
        sale_id: 'sale-1008',
        product_id: 'prod-sp-10',
        name: 'Hennessy VS Cognac 750ml',
        category: 'Spirits',
        price: 5900,
        qty: 1,
        line_total: 5900,
      },
    ],
  },
  {
    id: 'sale-1009',
    receipt_no: 997,
    ts: new Date(Date.now() - 2 * 86400000 - 1 * 3600000).toISOString(),
    subtotal: 1560,
    total: 1560,
    payment_method: 'Cash',
    cash_received: 2000,
    change: 440,
    status: 'completed',
    items: [
      {
        id: 'item-1009-1',
        sale_id: 'sale-1009',
        product_id: 'prod-br-03',
        name: 'White Cap Lager 500ml Can',
        category: 'Beer',
        price: 260,
        qty: 6,
        line_total: 1560,
      },
    ],
  },

  // 3 Days Ago
  {
    id: 'sale-1010',
    receipt_no: 992,
    ts: new Date(Date.now() - 3 * 86400000 - 6 * 3600000).toISOString(),
    subtotal: 3300,
    total: 3300,
    payment_method: 'M-Pesa',
    reference: 'QEY90182VV',
    status: 'completed',
    items: [
      {
        id: 'item-1010-1',
        sale_id: 'sale-1010',
        product_id: 'prod-sp-05',
        name: 'Jameson Irish Whiskey 750ml',
        category: 'Spirits',
        price: 2800,
        qty: 1,
        line_total: 2800,
      },
      {
        id: 'item-1010-2',
        sale_id: 'sale-1010',
        product_id: 'prod-mx-04',
        name: 'Red Bull Energy Drink 250ml',
        category: 'Mixers & Soft Drinks',
        price: 250,
        qty: 2,
        line_total: 500,
      },
    ],
  },
  {
    id: 'sale-1011',
    receipt_no: 993,
    ts: new Date(Date.now() - 3 * 86400000 - 3 * 3600000).toISOString(),
    subtotal: 2400,
    total: 2400,
    payment_method: 'M-Pesa',
    reference: 'QDD66129MM',
    status: 'completed',
    items: [
      {
        id: 'item-1011-1',
        sale_id: 'sale-1011',
        product_id: 'prod-wn-03',
        name: 'Robertson Winery Natural Sweet Red 750ml',
        category: 'Wine',
        price: 1200,
        qty: 2,
        line_total: 2400,
      },
    ],
  },
  {
    id: 'sale-1012',
    receipt_no: 994,
    ts: new Date(Date.now() - 3 * 86400000 - 1 * 3600000).toISOString(),
    subtotal: 1300,
    total: 1300,
    payment_method: 'Cash',
    cash_received: 1500,
    change: 200,
    status: 'completed',
    items: [
      {
        id: 'item-1012-1',
        sale_id: 'sale-1012',
        product_id: 'prod-br-02',
        name: 'Tusker Malt 330ml Can',
        category: 'Beer',
        price: 260,
        qty: 5,
        line_total: 1300,
      },
    ],
  },

  // 4 Days Ago
  {
    id: 'sale-1013',
    receipt_no: 989,
    ts: new Date(Date.now() - 4 * 86400000 - 5 * 3600000).toISOString(),
    subtotal: 1620,
    total: 1620,
    payment_method: 'Cash',
    cash_received: 2000,
    change: 380,
    status: 'completed',
    items: [
      {
        id: 'item-1013-1',
        sale_id: 'sale-1013',
        product_id: 'prod-sp-09',
        name: 'Captain Morgan Gold Rum 750ml',
        category: 'Spirits',
        price: 1350,
        qty: 1,
        line_total: 1350,
      },
      {
        id: 'item-1013-2',
        sale_id: 'sale-1013',
        product_id: 'prod-mx-03',
        name: 'Coca Cola 500ml',
        category: 'Mixers & Soft Drinks',
        price: 90,
        qty: 3,
        line_total: 270,
      },
    ],
  },
  {
    id: 'sale-1014',
    receipt_no: 990,
    ts: new Date(Date.now() - 4 * 86400000 - 2 * 3600000).toISOString(),
    subtotal: 3800,
    total: 3800,
    payment_method: 'M-Pesa',
    reference: 'QCB88211KK',
    status: 'completed',
    items: [
      {
        id: 'item-1014-1',
        sale_id: 'sale-1014',
        product_id: 'prod-sp-07',
        name: 'Johnnie Walker Black Label 750ml',
        category: 'Spirits',
        price: 3800,
        qty: 1,
        line_total: 3800,
      },
    ],
  },
  {
    id: 'sale-1015',
    receipt_no: 991,
    ts: new Date(Date.now() - 4 * 86400000 - 1 * 3600000).toISOString(),
    subtotal: 1120,
    total: 1120,
    payment_method: 'Cash',
    cash_received: 1200,
    change: 80,
    status: 'completed',
    items: [
      {
        id: 'item-1015-1',
        sale_id: 'sale-1015',
        product_id: 'prod-br-04',
        name: 'Guinness Foreign Extra 500ml Can',
        category: 'Beer',
        price: 280,
        qty: 4,
        line_total: 1120,
      },
    ],
  },

  // 5 Days Ago
  {
    id: 'sale-1016',
    receipt_no: 987,
    ts: new Date(Date.now() - 5 * 86400000 - 4 * 3600000).toISOString(),
    subtotal: 2100,
    total: 2100,
    payment_method: 'M-Pesa',
    reference: 'QBA33299LL',
    status: 'completed',
    items: [
      {
        id: 'item-1016-1',
        sale_id: 'sale-1016',
        product_id: 'prod-wn-05',
        name: 'Casillero del Diablo Cabernet 750ml',
        category: 'Wine',
        price: 2100,
        qty: 1,
        line_total: 2100,
      },
    ],
  },
  {
    id: 'sale-1017',
    receipt_no: 988,
    ts: new Date(Date.now() - 5 * 86400000 - 1 * 3600000).toISOString(),
    subtotal: 1400,
    total: 1400,
    payment_method: 'Cash',
    cash_received: 1500,
    change: 100,
    status: 'completed',
    items: [
      {
        id: 'item-1017-1',
        sale_id: 'sale-1017',
        product_id: 'prod-sp-12',
        name: 'Smirnoff Vodka Red 750ml',
        category: 'Spirits',
        price: 1400,
        qty: 1,
        line_total: 1400,
      },
    ],
  },
];

export function initStorage(): void {
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(INITIAL_ADJUSTMENTS));
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        ...DEFAULT_SETTINGS,
        next_receipt_no: 1004,
      }));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'v2');
    } else if (initialized !== 'v2') {
      // Auto-migrate to populate multi-day weekly sales for the chart
      const existingSalesStr = localStorage.getItem(STORAGE_KEYS.SALES);
      const existingSales = existingSalesStr ? JSON.parse(existingSalesStr) : [];
      if (existingSales.length <= 3) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'v2');
    }
  } catch (err) {
    console.error('Failed to initialize storage:', err);
  }
}

export function getProducts(): Product[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (err) {
    console.error('Failed to save products:', err);
  }
}

export function getStockAdjustments(): StockAdjustment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function recordStockAdjustment(adj: Omit<StockAdjustment, 'id' | 'created_at'>): StockAdjustment {
  const adjustments = getStockAdjustments();
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === adj.product_id);

  if (productIndex === -1) {
    throw new Error('Product not found for adjustment');
  }

  // Update product stock on hand
  const currentQty = products[productIndex].qty;
  const newQty = Math.max(0, currentQty + adj.delta); // prevent negative stock
  products[productIndex] = {
    ...products[productIndex],
    qty: newQty,
    updated_at: new Date().toISOString(),
  };

  const newAdjustment: StockAdjustment = {
    ...adj,
    id: `adj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    created_at: new Date().toISOString(),
  };

  adjustments.unshift(newAdjustment);
  saveProducts(products);
  localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
  return newAdjustment;
}

export function getSales(): Sale[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSettings(): Settings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export interface CompleteSalePayload {
  items: {
    product: Product;
    qty: number;
  }[];
  payment_method: 'Cash' | 'M-Pesa';
  reference?: string;
  cash_received?: number;
  change?: number;
}

export function completeSale(payload: CompleteSalePayload): Sale {
  const products = getProducts();
  const settings = getSettings();
  const sales = getSales();

  // Validate stock availability
  for (const item of payload.items) {
    const currentProd = products.find(p => p.id === item.product.id);
    if (!currentProd) {
      throw new Error(`Product ${item.product.name} not found`);
    }
    if (currentProd.qty < item.qty) {
      throw new Error(`Insufficient stock for ${currentProd.name}. Available: ${currentProd.qty}`);
    }
  }

  const receiptNo = settings.next_receipt_no || 1001;
  const saleId = `sale-${receiptNo}-${Date.now()}`;
  let subtotal = 0;

  const saleItems = payload.items.map((cartItem, idx) => {
    const lineTotal = cartItem.product.price * cartItem.qty;
    subtotal += lineTotal;

    // Decrement stock in catalog
    const prodIdx = products.findIndex(p => p.id === cartItem.product.id);
    if (prodIdx !== -1) {
      products[prodIdx].qty -= cartItem.qty;
      products[prodIdx].updated_at = new Date().toISOString();
    }

    return {
      id: `item-${receiptNo}-${idx + 1}`,
      sale_id: saleId,
      product_id: cartItem.product.id,
      name: cartItem.product.name,
      category: cartItem.product.category,
      price: cartItem.product.price, // snapshot
      qty: cartItem.qty,
      line_total: lineTotal,
    };
  });

  const newSale: Sale = {
    id: saleId,
    receipt_no: receiptNo,
    ts: new Date().toISOString(),
    subtotal,
    total: subtotal,
    payment_method: payload.payment_method,
    reference: payload.reference,
    cash_received: payload.cash_received,
    change: payload.change,
    status: 'completed',
    items: saleItems,
  };

  // Persist updated stock
  saveProducts(products);

  // Update sales log (newest first)
  sales.unshift(newSale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

  // Increment sequential receipt number
  settings.next_receipt_no = receiptNo + 1;
  saveSettings(settings);

  return newSale;
}

export function voidSale(saleId: string, reason: string): Sale {
  const sales = getSales();
  const products = getProducts();
  const settings = getSettings();

  const originalSaleIdx = sales.findIndex(s => s.id === saleId);
  if (originalSaleIdx === -1) {
    throw new Error('Sale not found');
  }

  const originalSale = sales[originalSaleIdx];
  if (originalSale.status === 'voided') {
    throw new Error('This sale has already been voided');
  }

  const voidTimestamp = new Date().toISOString();

  // 1. Restock items back into inventory
  for (const item of originalSale.items) {
    const pIdx = products.findIndex(p => p.id === item.product_id);
    if (pIdx !== -1) {
      products[pIdx].qty += item.qty;
      products[pIdx].updated_at = voidTimestamp;
    }
  }
  saveProducts(products);

  // 2. Mark original sale as voided (preserving its original record and receipt number)
  sales[originalSaleIdx] = {
    ...originalSale,
    status: 'voided',
    void_reason: reason,
    voided_at: voidTimestamp,
  };

  // 3. Create a linked reversing entry with its own unique sequential receipt number
  const reversalReceiptNo = settings.next_receipt_no;
  const reversalSaleId = `reversal-${reversalReceiptNo}-${Date.now()}`;

  const reversingEntry: Sale = {
    id: reversalSaleId,
    receipt_no: reversalReceiptNo,
    ts: voidTimestamp,
    subtotal: -originalSale.subtotal,
    total: -originalSale.total,
    payment_method: originalSale.payment_method,
    reference: originalSale.reference ? `REV-${originalSale.reference}` : undefined,
    cash_received: originalSale.cash_received ? -originalSale.cash_received : undefined,
    change: originalSale.change,
    status: 'voided',
    voided_sale_id: originalSale.id,
    void_reason: reason,
    voided_at: voidTimestamp,
    items: originalSale.items.map(item => ({
      ...item,
      id: `rev-${item.id}`,
      sale_id: reversalSaleId,
      qty: -item.qty,
      line_total: -item.line_total,
    })),
  };

  // Add reversal entry to sales log
  sales.unshift(reversingEntry);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

  // Increment sequential receipt number
  settings.next_receipt_no = reversalReceiptNo + 1;
  saveSettings(settings);

  return sales[originalSaleIdx + 1]; // Return the updated original sale
}

// Backup & Restore
export interface DatabaseExport {
  app: string;
  version: string;
  exported_at: string;
  products: Product[];
  sales: Sale[];
  adjustments: StockAdjustment[];
  settings: Settings;
}

export function exportDatabaseBackup(): void {
  const data: DatabaseExport = {
    app: 'Cellar POS',
    version: '1.0',
    exported_at: new Date().toISOString(),
    products: getProducts(),
    sales: getSales(),
    adjustments: getStockAdjustments(),
    settings: getSettings(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `cellar-pos-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importDatabaseBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.products || !Array.isArray(parsed.products)) {
      return { success: false, message: 'Invalid backup file: missing products table.' };
    }
    if (!parsed.sales || !Array.isArray(parsed.sales)) {
      return { success: false, message: 'Invalid backup file: missing sales table.' };
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed.products));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(parsed.sales));
    localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(parsed.adjustments || []));
    if (parsed.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
    }
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    return {
      success: true,
      message: `Restored ${parsed.products.length} products and ${parsed.sales.length} sales records successfully.`,
    };
  } catch (err) {
    return { success: false, message: `Failed to restore backup: ${(err as Error).message}` };
  }
}

export function resetToSampleData(): void {
  localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(INITIAL_ADJUSTMENTS));
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
    ...DEFAULT_SETTINGS,
    next_receipt_no: 1004,
  }));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}
