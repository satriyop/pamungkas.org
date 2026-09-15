import React, { useState, useEffect } from 'react';
import { GithubEvent, GithubCommitDetail } from '../types';

interface CommitItemProps {
  event: GithubEvent;
  onClick?: (message: string, sha: string) => void;
}

// In-memory cache and promise deduplicator across component instances
const commitMessageCache = new Map<string, string>();
const pendingCommitFetches = new Map<string, Promise<string>>();

async function getCommitMessage(repoName: string, sha: string, fallbackRef: string): Promise<string> {
  const cacheKey = `${repoName}:${sha}`;
  const cached = commitMessageCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const existingFetch = pendingCommitFetches.get(cacheKey);
  if (existingFetch) {
    return existingFetch;
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`/api/repos/${repoName}/commits/${sha}`);
      if (response.ok) {
        const data = (await response.json()) as GithubCommitDetail;
        const msg = data.commit.message || `Update to ${fallbackRef}`;
        commitMessageCache.set(cacheKey, msg);
        return msg;
      }
      return `Update to ${fallbackRef}`;
    } catch {
      return `Update to ${fallbackRef}`;
    } finally {
      pendingCommitFetches.delete(cacheKey);
    }
  })();

  pendingCommitFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
}

const CommitItem: React.FC<CommitItemProps> = ({ event, onClick }) => {
  // Determine initial data availability
  const hasCommits = Boolean(event.payload.commits && event.payload.commits.length > 0);
  const refName = event.payload.ref ? event.payload.ref.replace('refs/heads/', '') : 'repository';
  const commitSha = hasCommits ? event.payload.commits![0].sha : event.payload.head;
  const cacheKey = `${event.repo.name}:${commitSha}`;

  const initialMessage = hasCommits
    ? event.payload.commits![0].message
    : commitSha && commitMessageCache.has(cacheKey)
      ? commitMessageCache.get(cacheKey)!
      : '';

  const [message, setMessage] = useState<string>(initialMessage);
  const [loadingMsg, setLoadingMsg] = useState<boolean>(
    !hasCommits && Boolean(commitSha) && !commitMessageCache.has(cacheKey)
  );

  const displaySha = commitSha ? commitSha.substring(0, 7) : '???????';

  // Format Date
  const date = new Date(event.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Effect to fetch message if missing
  useEffect(() => {
    if (hasCommits) {
      setMessage(event.payload.commits![0].message);
      setLoadingMsg(false);
      return;
    }

    if (!commitSha) {
      setMessage(`Update to ${refName}`);
      setLoadingMsg(false);
      return;
    }

    if (commitMessageCache.has(cacheKey)) {
      setMessage(commitMessageCache.get(cacheKey)!);
      setLoadingMsg(false);
      return;
    }

    let isMounted = true;
    setLoadingMsg(true);

    getCommitMessage(event.repo.name, commitSha, refName).then((msg) => {
      if (isMounted) {
        setMessage(msg);
        setLoadingMsg(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [event.repo.name, hasCommits, commitSha, refName, cacheKey]);

  return (
    <a
      href={`https://github.com/${event.repo.name}/commit/${commitSha}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(message, commitSha || '');
        }
      }}
      className="inventory-border p-3 md:p-6 cursor-pointer hover:bg-[#352f2f] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#221e1e] transition-all group relative block no-underline w-full max-w-full pixel-press"
    >
      <div className="flex justify-between items-center mb-2 gap-2">
        <span className="text-[#55a630] font-bold text-xs uppercase tracking-widest truncate flex-1 min-w-0">
          {event.repo.name}
        </span>
        <span className="text-[#ff595e] text-xs font-mono whitespace-nowrap flex-shrink-0 bg-[#2b2626] px-1.5 py-0.5 border border-[#352f2f] rounded-sm tabular-nums glow-red">
          [{displaySha}]
        </span>
      </div>
      <h3
        className={`text-base md:text-xl font-bold pixel-font mb-2 group-hover:text-[#6eb6ff] transition-colors line-clamp-2 break-all ${
          loadingMsg ? 'animate-pulse text-[#6eb6ff]' : 'text-[#fcf4cf]'
        }`}
      >
        {loadingMsg ? 'DECODING TRANSMISSION...' : message}
      </h3>
      <div className="text-right text-[#fcf4cf]/75 text-xs mt-2 md:mt-4 border-t border-[#2b2626] pt-2 font-mono flex items-center justify-between">
        <span className="text-[#6eb6ff] text-[10px] uppercase group-hover:text-[#55a630] transition-colors">&gt; VIEW COMMIT</span>
        <span className="tabular-nums">{date}</span>
      </div>
    </a>
  );
};

export default CommitItem;
