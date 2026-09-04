/**
 * TEA TOP 第一味 - 全台區域預設排行榜資料與備援清單 (Fallback Data)
 * 當門市機上盒離線或資料庫連線失敗時，保證 100% 正常播放，絕不白屏。
 */

const DEFAULT_REGIONS = [
  { id: 'north', name: '北區門市', desc: '台北、新北、基隆、桃園、新竹' },
  { id: 'central', name: '中區門市', desc: '苗栗、台中、彰化、南投、雲林' },
  { id: 'south', name: '南區門市', desc: '嘉義、台南、高雄、屏東' },
  { id: 'special', name: '商場/國道特殊門市', desc: '百貨、休息站及特定特力屋商場' }
];

const DEFAULT_BADGE_OPTIONS = [
  { id: 'badge_hot', name: '可做熱飲', path: 'assets/images/badges/badge_hot.png?v=3', pathNavy: 'assets/images/badges/badge_hot_navy.png?v=3' },
  { id: 'badge_fixed_sugar', name: '甜度固定', path: 'assets/images/badges/badge_fixed_sugar.png?v=3', pathNavy: 'assets/images/badges/badge_fixed_sugar.png?v=3' },
  { id: 'badge_no_caffeine_hot_fixed', name: '無咖啡因', path: 'assets/images/badges/badge_no_caffeine_hot_fixed_orange.png?v=3', pathNavy: 'assets/images/badges/badge_no_caffeine_hot_fixed_navy.png?v=3' }
];

const DEFAULT_HERO_IMAGES = [
  { id: 'drink_1_hero', name: '飲品杯 01 (高山青/茶類)', path: 'assets/images/drinks/drink_1_hero.png' },
  { id: 'drink_2_hero', name: '飲品杯 02 (108茶王/桂花凍)', path: 'assets/images/drinks/drink_2_hero.png' },
  { id: 'drink_3_hero', name: '飲品杯 03 (青茶3Q/百香QQ)', path: 'assets/images/drinks/drink_3_hero.png' },
  { id: 'drink_4_hero', name: '飲品杯 04 (黑糖鮮奶/粉粿)', path: 'assets/images/drinks/drink_4_hero.png' },
  { id: 'drink_5_hero', name: '飲品杯 05 (雙Q奶茶/奶蓋)', path: 'assets/images/drinks/drink_5_hero.png' }
];

const NORTH_DRINKS = [
  {
    rank: '01',
    name: '招牌高山青',
    engName: 'Signature Alpine Green Tea',
    price: 40,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_1_hero.png',
    badges: ['assets/images/badges/badge_hot.png?v=3']
  },
  {
    rank: '02',
    name: '108茶王',
    engName: '108 King Oolong Tea',
    price: 49,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_2_hero.png',
    badges: ['assets/images/badges/badge_hot.png?v=3']
  },
  {
    rank: '03',
    name: '青茶3Q',
    engName: 'Alpine Green Tea w/ Coconut jelly & Tea jelly & Pearl',
    price: 50,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_3_hero.png',
    badges: ['assets/images/badges/badge_hot.png?v=3']
  },
  {
    rank: '04',
    name: '黑糖珍珠鮮奶',
    engName: 'Brown Sugar Fresh Milk w/ Pearls',
    price: 80,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_4_hero.png',
    badges: ['assets/images/badges/badge_no_caffeine_hot_fixed_orange.png?v=3']
  },
  {
    rank: '05',
    name: '當代雙Q',
    engName: 'Pearl Milk Tea w/ Taro Balls',
    price: 65,
    size: 'L',
    theme: 'orange',
    heroImg: 'assets/images/drinks/drink_5_hero.png',
    badges: ['assets/images/badges/badge_hot.png?v=3']
  },
  {
    rank: '06',
    name: '桂花凍108',
    engName: '108 King Oolong Tea w/ Osmanthus Jelly',
    price: 70,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_2_hero.png',
    badges: ['assets/images/badges/badge_fixed_sugar.png?v=3']
  },
  {
    rank: '07',
    name: '奶蓋日月紅',
    engName: 'Milk Foam Sun Moon Lake Black Tea',
    price: 60,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_5_hero.png',
    badges: ['assets/images/badges/badge_hot_navy.png?v=3']
  },
  {
    rank: '08',
    name: '轟蜜茶108',
    engName: 'Honey 108 King Oolong Tea w/ Tea Jelly',
    price: 70,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_1_hero.png',
    badges: []
  },
  {
    rank: '09',
    name: '紅豆粉粿鮮奶',
    engName: 'Brown Sugar Fresh Milk w/ Red Bean & Jelly',
    price: 95,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_4_hero.png',
    badges: ['assets/images/badges/badge_no_caffeine_hot_fixed_navy.png?v=3']
  },
  {
    rank: '10',
    name: '百香QQ',
    engName: 'Passion Fruit Green Tea Medley',
    price: 75,
    size: 'L',
    theme: 'navy',
    heroImg: 'assets/images/drinks/drink_3_hero.png',
    badges: ['assets/images/badges/badge_hot_navy.png?v=3']
  }
];

// 中區門市基礎範本 (深拷貝並預設初始值)
const CENTRAL_DRINKS = JSON.parse(JSON.stringify(NORTH_DRINKS));

// 南區門市基礎範本 (深拷貝並預設初始值)
const SOUTH_DRINKS = JSON.parse(JSON.stringify(NORTH_DRINKS));

// 特殊門市基礎範本
const SPECIAL_DRINKS = JSON.parse(JSON.stringify(NORTH_DRINKS));

const DEFAULT_MENUS_BY_REGION = {
  north: {
    regionId: 'north',
    regionName: '北區門市',
    drinks: NORTH_DRINKS,
    updatedAt: new Date().toISOString()
  },
  central: {
    regionId: 'central',
    regionName: '中區門市',
    drinks: CENTRAL_DRINKS,
    updatedAt: new Date().toISOString()
  },
  south: {
    regionId: 'south',
    regionName: '南區門市',
    drinks: SOUTH_DRINKS,
    updatedAt: new Date().toISOString()
  },
  special: {
    regionId: 'special',
    regionName: '商場/國道特殊門市',
    drinks: SPECIAL_DRINKS,
    updatedAt: new Date().toISOString()
  }
};

// 預設商品庫清單 (供第一次初始化使用)
const DEFAULT_PRODUCTS = NORTH_DRINKS.map((drink, index) => {
  // 排除 rank 屬性，並加上獨立 id
  const { rank, ...rest } = drink;
  return {
    id: 'prod_' + (index + 1).toString().padStart(3, '0'),
    ...rest
  };
});

// 支援全域掛載與模組輸出
if (typeof window !== 'undefined') {
  window.DEFAULT_REGIONS = DEFAULT_REGIONS;
  window.DEFAULT_BADGE_OPTIONS = DEFAULT_BADGE_OPTIONS;
  window.DEFAULT_HERO_IMAGES = DEFAULT_HERO_IMAGES;
  window.DEFAULT_MENUS_BY_REGION = DEFAULT_MENUS_BY_REGION;
  window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_REGIONS,
    DEFAULT_BADGE_OPTIONS,
    DEFAULT_HERO_IMAGES,
    DEFAULT_MENUS_BY_REGION,
    DEFAULT_PRODUCTS
  };
}

