
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page, BlogPost, GithubEvent } from './types';
import { RESUME_MD, BLOG_POSTS } from './constants';
import MarkdownView from './components/MarkdownView';
import CommitItem from './components/CommitItem';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [lastPage, setLastPage] = useState<Page>(Page.HOME);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [glitch, setGlitch] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>(['Save File Loaded...', 'Location: Valley Outpost', 'Weather: Clear']);
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [githubEvents, setGithubEvents] = useState<GithubEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [activeProjectCommits, setActiveProjectCommits] = useState<any[]>([]);
  const [activeProjectName, setActiveProjectName] = useState<string>('');
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const triggerTransition = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 150);
  }, []);

  const navigate = useCallback((page: Page, post: BlogPost | null = null) => {
    triggerTransition();
    if (page !== Page.POST) {
      setLastPage(page);
    } else {
      setLastPage(currentPage);
    }
    setCurrentPage(page);
    setSelectedPost(post);
    setTerminalHistory(prev => [...prev, `Action: Go to ${page}${post ? ` (${post.id})` : ''}`]);
  }, [triggerTransition, currentPage]);

  // Detect and fetch latest active project commits
  useEffect(() => {
    const latestPush = githubEvents.find(e => e.type === 'PushEvent');
    if (latestPush) {
      const repoName = latestPush.repo.name;
      setActiveProjectName(repoName);
      
      fetch(`/api/repos/${repoName}/commits?per_page=6`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setActiveProjectCommits(data);
          }
        })
        .catch(err => console.error("Error fetching project commits", err));
    }
  }, [githubEvents]);

  // Scroll chart to end (latest) on mount
  useEffect(() => {
    if (chartContainerRef.current) {
      const el = chartContainerRef.current;
      // Use a small timeout to ensure the DOM has rendered and scrollWidth is accurate
      setTimeout(() => {
        el.scrollLeft = el.scrollWidth;
      }, 100);
    }
  }, [currentPage]);

  const handleRepoClick = useCallback((repo: any) => {
    setTerminalHistory(prev => [...prev, `Fetching README for ${repo.name}...`]);

    fetch(`/api/repos/${repo.full_name}/readme`)
      .then(res => {
        if (!res.ok) throw new Error('README not found');
        return res.json();
      })
      .then(data => {
        // GitHub API returns content in base64
        const content = decodeURIComponent(escape(atob(data.content)));
        const post: BlogPost = {
          id: `repo-${repo.id}`,
          title: `PROJECT: ${repo.name.toUpperCase()}`,
          date: new Date(repo.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          }),
          content: content
        };
        navigate(Page.POST, post);
      })
      .catch(err => {
        console.error("Error fetching README", err);
        setTerminalHistory(prev => [...prev, `Error: README unavailable. Redirecting to external site.`]);
        window.open(repo.html_url, '_blank', 'noopener,noreferrer');
      });
  }, [navigate]);

  const handleCommitClick = useCallback((event: GithubEvent, message: string, sha: string) => {
    const post: BlogPost = {
      id: event.id,
      title: `COMMIT: ${sha.substring(0, 7)}`,
      date: new Date(event.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
      content: `# ${event.repo.name}
## Commit: ${sha}

### Message
${message}

---
[View on GitHub](https://github.com/${event.repo.name}/commit/${sha})`
    };
    navigate(Page.POST, post);
  }, [navigate]);

  // Fetch GitHub Repos
  useEffect(() => {
    console.log("Fetching repos...");
    fetch('/api/users/satriyop/repos?sort=updated&per_page=8')
      .then(res => {
        console.log("Repos response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Repos data received:", data);
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

  // Fetch GitHub Events (Commits)
  useEffect(() => {
    console.log("Fetching events...");
    fetch('/api/users/satriyop/events')
      .then(res => {
        console.log("Events response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Events data received:", data);
        if (Array.isArray(data)) {
          setGithubEvents(data);
        }
        setLoadingEvents(false);
      })
      .catch(err => {
        console.error("Error fetching events", err);
        setLoadingEvents(false);
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
            navigate(lastPage);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, navigate, lastPage]);

  return (
    <div className={`min-h-screen relative flex flex-col md:flex-row transition-all duration-75 ${glitch ? 'grayscale' : ''} overflow-x-hidden`}>
      
      {/* Inventory-Style Sidebar - Carved Wood Aesthetic */}
      <aside className="fixed left-0 top-0 h-full w-16 md:w-28 border-r-4 border-[#2b2626] flex flex-col items-center justify-between py-6 md:py-12 z-50 bg-[#4e4444] shadow-[4px_0px_0px_#352f2f]">
        <div className="vertical-text font-bold text-2xl md:text-3xl tracking-[0.2em] rotate-180 text-[#55a630] select-none pixel-font crt-glow">
          PAMUNGKAS.ORG
        </div>
        <nav className="flex flex-col gap-8 md:gap-10">
          <button 
            onClick={() => navigate(Page.HOME)}
            title="Shortcut: 1"
            className={`pixel-hover p-2 md:p-3 transform -rotate-90 origin-center text-xs md:text-sm font-bold tracking-tighter transition-all ${currentPage === Page.HOME ? 'bg-[#55a630] text-white scale-110' : 'text-[#fcf4cf] border-2 border-[#fcf4cf]'}`}
          >
            MENU
          </button>
          <button 
            onClick={() => navigate(Page.RESUME)}
            title="Shortcut: 2"
            className={`pixel-hover p-2 md:p-3 transform -rotate-90 origin-center text-xs md:text-sm font-bold tracking-tighter transition-all ${currentPage === Page.RESUME ? 'bg-[#55a630] text-white scale-110' : 'text-[#fcf4cf] border-2 border-[#fcf4cf]'}`}
          >
            BIO
          </button>
          <button 
            onClick={() => navigate(Page.BLOG)}
            title="Shortcut: 3"
            className={`pixel-hover p-2 md:p-3 transform -rotate-90 origin-center text-xs md:text-sm font-bold tracking-tighter transition-all ${currentPage === Page.BLOG ? 'bg-[#55a630] text-white scale-110' : 'text-[#fcf4cf] border-2 border-[#fcf4cf]'}`}
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
      <main className="flex-1 ml-16 md:ml-28 p-4 md:p-24 overflow-y-auto max-w-full overflow-x-hidden">
        
        {/* Game Header */}
        <header className="mb-12 md:mb-24 relative mt-4 md:mt-0">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none m-0 text-[#fcf4cf] pixel-font crt-glow">
            SATRIYO<br/>
            <span className="text-[#55a630] block md:translate-x-16">PAMUNGKAS</span>
          </h1>
          <div className="absolute -top-4 -right-4 md:-right-8 bg-[#ae2012] text-white text-[10px] md:text-xs px-2 md:px-3 py-1 font-bold transform rotate-6 border-2 border-white shadow-lg whitespace-nowrap">
            LEGENDARY ARCHITECT
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="max-w-4xl space-y-12 md:space-y-20 pb-24 md:pb-0">
          {currentPage === Page.HOME && (
            <section className="space-y-12 md:space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* QUEST_LOG */}
                <div className="inventory-border p-4 md:p-10 flex-1 relative group order-1 min-w-0">
                  <h3 className="text-[#6eb6ff] text-2xl md:text-3xl mb-4 md:mb-6 pixel-font">QUEST_LOG</h3>
                  <p className="text-base md:text-xl leading-relaxed opacity-90">
                    Satriyo is currently on a mission to modernize critical infrastructure. Armed with high-level certifications and 15+ years of experience in system architecture and digital transformation.
                  </p>
                  
                  {/* Digital Footsteps - Global Git Graph */}
                  <div className="mt-8 border-t-2 border-[#2b2626] pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[#55a630] text-sm pixel-font uppercase tracking-widest">
                        QUEST: {activeProjectName.split('/')[1] || 'Scanning...'}
                      </h4>
                      <div className="text-[8px] text-[#fcf4cf]/30 animate-pulse font-mono uppercase">Tracking Project History</div>
                    </div>
                    
                    <div className="relative ml-2 border-l-2 border-dashed border-[#55a630]/30 pl-8 space-y-8">
                      {activeProjectCommits.length === 0 ? (
                        <div className="text-[10px] opacity-50 uppercase italic">Awaiting project signal...</div>
                      ) : (
                        activeProjectCommits.map((c, idx) => {
                          const msg = c.commit.message;
                          const sha = c.sha;
                          const date = new Date(c.commit.author.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                          
                          return (
                            <div key={sha} className="relative group/node">
                              {/* Node Dot */}
                              <div className={`absolute -left-[41px] top-1 w-5 h-5 bg-[#4e4444] border-2 ${idx === 0 ? 'border-[#55a630]' : 'border-[#2b2626]'} flex items-center justify-center z-10 transition-colors group-hover/node:border-[#6eb6ff]`}>
                                {idx === 0 && <div className="w-2 h-2 bg-[#55a630] rounded-full animate-ping"></div>}
                                <div className={`w-1 h-1 ${idx === 0 ? 'bg-[#55a630]' : 'bg-[#2b2626]'} rounded-full`}></div>
                              </div>
                              
                              {/* Node Content */}
                              <div className="cursor-pointer" onClick={() => {
                                // Create a virtual event to use the handleCommitClick logic
                                const virtualEvent: GithubEvent = {
                                  id: sha,
                                  type: 'PushEvent',
                                  actor: { login: 'satriyop', avatar_url: '' },
                                  repo: { name: activeProjectName, url: `https://api.github.com/repos/${activeProjectName}` },
                                  payload: { commits: [{ sha, message: msg, url: '' }] },
                                  created_at: c.commit.author.date
                                };
                                handleCommitClick(virtualEvent, msg, sha);
                              }}>
                                <div className="text-[10px] font-bold text-[#6eb6ff] uppercase mb-1 flex justify-between items-center">
                                  <span>{sha.substring(0, 7)}</span>
                                  <span className="opacity-40">{date}</span>
                                </div>
                                <div className="text-xs opacity-70 leading-tight line-clamp-1 font-mono group-hover/node:opacity-100 group-hover/node:text-[#fcf4cf] transition-all">
                                  &gt; {msg}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      
                      {/* Terminal Path End */}
                      <div className="absolute -left-[35px] -bottom-4 text-[10px] text-[#55a630]/20 font-bold rotate-90 tracking-widest uppercase">
                        Origin
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-xs md:text-sm text-[#55a630] font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#55a630] rounded-full animate-pulse"></span>
                    CURRENT_OBJECTIVE: SOLVE_CHAOS
                  </div>
                </div>

                {/* SKILL_GROWTH (GitHub Chart) - Mobile: Order 2, Desktop: Order 3 (Bottom Full Width) */}
                <div className="inventory-border p-4 md:p-6 relative overflow-hidden order-2 md:order-3 md:col-span-2 min-w-0">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-[#6eb6ff] text-2xl md:text-3xl pixel-font">SKILL_GROWTH</h3>
                    <div className="text-[10px] text-[#55a630] font-bold uppercase tracking-widest">Git: satriyop</div>
                  </div>
                  <div ref={chartContainerRef} className="bg-[#2b2626]/40 p-2 md:p-4 rounded border-2 border-[#2b2626] overflow-x-auto max-w-full">
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
                
                {/* RECENT_LOGS - Mobile: Order 3, Desktop: Order 2 (Right Column) */}
                <div className="inventory-border p-4 md:p-10 flex-1 bg-[#352f2f]/30 order-3 md:order-2 min-w-0">
                  <h3 className="text-[#6eb6ff] text-2xl md:text-3xl mb-4 md:mb-6 pixel-font">RECENT_LOGS</h3>
                  <div className="space-y-4">
                    {loadingEvents ? (
                      <div className="text-[#55a630] font-bold animate-pulse text-sm">Loading datastream...</div>
                    ) : (
                      githubEvents
                        .filter(event => event.type === 'PushEvent')
                        .slice(0, 5)
                        .map(event => (
                          <CommitItem key={event.id} event={event} onClick={(msg, sha) => handleCommitClick(event, msg, sha)} />
                        ))
                    )}
                    {!loadingEvents && githubEvents.filter(e => e.type === 'PushEvent').length === 0 && (
                      <div className="opacity-50 text-sm">No recent logs found.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Public Repositories as Inventory Slots */}
              <div className="space-y-6">
                <h3 className="text-[#6eb6ff] text-2xl md:text-3xl pixel-font">PUBLIC_ARTIFACTS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                        onClick={(e) => {
                          e.preventDefault();
                          handleRepoClick(repo);
                        }}
                        className="inventory-border p-4 text-center group cursor-pointer transition-all hover:scale-105 block no-underline min-w-0"
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
            <div className="inventory-border p-6 md:p-16">
              <div className="mb-8 md:mb-12 border-b-4 border-[#55a630] pb-4 md:pb-6">
                <h2 className="text-3xl md:text-5xl text-[#55a630] pixel-font break-all md:break-normal">ADVENTURER_BIO.TXT</h2>
              </div>
              <MarkdownView content={RESUME_MD} />
            </div>
          )}

          {currentPage === Page.BLOG && (
            <div className="space-y-12 md:space-y-16">
              <h2 className="text-4xl md:text-6xl text-[#6eb6ff] pixel-font border-l-8 border-[#6eb6ff] pl-4 md:pl-6">DATA_STREAM</h2>
              {loadingEvents ? (
                <div className="inventory-border p-8 text-center animate-pulse">
                  <span className="text-xl pixel-font text-[#6eb6ff]">CONNECTING TO SATELLITE...</span>
                </div>
              ) : (
                <div className="grid gap-4 md:gap-6">
                  {githubEvents
                    .filter(event => event.type === 'PushEvent')
                    .slice(0, 10) // Show last 10 push events
                    .map(event => (
                      <CommitItem key={event.id} event={event} onClick={(msg, sha) => handleCommitClick(event, msg, sha)} />
                    ))}
                    {githubEvents.filter(event => event.type === 'PushEvent').length === 0 && (
                      <div className="inventory-border p-8 text-center text-[#ae2012]">
                        NO DATA SIGNALS DETECTED.
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          {currentPage === Page.POST && selectedPost && (
            <div className="inventory-border p-6 md:p-16">
              <button 
                onClick={() => navigate(lastPage)}
                title="Shortcut: Escape"
                className="mb-8 md:mb-12 bg-[#2b2626] text-[#fcf4cf] border-2 border-[#fcf4cf] px-4 md:px-6 py-2 text-xs md:text-sm font-bold hover:bg-[#55a630] transition-colors pixel-font"
              >
                &lt; EXIT_RECORDS [ESC]
              </button>
              <MarkdownView content={selectedPost.content} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Status Bar */}
      <footer className="fixed bottom-4 right-4 md:bottom-6 md:right-16 w-64 border-4 border-[#2b2626] bg-[#4e4444] p-4 font-mono z-40 shadow-[8px_8px_0px_#2b2626] origin-bottom-right scale-90 md:scale-100 hidden sm:block">
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
      <div className="fixed bottom-0 right-0 text-[15vh] md:text-[25vh] font-black text-black/5 pointer-events-none select-none -z-10 pixel-font leading-none text-right">
        VALLEY<br/>DATA
      </div>
    </div>
  );
};

export default App;
