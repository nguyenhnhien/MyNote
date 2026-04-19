import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WaterBackground } from './components/WaterBackground';
import { HandwritingText, ClickRipple } from './components/HandwritingText';
import { Page, NAV_ITEMS, SiteConfig } from './types';
import { Home, About, Poems, Prose, Gallery, SystemSettings } from './components/Pages';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { subscribeToConfig, DEFAULT_CONFIG } from './lib/config';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  const ADMIN_EMAIL = 'nguyenhuynhngochien358lx@gmail.com';

  useEffect(() => {
    const unsubConfig = subscribeToConfig(setSiteConfig);
    return () => unsubConfig();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser && authUser.email === ADMIN_EMAIL && authUser.emailVerified) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Smooth scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleLogoClick = async () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setClickCount(0);
      if (isAdmin) {
        if (confirm("Bạn có muốn đăng xuất và tắt chế độ quản trị?")) {
          await signOut(auth);
        }
      } else {
        try {
          const loggedInUser = await signInWithGoogle();
          if (loggedInUser.email !== ADMIN_EMAIL) {
            alert("Truy cập bị từ chối. Bạn không phải là quản trị viên được ủy quyền.");
            await signOut(auth);
          }
        } catch (error) {
          alert("Xác thực thất bại.");
        }
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home key="home" onExplore={() => setCurrentPage('about')} config={siteConfig} />;
      case 'about': return <About key="about" config={siteConfig} isAdmin={isAdmin} />;
      case 'poems': return <Poems key="poems" isAdmin={isAdmin} config={siteConfig} />;
      case 'prose': return <Prose key="prose" isAdmin={isAdmin} config={siteConfig} />;
      case 'gallery': return <Gallery key="gallery" isAdmin={isAdmin} config={siteConfig} />;
      // @ts-ignore - dynamic page for system settings
      case 'settings': return <SystemSettings key="settings" config={siteConfig} />;
      default: return <Home onExplore={() => setCurrentPage('about')} config={siteConfig} />;
    }
  };

  return (
    <div className="relative min-h-screen">
      <WaterBackground config={siteConfig} />
      <ClickRipple />
      
      {/* Navigation Header - Full-width rectangle at the top edge */}
      <nav className="fixed top-0 left-0 w-full z-[100] transition-all duration-300">
        <div className="w-full flex justify-between items-center px-10 py-6 glass border-b border-white/5 shadow-2xl backdrop-blur-2xl bg-water-deep/40">
          {/* Nav Items */}
          <div className="flex gap-10 items-center">
            {NAV_ITEMS.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`text-[11px] tracking-[4px] uppercase transition-all duration-300 relative pb-1 border-b ${
                  currentPage === item.id 
                    ? 'text-white border-white/50' 
                    : 'text-paper/60 border-transparent hover:text-white hover:border-white/30'
                } font-light`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {siteConfig.navLabels[item.id] || item.label}
              </motion.button>
            ))}
            {isAdmin && (
              <motion.button
                onClick={() => setCurrentPage('settings' as Page)}
                className={`text-[11px] tracking-[4px] uppercase transition-all duration-300 relative pb-1 border-b opacity-50 hover:opacity-100 ${
                  currentPage === 'settings' 
                    ? 'text-water-light border-water-light/50' 
                    : 'text-water-light/60 border-transparent'
                } font-bold`}
              >
                Cài đặt
              </motion.button>
            )}
          </div>

          {/* Secret Admin Trigger */}
          <div className="opacity-0 hover:opacity-10 transition-opacity cursor-pointer text-[8px]" onClick={handleLogoClick}>
            {isAdmin ? "[Quản trị viên]" : "[Secret]"}
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-paper p-2 flex flex-col gap-1.5"
          >
            <div className="w-6 h-[1px] bg-paper" />
            <div className="w-6 h-[1px] bg-paper" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-[60] bg-water-deep flex flex-col items-center justify-center gap-8 md:hidden"
          >
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-8 right-8 text-paper"
            >
              Close
            </button>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMenuOpen(false);
                }}
                className="text-2xl font-serif"
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} className="text-xl opacity-50">Home</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-20 px-6 container mx-auto max-w-6xl min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="relative z-10 text-center py-10 opacity-30 text-xs tracking-widest uppercase">
          &copy; 2026 Crafted with Soul
      </footer>
    </div>
  );
}
