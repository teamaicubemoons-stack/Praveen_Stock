import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── MOCK / SEED DATA ────────────────────────────────────────────────────────

const SEED_SUPPLIERS = [
  { id: 's1', name: 'Ravi Textiles, Surat',     contact: '+91 98765 43210', city: 'Surat'   },
  { id: 's2', name: 'Meena Fabrics, Jaipur',    contact: '+91 91234 56789', city: 'Jaipur'  },
  { id: 's3', name: 'Bajaj Wholesale, Mumbai',  contact: '+91 99887 66554', city: 'Mumbai'  },
  { id: 's4', name: 'Sharma Cotton, Delhi',     contact: '+91 98112 33445', city: 'Delhi'   },
];

const SEED_INWARD = [
  {
    id: 'IN-001', supplierId: 's1', supplierName: 'Ravi Textiles, Surat',
    date: '2026-04-20', status: 'verified',
    items: [
      { name: 'Cotton Shirt', qty: 120 },
      { name: 'Denim Jeans',  qty: 80  },
    ],
  },
  {
    id: 'IN-002', supplierId: 's2', supplierName: 'Meena Fabrics, Jaipur',
    date: '2026-04-22', status: 'pending',
    items: [
      { name: 'Rayon Kurti',  qty: 200 },
      { name: 'Salwar Suit',  qty: 60  },
    ],
  },
  {
    id: 'IN-003', supplierId: 's3', supplierName: 'Bajaj Wholesale, Mumbai',
    date: '2026-04-25', status: 'verified',
    items: [
      { name: 'Polo T-Shirt', qty: 150 },
    ],
  },
];

const SEED_PRODUCTS = [
  {
    id: 'P001', name: 'Cotton Shirt', category: 'Shirts', inwardId: 'IN-001',
    sku: 'PTC-SHIRT-M-WHT-001',
    variants: [
      { id: 'V001', size: 'S', color: 'White', qty: 30, warehouseLocation: 'A-R1-S2' },
      { id: 'V002', size: 'M', color: 'White', qty: 40, warehouseLocation: 'A-R1-S2' },
      { id: 'V003', size: 'L', color: 'Blue',  qty: 50, warehouseLocation: 'A-R1-S3' },
    ],
    totalStock: 120,
    mrp: 499,
    costPrice: 280,
    status: 'active',
  },
  {
    id: 'P002', name: 'Denim Jeans', category: 'Bottoms', inwardId: 'IN-001',
    sku: 'PTC-JEANS-32-BLU-002',
    variants: [
      { id: 'V004', size: '30', color: 'Blue',  qty: 25, warehouseLocation: 'B-R2-S1' },
      { id: 'V005', size: '32', color: 'Blue',  qty: 30, warehouseLocation: 'B-R2-S1' },
      { id: 'V006', size: '34', color: 'Black', qty: 25, warehouseLocation: 'B-R2-S2' },
    ],
    totalStock: 80,
    mrp: 1199,
    costPrice: 650,
    status: 'active',
  },
  {
    id: 'P003', name: 'Rayon Kurti', category: 'Ethnic', inwardId: 'IN-002',
    sku: 'PTC-KURTI-M-RED-003',
    variants: [
      { id: 'V007', size: 'S',  color: 'Red',   qty: 70, warehouseLocation: 'C-R1-S1' },
      { id: 'V008', size: 'M',  color: 'Red',   qty: 80, warehouseLocation: 'C-R1-S1' },
      { id: 'V009', size: 'L',  color: 'Green', qty: 50, warehouseLocation: 'C-R1-S2' },
    ],
    totalStock: 200,
    mrp: 699,
    costPrice: 350,
    status: 'active',
  },
  {
    id: 'P004', name: 'Polo T-Shirt', category: 'T-Shirts', inwardId: 'IN-003',
    sku: 'PTC-POLO-L-NAV-004',
    variants: [
      { id: 'V010', size: 'M',  color: 'Navy',  qty: 50, warehouseLocation: 'A-R2-S1' },
      { id: 'V011', size: 'L',  color: 'Navy',  qty: 60, warehouseLocation: 'A-R2-S1' },
      { id: 'V012', size: 'XL', color: 'Black', qty: 40, warehouseLocation: 'A-R2-S2' },
    ],
    totalStock: 150,
    mrp: 599,
    costPrice: 310,
    status: 'active',
  },
  {
    id: 'P005', name: 'Salwar Suit', category: 'Ethnic', inwardId: 'IN-002',
    sku: 'PTC-SUIT-M-PIN-005',
    variants: [
      { id: 'V013', size: 'S', color: 'Pink',   qty: 20, warehouseLocation: 'C-R2-S1' },
      { id: 'V014', size: 'M', color: 'Yellow', qty: 25, warehouseLocation: 'C-R2-S1' },
      { id: 'V015', size: 'L', color: 'Pink',   qty: 15, warehouseLocation: 'C-R2-S2' },
    ],
    totalStock: 60,
    mrp: 1499,
    costPrice: 800,
    status: 'active',
  },
];

const SEED_WAREHOUSE_LOCATIONS = [
  { id: 'WH1', zone: 'A', rack: 'R1', shelf: 'S1', box: 'B1', capacity: 100, used: 70, label: 'A-R1-S1' },
  { id: 'WH2', zone: 'A', rack: 'R1', shelf: 'S2', box: 'B2', capacity: 100, used: 70, label: 'A-R1-S2' },
  { id: 'WH3', zone: 'A', rack: 'R1', shelf: 'S3', box: 'B3', capacity: 100, used: 50, label: 'A-R1-S3' },
  { id: 'WH4', zone: 'A', rack: 'R2', shelf: 'S1', box: 'B1', capacity: 120, used: 110, label: 'A-R2-S1' },
  { id: 'WH5', zone: 'A', rack: 'R2', shelf: 'S2', box: 'B2', capacity: 120, used: 40,  label: 'A-R2-S2' },
  { id: 'WH6', zone: 'B', rack: 'R2', shelf: 'S1', box: 'B1', capacity: 80,  used: 55,  label: 'B-R2-S1' },
  { id: 'WH7', zone: 'B', rack: 'R2', shelf: 'S2', box: 'B2', capacity: 80,  used: 25,  label: 'B-R2-S2' },
  { id: 'WH8', zone: 'C', rack: 'R1', shelf: 'S1', box: 'B1', capacity: 150, used: 150, label: 'C-R1-S1' },
  { id: 'WH9', zone: 'C', rack: 'R1', shelf: 'S2', box: 'B2', capacity: 150, used: 50,  label: 'C-R1-S2' },
  { id: 'WH10',zone: 'C', rack: 'R2', shelf: 'S1', box: 'B1', capacity: 60,  used: 45,  label: 'C-R2-S1' },
  { id: 'WH11',zone: 'C', rack: 'R2', shelf: 'S2', box: 'B2', capacity: 60,  used: 15,  label: 'C-R2-S2' },
];

const SEED_ORDERS = [
  {
    id: 'ORD-001', customerName: 'Sharma Garments', customerPhone: '+91 98001 23456',
    date: '2026-04-28', status: 'dispatched',
    items: [
      { productId: 'P001', productName: 'Cotton Shirt', sku: 'PTC-SHIRT-M-WHT-001', size: 'M', color: 'White', qty: 20, mrp: 499, total: 9980 },
      { productId: 'P002', productName: 'Denim Jeans',  sku: 'PTC-JEANS-32-BLU-002', size: '32', color: 'Blue', qty: 10, mrp: 1199, total: 11990 },
    ],
    subtotal: 21970, discount: 1000, total: 20970,
    paymentStatus: 'paid', shippingAddress: 'Shop 12, Khari Baoli, Delhi',
    pickingStatus: 'done', packingStatus: 'done',
    trackingId: 'DTDC-9988776655',
  },
  {
    id: 'ORD-002', customerName: 'Patel Fashion House', customerPhone: '+91 99554 66778',
    date: '2026-04-30', status: 'packed',
    items: [
      { productId: 'P003', productName: 'Rayon Kurti', sku: 'PTC-KURTI-M-RED-003', size: 'M', color: 'Red', qty: 30, mrp: 699, total: 20970 },
    ],
    subtotal: 20970, discount: 500, total: 20470,
    paymentStatus: 'pending', shippingAddress: 'Plot 5, GIDC, Ahmedabad',
    pickingStatus: 'done', packingStatus: 'done',
    trackingId: '',
  },
  {
    id: 'ORD-003', customerName: 'Jain Brothers', customerPhone: '+91 94001 88990',
    date: '2026-05-01', status: 'confirmed',
    items: [
      { productId: 'P004', productName: 'Polo T-Shirt', sku: 'PTC-POLO-L-NAV-004', size: 'L', color: 'Navy', qty: 25, mrp: 599, total: 14975 },
      { productId: 'P005', productName: 'Salwar Suit',  sku: 'PTC-SUIT-M-PIN-005', size: 'M', color: 'Pink',  qty: 10, mrp: 1499, total: 14990 },
    ],
    subtotal: 29965, discount: 965, total: 29000,
    paymentStatus: 'partial', shippingAddress: 'Gandhi Chowk, Ludhiana, Punjab',
    pickingStatus: 'pending', packingStatus: 'pending',
    trackingId: '',
  },
  {
    id: 'ORD-004', customerName: 'Gupta Ready-Made', customerPhone: '+91 90123 45678',
    date: '2026-05-01', status: 'pending',
    items: [
      { productId: 'P001', productName: 'Cotton Shirt', sku: 'PTC-SHIRT-M-WHT-001', size: 'L', color: 'Blue', qty: 15, mrp: 499, total: 7485 },
    ],
    subtotal: 7485, discount: 0, total: 7485,
    paymentStatus: 'pending', shippingAddress: 'Chandni Chowk, Delhi',
    pickingStatus: 'pending', packingStatus: 'pending',
    trackingId: '',
  },
];

const SEED_RETURNS = [
  {
    id: 'RET-001', orderId: 'ORD-001', customerName: 'Sharma Garments',
    date: '2026-04-30', reason: 'Size mismatch',
    items: [{ productId: 'P001', productName: 'Cotton Shirt', qty: 5, size: 'M', color: 'White' }],
    status: 'processed',
  },
];

// ─── STORE ────────────────────────────────────────────────────────────────────

const useStore = create(
  persist(
    (set, get) => ({
  // Auth
  isAuthenticated: false,
  currentUser: null,
  dismissedNotifications: [], // Tracks IDs of notifications user has seen/dismissed
  login: (email, password) => {
    set({
      isAuthenticated: true,
      currentUser: { id: 'U1', name: 'Praveen Trading Co.garwal', email, role: 'Admin', avatar: 'PA' },
    });
  },
  logout: () => set({ isAuthenticated: false, currentUser: null }),

  // Suppliers
  suppliers: SEED_SUPPLIERS,
  addSupplier: (supplier) => set((state) => ({
    suppliers: [...state.suppliers, { ...supplier, id: `s${Date.now()}` }],
  })),

  // Stock Inward
  inwardStock: SEED_INWARD,
  addInward: (entry) => set((state) => {
    const id = `IN-${String(state.inwardStock.length + 1).padStart(3, '0')}`;
    return { inwardStock: [...state.inwardStock, { ...entry, id, date: new Date().toISOString().split('T')[0], status: 'pending' }] };
  }),
  updateInwardStatus: (id, status) => set((state) => ({
    inwardStock: state.inwardStock.map((i) => i.id === id ? { ...i, status } : i),
  })),
  verifyInwardItem: (id, itemName, verifiedQty) => set((state) => ({
    inwardStock: state.inwardStock.map((entry) => {
      if (entry.id !== id) return entry;
      const newItems = entry.items.map((it) => {
        if (it.name === itemName) {
          const rem = Math.max(0, it.qty - verifiedQty);
          return { ...it, qty: rem };
        }
        return it;
      }).filter(it => it.qty > 0);
      
      return {
        ...entry,
        items: newItems,
        status: newItems.length === 0 ? 'verified' : 'pending'
      };
    })
  })),

  // Products
  products: SEED_PRODUCTS,
  addProduct: (product) => set((state) => {
    const num = state.products.length + 1;
    const id  = `P${String(num).padStart(3, '0')}`;
    return { products: [...state.products, { ...product, id }] };
  }),
  updateProductStock: (productId, variantId, delta) => set((state) => ({
    products: state.products.map((p) => {
      if (p.id !== productId) return p;
      const variants = p.variants.map((v) =>
        v.id === variantId ? { ...v, qty: Math.max(0, v.qty + delta) } : v
      );
      return { ...p, variants, totalStock: variants.reduce((s, v) => s + v.qty, 0) };
    }),
  })),
  assignWarehouseLocation: (productId, variantId, location) => set((state) => ({
    products: state.products.map((p) => {
      if (p.id !== productId) return p;
      return {
        ...p,
        variants: p.variants.map((v) =>
          v.id === variantId ? { ...v, warehouseLocation: location } : v
        ),
      };
    }),
  })),

  // Warehouse
  warehouseLocations: SEED_WAREHOUSE_LOCATIONS,

  // Orders
  orders: SEED_ORDERS,
  addOrder: (order) => set((state) => {
    const id = `ORD-${String(state.orders.length + 1).padStart(3, '0')}`;
    // Validate stock
    let status = 'confirmed';
    for (const item of order.items) {
      const prod = state.products.find((p) => p.id === item.productId);
      const variant = prod?.variants.find((v) => v.size === item.size && v.color === item.color);
      if (!variant || variant.qty < item.qty) { status = 'partial'; break; }
    }
    return {
      orders: [...state.orders, {
        ...order, id,
        date: new Date().toISOString().split('T')[0],
        status,
        pickingStatus: 'pending',
        packingStatus: 'pending',
        trackingId: '',
      }],
    };
  }),
  updateOrderStatus: (id, status) => set((state) => ({
    orders: state.orders.map((o) => o.id === id ? { ...o, status } : o),
  })),
  updatePickingStatus: (id, pickingStatus) => set((state) => ({
    orders: state.orders.map((o) => o.id === id ? { ...o, pickingStatus } : o),
  })),
  updatePackingStatus: (id, packingStatus) => set((state) => ({
    orders: state.orders.map((o) => o.id === id ? { ...o, packingStatus } : o),
  })),
  dispatchOrder: (id, trackingId) => set((state) => {
    // Reduce stock for dispatched order
    const order = state.orders.find((o) => o.id === id);
    let products = [...state.products];
    if (order) {
      order.items.forEach((item) => {
        products = products.map((p) => {
          if (p.id !== item.productId) return p;
          const variants = p.variants.map((v) =>
            v.size === item.size && v.color === item.color
              ? { ...v, qty: Math.max(0, v.qty - item.qty) }
              : v
          );
          return { ...p, variants, totalStock: variants.reduce((s, v) => s + v.qty, 0) };
        });
      });
    }
    return {
      products,
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status: 'dispatched', trackingId, pickingStatus: 'done', packingStatus: 'done' } : o
      ),
    };
  }),

  // Returns
  returns: SEED_RETURNS,
  addReturn: (ret) => set((state) => {
    const id = `RET-${String(state.returns.length + 1).padStart(3, '0')}`;
    // Add stock back
    let products = [...state.products];
    ret.items.forEach((item) => {
      products = products.map((p) => {
        if (p.id !== item.productId) return p;
        const variants = p.variants.map((v) =>
          v.size === item.size && v.color === item.color
            ? { ...v, qty: v.qty + item.qty }
            : v
        );
        return { ...p, variants, totalStock: variants.reduce((s, v) => s + v.qty, 0) };
      });
    });
    return {
      products,
      returns: [...state.returns, { ...ret, id, date: new Date().toISOString().split('T')[0], status: 'processed' }],
    };
  }),
    dismissNotification: (id) => set((state) => ({
      dismissedNotifications: [...state.dismissedNotifications, id]
    })),
    dismissAllNotifications: (ids) => set((state) => ({
      dismissedNotifications: [...state.dismissedNotifications, ...ids]
    })),
    }),
    {
      name: 'praveen-trading-storage',
    }
  )
);

export default useStore;
