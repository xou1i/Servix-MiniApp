export const MOCK_CATEGORIES = [
  { id: 'cat_all', name: 'الكل', icon: 'LayoutGrid' },
  { id: 'cat_main', name: 'رئيسي', icon: 'Utensils' },
  { id: 'cat_drinks', name: 'مشروبات', icon: 'Coffee' },
  { id: 'cat_desserts', name: 'حلى', icon: 'CakeSlice' }
];

export const MOCK_ITEMS = [
  { id: 'item_1', category: 'cat_main', name: 'ستيك لحم بقر', price: 120, image: '🥩', hasModifiers: true },
  { id: 'item_2', category: 'cat_main', name: 'برجر كلاسيك', price: 45, image: '🍔', hasModifiers: true },
  { id: 'item_3', category: 'cat_main', name: 'بيتزا مارغريتا', price: 55, image: '🍕', hasModifiers: false },
  { id: 'item_4', category: 'cat_drinks', name: 'عصير برتقال', price: 15, image: '🍊', hasModifiers: false },
  { id: 'item_5', category: 'cat_drinks', name: 'قهوة مختصة', price: 20, image: '☕', hasModifiers: true },
  { id: 'item_6', category: 'cat_desserts', name: 'كيكة شوكولاتة', price: 35, image: '🍰', hasModifiers: false },
  { id: 'item_7', category: 'cat_main', name: 'باستا ترفل', price: 65, image: '🍝', hasModifiers: false },
  { id: 'item_8', category: 'cat_main', name: 'سلطة سيزر', price: 30, image: '🥗', hasModifiers: false },
];
