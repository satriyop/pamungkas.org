import React, { useState } from 'react';
import { SOCIAL_LINKS } from '../constants';

export const SocialIcon: React.FC<{ id: string; className?: string }> = ({ id, className = 'w-4 h-4' }) => {
  switch (id) {
    case 'email':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3z" />
        </svg>
      );
    case 'github':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );
    case 'x':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    default:
      return null;
  }
};

export const SidebarSocials: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('satriyo@pamungkas.org');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 w-full px-2">
      <div className="text-[9px] font-mono text-[#55a630] font-bold uppercase tracking-widest">
        COMMS
      </div>
      <div className="grid grid-cols-2 gap-1.5 justify-items-center">
        {SOCIAL_LINKS.map((link, idx) => {
          const isEmail = link.id === 'email';
          const isLast = idx === SOCIAL_LINKS.length - 1;
          return (
            <a
              key={link.id}
              href={link.url}
              target={isEmail ? '_self' : '_blank'}
              rel={isEmail ? undefined : 'noopener noreferrer'}
              onClick={isEmail ? handleCopyEmail : undefined}
              title={isEmail ? (copied ? 'COPIED TO CLIPBOARD!' : 'CLICK TO COPY: satriyo@pamungkas.org') : `${link.name}: ${link.label}`}
              className={`w-7 h-7 flex items-center justify-center border-2 border-[#2b2626] bg-[#352f2f] text-[#fcf4cf] hover:text-[#55a630] hover:border-[#55a630] hover:bg-[#2b2626] transition-all rounded-sm pixel-press ${
                isLast ? 'col-span-2' : ''
              } ${
                isEmail && copied ? 'border-[#55a630] text-[#55a630] bg-[#2b2626]' : ''
              }`}
            >
              <SocialIcon id={link.id} className="w-3.5 h-3.5" />
            </a>
          );
        })}
      </div>
      {copied && (
        <span className="text-[8px] font-mono text-[#55a630] font-bold animate-pulse">
          COPIED!
        </span>
      )}
    </div>
  );
};

export const HeroSocials: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('satriyo@pamungkas.org');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-[11px] font-mono text-[#55a630] font-bold uppercase tracking-wider flex items-center gap-1.5 mr-1">
        <span className="w-2 h-2 rounded-full bg-[#55a630] animate-pulse"></span>
        COMMS:
      </span>
      {SOCIAL_LINKS.map((link) => {
        const isEmail = link.id === 'email';
        return (
          <a
            key={link.id}
            href={link.url}
            target={isEmail ? '_self' : '_blank'}
            rel={isEmail ? undefined : 'noopener noreferrer'}
            onClick={isEmail ? handleCopyEmail : undefined}
            title={isEmail ? 'Click to copy email address' : `Open ${link.name} profile`}
            className="inventory-border px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5 text-[#fcf4cf] hover:text-[#55a630] hover:border-[#55a630] hover:-translate-y-0.5 transition-all no-underline pixel-press"
          >
            <SocialIcon id={link.id} className="w-3 h-3 text-[#6eb6ff]" />
            <span>{isEmail && copied ? 'COPIED!' : link.name}</span>
          </a>
        );
      })}
    </div>
  );
};
