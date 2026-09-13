
import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownViewProps {
  content: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const sanitizedHtml = useMemo(() => {
    const rawHtml = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  return (
    <div 
      className="prose prose-invert max-w-none prose-custom text-lg selection:bg-yellow-100 selection:text-black"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      style={{
        color: '#fcf4cf', // Aged Paper Cream
      }}
    />
  );
};

export default MarkdownView;
