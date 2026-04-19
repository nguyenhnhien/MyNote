export type Page = 'home' | 'about' | 'poems' | 'prose' | 'gallery';

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
];

export interface SiteConfig {
  homeTagline: string;
  navLabels: Record<string, string>;
  pageTitles: Record<string, string>;
  pageSubtitles: Record<string, string>;
  bgMode: 'water' | 'slideshow' | 'auto';
  slideImages: string[];
}
