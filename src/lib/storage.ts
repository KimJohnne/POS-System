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

// All business records live in one snapshot. A single localStorage write is atomic
// at the key level; this prevents partially written sales, stock and receipts.
// It does NOT provide cross-device synchronization or multi-tab locking.
const SNAPSHOT_KEY = 'cellar_pos_snapshot_v3';
interface Snapshot {
  version: 3;
  products: Product[];
  adjustments: StockAdjustment[];
  sales: Sale[];
  settings: Settings;
}
function parseStored<T>(key: string): T | undefined {
  const value = localStorage.getItem(key);
  return value === null ? undefined : JSON.parse(value) as T;
}
function nextReceiptNumber(sales: Sale[], candidate = 1001): number {
  return Math.max(candidate, 1001, ...sales.map(s => Number.isSafeInteger(s.receipt_no) ? s.receipt_no + 1 : 1001));
}
function readSnapshot(): Snapshot {
  const snapshot = parseStored<Snapshot>(SNAPSHOT_KEY);
  if (snapshot) {
    if (snapshot.version !== 3 || !Array.isArray(snapshot.products) ||
        !Array.isArray(snapshot.sales) || !Array.isArray(snapshot.adjustments) ||
        !snapshot.settings) throw new Error('POS database is invalid. Restore a verified backup.');
    return snapshot;
  }
  // Import all pre-v3 records without overwriting real sales with demo records.
  const products = parseStored<Product[]>(STORAGE_KEYS.PRODUCTS);
  const sales = parseStored<Sale[]>(STORAGE_KEYS.SALES);
  const adjustments = parseStored<StockAdjustment[]>(STORAGE_KEYS.ADJUSTMENTS);
  const settings = parseStored<Settings>(STORAGE_KEYS.SETTINGS);
  const hasLegacy = [products, sales, adjustments, settings].some(x => x !== undefined);
  if ((products && !Array.isArray(products)) || (sales && !Array.isArray(sales)) ||
      (adjustments && !Array.isArray(adjustments))) throw new Error('Legacy POS data is malformed.');
  const chosenSales = sales ?? (hasLegacy ? [] : INITIAL_SALES);
  return {
    version: 3,
    products: products ?? (hasLegacy ? [] : INITIAL_PRODUCTS),
    sales: chosenSales,
    adjustments: adjustments ?? (hasLegacy ? [] : INITIAL_ADJUSTMENTS),
    settings: { ...DEFAULT_SETTINGS, ...(settings ?? {}), next_receipt_no: nextReceiptNumber(chosenSales, settings?.next_receipt_no) },
  };
}
function commit(snapshot: Snapshot): void {
  // Throws on quota, permissions, or serialization failure; caller must not report success.
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}
function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(label + ' must be a positive integer.');
}
function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(label + ' must be a non-negative integer.');
}
function assertValidProduct(p: Product): void {
  if (!p || typeof p.id !== 'string' || !p.id || typeof p.name !== 'string' || !p.name.trim() ||
      typeof p.category !== 'string' || !p.category.trim()) throw new Error('Invalid product identity.');
  assertPositiveInteger(p.price, 'Price');
  assertNonNegativeInteger(p.qty, 'Stock');
  if (p.low_stock_threshold != null) assertNonNegativeInteger(p.low_stock_threshold, 'Low-stock threshold');
}
export function initStorage(): void {
  const snapshot = readSnapshot();
  // Validate before writing the upgraded snapshot. Never silently reset corrupted data.
  snapshot.products.forEach(assertValidProduct);
  commit(snapshot);
}
export function getProducts(): Product[] { return readSnapshot().products; }
export function saveProducts(products: Product[]): void {
  products.forEach(assertValidProduct);
  const state = readSnapshot();
  commit({ ...state, products });
}
export function getStockAdjustments(): StockAdjustment[] { return readSnapshot().adjustments; }
export function recordStockAdjustment(adj: Omit<StockAdjustment, 'id' | 'created_at'>): StockAdjustment {
  const state = readSnapshot();
  if (!Number.isSafeInteger(adj.delta) || adj.delta === 0) throw new Error('Stock adjustment must be a non-zero integer.');
  const index = state.products.findIndex(p => p.id === adj.product_id);
  if (index < 0) throw new Error('Product not found for adjustment.');
  const product = state.products[index];
  const newQty = product.qty + adj.delta;
  if (!Number.isSafeInteger(newQty) || newQty < 0) throw new Error('Insufficient stock for adjustment.');
  const created_at = new Date().toISOString();
  const event: StockAdjustment = { ...adj, product_name: product.name, id: crypto.randomUUID(), created_at };
  const products = state.products.map((p, i) => i === index ? { ...p, qty: newQty, updated_at: created_at } : p);
  commit({ ...state, products, adjustments: [event, ...state.adjustments] });
  return event;
}
// Product edits and stock corrections are committed together, so quantity cannot
// change without an audit event.
export function saveCatalogProduct(product: Product): void {
  assertValidProduct(product);
  const state = readSnapshot();
  const previous = state.products.find(p => p.id === product.id);
  if (!previous) {
    if (state.products.some(p => p.id === product.id)) throw new Error('Duplicate product ID.');
    const created_at = new Date().toISOString();
    const event: StockAdjustment = {
      id: crypto.randomUUID(), product_id: product.id, product_name: product.name,
      delta: product.qty, reason: 'Restock', notes: 'Opening quantity on product creation', created_at,
    };
    commit({ ...state, products: [product, ...state.products], adjustments: product.qty ? [event, ...state.adjustments] : state.adjustments });
    return;
  }
  const difference = product.qty - previous.qty;
  const adjustments = difference ? [{
    id: crypto.randomUUID(), product_id: product.id, product_name: product.name,
    delta: difference, reason: 'Correction' as const, notes: 'Product quantity edited in catalogue',
    created_at: new Date().toISOString(),
  }, ...state.adjustments] : state.adjustments;
  commit({ ...state, products: state.products.map(p => p.id === product.id ? product : p), adjustments });
}
export function getSales(): Sale[] { return readSnapshot().sales; }
export function getSettings(): Settings { return readSnapshot().settings; }
export function saveSettings(settings: Settings): void {
  const state = readSnapshot();
  // Don't allow UI edits to move receipt counter behind existing receipts.
  commit({ ...state, settings: { ...settings, next_receipt_no: nextReceiptNumber(state.sales, settings.next_receipt_no) } });
}
export interface CompleteSalePayload {
  items: { product: Product; qty: number }[];
  payment_method: 'Cash' | 'M-Pesa';
  reference?: string;
  cash_received?: number;
  change?: number;
}
export function completeSale(payload: CompleteSalePayload): Sale {
  const state = readSnapshot();
  if (!Array.isArray(payload.items) || payload.items.length === 0) throw new Error('Cart must not be empty.');
  if (payload.payment_method !== 'Cash' && payload.payment_method !== 'M-Pesa') throw new Error('Unknown payment method.');
  const seen = new Set<string>();
  let subtotal = 0;
  const saleId = crypto.randomUUID();
  const receiptNo = nextReceiptNumber(state.sales, state.settings.next_receipt_no);
  const updatedProducts = state.products.map(p => ({ ...p }));
  const now = new Date().toISOString();
  const items = payload.items.map((item, index) => {
    const id = item?.product?.id;
    if (!id || seen.has(id)) throw new Error('Invalid or duplicate cart product.');
    seen.add(id);
    assertPositiveInteger(item.qty, 'Sale quantity');
    const product = updatedProducts.find(p => p.id === id);
    if (!product) throw new Error('Product no longer exists.');
    if (product.qty < item.qty) throw new Error('Insufficient stock for ' + product.name);
    const line_total = product.price * item.qty;
    if (!Number.isSafeInteger(line_total)) throw new Error('Sale amount exceeds supported range.');
    subtotal += line_total;
    product.qty -= item.qty;
    product.updated_at = now;
    return { id: crypto.randomUUID(), sale_id: saleId, product_id: id, name: product.name, category: product.category, price: product.price, qty: item.qty, line_total };
  });
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) throw new Error('Invalid sale total.');
  let cash_received: number | undefined;
  let change: number | undefined;
  let reference: string | undefined;
  if (payload.payment_method === 'Cash') {
    cash_received = payload.cash_received;
    if (cash_received === undefined || !Number.isSafeInteger(cash_received) || cash_received < subtotal) throw new Error('Insufficient cash received.');
    change = cash_received - subtotal;
  } else {
    reference = payload.reference?.trim().toUpperCase();
    if (!reference || !/^[A-Z0-9-]{6,32}$/.test(reference)) throw new Error('Enter a valid M-Pesa transaction reference.');
    if (state.sales.some(s => s.payment_method === 'M-Pesa' && s.reference === reference && s.status === 'completed')) throw new Error('M-Pesa reference already recorded.');
  }
  const sale: Sale = { id: saleId, receipt_no: receiptNo, ts: now, subtotal, total: subtotal,
    payment_method: payload.payment_method, reference, cash_received, change, status: 'completed', items };
  commit({ ...state, products: updatedProducts, sales: [sale, ...state.sales],
    settings: { ...state.settings, next_receipt_no: receiptNo + 1 } });
  return sale;
}
export function voidSale(saleId: string, reason: string): Sale {
  if (!reason?.trim()) throw new Error('Void reason is required.');
  const state = readSnapshot();
  const original = state.sales.find(s => s.id === saleId);
  if (!original || original.status !== 'completed' || original.voided_sale_id) throw new Error('Sale cannot be voided.');
  const now = new Date().toISOString();
  const receiptNo = nextReceiptNumber(state.sales, state.settings.next_receipt_no);
  const products = state.products.map(p => {
    const delta = original.items.filter(i => i.product_id === p.id).reduce((n, i) => n + i.qty, 0);
    return delta ? { ...p, qty: p.qty + delta, updated_at: now } : p;
  });
  const updatedOriginal: Sale = { ...original, status: 'voided', void_reason: reason.trim(), voided_at: now };
  const reversalId = crypto.randomUUID();
  const reversingEntry: Sale = {
    id: reversalId, receipt_no: receiptNo, ts: now, subtotal: -original.subtotal, total: -original.total,
    payment_method: original.payment_method, reference: original.reference ? 'REV-' + original.reference : undefined,
    status: 'voided', voided_sale_id: original.id, void_reason: reason.trim(), voided_at: now,
    items: original.items.map(i => ({ ...i, id: crypto.randomUUID(), sale_id: reversalId, qty: -i.qty, line_total: -i.line_total })),
  };
  commit({ ...state, products, sales: [reversingEntry, ...state.sales.map(s => s.id === saleId ? updatedOriginal : s)],
    settings: { ...state.settings, next_receipt_no: receiptNo + 1 } });
  return updatedOriginal;
}
export interface DatabaseExport {
  app: string; version: string; exported_at: string;
  products: Product[]; sales: Sale[]; adjustments: StockAdjustment[]; settings: Settings;
}
export function exportDatabaseBackup(): void {
  const state = readSnapshot();
  const data: DatabaseExport = { app: 'Cellar POS', version: '3.0', exported_at: new Date().toISOString(), ...state };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'cellar-pos-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function importDatabaseBackup(input: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(input);
    if (!data || data.app !== 'Cellar POS' || !Array.isArray(data.products) ||
        !Array.isArray(data.sales) || !Array.isArray(data.adjustments) || !data.settings)
      throw new Error('Invalid backup format.');
    data.products.forEach(assertValidProduct);
    const productIds = new Set(data.products.map((p: Product) => p.id));
    if (productIds.size !== data.products.length) throw new Error('Duplicate product IDs.');
    const receipts = new Set<number>();
    for (const sale of data.sales as Sale[]) {
      if (!sale || !Number.isSafeInteger(sale.receipt_no) || receipts.has(sale.receipt_no) ||
          !Array.isArray(sale.items) || !Number.isSafeInteger(sale.total) || !sale.id ||
          !['completed', 'voided'].includes(sale.status) ||
          !['Cash', 'M-Pesa'].includes(sale.payment_method))
        throw new Error('Invalid or duplicate sales records.');
      receipts.add(sale.receipt_no);
    }
    if (!Array.isArray(data.settings.categories) || typeof data.settings.shop_name !== 'string')
      throw new Error('Invalid settings.');
    for (const adjustment of data.adjustments as StockAdjustment[]) {
      if (!adjustment || !Number.isSafeInteger(adjustment.delta) || !adjustment.product_id ||
          !adjustment.id || typeof adjustment.reason !== 'string' ||
          typeof adjustment.created_at !== 'string') throw new Error('Invalid stock adjustment record.');
    }
    for (const sale of data.sales as Sale[]) {
      if (!Number.isSafeInteger(sale.subtotal) || !Number.isFinite(Date.parse(sale.ts)) ||
          sale.items.some(i => !i || !i.id || !i.product_id || !Number.isSafeInteger(i.qty) ||
            !Number.isSafeInteger(i.price) || !Number.isSafeInteger(i.line_total) ||
            i.sale_id !== sale.id || i.line_total !== i.price * i.qty) ||
          sale.items.reduce((sum, i) => sum + i.line_total, 0) !== sale.total)
        throw new Error('Invalid sale amounts or line items.');
    }
    const snapshot: Snapshot = { version: 3, products: data.products, sales: data.sales,
      adjustments: data.adjustments,
      settings: { ...DEFAULT_SETTINGS, ...data.settings,
        next_receipt_no: nextReceiptNumber(data.sales, data.settings.next_receipt_no) } };
    commit(snapshot);
    return { success: true, message: 'Restored ' + snapshot.products.length + ' products and ' + snapshot.sales.length + ' sales.' };
  } catch (err) {
    return { success: false, message: 'Restore rejected; existing records unchanged. ' + (err as Error).message };
  }
}
export function resetToSampleData(): void {
  commit({ version: 3, products: INITIAL_PRODUCTS, adjustments: INITIAL_ADJUSTMENTS,
    sales: INITIAL_SALES, settings: { ...DEFAULT_SETTINGS, next_receipt_no: nextReceiptNumber(INITIAL_SALES) } });
}
