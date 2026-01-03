
import React, { useState, useEffect, useCallback } from 'react';
import { Page, BlogPost } from './types';
import { RESUME_MD, BLOG_POSTS } from './constants';
import MarkdownView from './components/MarkdownView';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [glitch, setGlitch] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>(['Save File Loaded...', 'Location: Valley Outpost', 'Weather: Clear']);
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);

  const triggerTransition = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 150);
  }, []);

  const navigate = useCallback((page: Page, post: BlogPost | null = null) => {
    triggerTransition();
    setCurrentPage(page);
    setSelectedPost(post);
    setTerminalHistory(prev => [...prev, `Action: Go to ${page}${post ? ` (${post.id})` : ''}`]);
  }, [triggerTransition]);

  // Fetch GitHub Repos
  useEffect(() => {
    fetch('https://api.github.com/users/satriyop/repos?sort=updated&per_page=8')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
        }
        setLoadingRepos(false);
      })
      .catch(err => {
        console.error("Error fetching repos", err);
        setLoadingRepos(false);
      });
  }, []);

  // Keyboard Shortcuts Implementation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Avoid triggering shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case '1':
          navigate(Page.HOME);
          break;
        case '2':
          navigate(Page.RESUME);
          break;
        case '3':
          navigate(Page.BLOG);
          break;
        case 'Escape':
          if (currentPage === Page.POST) {
            navigate(Page.BLOG);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, navigate]);

  return (
    <div className={`min-h-screen relative flex flex-col md:flex-row transition-all duration-75 ${glitch ? 'grayscale' : ''}`}>
      
      {/* Inventory-Style Sidebar - Carved Wood Aesthetic */}
      <aside className="fixed left-0 top-0 h-full w-16 md:w-28 border-r-4 border-[#2b2626] flex flex-col items-center justify-between py-12 z-50 bg-[#4e4444] shadow-[4px_0px_0px_#352f2f]">
        <div className="vertical-text font-bold text-3xl tracking-[0.2em] rotate-180 text-[#55a630] select-none pixel-font crt-glow">
          PAMUNGKAS.ORG
        </div>
        <nav className="flex flex-col gap-10">
          <button 
            onClick={() => navigate(Page.HOME)}
            title="Shortcut: 1"
            className={`pixel-hover p-3 transform -rotate-90 origin-center text-sm font-bold tracking-tighter transition-all ${currentPage === Page.HOME ? 'bg-[#55a630] text-white scale-110' : 'text-[#fcf4cf] border-2 border-[#fcf4cf]'}`}
          >
            MENU
          </button>
          <button 
            onClick={() => navigate(Page.RESUME)}
            title="Shortcut: 2"
            className={`pixel-hover p-3 transform -rotate-90 origin-center text-sm font-bold tracking-tighter transition-all ${currentPage === Page.RESUME ? 'bg-[#55a630] text-white scale-110' : 'text-[#fcf4cf] border-2 border-[#fcf4cf]'}`}
          >
            BIO
          </button>
          <button 
            onClick={() => navigate(Page.BLOG)}
            title="Shortcut: 3"
            className={`pixel-hover p-3 transform -rotate-90 origin-center text-sm font-bold tracking-tighter transition-all ${currentPage === Page.BLOG ? 'bg-[#55a630] text-white scale-110' : 'text-[#fcf4cf] border-2 border-[#fcf4cf]'}`}
          >
            DATA
          </button>
        </nav>
        <div className="flex flex-col gap-2 items-center">
            <div className="w-2 h-2 bg-[#ae2012] rounded-full animate-pulse"></div>
            <div className="text-[10px] text-[#55a630] font-bold">LVL. 20</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-16 md:ml-28 p-8 md:p-24 overflow-y-auto">
        
        {/* Game Header */}
        <header className="mb-24 relative">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none m-0 text-[#fcf4cf] pixel-font crt-glow">
            SATRIYO<br/>
            <span className="text-[#55a630] block md:translate-x-16">PAMUNGKAS</span>
          </h1>
          <div className="absolute -top-4 -right-4 bg-[#ae2012] text-white text-xs px-3 py-1 font-bold transform rotate-6 border-2 border-white shadow-lg">
            LEGENDARY ARCHITECT
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="max-w-4xl space-y-20">
          {currentPage === Page.HOME && (
            <section className="space-y-16">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="inventory-border p-10 flex-1 relative group">
                  <h3 className="text-[#6eb6ff] text-3xl mb-6 pixel-font">QUEST_LOG</h3>
                  <p className="text-xl leading-relaxed opacity-90">
                    Satriyo is currently on a mission to modernize critical infrastructure. Armed with high-level certifications and 15+ years of experience in system architecture and digital transformation.
                  </p>
                  <div className="mt-8 text-sm text-[#55a630] font-bold">CURRENT_OBJECTIVE: SOLVE_CHAOS</div>
                </div>
                
                <div className="inventory-border p-10 flex-1 bg-[#352f2f]/30">
                  <h3 className="text-[#6eb6ff] text-3xl mb-6 pixel-font">ARCHIVE</h3>
                  <ul className="space-y-4">
                    {BLOG_POSTS.map(post => (
                      <li key={post.id}>
                        <button 
                          onClick={() => navigate(Page.POST, post)}
                          className="text-lg hover:text-[#55a630] transition-all block w-full text-left p-1 border-b border-[#2b2626]"
                        >
                          * {post.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* GitHub Contributions Section */}
              <div className="inventory-border p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[#6eb6ff] text-3xl pixel-font">SKILL_GROWTH</h3>
                  <div className="text-[10px] text-[#55a630] font-bold uppercase tracking-widest">Git: satriyop</div>
                </div>
                <div className="bg-[#2b2626]/40 p-4 rounded border-2 border-[#2b2626] overflow-x-auto">
                  <img 
                    src="https://ghchart.rshah.org/55a630/satriyop" 
                    alt="satriyop's GitHub contributions" 
                    className="w-full min-w-[600px] pixelated-img opacity-90 hover:opacity-100 transition-opacity"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="mt-4 text-[10px] text-right text-[#fcf4cf]/40 italic">
                  * Historical data fetched from the decentralized archives
                </div>
              </div>

              {/* Public Repositories as Inventory Slots */}
              <div className="space-y-6">
                <h3 className="text-[#6eb6ff] text-3xl pixel-font">PUBLIC_ARTIFACTS</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {loadingRepos ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="inventory-border p-4 text-center animate-pulse h-24 flex items-center justify-center">
                        <div className="text-[#2b2626] font-bold text-xs uppercase pixel-font">Loading...</div>
                      </div>
                    ))
                  ) : repos.length > 0 ? (
                    repos.map(repo => (
                      <a 
                        key={repo.id} 
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inventory-border p-4 text-center group cursor-pointer transition-all hover:scale-105 block no-underline"
                      >
                        <div className="text-[10px] text-[#6eb6ff] mb-2 opacity-50 uppercase truncate">
                          {repo.language || 'Code'}
                        </div>
                        <div className="text-base font-bold pixel-font text-[#55a630] group-hover:text-white truncate" title={repo.name}>
                          {repo.name}
                        </div>
                        <div className="mt-2 text-[8px] text-[#fcf4cf]/40 uppercase">★ {repo.stargazers_count}</div>
                      </a>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-8 border-2 border-dashed border-[#2b2626] text-[#ae2012]">
                      No artifacts discovered in this sector.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {currentPage === Page.RESUME && (
            <div className="inventory-border p-8 md:p-16">
              <div className="mb-12 border-b-4 border-[#55a630] pb-6">
                <h2 className="text-5xl text-[#55a630] pixel-font">ADVENTURER_BIO.TXT</h2>
              </div>
              <MarkdownView content={RESUME_MD} />
            </div>
          )}

          {currentPage === Page.BLOG && (
            <div className="space-y-16">
              <h2 className="text-6xl text-[#6eb6ff] pixel-font border-l-8 border-[#6eb6ff] pl-6">SCROLL_DUMP</h2>
              {BLOG_POSTS.map(post => (
                <article 
                  key={post.id} 
                  className="inventory-border p-8 cursor-pointer hover:bg-[#352f2f] transition-all group relative"
                  onClick={() => navigate(Page.POST, post)}
                >
                  <div className="absolute top-4 right-4 text-xs font-bold text-[#55a630]">{post.date}</div>
                  <h2 className="text-4xl font-black pixel-font mb-4 group-hover:translate-x-4 transition-transform">{post.title}</h2>
                  <div className="text-sm uppercase font-bold tracking-widest text-[#6eb6ff]">Read Knowledge Fragment</div>
                </article>
              ))}
            </div>
          )}

          {currentPage === Page.POST && selectedPost && (
            <div className="inventory-border p-8 md:p-16">
              <button 
                onClick={() => navigate(Page.BLOG)}
                title="Shortcut: Escape"
                className="mb-12 bg-[#2b2626] text-[#fcf4cf] border-2 border-[#fcf4cf] px-6 py-2 text-sm font-bold hover:bg-[#55a630] transition-colors pixel-font"
              >
                &lt; EXIT_RECORDS [ESC]
              </button>
              <MarkdownView content={selectedPost.content} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Status Bar */}
      <footer className="fixed bottom-6 right-6 md:right-16 w-64 border-4 border-[#2b2626] bg-[#4e4444] p-4 font-mono z-40 shadow-[8px_8px_0px_#2b2626]">
        <div className="flex justify-between items-center border-b border-[#2b2626] mb-3 pb-1">
            <div className="text-[#55a630] font-bold text-xs uppercase pixel-font">Status Window</div>
            <div className="text-[#ae2012] text-xs">● Live</div>
        </div>
        <div className="space-y-2 text-[11px] font-bold">
          <div className="flex justify-between"><span>ENERGY:</span><span className="text-[#55a630]">█████████▒ 90%</span></div>
          <div className="flex justify-between"><span>GOLD:</span><span className="text-[#fcf4cf]">15,420g</span></div>
          <div className="flex justify-between text-[9px] mt-2 border-t border-[#2b2626]/30 pt-1">
            <span className="text-[#6eb6ff] opacity-70">HOTKEYS: [1][2][3]</span>
            {currentPage === Page.POST && <span className="text-[#ae2012] opacity-70">[ESC] BACK</span>}
          </div>
          <div className="mt-1 text-[#6eb6ff] uppercase truncate overflow-hidden">
            {terminalHistory[terminalHistory.length - 1].split(':').pop()?.trim()}
          </div>
        </div>
      </footer>

      {/* Background Flavor Text */}
      <div className="fixed bottom-0 right-0 text-[25vh] font-black text-black/5 pointer-events-none select-none -z-10 pixel-font leading-none text-right">
        VALLEY<br/>DATA
      </div>
    </div>
  );
};

export default App;
