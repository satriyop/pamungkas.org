import React, { useState } from 'react';
import { RESUME_MD } from '../constants';
import MarkdownView from './MarkdownView';

interface Stat {
  label: string;
  name: string;
  value: number;
  description: string;
}

const STATS: Stat[] = [
  { label: 'INT', name: 'System Architecture', value: 98, description: 'Distributed systems, digital transformation, fault tolerance' },
  { label: 'STR', name: 'Infrastructure & Net', value: 96, description: 'Carrier-grade routing, datacenter design, optical & SDN' },
  { label: 'WIS', name: 'Enterprise Security', value: 94, description: 'Risk mitigation, defense sector standards, SIGINT/HUMINT' },
  { label: 'AGI', name: 'Full-Stack Execution', value: 91, description: 'PHP/Laravel, TypeScript/React, Python, rapid prototyping' },
];

const CERTIFICATIONS = [
  { id: 'ccna', code: 'CISCO', title: 'CCNA Routing & Switching', tag: 'NETWORKING', level: 'MASTER' },
  { id: 'juniper', code: 'JUNIPER', title: 'JNCIA & JNCIS Specialist', tag: 'SECURITY', level: 'SPECIALIST' },
  { id: 'infoblox', code: 'INFOBLOX', title: 'CISA Core Network Services', tag: 'DNS/IPAM', level: 'ADMIN' },
  { id: 'dc', code: 'DATACENTER', title: 'CDCP & CDCS Certified', tag: 'FACILITIES', level: 'ENGINEER' },
  { id: 'netapp', code: 'NETAPP', title: 'Storage Architecture', tag: 'SAN/NAS', level: 'ARCHITECT' },
  { id: 'routing', code: 'CARRIER', title: 'Force10 & Ruckus Wireless', tag: 'SWITCHING', level: 'EXPERT' },
];

const SKILL_METERS = [
  { name: 'System & Cloud Architecture', pct: 98, level: 'MAX' },
  { name: 'Network Infrastructure (Cisco, Juniper)', pct: 96, level: 'TIER 1' },
  { name: 'PHP (Laravel Framework)', pct: 92, level: 'EXPERT' },
  { name: 'JavaScript / TypeScript (React, Node)', pct: 90, level: 'EXPERT' },
  { name: 'Python (Scripting & Automation)', pct: 85, level: 'ADVANCED' },
  { name: 'Java (Spring Boot) & C# (.NET)', pct: 80, level: 'PROFICIENT' },
];

const MISSIONS = [
  {
    year: '2025',
    client: 'Indonesian Army (Korem 074)',
    role: 'Supporting Zona Integrasi Program, building agents of change.',
    badge: 'DEFENSE',
    badgeColor: 'border-[#ae2012] text-[#fcf4cf] bg-[#ae2012]/30',
  },
  {
    year: '2024',
    client: 'Presidential Security Force (Paspampres)',
    role: 'Assisting for KTT G20, planning risk management and security instruments.',
    badge: 'PRESIDENTIAL',
    badgeColor: 'border-[#ae2012] text-[#fcf4cf] bg-[#ae2012]/30',
  },
  {
    year: '2023',
    client: 'Indonesian Navy',
    role: 'Improving Cyber Security via HUMINT, SIGINT alignment.',
    badge: 'MARITIME DEFENSE',
    badgeColor: 'border-[#6eb6ff] text-[#fcf4cf] bg-[#6eb6ff]/20',
  },
  {
    year: '2023',
    client: 'Kemenhub (Ministry of Transportation)',
    role: 'Robust network and security infrastructure design.',
    badge: 'INFRASTRUCTURE',
    badgeColor: 'border-[#6eb6ff] text-[#fcf4cf] bg-[#6eb6ff]/20',
  },
  {
    year: '2022',
    client: 'Koota.id',
    role: 'Built Digital Cooperative application used by thousands of active members.',
    badge: 'FINTECH',
    badgeColor: 'border-[#55a630] text-[#fcf4cf] bg-[#55a630]/20',
  },
  {
    year: '2022',
    client: 'LSPTDI.com',
    role: 'Built online assessment application guided by national BNSP standards.',
    badge: 'GOV / ED',
    badgeColor: 'border-[#55a630] text-[#fcf4cf] bg-[#55a630]/20',
  },
  {
    year: '2022',
    client: 'ATRBPN',
    role: 'IT consultancy for PPRA (Program Percepatan Reforma Agraria).',
    badge: 'CIVIC TECH',
    badgeColor: 'border-[#55a630] text-[#fcf4cf] bg-[#55a630]/20',
  },
];

const CORPORATE_HISTORY = [
  { period: '2018 – NOW', role: 'Founder', org: 'Enterk0d3', detail: 'Software development consultancy in Yogyakarta building enterprise products.' },
  { period: '2015 – 2017', role: 'Technology Manager', org: 'Telkomtelstra', detail: 'Intermediary between C-level departments and strategic product delivery.' },
  { period: '2013 – 2015', role: 'Territory Manager', org: 'Riverbed Technology', detail: 'Country revenue and partner ecosystem growth for WAN optimization.' },
  { period: '2012 – 2013', role: 'Presales Manager', org: 'Alcatel Lucent', detail: 'Technical recommendations and telecommunications network architecture.' },
  { period: '2008 – 2012', role: 'Technical Manager', org: 'Softnet Indonesia', detail: 'Technical proposals, POC deployments, and critical infrastructure closing.' },
  { period: '2005 – 2007', role: 'System Engineer', org: 'Datacraft Indonesia', detail: 'Network engineering implementations for Citibank, Nestle, and XL Axiata.' },
];

const CharacterSheet: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dossier' | 'raw'>('dossier');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(RESUME_MD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Bar with View Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-[#55a630] pb-4">
        <div>
          <div className="text-xs text-[#6eb6ff] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#55a630] animate-pulse"></span>
            CONFIDENTIAL ARCHIVE // OPERATIVE DOSSIER
          </div>
          <h2 className="text-3xl md:text-5xl text-[#55a630] pixel-font m-0 mt-1">
            ADVENTURER_BIO.TXT
          </h2>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setViewMode('dossier')}
            className={`px-3 py-1.5 border-2 font-bold pixel-font transition-all pixel-press ${
              viewMode === 'dossier'
                ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]'
                : 'text-[#fcf4cf] border-[#2b2626] bg-[#352f2f] hover:border-[#fcf4cf]'
            }`}
          >
            ★ RPG DOSSIER
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1.5 border-2 font-bold pixel-font transition-all pixel-press ${
              viewMode === 'raw'
                ? 'bg-[#55a630] text-white border-[#55a630] shadow-[2px_2px_0_#221e1e]'
                : 'text-[#fcf4cf] border-[#2b2626] bg-[#352f2f] hover:border-[#fcf4cf]'
            }`}
          >
            RAW TEXT
          </button>
          {viewMode === 'raw' && (
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-[#2b2626] text-[#6eb6ff] border border-[#352f2f] font-mono hover:text-white transition-colors"
              title="Copy markdown text to clipboard"
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          )}
        </div>
      </div>

      {viewMode === 'raw' ? (
        <div className="inventory-border p-6 md:p-12">
          <MarkdownView content={RESUME_MD} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Character Identity Card */}
          <div className="inventory-border p-6 md:p-8 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Avatar Box */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#2b2626]/80 border-2 border-[#2b2626] rounded text-center relative shadow-inner">
                <div className="w-24 h-24 rounded-full border-4 border-[#55a630] bg-[#433d3c] flex items-center justify-center text-4xl mb-3 shadow-[0_0_12px_rgba(85,166,48,0.4)]">
                  🧙‍♂️
                </div>
                <div className="text-xl font-bold pixel-font text-[#fcf4cf]">
                  SATRIYO PAMUNGKAS
                </div>
                <div className="inline-block mt-2 px-2.5 py-0.5 bg-[#55a630] text-white font-bold text-xs pixel-font shadow-[2px_2px_0_#221e1e]">
                  LVL. 20 LEGENDARY ARCHITECT
                </div>
                <div className="mt-3 text-xs font-mono text-[#6eb6ff] flex flex-col gap-1">
                  <span>CLASS: SYSTEM ARCHITECT</span>
                  <span className="text-[#fcf4cf]/75">EXP: 15+ YEARS</span>
                  <span className="text-[#55a630]">+62817831441</span>
                  <span className="text-[#fcf4cf]/90">satriyo@pamungkas.com</span>
                </div>
              </div>

              {/* RPG Attributes Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-[#2b2626] pb-2">
                  <h3 className="text-lg font-bold pixel-font text-[#6eb6ff]">CORE ATTRIBUTES</h3>
                  <span className="text-xs font-mono text-[#55a630]">TIER: ELITE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="p-3 bg-[#352f2f]/60 border border-[#2b2626] rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold font-mono text-[#55a630]">
                          [{stat.label}] {stat.name}
                        </span>
                        <span className="text-xs font-bold font-mono text-[#6eb6ff]">{stat.value}/100</span>
                      </div>
                      {/* 8-bit Meter Bar */}
                      <div className="w-full h-2.5 bg-[#2b2626] border border-[#2b2626] rounded-sm overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-[#55a630] to-[#6eb6ff] transition-all"
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                      <p className="text-[11px] font-mono text-[#fcf4cf]/75 leading-tight">
                        {stat.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#2b2626]/60 border-l-4 border-[#55a630] text-xs font-mono text-[#fcf4cf]/90 leading-relaxed">
                  Genuine passion is assisting organizations with problem-solving altitude. Equipped with deep infrastructure, carrier networking, and modern software craft to architect robust digital transformations.
                </div>
              </div>
            </div>
          </div>

          {/* 2. Equipped Certifications */}
          <div className="inventory-border p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-[#2b2626] pb-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold pixel-font text-[#6eb6ff]">
                  EQUIPPED CERTIFICATIONS
                </h3>
                <p className="text-xs font-mono text-[#fcf4cf]/75 mt-0.5">
                  Verified hardware, security, and telecommunications credentials
                </p>
              </div>
              <span className="text-xs font-mono text-[#55a630] uppercase hidden sm:inline">6 SEALS VERIFIED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 bg-[#352f2f]/60 border-2 border-[#2b2626] rounded hover:border-[#55a630] transition-colors relative group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2 py-0.5 bg-[#2b2626] text-[#55a630] font-mono font-bold text-[10px] rounded border border-[#352f2f]">
                      {cert.code}
                    </span>
                    <span className="text-[9px] font-mono text-[#6eb6ff] uppercase tracking-wider">
                      {cert.level}
                    </span>
                  </div>
                  <div className="font-bold pixel-font text-base text-[#fcf4cf] group-hover:text-white transition-colors">
                    {cert.title}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-[#fcf4cf]/70">
                    ROLE: {cert.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Tech Proficiencies */}
          <div className="inventory-border p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold pixel-font text-[#6eb6ff] mb-2">
              DISCIPLINE PROFICIENCIES
            </h3>
            <p className="text-xs font-mono text-[#fcf4cf]/75 mb-6">
              Engineering specializations and programming language mastery
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SKILL_METERS.map((meter) => (
                <div key={meter.name} className="p-3 bg-[#352f2f]/40 border border-[#2b2626] rounded">
                  <div className="flex justify-between items-center mb-1 text-xs font-mono">
                    <span className="font-bold text-[#fcf4cf]">{meter.name}</span>
                    <span className="text-[#55a630] font-bold">[{meter.level}]</span>
                  </div>
                  <div className="w-full h-3 bg-[#2b2626] border border-[#2b2626] rounded-sm overflow-hidden flex items-center">
                    <div
                      className="h-full bg-[#55a630] transition-all"
                      style={{ width: `${meter.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Classified Campaigns (Consulting Engagements) */}
          <div className="inventory-border p-6 md:p-8">
            <div className="flex justify-between items-center mb-6 border-b border-[#2b2626] pb-3">
              <div>
                <h3 className="text-xl md:text-2xl font-bold pixel-font text-[#6eb6ff]">
                  SPECIAL MISSIONS & CAMPAIGNS
                </h3>
                <p className="text-xs font-mono text-[#fcf4cf]/75 mt-0.5">
                  Strategic defense, government, and enterprise initiatives
                </p>
              </div>
              <span className="text-xs font-mono text-[#ae2012] animate-pulse">● CLEARANCE: HIGH</span>
            </div>

            <div className="space-y-4">
              {MISSIONS.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#352f2f]/40 border-l-4 border-[#55a630] hover:bg-[#352f2f] transition-all rounded-r flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-[#55a630] font-bold">[{m.year}]</span>
                      <span className="font-bold pixel-font text-base text-[#fcf4cf]">{m.client}</span>
                    </div>
                    <p className="text-xs font-mono text-[#fcf4cf]/85 leading-relaxed">
                      {m.role}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border self-start sm:self-center uppercase font-bold tracking-wider ${m.badgeColor}`}
                  >
                    {m.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Guild History (Corporate Experience) */}
          <div className="inventory-border p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold pixel-font text-[#6eb6ff] mb-2">
              GUILD RECORD // CORPORATE HISTORY
            </h3>
            <p className="text-xs font-mono text-[#fcf4cf]/75 mb-6">
              Leadership, pre-sales architecture, and engineering tenures
            </p>

            <div className="relative border-l-2 border-dashed border-[#55a630]/60 ml-3 pl-6 space-y-6">
              {CORPORATE_HISTORY.map((corp, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-4 h-4 bg-[#4e4444] border-2 border-[#55a630] rounded-full group-hover:bg-[#55a630] transition-colors"></div>
                  <div className="flex justify-between items-baseline mb-1 flex-wrap gap-1">
                    <span className="font-bold pixel-font text-base text-[#55a630] group-hover:text-white transition-colors">
                      {corp.org} — <span className="text-[#fcf4cf]">{corp.role}</span>
                    </span>
                    <span className="text-xs font-mono text-[#6eb6ff] bg-[#2b2626] px-2 py-0.5 rounded border border-[#352f2f]">
                      {corp.period}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#fcf4cf]/80 leading-relaxed">
                    {corp.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Academic Background, Awards & References */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <div className="inventory-border p-6">
              <h3 className="text-lg font-bold pixel-font text-[#6eb6ff] mb-4 border-b border-[#2b2626] pb-2">
                ACADEMY TRAINING
              </h3>
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-[#352f2f]/40 border border-[#2b2626] rounded">
                  <div className="font-bold text-[#55a630]">Gadjah Mada University (2005)</div>
                  <div className="text-[#fcf4cf] font-bold mt-0.5">B.S. in Electrical Engineering (GPA 3.2)</div>
                  <p className="text-[#fcf4cf]/75 text-[11px] mt-1 leading-normal">
                    2 years as Campus Network Administrator; sharpened routing & ISP infrastructure at a local Yogyakarta provider.
                  </p>
                </div>
                <div className="p-3 bg-[#352f2f]/40 border border-[#2b2626] rounded">
                  <div className="font-bold text-[#55a630]">Gadjah Mada University (2009)</div>
                  <div className="text-[#fcf4cf] font-bold mt-0.5">Master of Business Administration (MBA)</div>
                  <p className="text-[#fcf4cf]/75 text-[11px] mt-1 leading-normal">
                    Paused to launch an electrical & green energy enterprise.
                  </p>
                </div>
              </div>
            </div>

            {/* Honors & References */}
            <div className="inventory-border p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold pixel-font text-[#6eb6ff] mb-4 border-b border-[#2b2626] pb-2">
                  HONORS & REFERENCES
                </h3>
                <div className="p-3 bg-[#352f2f]/40 border border-[#2b2626] rounded mb-4">
                  <div className="text-[#55a630] font-mono font-bold text-xs">AWARDS:</div>
                  <div className="text-[#fcf4cf] font-bold pixel-font text-sm mt-1">
                    🏆 Youngster Achiever Under 35 — SWA Magazine
                  </div>
                </div>

                <div className="text-xs font-mono text-[#fcf4cf]/80">
                  <div className="text-[#6eb6ff] font-bold mb-2">GUILD REFERENCES:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>• Husni Chan (Dimension Data)</div>
                    <div>• Stanley Thirtabrata (Softnet)</div>
                    <div>• Roberto Galbiati (Riverbed)</div>
                    <div>• Nathan Bell (Telkomtelstra)</div>
                    <div className="sm:col-span-2">• Erik Meijer (Telkomtelstra)</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#2b2626] flex justify-between items-center text-[10px] font-mono text-[#fcf4cf]/60">
                <span>SECURITY ARCHIVE // DECENTRALIZED</span>
                <button
                  onClick={handleCopy}
                  className="text-[#55a630] hover:text-white transition-colors underline cursor-pointer"
                >
                  {copied ? 'COPIED TO CLIPBOARD' : 'EXPORT DOSSIER TEXT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSheet;
