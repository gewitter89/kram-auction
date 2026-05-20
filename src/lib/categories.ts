export const launchCategories = [
  { slug: 'electronics', name: 'Електроніка', description: 'Аукціони та оголошення електроніки: гаджети, пристрої, аксесуари та корисна техніка з прозорими ставками.' },
  { slug: 'phones', name: 'Телефони', description: 'Смартфони, кнопкові телефони, аксесуари та мобільна техніка від продавців KRAM.' },
  { slug: 'laptops', name: 'Ноутбуки та ПК', description: 'Ноутбуки, компʼютери, монітори та комплектуючі з прямими домовленостями між покупцем і продавцем.' },
  { slug: 'games', name: 'Ігри та консолі', description: 'PlayStation, Xbox, Nintendo, ігри, геймпади та аксесуари для геймерів.' },
  { slug: 'kids', name: 'Дитячі товари', description: 'Дитячі речі, іграшки, коляски та корисні товари для сімʼї.' },
  { slug: 'fashion', name: 'Одяг', description: 'Одяг, взуття та аксесуари у форматі оголошень і прозорих торгів.' },
  { slug: 'home', name: 'Дім', description: 'Товари для дому, побутова техніка, меблі, декор та корисні речі.' },
  { slug: 'sport', name: 'Спорт', description: 'Спортивні товари, інвентар, екіпірування та товари для активного відпочинку.' },
  { slug: 'tools', name: 'Інструменти', description: 'Ручний та електроінструмент, обладнання і товари для ремонту.' },
  { slug: 'auto', name: 'Авто', description: 'Автотовари, аксесуари, запчастини та корисні речі для автомобілістів.' },
  { slug: 'books', name: 'Книги', description: 'Книги, навчальні матеріали, видання для колекцій та читання.' },
  { slug: 'collections', name: 'Колекції', description: 'Колекційні предмети, рідкісні речі, сувеніри та хобі-товари.' },
] as const

export type LaunchCategorySlug = typeof launchCategories[number]['slug']

export function getLaunchCategory(slug: string) {
  return launchCategories.find(category => category.slug === slug)
}
