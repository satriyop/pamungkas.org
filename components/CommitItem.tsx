import React, { useState, useEffect } from 'react';
import { GithubEvent } from '../types';

interface CommitItemProps {
  event: GithubEvent;
  onClick?: (message: string, sha: string) => void;
}

const CommitItem: React.FC<CommitItemProps> = ({ event, onClick }) => {
  const [message, setMessage] = useState<string>('');
  const [loadingMsg, setLoadingMsg] = useState(false);

  // Determine initial data availability
  const hasCommits = event.payload.commits && event.payload.commits.length > 0;
  const refName = event.payload.ref ? event.payload.ref.replace('refs/heads/', '') : 'repository';
  
  // SHA determination
  const commitSha = hasCommits 
    ? event.payload.commits![0].sha 
    : (event.payload as any).head; // 'head' exists on PushEvent payload but might be missing from type def
    
  const displaySha = commitSha ? commitSha.substring(0, 7) : '???????';

  // Format Date
  const date = new Date(event.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Effect to fetch message if missing
  useEffect(() => {
    if (hasCommits) {
      setMessage(event.payload.commits![0].message);
      return;
    }

    if (!commitSha) {
        setMessage(`Update to ${refName}`);
        return;
    }

    // If we have a SHA but no message (e.g. private repo event masking), fetch it
    const fetchCommitDetails = async () => {
      setLoadingMsg(true);

      try {
        // Use proxy instead of GitHub URL directly
        const response = await fetch(`/api/repos/${event.repo.name}/commits/${commitSha}`);
        if (response.ok) {
          const data = await response.json();
          setMessage(data.commit.message);
        } else {
          setMessage(`Update to ${refName}`);
        }
      } catch (error) {
        setMessage(`Update to ${refName}`);
      } finally {
        setLoadingMsg(false);
      }
    };

    fetchCommitDetails();
  }, [event, hasCommits, commitSha, refName]);

  return (
    <a 
      href={`https://github.com/${event.repo.name}/commit/${commitSha}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(message, commitSha);
        }
      }}
      className="inventory-border p-3 md:p-6 cursor-pointer hover:bg-[#352f2f] transition-all group relative block no-underline w-full max-w-full"
    >
      <div className="flex justify-between items-center mb-2 gap-2">
        <span className="text-[#55a630] font-bold text-[10px] md:text-xs uppercase tracking-widest truncate flex-1 min-w-0">{event.repo.name}</span>
        <span className="text-[#ae2012] text-[10px] md:text-xs font-mono whitespace-nowrap flex-shrink-0">[{displaySha}]</span>
      </div>
      <h3 className={`text-base md:text-xl font-bold pixel-font mb-2 group-hover:text-[#6eb6ff] transition-colors line-clamp-2 break-all ${loadingMsg ? 'animate-pulse' : ''}`}>
        {loadingMsg ? 'DECODING TRANSMISSION...' : message}
      </h3>
      <div className="text-right text-[#fcf4cf]/50 text-[10px] md:text-xs mt-2 md:mt-4 border-t border-[#2b2626] pt-2">
        {date}
      </div>
    </a>
  );
};

export default CommitItem;
