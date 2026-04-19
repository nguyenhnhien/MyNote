import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HandwritingText } from './HandwritingText';
import { Quote, Image as ImageIcon, MapPin, Feather, Plus } from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { SiteConfig, Page } from '../types';
import { updateConfig } from '../lib/config';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="flex-1 flex flex-col"
  >
    {children}
  </motion.div>
);

export const Home: React.FC<{ onExplore: () => void, config: SiteConfig }> = ({ onExplore, config }) => (
  <PageTransition>
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] relative py-20">
      <div className="text-center z-10">
        <HandwritingText text={config.pageTitles.home || "nguyenhnhien"} />
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0px' }}
          animate={{ opacity: 0.6, letterSpacing: '8px' }}
          transition={{ delay: 2.2, duration: 1.5 }}
          className="mt-8 text-[12px] uppercase font-light tracking-[8px] text-orange-100/70"
        >
          {config.homeTagline || "Những vệt nước thời gian"}
        </motion.div>
      </div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        onClick={onExplore}
        className="mt-16 px-10 py-4 border border-white/20 rounded-full text-[10px] tracking-[4px] uppercase hover:bg-white/5 transition-all group font-light text-orange-50/80"
      >
        Khám phá
      </motion.button>

      {/* Gallery Glimpse pattern from theme */}
      <div className="absolute bottom-10 right-0 hidden lg:flex flex-col items-end gap-4 p-4">
        <div className="text-[11px] uppercase tracking-[2px] text-white/50">Yên hoa lộng nguyệt</div>
        <div className="flex gap-2.5">
          <div className="w-14 h-18 glass rounded flex items-center justify-center text-[10px] text-white/40">Landscape</div>
          <div className="w-14 h-18 glass rounded border-white flex items-center justify-center text-[10px] text-white/80 bg-white/10">Character</div>
          <div className="w-14 h-18 glass rounded flex items-center justify-center text-[10px] text-white/40">Travel</div>
        </div>
      </div>

      {/* Footer credit from theme */}
      <div className="absolute bottom-10 left-0 hidden lg:block text-[10px] tracking-[1px] opacity-40 uppercase font-light p-4">
        EST. 2024 • PERSONAL ARCHIVE
      </div>
    </div>
  </PageTransition>
);

export const About: React.FC<{ config: SiteConfig, isAdmin: boolean }> = ({ config, isAdmin }) => (
  <PageTransition>
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h2 className="text-7xl font-ruthie text-white">{config.pageTitles.about || "About me"}</h2>
        <div className="w-16 h-[1px] bg-water-light mx-auto" />
      </header>
      
      <div className="grid md:grid-cols-[2fr_3fr] gap-12 items-center">
        <div className="relative group">
          <div className="aspect-[4/5] bg-water-surface rounded-2xl overflow-hidden border border-white/10">
             <img 
               src="https://picsum.photos/seed/vintage-writer/800/1000" 
               alt="About me" 
               className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 glass rounded-full flex items-center justify-center animate-spin-slow">
            <span className="text-[10px] uppercase tracking-widest text-center px-4 font-bold opacity-40">Creative Soul • Wanderer • Dreamer</span>
          </div>
        </div>
        
        <div className="space-y-8 text-paper font-spectral font-semibold leading-relaxed text-xl">
          <div className="italic border-l-2 border-water-light pl-6 py-2 bg-white/5 rounded-r-lg">
            “Đời này có hai lời hứa, một với bản thân, hai với quê hương. Tuổi trẻ phải giữ lời với bản thân mới có cơ hội hoàn thành hai ước nguyện cuộc đời”.
          </div>
          <p>
            Ngược dòng Trước - Sau, xin về với quê hương, về với bản thân.
          </p>
          <p className="font-ruthie text-4xl text-white/80">
            Kiếp này nếu không còn gì vướng bận, tôi thuộc về những vần thơ.
          </p>
          <div className="pt-6 flex gap-6">
             <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60">
               <MapPin size={14} className="text-water-light" />
               Quê hương trong tim
             </div>
             <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-60">
               <Feather size={14} className="text-water-light" />
               Tình yêu thơ ca
             </div>
          </div>
        </div>
      </div>
    </div>
  </PageTransition>
);

export const Poems: React.FC<{ isAdmin: boolean, config: SiteConfig }> = ({ isAdmin, config }) => {
  const [poems, setPoems] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'poems'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPoems(docs);
    });
    return () => unsubscribe();
  }, []);

  const addPoem = async () => {
    const title = prompt("Tiêu đề bài thơ:");
    const date = prompt("Ngày sáng tác (vd: 18.04.2026):");
    const content = prompt("Nội dung bài thơ:");
    if (title && date && content) {
      try {
        await addDoc(collection(db, 'poems'), {
          title,
          date,
          content,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Lỗi khi bài thơ:", error);
        alert("Lỗi khi lưu bài thơ. Vui lòng kiểm tra quyền truy cập.");
      }
    }
  };

  const deletePoem = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài thơ này không?")) {
      await deleteDoc(doc(db, 'poems', id));
    }
  };

  const editPoem = async (poem: any) => {
    const title = prompt("Tiêu đề bài thơ:", poem.title);
    const content = prompt("Nội dung bài thơ:", poem.content);
    const date = prompt("Ngày sáng tác:", poem.date);
    if (title && content && date) {
      await updateDoc(doc(db, 'poems', poem.id), { title, content, date });
    }
  };

  return (
    <PageTransition>
      <div className="space-y-20">
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-8xl font-ruthie text-white">{config.pageTitles.poems || "Người tình mùa đông"}</h2>
          <p className="text-4xl font-amatic text-paper/60 tracking-[4px]">{config.pageSubtitles.poems || "Tôi thuộc về những vần thơ"}</p>
          {isAdmin && (
            <button onClick={addPoem} className="mt-6 flex items-center gap-2 mx-auto px-6 py-2 glass rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
              <Plus size={14} /> Thêm bài thơ mới
            </button>
          )}
        </header>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {poems.map((poem) => (
            <motion.article 
              key={poem.id}
              whileHover={{ y: -10 }}
              className="glass p-10 rounded-3xl space-y-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote size={40} />
              </div>
              <h3 className="text-3xl font-arizona text-white">{poem.title}</h3>
              <div className="space-y-2 font-spectral font-semibold leading-relaxed text-paper whitespace-pre-line">
                 {poem.content}
              </div>
              <div className="pt-6 font-[Courier_New] italic text-[10px] uppercase tracking-[0.2em] opacity-40">SÁNG TÁC: {poem.date}</div>
              
              {isAdmin && (
                <div className="flex gap-4 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editPoem(poem)} className="text-xs uppercase tracking-widest text-water-light hover:underline underline-offset-4">Sửa</button>
                  <button onClick={() => deletePoem(poem.id)} className="text-xs uppercase tracking-widest text-red-400 hover:underline underline-offset-4">Xóa</button>
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export const Prose: React.FC<{ isAdmin: boolean, config: SiteConfig }> = ({ isAdmin, config }) => {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'prose'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(docs);
    });
    return () => unsubscribe();
  }, []);

  const addEntry = async () => {
    const title = prompt("Tiêu đề bài viết:");
    const date = prompt("Ngày tháng (vd: December 20, 2023):");
    const excerpt = prompt("Nội dung tóm tắt:");
    if (title && date && excerpt) {
      try {
        await addDoc(collection(db, 'prose'), {
          title,
          date,
          excerpt,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Lỗi khi thêm bài viết:", error);
      }
    }
  };

  const deleteProse = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      await deleteDoc(doc(db, 'prose', id));
    }
  };

  const editProse = async (item: any) => {
    const title = prompt("Tiêu đề bài viết:", item.title);
    const excerpt = prompt("Nội dung:", item.excerpt);
    const date = prompt("Ngày tháng:", item.date);
    if (title && excerpt && date) {
      await updateDoc(doc(db, 'prose', item.id), { title, excerpt, date });
    }
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="text-center space-y-4">
          <h2 className="text-8xl font-ruthie text-white">{config.pageTitles.prose || "Viết lên gồng xiềng"}</h2>
          <p className="text-4xl font-amatic text-paper/60 tracking-[4px]">{config.pageSubtitles.prose || "Một thế giới khác"}</p>
          {isAdmin && (
            <button onClick={addEntry} className="mt-6 flex items-center gap-2 mx-auto px-6 py-2 glass rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
              <Plus size={14} /> Thêm bài viết mới
            </button>
          )}
        </header>

        <div className="space-y-24">
          {entries.map((item) => (
            <article key={item.id} className="relative pl-12 border-l border-white/10 space-y-6 group">
              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-white/30" />
              <div className="flex items-center gap-4 font-[Courier_New] italic text-[10px] tracking-[3px] uppercase opacity-40">
                <span>{item.date}</span>
              </div>
              <h3 className="text-4xl font-arizona text-white">{item.title}</h3>
              <div className="space-y-6 font-spectral font-semibold text-lg leading-relaxed text-paper">
                <p>{item.excerpt}</p>
              </div>
              <div className="flex gap-6 items-center">
                <button className="text-white/60 text-[10px] uppercase tracking-[3px] hover:text-white transition-colors border-b border-white/20 pb-1">Đọc tiếp</button>
                {isAdmin && (
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editProse(item)} className="text-[10px] uppercase tracking-[3px] text-water-light hover:underline">Sửa</button>
                    <button onClick={() => deleteProse(item.id)} className="text-[10px] uppercase tracking-[3px] text-red-400 hover:underline">Xóa</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export const Gallery: React.FC<{ isAdmin: boolean, config: SiteConfig }> = ({ isAdmin, config }) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(docs);
    });
    return () => unsubscribe();
  }, []);

  const addItem = async () => {
    const title = prompt("Tiêu đề ảnh:");
    const desc = prompt("Mô tả:");
    const category = prompt("Danh mục (Phong cảnh / Nhân vật):") as "Phong cảnh" | "Nhân vật";
    if (title && desc && category) {
      try {
        await addDoc(collection(db, 'gallery'), {
          title,
          desc,
          category,
          seed: 'img-' + Date.now(),
          align: items.length % 2 === 0 ? 'right' : 'left',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Lỗi khi thêm ảnh:", error);
      }
    }
  };

  const deleteItem = async (id: string) => {
    if (confirm("Xác nhận xóa ảnh này?")) {
      await deleteDoc(doc(db, 'gallery', id));
    }
  };

  return (
    <PageTransition>
      <div className="space-y-20">
        <header className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-9xl font-ruthie text-white tracking-tight">{config.pageTitles.gallery || "Yên hoa lộng nguyệt"}</h2>
          <p className="text-4xl font-amatic text-paper/50 tracking-[4px]">{config.pageSubtitles.gallery || "Nơi những mảnh ghép ký ức và giấc mơ hội ngộ"}</p>
          <div className="flex justify-center gap-6 pt-4 flex-wrap">
             {['Tất cả', 'Phong cảnh', 'Nhân vật'].map(category => (
               <button key={category} className="text-[10px] uppercase tracking-[4px] opacity-40 hover:opacity-100 transition-opacity pb-2 border-b border-transparent hover:border-white/20">
                 {category}
               </button>
             ))}
             {isAdmin && (
               <button onClick={addItem} className="text-[10px] uppercase tracking-[4px] text-water-light flex items-center gap-2 border-b border-white/10 pb-2">
                 <Plus size={12} /> Thêm ảnh mới
               </button>
             )}
          </div>
        </header>

        <div className="flex flex-col gap-32 pt-10">
          {items.map((item) => (
            <motion.div 
              key={item.id}
              className={`flex flex-col ${item.align === 'left' ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center group`}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 50 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-3xl overflow-hidden glass p-3 relative">
                <div className="w-full h-full rounded-2xl overflow-hidden">
                  <img 
                    src={`https://picsum.photos/seed/${item.seed}/1200/900`} 
                    alt={item.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="absolute top-6 right-6 w-10 h-10 glass rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    X
                  </button>
                )}
              </div>
              <div className={`w-full md:w-1/2 space-y-6 ${item.align === 'left' ? 'text-left' : 'text-right'}`}>
                <div className="text-[10px] uppercase tracking-[4px] text-water-light font-bold opacity-60">{item.category}</div>
                <h3 className="text-4xl font-serif text-white">{item.title}</h3>
                <p className="text-paper/60 font-serif text-lg leading-relaxed max-w-md mx-auto md:mx-0">
                  {item.desc}
                </p>
                <div className="pt-4 flex items-center justify-start md:justify-end gap-4">
                  <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-all">
                    <ImageIcon size={18} className="opacity-40" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export const SystemSettings: React.FC<{ config: SiteConfig }> = ({ config }) => {
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);

  const save = async () => {
    try {
      await updateConfig(localConfig);
      alert("Cài đặt đã được lưu!");
    } catch (e) {
      alert("Lỗi khi lưu cài đặt.");
    }
  };

  const updateLabel = (id: string, val: string) => {
    setLocalConfig(prev => ({
      ...prev,
      navLabels: { ...prev.navLabels, [id]: val }
    }));
  };

  const updateTitle = (id: string, val: string) => {
    setLocalConfig(prev => ({
      ...prev,
      pageTitles: { ...prev.pageTitles, [id]: val }
    }));
  };

  const updateSubtitle = (id: string, val: string) => {
    setLocalConfig(prev => ({
      ...prev,
      pageSubtitles: { ...prev.pageSubtitles, [id]: val }
    }));
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        <header className="text-center space-y-4">
          <h2 className="text-6xl font-ruthie text-white">Cài đặt hệ thống</h2>
          <p className="text-paper/40 uppercase tracking-[4px] text-xs">Quản lý toàn bộ giao diện của bạn</p>
        </header>

        <div className="grid md:grid-cols-2 gap-12">
          <section className="glass p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-serif border-b border-white/10 pb-4">Điều hướng & Tiêu đề</h3>
            {Object.keys(config.navLabels).map(id => (
              <div key={id} className="space-y-4 pt-4 border-t border-white/5 first:border-0 first:pt-0">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">Tên Menu [{id}]</label>
                  <input 
                    className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm w-full outline-none focus:border-water-light transition-colors"
                    value={localConfig.navLabels[id]} 
                    onChange={e => updateLabel(id, e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40">Tiêu đề chính [{id}]</label>
                  <input 
                    className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm w-full outline-none focus:border-water-light transition-colors"
                    value={localConfig.pageTitles[id]} 
                    onChange={e => updateTitle(id, e.target.value)} 
                  />
                </div>
                {id !== 'home' && id !== 'about' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40">Tiêu đề phụ [{id}]</label>
                    <input 
                      className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm w-full outline-none focus:border-water-light transition-colors"
                      value={localConfig.pageSubtitles[id]} 
                      onChange={updateSubtitle === undefined ? () => {} : (e) => updateSubtitle(id, e.target.value)} 
                    />
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-12">
            <div className="glass p-8 rounded-3xl space-y-6">
              <h3 className="text-xl font-serif border-b border-white/10 pb-4">Giao diện Trang chủ</h3>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Tagline (Dưới cùng)</label>
                <input 
                  className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm w-full outline-none focus:border-water-light transition-colors"
                  value={localConfig.homeTagline} 
                  onChange={e => setLocalConfig({...localConfig, homeTagline: e.target.value})} 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Chế độ hình nền</label>
                <select 
                  className="bg-water-deep border border-white/10 p-3 rounded-lg text-sm w-full outline-none focus:border-water-light transition-colors"
                  value={localConfig.bgMode}
                  onChange={e => setLocalConfig({...localConfig, bgMode: e.target.value as any})}
                >
                  <option value="auto">Ngẫu nhiên (Auto)</option>
                  <option value="water">Gợn sóng mặt nước</option>
                  <option value="slideshow">Trình chiếu ảnh</option>
                </select>
              </div>
            </div>

            <button 
              onClick={save}
              className="w-full py-6 bg-water-light text-water-deep font-bold uppercase tracking-[8px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-water-light/20"
            >
              Lưu thay đổi
            </button>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};
