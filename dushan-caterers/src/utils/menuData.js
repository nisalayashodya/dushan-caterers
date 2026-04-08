// src/utils/menuData.js
export const menuCategories = [
  {
    id: 'rice-curry',
    name: 'Rice & Curry',
    icon: '🍛',
    items: [
      { id: 'rc1', name: 'White Rice', price: 150, unit: 'per person', description: 'Steamed white rice', dietary: ['vegan'] },
      { id: 'rc2', name: 'Yellow Rice', price: 200, unit: 'per person', description: 'Fragrant turmeric rice', dietary: ['vegan'] },
      { id: 'rc3', name: 'Chicken Curry', price: 350, unit: 'per person', description: 'Traditional Sri Lankan chicken curry', dietary: [] },
      { id: 'rc4', name: 'Fish Curry', price: 380, unit: 'per person', description: 'Authentic spicy fish curry', dietary: [] },
      { id: 'rc5', name: 'Dhal Curry', price: 180, unit: 'per person', description: 'Creamy lentil curry', dietary: ['vegan'] },
      { id: 'rc6', name: 'Potato Curry', price: 200, unit: 'per person', description: 'Spiced potato curry', dietary: ['vegan'] },
      { id: 'rc7', name: 'Jackfruit Curry', price: 220, unit: 'per person', description: 'Young jackfruit in coconut gravy', dietary: ['vegan'] },
      { id: 'rc8', name: 'Beef Curry', price: 400, unit: 'per person', description: 'Slow-cooked beef curry', dietary: [] },
      { id: 'rc9', name: 'Mutton Curry', price: 450, unit: 'per person', description: 'Tender mutton in spiced gravy', dietary: [] },
      { id: 'rc10', name: 'Prawn Curry', price: 500, unit: 'per person', description: 'Succulent prawns in coconut curry', dietary: [] }
    ]
  },
  {
    id: 'short-eats',
    name: 'Short Eats',
    icon: '🥐',
    items: [
      { id: 'se1', name: 'Chicken Patties', price: 120, unit: 'each', description: 'Flaky pastry with spiced chicken filling', dietary: [] },
      { id: 'se2', name: 'Vegetable Rolls', price: 90, unit: 'each', description: 'Crispy rolls with vegetable filling', dietary: ['vegetarian'] },
      { id: 'se3', name: 'Fish Cutlets', price: 110, unit: 'each', description: 'Golden fried fish cakes', dietary: [] },
      { id: 'se4', name: 'Egg Rolls', price: 100, unit: 'each', description: 'Savory egg-filled rolls', dietary: ['vegetarian'] },
      { id: 'se5', name: 'Cheese Sandwiches', price: 150, unit: 'each', description: 'Fresh cheese sandwiches', dietary: ['vegetarian'] },
      { id: 'se6', name: 'Meat Buns', price: 130, unit: 'each', description: 'Soft buns with spiced meat', dietary: [] }
    ]
  },
  {
    id: 'biriyani',
    name: 'Biriyani',
    icon: '🍚',
    items: [
      { id: 'br1', name: 'Chicken Biriyani', price: 650, unit: 'per person', description: 'Aromatic basmati rice with tender chicken', dietary: [] },
      { id: 'br2', name: 'Mutton Biriyani', price: 750, unit: 'per person', description: 'Rich mutton biriyani with fried onions', dietary: [] },
      { id: 'br3', name: 'Vegetable Biriyani', price: 500, unit: 'per person', description: 'Fragrant rice with mixed vegetables', dietary: ['vegetarian'] },
      { id: 'br4', name: 'Prawn Biriyani', price: 800, unit: 'per person', description: 'Luxurious prawn biriyani', dietary: [] }
    ]
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: '🍮',
    items: [
      { id: 'ds1', name: 'Watalappan', price: 200, unit: 'per person', description: 'Traditional Sri Lankan coconut custard', dietary: ['vegetarian'] },
      { id: 'ds2', name: 'Caramel Pudding', price: 180, unit: 'per person', description: 'Creamy caramel pudding', dietary: ['vegetarian'] },
      { id: 'ds3', name: 'Fruit Salad', price: 150, unit: 'per person', description: 'Fresh tropical fruit salad', dietary: ['vegan'] },
      { id: 'ds4', name: 'Ice Cream', price: 200, unit: 'per person', description: 'Assorted ice cream selection', dietary: ['vegetarian'] },
      { id: 'ds5', name: 'Curd & Treacle', price: 160, unit: 'per person', description: 'Buffalo curd with kithul treacle', dietary: ['vegetarian'] }
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    items: [
      { id: 'bv1', name: 'King Coconut Water', price: 120, unit: 'per person', description: 'Fresh king coconut', dietary: ['vegan'] },
      { id: 'bv2', name: 'Soft Drinks', price: 150, unit: 'per person', description: 'Assorted soft drinks', dietary: ['vegan'] },
      { id: 'bv3', name: 'Fruit Juice', price: 180, unit: 'per person', description: 'Fresh fruit juices', dietary: ['vegan'] },
      { id: 'bv4', name: 'Tea/Coffee', price: 100, unit: 'per person', description: 'Ceylon tea or coffee', dietary: ['vegetarian'] },
      { id: 'bv5', name: 'Faluda', price: 250, unit: 'per person', description: 'Rose-flavored milk drink', dietary: ['vegetarian'] }
    ]
  },
  {
    id: 'special',
    name: 'Special Items',
    icon: '⭐',
    items: [
      { id: 'sp1', name: 'Roast Chicken', price: 800, unit: 'per bird', description: 'Whole roasted chicken with herbs', dietary: [] },
      { id: 'sp2', name: 'BBQ Pork', price: 1200, unit: 'per kg', description: 'Slow-cooked BBQ pork ribs', dietary: [] },
      { id: 'sp3', name: 'Lamprais', price: 550, unit: 'per person', description: 'Dutch-inspired rice packet with accompaniments', dietary: [] },
      { id: 'sp4', name: 'String Hoppers Set', price: 400, unit: 'per person', description: 'String hoppers with coconut sambal and curry', dietary: [] },
      { id: 'sp5', name: 'Hoppers Set', price: 350, unit: 'per person', description: 'Egg hoppers with sambal and curry', dietary: [] }
    ]
  }
];

export const eventPackages = [
  {
    id: 'pkg-budget',
    name: 'Budget Package',
    icon: '💰',
    priceRange: '500 - 800 LKR/person',
    minGuests: 20,
    description: 'Perfect for small gatherings and casual events',
    recommended: ['rc1', 'rc3', 'rc5', 'rc6', 'bv2'],
    eventTypes: ['birthday', 'office', 'casual']
  },
  {
    id: 'pkg-standard',
    name: 'Standard Package',
    icon: '🌟',
    priceRange: '800 - 1500 LKR/person',
    minGuests: 50,
    description: 'Ideal for weddings, engagements and formal events',
    recommended: ['rc2', 'rc3', 'rc4', 'rc5', 'rc6', 'se1', 'ds1', 'bv1'],
    eventTypes: ['wedding', 'engagement', 'formal']
  },
  {
    id: 'pkg-premium',
    name: 'Premium Package',
    icon: '👑',
    priceRange: '1500+ LKR/person',
    minGuests: 100,
    description: 'Luxury experience for grand ceremonies',
    recommended: ['rc2', 'br1', 'rc4', 'rc9', 'sp3', 'se1', 'se3', 'ds1', 'ds2', 'bv1', 'bv5'],
    eventTypes: ['wedding', 'corporate', 'gala']
  }
];

export const eventTypes = [
  'Wedding', 'Engagement', 'Birthday Party', 'Corporate Event',
  'Office Party', 'Funeral', 'Religious Ceremony', 'Graduation', 'Casual Gathering', 'Other'
];
