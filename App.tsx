
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Page, BlogPost, GithubEvent, GithubRepo, GithubReadmeResponse, GithubCommitDetail, XSignal } from './types';
import MarkdownView from './components/MarkdownView';
import CommitItem from './components/CommitItem';
import CharacterSheet from './components/CharacterSheet';
import { SidebarSocials, HeroSocials, SocialIcon } from './components/SocialLinks';

function isXSignalItem(value: unknown): value is XSignal {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.url === 'string' &&
    (item.url.startsWith('https://x.com/') || item.url.startsWith('https://twitter.com/')) &&
    typeof item.created_at === 'string' &&
    typeof item.text === 'string'
  );
}

function parseXSignal(data: unknown): XSignal[] | null {
  if (!Array.isArray(data)) return null;
  const items = data.filter(isXSignalItem);
  if (data.length > 0 && items.length === 0) return null;
  return items;
}

function formatSignalDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  PHP: '#8892be',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Shell: '#89e051',
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [lastPage, setLastPage] = useState<Page>(Page.HOME);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [glitch, setGlitch] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>(['Save File Loaded...', 'Location: Valley Outpost', 'Weather: Clear']);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [reposError, setReposError] = useState<string | null>(null);
  const [githubEvents, setGithubEvents] = useState<GithubEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [activeProjectCommits, setActiveProjectCommits] = useState<GithubCommitDetail[]>([]);
  const [activeProjectName, setActiveProjectName] = useState<string>('');
  const [xSignal, setXSignal] = useState<XSignal[]>([]);
  const [loadingXSignal, setLoadingXSignal] = useState(true);
  const [xSignalError, setXSignalError] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const triggerTransition = useCallback(() => {
    setGlitch(true);
    setTimeout(() => setGlitch(false), 160);
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

  const scrollChartToEnd = useCallback(() => {
    if (chartContainerRef.current) {
      chartContainerRef.current.scrollLeft = chartContainerRef.current.scrollWidth;
    }
  }, []);

  // Detect and fetch latest active project commits
  useEffect(() => {
    const latestPush = githubEvents.find(e => e.type === 'PushEvent');
    if (latestPush) {
      const repoName = latestPush.repo.name;
      setActiveProjectName(repoName);
      
      let isMounted = true;
      fetch(`/api/repos/${repoName}/commits?per_page=6`)
        .then(res => res.ok ? (res.json() as Promise<GithubCommitDetail[]>) : [])
        .then(data => {
          if (isMounted && Array.isArray(data)) {
            setActiveProjectCommits(data);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }
  }, [githubEvents]);

  // Scroll chart to end (latest) on mount and page switch
  useEffect(() => {
    scrollChartToEnd();
  }, [currentPage, scrollChartToEnd]);

  const handleRepoClick = useCallback((repo: GithubRepo) => {
    setTerminalHistory(prev => [...prev, `Fetching README for ${repo.name}...`]);

    fetch(`/api/repos/${repo.full_name}/readme`)
      .then(res => {
        if (!res.ok) throw new Error('README not found');
        return res.json() as Promise<GithubReadmeResponse>;
      })
      .then(data => {
        // GitHub API returns content in base64, clean any whitespace/newlines
        const cleanBase64 = data.content.replace(/\s/g, '');
        const binaryString = atob(cleanBase64);
        const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        const content = new TextDecoder('utf-8').decode(bytes);

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
    let isMounted = true;
    fetch('/api/users/satriyop/repos?sort=updated&per_page=8')
      .then(async (res) => {
        if (!res.ok) {
          const errData = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errData?.message || `HTTP ${res.status}`);
        }
        return res.json() as Promise<GithubRepo[]>;
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setRepos(data);
          }
          setLoadingRepos(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setReposError(err.message);
          setLoadingRepos(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch GitHub Events (Commits)
  useEffect(() => {
    let isMounted = true;
    fetch('/api/users/satriyop/events')
      .then(async (res) => {
        if (!res.ok) {
          const errData = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(errData?.message || `HTTP ${res.status}`);
        }
        return res.json() as Promise<GithubEvent[]>;
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setGithubEvents(data);
          }
          setLoadingEvents(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setEventsError(err.message);
          setLoadingEvents(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch X_SIGNAL (static same-origin JSON — no X API)
  useEffect(() => {
    let isMounted = true;
    fetch('/x-signal.json')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<unknown>;
      })
      .then((data) => {
        if (!isMounted) return;
        const parsed = parseXSignal(data);
        if (parsed === null) {
          setXSignalError(true);
          setXSignal([]);
        } else {
          setXSignal(parsed);
        }
        setLoadingXSignal(false);
      })
      .catch(() => {
        if (isMounted) {
          setXSignalError(true);
          setXSignal([]);
          setLoadingXSignal(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
    <div className={`min-h-screen relative flex flex-col md:flex-row transition-all duration-75 ${glitch ? 'crt-glitch grayscale' : ''} overflow-x-hidden`}>
      
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#4e4444] border-b-4 border-[#2b2626] shadow-[0_4px_0_#221e1e] sticky top-0 z-50">
        <div className="font-bold text-lg tracking-wider text-[#55a630] pixel-font crt-glow">
          PAMUNGKAS.ORG
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <a
            href="mailto:satriyo@pamungkas.org"
            title="Email: satriyo@pamungkas.org"
            className="w-7 h-7 flex items-center justify-center bg-[#352f2f] border border-[#2b2626] text-[#6eb6ff] hover:text-[#55a630] hover:border-[#55a630] rounded-sm transition-all"
          >
            <SocialIcon id="email" className="w-3.5 h-3.5" />
          </a>
          <span className="w-2 h-2 bg-[#55a630] rounded-full animate-pulse"></span>
          <span className="text-[#fcf4cf] font-bold">LVL. 20</span>
          <span className="text-[#6eb6ff] font-bold">ONLINE</span>
        </div>
      </header>

      {/* Desktop Inventory-Style Sidebar - Carved Wood Aesthetic */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-28 border-r-4 border-[#2b2626] flex-col items-center justify-between py-6 z-50 bg-[#4e4444] shadow-[4px_0px_0px_#221e1e] overflow-y-auto">
        {/* Brand Crest */}
        <div 
          onClick={() => navigate(Page.HOME)} 
          className="flex flex-col items-center cursor-pointer group select-none"
          title="Return to Home [1]"
        >
          <div className="w-10 h-10 border-2 border-[#55a630] bg-[#352f2f] shadow-[2px_2px_0_#221e1e] flex items-center justify-center text-[#55a630] font-black pixel-font text-lg group-hover:bg-[#55a630] group-hover:text-white transition-all pixel-press">
            P
          </div>
          <span className="text-[9px] font-mono font-bold text-[#55a630] mt-1 tracking-wider">
            PAMUNGKAS
          </span>
          <span className="text-[8px] font-mono text-[#fcf4cf]/60 -mt-0.5 font-bold">
            .ORG
          </span>
        </div>

        {/* Command Navigation */}
        <nav className="flex flex-col gap-2.5 w-full px-3">
          <button 
            onClick={() => navigate(Page.HOME)}
            title="Shortcut: 1"
            className={`w-full py-2 px-1 text-center font-bold text-xs pixel-font tracking-wider transition-all pixel-press border-2 ${
              currentPage === Page.HOME 
                ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]' 
                : 'text-[#fcf4cf] border-[#2b2626] bg-[#352f2f] hover:border-[#fcf4cf]'
            }`}
          >
            [1] MENU
          </button>
          <button 
            onClick={() => navigate(Page.RESUME)}
            title="Shortcut: 2"
            className={`w-full py-2 px-1 text-center font-bold text-xs pixel-font tracking-wider transition-all pixel-press border-2 ${
              currentPage === Page.RESUME 
                ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]' 
                : 'text-[#fcf4cf] border-[#2b2626] bg-[#352f2f] hover:border-[#fcf4cf]'
            }`}
          >
            [2] BIO
          </button>
          <button 
            onClick={() => navigate(Page.BLOG)}
            title="Shortcut: 3"
            className={`w-full py-2 px-1 text-center font-bold text-xs pixel-font tracking-wider transition-all pixel-press border-2 ${
              currentPage === Page.BLOG 
                ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]' 
                : 'text-[#fcf4cf] border-[#2b2626] bg-[#352f2f] hover:border-[#fcf4cf]'
            }`}
          >
            [3] DATA
          </button>
        </nav>

        {/* Comms Array */}
        <SidebarSocials />

        {/* Status Beacon */}
        <div className="flex flex-col items-center gap-1 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#55a630] rounded-full animate-pulse"></span>
            <span className="text-[9px] font-mono font-bold text-[#55a630]">ONLINE</span>
          </div>
          <div className="text-[9px] font-mono text-[#fcf4cf]/75 font-bold">LVL. 20</div>
        </div>
      </aside>

      {/* Mobile Bottom Controller Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#4e4444] border-t-4 border-[#2b2626] px-3 py-2 shadow-[0_-4px_0_#221e1e] flex items-center justify-around">
        <button
          onClick={() => navigate(Page.HOME)}
          className={`pixel-hover px-4 py-1.5 text-xs font-bold pixel-font border-2 transition-all ${
            currentPage === Page.HOME
              ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]'
              : 'text-[#fcf4cf] border-[#fcf4cf] bg-[#352f2f]'
          }`}
        >
          [1] MENU
        </button>
        <button
          onClick={() => navigate(Page.RESUME)}
          className={`pixel-hover px-4 py-1.5 text-xs font-bold pixel-font border-2 transition-all ${
            currentPage === Page.RESUME
              ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]'
              : 'text-[#fcf4cf] border-[#fcf4cf] bg-[#352f2f]'
          }`}
        >
          [2] BIO
        </button>
        <button
          onClick={() => navigate(Page.BLOG)}
          className={`pixel-hover px-4 py-1.5 text-xs font-bold pixel-font border-2 transition-all ${
            currentPage === Page.BLOG
              ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]'
              : 'text-[#fcf4cf] border-[#fcf4cf] bg-[#352f2f]'
          }`}
        >
          [3] DATA
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-28 p-4 md:p-24 overflow-y-auto max-w-full overflow-x-hidden pb-24 md:pb-16">
        
        {/* Game Header */}
        <header className="mb-12 md:mb-24 relative mt-4 md:mt-0">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none m-0 text-[#fcf4cf] pixel-font crt-glow">
            SATRIYO<br/>
            <span className="text-[#55a630] block md:translate-x-16">PAMUNGKAS</span>
          </h1>
          <div className="absolute -top-4 -right-4 md:-right-8 bg-[#ae2012] text-white text-[10px] md:text-xs px-2 md:px-3 py-1 font-bold transform rotate-6 border-2 border-white shadow-lg whitespace-nowrap">
            LEGENDARY ARCHITECT
          </div>
          <HeroSocials />
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
                      <div className="text-[10px] text-[#fcf4cf]/75 font-mono uppercase tracking-wider">Project Signal Tracker</div>
                    </div>
                    
                    <div className="relative ml-2 border-l-2 border-dashed border-[#55a630]/60 pl-8 space-y-8">
                      {activeProjectCommits.length === 0 ? (
                        <div className="text-xs text-[#fcf4cf]/60 uppercase italic font-mono">Awaiting project signal...</div>
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
                              <button
                                type="button"
                                className="w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6eb6ff] rounded p-1 -m-1 transition-colors group/btn pixel-press block"
                                onClick={() => {
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
                                }}
                              >
                                <div className="text-[11px] font-bold text-[#6eb6ff] uppercase mb-1 flex justify-between items-center font-mono">
                                  <span className="bg-[#2b2626] px-1.5 py-0.5 border border-[#352f2f] rounded-sm">[{sha.substring(0, 7)}]</span>
                                  <span className="text-[#fcf4cf]/75">{date}</span>
                                </div>
                                <div className="text-xs text-[#fcf4cf]/85 leading-tight line-clamp-1 font-mono group-hover/btn:text-white transition-colors">
                                  &gt; {msg}
                                </div>
                              </button>
                            </div>
                          );
                        })
                      )}
                      
                      {/* Terminal Path End */}
                      <div className="absolute -left-[35px] -bottom-4 text-[10px] text-[#55a630]/80 font-bold rotate-90 tracking-widest uppercase font-mono">
                        Origin
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-xs md:text-sm text-[#55a630] font-bold flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 bg-[#55a630] rounded-full animate-pulse"></span>
                    CURRENT_OBJECTIVE: SOLVE_CHAOS
                  </div>
                </div>

                {/* SKILL_GROWTH (GitHub Chart) - Mobile: Order 2, Desktop: Order 3 (Bottom Full Width) */}
                <div className="inventory-border p-4 md:p-6 relative overflow-hidden order-2 md:order-3 md:col-span-2 min-w-0">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-[#6eb6ff] text-2xl md:text-3xl pixel-font">SKILL_GROWTH</h3>
                    <div className="text-xs text-[#55a630] font-bold uppercase tracking-widest font-mono">Git: satriyop</div>
                  </div>
                  <div ref={chartContainerRef} className="bg-[#2b2626]/40 p-2 md:p-4 rounded border-2 border-[#2b2626] overflow-x-auto max-w-full">
                    <img 
                      src="https://ghchart.rshah.org/55a630/satriyop" 
                      alt="satriyop's GitHub contributions" 
                      className="w-full min-w-[600px] pixelated-img opacity-90 hover:opacity-100 transition-opacity"
                      style={{ imageRendering: 'pixelated' }}
                      onLoad={scrollChartToEnd}
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0.5';
                      }}
                    />
                  </div>
                  <div className="mt-4 text-[11px] text-right text-[#fcf4cf]/75 font-mono italic">
                    * Historical data fetched from the decentralized archives
                  </div>
                </div>
                
                {/* RECENT_LOGS - Mobile: Order 3, Desktop: Order 2 (Right Column) */}
                <div className="inventory-border p-4 md:p-10 flex-1 bg-[#352f2f]/30 order-3 md:order-2 min-w-0">
                  <h3 className="text-[#6eb6ff] text-2xl md:text-3xl mb-4 md:mb-6 pixel-font">RECENT_LOGS</h3>
                  <div className="space-y-4">
                    {loadingEvents ? (
                      <div className="text-[#55a630] font-bold animate-pulse text-sm">Loading datastream...</div>
                    ) : eventsError ? (
                      <div className="text-[#ae2012] text-xs font-mono">
                        SIGNAL INTERRUPT: {eventsError}
                      </div>
                    ) : (
                      githubEvents
                        .filter(event => event.type === 'PushEvent')
                        .slice(0, 5)
                        .map(event => (
                          <CommitItem key={event.id} event={event} onClick={(msg, sha) => handleCommitClick(event, msg, sha)} />
                        ))
                    )}
                    {!loadingEvents && !eventsError && githubEvents.filter(e => e.type === 'PushEvent').length === 0 && (
                      <div className="opacity-70 text-sm font-mono">No recent logs found.</div>
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
                      <div key={i} className="inventory-border p-4 text-center animate-pulse h-28 flex items-center justify-center">
                        <div className="text-[#fcf4cf]/60 font-bold text-xs uppercase pixel-font">Loading...</div>
                      </div>
                    ))
                  ) : reposError ? (
                    <div className="col-span-full text-center p-8 border-2 border-dashed border-[#ae2012]/40 text-[#ae2012] font-mono text-xs">
                      SECTOR OFFLINE: {reposError}
                    </div>
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
                        className="inventory-border p-4 text-left group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#221e1e] block no-underline min-w-0 flex flex-col justify-between pixel-press"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#6eb6ff] font-bold uppercase tracking-wider">
                              <span 
                                className="w-2 h-2 rounded-full inline-block flex-shrink-0" 
                                style={{ backgroundColor: LANGUAGE_COLORS[repo.language || ''] || '#55a630' }}
                              />
                              <span className="truncate">{repo.language || 'Code'}</span>
                            </span>
                            <span className="text-[10px] text-[#fcf4cf] bg-[#2b2626] px-2 py-0.5 rounded-sm border border-[#352f2f] font-mono font-bold flex items-center gap-1 flex-shrink-0">
                              <span className="text-[#55a630]">★</span> {repo.stargazers_count}
                            </span>
                          </div>
                          <div className="text-base font-bold pixel-font text-[#55a630] group-hover:text-white truncate transition-colors" title={repo.name}>
                            {repo.name}
                          </div>
                          {repo.description && (
                            <p className="mt-2 text-xs text-[#fcf4cf]/80 line-clamp-2 font-mono leading-relaxed">
                              {repo.description}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-2 border-t border-[#2b2626] flex items-center justify-between text-[10px] text-[#fcf4cf]/70 font-mono uppercase">
                          <span>ACCESS ARCHIVE</span>
                          <span className="text-[#55a630] group-hover:text-white group-hover:translate-x-1 transition-all">&gt;</span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-8 border-2 border-dashed border-[#2b2626] text-[#ae2012] font-mono">
                      No artifacts discovered in this sector.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {currentPage === Page.RESUME && (
            <CharacterSheet />
          )}

          {currentPage === Page.BLOG && (
            <div className="space-y-12 md:space-y-16">
              {/* X_SIGNAL — static same-origin JSON */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl text-[#55a630] pixel-font border-l-8 border-[#55a630] pl-4 md:pl-6">
                  X_SIGNAL
                </h2>
                {loadingXSignal ? (
                  <div className="inventory-border p-8 text-center animate-pulse">
                    <span className="text-xl pixel-font text-[#55a630]">SCANNING FREQUENCY...</span>
                  </div>
                ) : xSignalError ? (
                  <div className="inventory-border p-8 text-center text-[#ae2012] font-mono text-sm">
                    SIGNAL LOST: X_SIGNAL UNAVAILABLE.
                  </div>
                ) : xSignal.length === 0 ? (
                  <div className="inventory-border p-8 text-center text-[#ae2012]">
                    NO X SIGNALS DETECTED.
                  </div>
                ) : (
                  <div className="grid gap-4 md:gap-6">
                    {xSignal.map(item => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inventory-border p-4 md:p-6 hover:bg-[#352f2f] transition-all group block no-underline"
                      >
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <span className="text-[#6eb6ff] font-bold text-xs uppercase tracking-widest">
                            {formatSignalDate(item.created_at)}
                          </span>
                          <span className="text-[#55a630] text-xs font-mono group-hover:text-white whitespace-nowrap">
                            OPEN ON X &gt;
                          </span>
                        </div>
                        <p className="text-sm md:text-base leading-relaxed opacity-90 font-mono line-clamp-3 whitespace-pre-line">
                          {item.text}
                        </p>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Live GitHub Push Stream */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl text-[#6eb6ff] pixel-font border-l-8 border-[#6eb6ff] pl-4 md:pl-6">
                  DATA_STREAM
                </h2>
                {loadingEvents ? (
                  <div className="inventory-border p-8 text-center animate-pulse">
                    <span className="text-xl pixel-font text-[#6eb6ff]">CONNECTING TO SATELLITE...</span>
                  </div>
                ) : eventsError ? (
                  <div className="inventory-border p-8 text-center text-[#ae2012] font-mono text-sm">
                    SATELLITE COMM ERROR: {eventsError}
                  </div>
                ) : (
                  <div className="grid gap-4 md:gap-6">
                    {githubEvents
                      .filter(event => event.type === 'PushEvent')
                      .slice(0, 10)
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

      {/* Floating Status Bar - Desktop HUD */}
      <footer className="fixed bottom-6 right-16 w-64 border-4 border-[#2b2626] bg-[#4e4444] p-4 font-mono z-40 shadow-[6px_6px_0px_#221e1e] origin-bottom-right hidden md:block">
        <div className="flex justify-between items-center border-b-2 border-[#2b2626] mb-3 pb-1">
            <div className="text-[#55a630] font-bold text-xs uppercase pixel-font">Status Window</div>
            <div className="text-[#ae2012] text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ae2012] animate-pulse inline-block"></span>
              Live
            </div>
        </div>
        <div className="space-y-2 text-xs font-bold">
          <div className="flex justify-between text-[#fcf4cf]"><span>ENERGY:</span><span className="text-[#55a630]">█████████▒ 90%</span></div>
          <div className="flex justify-between text-[#fcf4cf]"><span>GOLD:</span><span className="text-[#fcf4cf]">15,420g</span></div>
          <div className="flex justify-between text-[10px] mt-2 border-t border-[#2b2626] pt-1">
            <span className="text-[#6eb6ff] font-bold">HOTKEYS: [1][2][3]</span>
            {currentPage === Page.POST && <span className="text-[#ae2012] font-bold">[ESC] BACK</span>}
          </div>
          <div className="mt-1 text-[#6eb6ff] uppercase truncate overflow-hidden text-[10px]">
            &gt; {terminalHistory[terminalHistory.length - 1].split(':').pop()?.trim()}
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
