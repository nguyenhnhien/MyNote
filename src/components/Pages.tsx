import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HandwritingText } from './HandwritingText';
import { Quote, Image as ImageIcon, MapPin, Feather, Plus, Book, Lock, Unlock, ChevronRight, ChevronLeft, Trash2, Edit3, Upload, Camera, XCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { uploadImage } from '../lib/storage';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query, 
  orderBy, 
  serverTimestamp,
  getDocs,
  where
} from 'firebase/firestore';
import { SiteConfig, Page, Story, Chapter } from '../types';
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

export const Home: React.FC<{ onExplore: () => void, config: SiteConfig, onAdminTrigger?: () => void }> = ({ onExplore, config, onAdminTrigger }) => (
  <PageTransition>
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] relative py-20">
      <div className="text-center z-10">
        <HandwritingText text={config.pageTitles.home || "nguyenhnhien"} onClick={onAdminTrigger} />
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0px' }}
          animate={{ opacity: 1, letterSpacing: '8px' }}
          transition={{ delay: 2.2, duration: 1.5 }}
          className="mt-8 text-[12px] uppercase font-medium tracking-[8px] text-white drop-shadow-lg"
        >
          {config.homeTagline || "Những vệt nước thời gian"}
        </motion.div>
      </div>
      
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        onClick={onExplore}
        className="mt-16 px-10 py-4 border border-white/40 rounded-full text-[10px] tracking-[4px] uppercase bg-black/20 hover:bg-white/10 backdrop-blur-sm transition-all group font-bold text-white shadow-xl"
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
               src={config.aboutImageUrl || "https://picsum.photos/seed/vintage-writer/800/1000"} 
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
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const title = prompt("Tiêu đề ảnh:");
      const desc = prompt("Mô tả:");
      const category = prompt("Danh mục (Phong cảnh / Nhân vật):") as "Phong cảnh" | "Nhân vật";

      if (title && desc && category) {
        try {
          const imageUrl = await uploadImage(file, 'gallery');
          await addDoc(collection(db, 'gallery'), {
            title,
            desc,
            category,
            seed: imageUrl, // Use the actual URL here now
            isUploaded: true,
            align: items.length % 2 === 0 ? 'right' : 'left',
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error("Lỗi khi thêm ảnh:", error);
          alert("Lỗi khi tải ảnh lên.");
        }
      }
    };
    fileInput.click();
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
                    src={item.isUploaded ? item.seed : `https://picsum.photos/seed/${item.seed}/1200/900`} 
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
                <p className="text-paper/60 font-serif text-lg leading-relaxed mx-auto md:mx-0">
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

export const Archive: React.FC<{ isAdmin: boolean, config: SiteConfig }> = ({ isAdmin, config }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [unlockPasswords, setUnlockPasswords] = useState<Record<string, string>>({});
  const [unlockedStories, setUnlockedStories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(docs);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedStory) {
      const q = query(
        collection(db, `stories/${selectedStory.id}/chapters`), 
        orderBy('chapterNumber', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        setChapters(docs);
      });
      return () => unsubscribe();
    } else {
      setChapters([]);
      setSelectedChapter(null);
    }
  }, [selectedStory]);

  const addStory = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const title = prompt("Tên bộ truyện:");
      const desc = prompt("Mô tả ngắn:");
      const isPrivate = confirm("Bộ truyện này có cần mật khẩu không?");
      let password = "";
      if (isPrivate) {
        password = prompt("Nhập mật khẩu cho bộ truyện:") || "";
      }
      
      if (title && desc) {
        try {
          const coverUrl = await uploadImage(file, 'stories');
          await addDoc(collection(db, 'stories'), {
            title,
            description: desc,
            author: "nguyenhnhien",
            coverUrl,
            isPrivate,
            password,
            createdAt: serverTimestamp()
          });
        } catch (error) {
          alert("Lỗi khi tải ảnh bìa lên.");
        }
      }
    };
    fileInput.click();
  };

  const addChapter = async () => {
    if (!selectedStory) return;
    const title = prompt("Tiêu đề chương:");
    const content = prompt("Nội dung chương:");
    const num = chapters.length + 1;
    
    if (title && content) {
      await addDoc(collection(db, `stories/${selectedStory.id}/chapters`), {
        storyId: selectedStory.id,
        chapterNumber: num,
        title,
        content,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleUnlock = (story: Story) => {
    const input = unlockPasswords[story.id];
    if (input === story.password || isAdmin) {
      setUnlockedStories(prev => ({ ...prev, [story.id]: true }));
    } else {
      alert("Mật khẩu không chính xác.");
    }
  };

  const deleteStory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Xóa toàn bộ truyện và các chương liên quan?")) {
      await deleteDoc(doc(db, 'stories', id));
    }
  };

  if (selectedChapter && selectedStory) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-12">
          <button 
            onClick={() => setSelectedChapter(null)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={14} /> Quay lại danh sách chương
          </button>
          
          <article className="glass p-12 rounded-[40px] space-y-10 min-h-[60vh]">
            <header className="text-center space-y-4 border-b border-white/5 pb-10">
              <div className="text-[10px] uppercase tracking-[4px] opacity-40">Chương {selectedChapter.chapterNumber}</div>
              <h2 className="text-5xl font-arizona text-white">{selectedChapter.title}</h2>
            </header>
            
            <div className="font-spectral text-xl leading-relaxed text-paper whitespace-pre-line text-justify first-letter:text-5xl first-letter:font-ruthie first-letter:mr-3 first-letter:float-left first-letter:text-white">
              {selectedChapter.content}
            </div>
          </article>

          <div className="flex justify-between items-center py-10">
             <button 
               disabled={selectedChapter.chapterNumber <= 1}
               onClick={() => setSelectedChapter(chapters.find(c => c.chapterNumber === selectedChapter.chapterNumber - 1) || null)}
               className="flex items-center gap-4 text-[10px] uppercase tracking-[3px] opacity-40 hover:opacity-100 disabled:opacity-10 transition-all font-bold"
             >
               <ChevronLeft size={16} /> Chương trước
             </button>
             <button 
               disabled={selectedChapter.chapterNumber >= chapters.length}
               onClick={() => setSelectedChapter(chapters.find(c => c.chapterNumber === selectedChapter.chapterNumber + 1) || null)}
               className="flex items-center gap-4 text-[10px] uppercase tracking-[3px] opacity-40 hover:opacity-100 disabled:opacity-10 transition-all font-bold"
             >
               Chương sau <ChevronRight size={16} />
             </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (selectedStory) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-12">
          <button 
            onClick={() => setSelectedStory(null)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={14} /> Quay lại Lưu trữ
          </button>

          <div className="grid md:grid-cols-[1fr_2fr] gap-12">
            <div className="space-y-6">
              <div className="aspect-[3/4] glass rounded-3xl overflow-hidden p-3">
                <div className="w-full h-full bg-water-surface rounded-2xl flex items-center justify-center overflow-hidden">
                  {selectedStory.coverUrl ? (
                    <img src={selectedStory.coverUrl} className="w-full h-full object-cover" alt="Cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Book size={60} className="opacity-10" />
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-ruthie text-white">{selectedStory.title}</h3>
                <p className="text-sm text-paper/60 leading-relaxed font-spectral">{selectedStory.description}</p>
                {isAdmin && (
                  <button onClick={addChapter} className="w-full py-3 glass rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2">
                    <Plus size={14} /> Thêm chương mới
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[4px] opacity-40 border-b border-white/5 pb-4">Danh sách chương ({chapters.length})</h4>
              <div className="grid gap-3">
                {chapters.map(chapter => (
                  <button 
                    key={chapter.id}
                    onClick={() => setSelectedChapter(chapter)}
                    className="glass p-6 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all text-left"
                  >
                    <div className="space-y-1">
                      <div className="text-[9px] uppercase tracking-[2px] opacity-30">Chương {chapter.chapterNumber}</div>
                      <div className="text-lg font-arizona text-white/80 group-hover:text-white transition-colors">{chapter.title}</div>
                    </div>
                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
                {chapters.length === 0 && (
                  <div className="py-20 text-center opacity-20 italic">Chưa có chương nào được tải lên...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-16">
        <header className="text-center space-y-4">
           <h2 className="text-8xl font-ruthie text-white">{config.pageTitles.archive || "Khu vườn bí mật"}</h2>
           <p className="text-3xl font-amatic text-paper/40 tracking-[4px] uppercase">{config.pageSubtitles.archive || "Những câu chuyện chưa kể"}</p>
           {isAdmin && (
             <button onClick={addStory} className="mt-8 mx-auto px-8 py-3 glass rounded-full flex items-center gap-3 text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
               <Plus size={16} /> Tạo bộ truyện mới
             </button>
           )}
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {stories.map(story => {
            const isUnlocked = !story.isPrivate || unlockedStories[story.id] || isAdmin;
            return (
              <motion.div
                key={story.id}
                whileHover={{ y: -5 }}
                className="glass rounded-[32px] overflow-hidden flex flex-col group h-full relative"
              >
                <div className="aspect-[16/10] bg-water-surface relative">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10 overflow-hidden">
                     {story.coverUrl ? (
                       <img src={story.coverUrl} className="w-full h-full object-cover" alt="Cover" referrerPolicy="no-referrer" />
                     ) : (
                       <Book size={80} />
                     )}
                   </div>
                   {story.isPrivate && !isUnlocked && (
                     <div className="absolute inset-0 backdrop-blur-md bg-black/20 flex flex-col items-center justify-center p-6 space-y-4 text-center">
                        <Lock size={30} className="text-water-light animate-pulse" />
                        <div className="space-y-4">
                          <p className="text-[10px] uppercase tracking-[3px] opacity-70">Truyện này cần mật khẩu</p>
                          <div className="flex gap-2">
                             <input 
                               type="password"
                               placeholder="Mật mã..."
                               className="w-full bg-white/10 border border-white/20 px-4 py-2 rounded-full text-xs outline-none focus:border-water-light transition-colors"
                               value={unlockPasswords[story.id] || ''}
                               onChange={(e) => setUnlockPasswords(prev => ({ ...prev, [story.id]: e.target.value }))}
                             />
                             <button 
                               onClick={() => handleUnlock(story)}
                               className="px-4 py-2 bg-water-light text-water-deep rounded-full hover:scale-105 transition-transform"
                             >
                               <Unlock size={14} />
                             </button>
                          </div>
                        </div>
                     </div>
                   )}
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-arizona text-white group-hover:text-water-light transition-colors">{story.title}</h3>
                    <p className="text-xs text-paper/40 line-clamp-2 leading-relaxed italic">{story.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-6">
                    <button 
                      disabled={!isUnlocked}
                      onClick={() => setSelectedStory(story)}
                      className="text-[10px] uppercase tracking-[3px] font-bold text-white hover:text-water-light disabled:opacity-20 transition-colors flex items-center gap-2"
                    >
                      {isUnlocked ? "Đọc ngay" : "Bị khóa"} <ChevronRight size={14} />
                    </button>
                    {isAdmin && (
                      <button onClick={(e) => deleteStory(e, story.id)} className="text-red-400 opacity-20 hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {stories.length === 0 && (
          <div className="py-40 text-center opacity-20 font-ruthie text-4xl">Chưa có mẩu chuyện nào được lưu giấu...</div>
        )}
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

  const uploadAboutImage = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const url = await uploadImage(file, 'about');
        setLocalConfig(prev => ({ ...prev, aboutImageUrl: url }));
      } catch (e) {
        alert("Lỗi tải ảnh.");
      }
    };
    fileInput.click();
  };

  const uploadSlideImage = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const url = await uploadImage(file, 'bg');
        setLocalConfig(prev => ({ ...prev, slideImages: [...prev.slideImages, url] }));
      } catch (e) {
        alert("Lỗi tải ảnh.");
      }
    };
    fileInput.click();
  };

  const removeSlide = (idx: number) => {
    setLocalConfig(prev => ({
      ...prev,
      slideImages: prev.slideImages.filter((_, i) => i !== idx)
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
                <label className="text-[10px] uppercase tracking-widest opacity-40">Ảnh trang About Me</label>
                <div className="flex gap-4 items-center">
                  <input 
                    className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm flex-1 outline-none focus:border-water-light transition-colors"
                    value={localConfig.aboutImageUrl} 
                    onChange={e => setLocalConfig({...localConfig, aboutImageUrl: e.target.value})} 
                    placeholder="URL ảnh..."
                  />
                  <button onClick={uploadAboutImage} className="p-3 glass rounded-lg hover:bg-white/10 transition-colors" title="Tải ảnh lên từ thiết bị">
                    <Upload size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-widest opacity-40">Danh sách hình nền (Slideshow)</label>
                <div className="grid grid-cols-2 gap-4">
                  {localConfig.slideImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden glass p-1 group">
                       <img src={img} className="w-full h-full object-cover rounded-lg" alt={`Slide ${idx}`} />
                       <button 
                        onClick={() => removeSlide(idx)}
                        className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <XCircle size={14} />
                       </button>
                    </div>
                  ))}
                  <button 
                    onClick={uploadSlideImage}
                    className="aspect-video rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group"
                  >
                    <Plus size={24} className="opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    <span className="text-[8px] uppercase tracking-widest opacity-40">Thêm ảnh mới</span>
                  </button>
                </div>
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
