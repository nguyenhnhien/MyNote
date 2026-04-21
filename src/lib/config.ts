import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SiteConfig } from '../types';

export const DEFAULT_CONFIG: SiteConfig = {
  homeTagline: "Những vệt nước thời gian",
  navLabels: {
    home: "TRANG CHỦ",
    about: "About Me",
    poems: "Người tình mùa đông",
    prose: "Viết lên gồng xiềng",
    gallery: "Yên hoa lộng nguyệt",
    archive: "Lưu trữ"
  },
  pageTitles: {
    home: "nguyenhnhien",
    about: "About me",
    poems: "Người tình mùa đông",
    prose: "Viết lên gồng xiềng",
    gallery: "Yên hoa lộng nguyệt",
    archive: "Khu vườn bí mật"
  },
  pageSubtitles: {
    home: "",
    about: "",
    poems: "Tôi thuộc về những vần thơ",
    prose: "Một thế giới khác",
    gallery: "Nơi những mảnh ghép ký ức và giấc mơ hội ngộ",
    archive: "Những câu chuyện chưa kể"
  },
  bgMode: 'slideshow',
  slideImages: [
    'input_file_0.png',
    'https://picsum.photos/seed/nature/1920/1080',
    'https://picsum.photos/seed/ocean/1920/1080',
    'https://picsum.photos/seed/mist/1920/1080',
  ],
  aboutImageUrl: 'https://picsum.photos/seed/vintage-writer/800/1000'
};

export function subscribeToConfig(callback: (config: SiteConfig) => void) {
  const configDoc = doc(db, 'config', 'site');
  return onSnapshot(configDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...DEFAULT_CONFIG, ...snapshot.data() } as SiteConfig);
    } else {
      callback(DEFAULT_CONFIG);
    }
  });
}

export async function updateConfig(newConfig: Partial<SiteConfig>) {
  const configDoc = doc(db, 'config', 'site');
  await setDoc(configDoc, newConfig, { merge: true });
}
