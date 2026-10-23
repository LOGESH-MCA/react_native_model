/**
 * Grocery Food Products Data
 * Explanation for Viva:
 * Since there is no external database or backend required,
 * this array acts as our in-memory data source for the grocery items.
 * We include categories: 'Fresh fruits' and 'Fresh vegetables'
 * exactly matching the Figma design reference.
 */

export const INITIAL_PRODUCTS = [
  {
    id: '1',
    name: 'Banana',
    category: 'Fresh fruits',
    price: 50, // Rs 50/kg (matching Figma screen)
    unit: 'kg',
    rating: 4.8,
    reviews: 124,
    calories: '89 kcal / 100g',
    image: require('../../assets/images/banana.png'),
    description: 'Freshly harvested yellow bananas packed with potassium, dietary fiber, and natural energy. Great for morning smoothies or a healthy snack.',
    stock: 45,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Pineapple',
    category: 'Fresh fruits',
    price: 120, // Rs 120/kg (matching Figma screen)
    unit: 'kg',
    rating: 4.9,
    reviews: 98,
    calories: '50 kcal / 100g',
    image: require('../../assets/images/pineapple.png'),
    description: 'Sweet, tropical and juicy ripe pineapple. High in Vitamin C and bromelain enzyme for digestion and immune health.',
    stock: 20,
    isPopular: true,
  },
  {
    id: '3',
    name: 'Tomato',
    category: 'Fresh vegetables',
    price: 220, // Rs 220/kg (matching Figma screen)
    unit: 'kg',
    rating: 4.7,
    reviews: 86,
    calories: '18 kcal / 100g',
    image: require('../../assets/images/tomato.png'),
    description: 'Farm-fresh vine-ripened red tomatoes. Juicy and rich in lycopene antioxidant, perfect for salads, curries, and sauces.',
    stock: 60,
    isPopular: true,
  },
  {
    id: '4',
    name: 'Cabbage',
    category: 'Fresh vegetables',
    price: 40, // Rs 40/kg (matching Figma screen)
    unit: 'kg',
    rating: 4.5,
    reviews: 42,
    calories: '25 kcal / 100g',
    image: require('../../assets/images/cabbage.png'),
    description: 'Crisp green farm cabbage with tightly packed leaves. Rich in Vitamin K and Vitamin C, ideal for stir-fries and fresh slaws.',
    stock: 35,
    isPopular: false,
  },
  {
    id: '5',
    name: 'Mango (Alphonso)',
    category: 'Fresh fruits',
    price: 150, // Rs 150/kg
    unit: 'kg',
    rating: 5.0,
    reviews: 215,
    calories: '60 kcal / 100g',
    image: require('../../assets/images/mango.png'),
    description: 'The King of Fruits! Golden, aromatic Alphonso mangoes with rich, velvety pulp and irresistible sweetness.',
    stock: 28,
    isPopular: true,
  },
  {
    id: '6',
    name: 'Fresh Orange',
    category: 'Fresh fruits',
    price: 90, // Rs 90/kg
    unit: 'kg',
    rating: 4.6,
    reviews: 73,
    calories: '47 kcal / 100g',
    image: require('../../assets/images/orange.png'),
    description: 'Sun-kissed citrus oranges bursting with sweet juice and essential Vitamin C to boost your daily immunity.',
    stock: 50,
    isPopular: true,
  },
  {
    id: '7',
    name: 'Cauliflower',
    category: 'Fresh vegetables',
    price: 60, // Rs 60/kg
    unit: 'kg',
    rating: 4.6,
    reviews: 58,
    calories: '25 kcal / 100g',
    image: require('../../assets/images/cauliflower.png'),
    description: 'Pure white fresh cauliflower head surrounded by crisp green leaves. High in fiber and B-vitamins, great for low-carb recipes.',
    stock: 30,
    isPopular: false,
  },
  {
    id: '8',
    name: 'Bell Peppers',
    category: 'Fresh vegetables',
    price: 110, // Rs 110/kg
    unit: 'kg',
    rating: 4.8,
    reviews: 64,
    calories: '31 kcal / 100g',
    image: require('../../assets/images/bellpepper.png'),
    description: 'Vibrant trio of crunchy red, yellow, and green capsicums. Adds color, sweetness, and high vitamin levels to every dish.',
    stock: 25,
    isPopular: true,
  },
  {
    id: '9',
    name: 'Red Apple',
    category: 'Fresh fruits',
    price: 180, // Rs 180/kg
    unit: 'kg',
    rating: 4.9,
    reviews: 140,
    calories: '52 kcal / 100g',
    image: require('../../assets/images/apple.png'),
    description: 'Crisp, sweet, and juicy red apples sourced from high-altitude orchards. An apple a day keeps the doctor away!',
    stock: 40,
    isPopular: true,
  },
];
