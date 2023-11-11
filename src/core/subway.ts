export const metroStations = [
  { name: 'Девяткино', color: ['red'] },
  { name: 'Гражданский проспект', color: ['red'] },
  { name: 'Академическая', color: ['red'] },
  { name: 'Политехническая', color: ['red'] },
  { name: 'Площадь Мужества', color: ['red'] },
  { name: 'Лесная', color: ['red'] },
  { name: 'Выборгская', color: ['red'] },
  { name: 'Площадь Ленина', color: ['red'] },
  { name: 'Чернышевская', color: ['red'] },
  { name: 'Площадь Восстания', color: ['red'] },
  { name: 'Владимирская', color: ['red'] },
  { name: 'Пушкинская', color: ['red'] },
  { name: 'Балтийская', color: ['red'] },
  { name: 'Нарвская', color: ['red'] },
  { name: 'Кировский завод', color: ['red'] },
  { name: 'Автово', color: ['red'] },
  { name: 'Ленинский проспект', color: ['red'] },
  { name: 'Проспект Ветеранов', color: ['red'] },
  { name: 'Комендантский проспект', color: ['purple'] },
  { name: 'Старая Деревня', color: ['purple'] },
  { name: 'Крестовский остров', color: ['purple'] },
  { name: 'Чкаловская', color: ['purple'] },
  { name: 'Спортивная', color: ['purple'] },
  { name: 'Адмиралтейская', color: ['purple'] },
  { name: 'Садовая', color: ['purple'] },
  { name: 'Звенигородская', color: ['purple'] },
  { name: 'Обводный канал', color: ['purple'] },
  { name: 'Волковская', color: ['purple'] },
  { name: 'Бухарестская', color: ['purple'] },
  { name: 'Международная', color: ['purple'] },
  { name: 'Спасская', color: ['orange'] },
  { name: 'Достоевская', color: ['orange'] },
  { name: 'Лиговский проспект', color: ['orange'] },
  { name: 'Площадь Александра Невского, color: ', color: ['orange', 'green'] },
  { name: 'Парнас', color: ['blue'] },
  { name: 'Проспект Просвещения', color: ['blue'] },
  { name: 'Озерки', color: ['blue'] },
  { name: 'Удельная', color: ['blue'] },
  { name: 'Пионерская', color: ['blue'] },
  { name: 'Чёрная речка', color: ['blue'] },
  { name: 'Петроградская', color: ['blue'] },
  { name: 'Горьковская', color: ['blue'] },
  { name: 'Невский проспект', color: ['blue'] },
  { name: 'Сенная площадь', color: ['blue'] },
  { name: 'Технологический институт', color: ['blue', 'red'] },
  { name: 'Фрунзенская', color: ['blue'] },
  { name: 'Московские ворота', color: ['blue'] },
  { name: 'Электросила', color: ['blue'] },
  { name: 'Парк Победы', color: ['blue'] },
  { name: 'Московская', color: ['blue'] },
  { name: 'Звёздная', color: ['blue'] },
  { name: 'Купчино', color: ['blue'] },
  { name: 'Беговая', color: ['green'] },
  { name: 'Зенит', color: ['green'] },
  { name: 'Приморская', color: ['green'] },
  { name: 'Василеостровская', color: ['green'] },
  { name: 'Гостиный двор', color: ['green'] },
  { name: 'Маяковская', color: ['green'] },
  { name: 'Елизаровская', color: ['green'] },
  { name: 'Ломоносовская', color: ['green'] },
  { name: 'Пролетарская', color: ['green'] },
  { name: 'Обухово', color: ['green'] },
  { name: 'Рыбацкое', color: ['green'] },
];

type SubwayColorsType = {
  red: string;
  blue: string;
  orange: string;
  purple: string;
  green: string;
};

export const subwayColors: SubwayColorsType = {
  red: '🔴',
  blue: '🔵',
  orange: '🟠',
  purple: '🟣',
  green: '🟢',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSubwayColor = (color: any): color is keyof SubwayColorsType => {
  return color in subwayColors;
};
