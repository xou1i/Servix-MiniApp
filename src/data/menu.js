/**
 * Menu catalog — food items go to Chef, drink items go to Barista.
 * Each item has EN + AR labels.
 */
export const MENU_ITEMS = [
  // ── Food → Chef ──────────────────────────────────────────
  { id: 'f-burger',   labelEn: 'Burger',          labelAr: 'برجر',             category: 'food' },
  { id: 'f-pizza',    labelEn: 'Pizza',            labelAr: 'بيتزا',            category: 'food' },
  { id: 'f-pasta',    labelEn: 'Pasta',            labelAr: 'باستا',            category: 'food' },
  { id: 'f-fries',    labelEn: 'Fries',            labelAr: 'بطاطس',            category: 'food' },
  { id: 'f-chicken',  labelEn: 'Grilled Chicken',  labelAr: 'دجاج مشوي',        category: 'food' },
  { id: 'f-salad',    labelEn: 'Salad',            labelAr: 'سلطة',             category: 'food' },
  { id: 'f-steak',    labelEn: 'Steak',            labelAr: 'ستيك',             category: 'food' },
  // ── Drinks → Barista ─────────────────────────────────────
  { id: 'd-espresso', labelEn: 'Espresso',         labelAr: 'إسبريسو',          category: 'drink' },
  { id: 'd-latte',    labelEn: 'Latte',            labelAr: 'لاتيه',            category: 'drink' },
  { id: 'd-cap',      labelEn: 'Cappuccino',       labelAr: 'كابتشينو',         category: 'drink' },
  { id: 'd-amer',     labelEn: 'Americano',        labelAr: 'أمريكانو',         category: 'drink' },
  { id: 'd-mocha',    labelEn: 'Mocha',            labelAr: 'موكا',             category: 'drink' },
  { id: 'd-tea',      labelEn: 'Tea',              labelAr: 'شاي',              category: 'drink' },
  { id: 'd-juice',    labelEn: 'Fresh Juice',      labelAr: 'عصير طازج',        category: 'drink' },
  { id: 'd-soft',     labelEn: 'Soft Drink',       labelAr: 'مشروب غازي',       category: 'drink' },
];

export const FOOD_ITEMS  = MENU_ITEMS.filter((i) => i.category === 'food');
export const DRINK_ITEMS = MENU_ITEMS.filter((i) => i.category === 'drink');

/** Route selected item ids → { kitchenItems, baristaItems } */
export function routeItems(selectedIds, lang = 'ar') {
  const labelKey = lang === 'en' ? 'labelEn' : 'labelAr';
  const kitchenItems = [];
  const baristaItems = [];
  selectedIds.forEach((id) => {
    const item = MENU_ITEMS.find((m) => m.id === id);
    if (!item) return;
    if (item.category === 'food')  kitchenItems.push(item[labelKey]);
    if (item.category === 'drink') baristaItems.push(item[labelKey]);
  });
  return { kitchenItems, baristaItems };
}
