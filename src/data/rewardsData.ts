export type RewardType = 'SHOP' | 'STREAK';

export interface Reward {
  id: string;
  title: string;
  description: string;
  image: any;

  type: RewardType;

  // SHOP ödülleri için
  cost?: number;

  // STREAK rozetleri için
  streakRequired?: number;
}

export const REWARDS: Reward[] = [
  {
    id: 'r0', // sunumda gostermek icin 0 puanlik ornek veri
    title: 'Işıltılı Bir Hayat',
    description: 'Bu ışıltılı hayatı sen seçtin✨',
    type: 'SHOP',
    cost: 0,
    image: require('../assets/rewards/rozet8.png'),
  },
  {
    id: 'r1',
    title: 'Etkinlik Gurmesi',
    description: 'Bu kültür işinde bayağı iyisin dostum.',
    type: 'SHOP',
    cost: 10,
    image: require('../assets/rewards/rozet2.png'),
  },
  {
    id: 'r2',
    title: 'Kültür Avcısı',
    description: 'Farklı kategorilerden etkinlikler',
    type: 'SHOP',
    cost: 100,
    image: require('../assets/rewards/rozet3.png'),
  },
  {
    id: 'r3',
    title: 'Sahne Arkası',
    description: 'Özel içerik rozeti',
    type: 'SHOP',
    cost: 200,
    image: require('../assets/rewards/rozet4.png'),
  },
  {
    id: 'r4',
    title: 'Harita Kaşifi',
    description: 'Tam bir çok gezentisin.',
    type: 'SHOP',
    cost: 400,
    image: require('../assets/rewards/rozet5.png'),
  },
  {
    id: 'r5',
    title: 'Gizemli Kupa',
    description: 'Sürpriz ödül',
    type: 'SHOP',
    cost: 800,
    image: require('../assets/rewards/rozet6.png'),
  },
  {
    id: 'r6',
    title: 'Işıltılı Bir Hayat',
    description: 'Bu ışıltılı hayatı sen seçtin✨',
    type: 'SHOP',
    cost: 800,
    image: require('../assets/rewards/rozet8.png'),
  },
  {
    id: 'r7',
    title: 'Hedefine Bağlı',
    description: "Hedefi tam 12'den vurdun",
    type: 'SHOP',
    cost: 800,
    image: require('../assets/rewards/rozet7.png'),
  },

  /* =========================
     🔥 STREAK ROZETLERİ
     (SATIN ALINMAZ)
  ========================= */

  {
    id: 'streak10',
    title: '10 Günlük Seri',
    description: '10 gün üst üste giriş yaptın',
    type: 'STREAK',
    streakRequired: 10,
    image: require('../assets/rewards/streak10.png'),
  },
  {
    id: 'streak20',
    title: '20 Günlük Seri',
    description: '20 gün pes etmeden devam!',
    type: 'STREAK',
    streakRequired: 20,
    image: require('../assets/rewards/streak20.png'),
  },
  {
    id: 'streak30',
    title: '30 Günlük Seri',
    description: 'Efsane disiplin!',
    type: 'STREAK',
    streakRequired: 30,
    image: require('../assets/rewards/streak30.png'),
  },
];
