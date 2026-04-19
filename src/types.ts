export type Page = 'home' | 'about' | 'poems' | 'prose' | 'gallery' | 'archive';

export interface NavItem {
  id: Page;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'TRANG CHỦ' },
  { id: 'about', label: 'About Me' },
  { id: 'poems', label: 'Người tình mùa đông' },
  { id: 'prose', label: 'Viết lên gồng xiềng' },
  { id: 'gallery', label: 'Yên hoa lộng nguyệt' },
  { id: 'archive', label: 'Lưu trữ' },
];

export interface SiteConfig {
  homeTagline: string;
  navLabels: Record<string, string>;
  pageTitles: Record<string, string>;
  pageSubtitles: Record<string, string>;
  bgMode: 'water' | 'slideshow' | 'auto';
  slideImages: string[];
}

export interface Story {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  isPrivate: boolean;
  password?: string;
  createdAt: any;
}

export interface Chapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  title: string;
  content: string;
  createdAt: any;
}
