
import React from 'react';
import { marked } from 'marked';

interface MarkdownViewProps {
  content: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  const html = marked.parse(content);

  return (
    <div 
      className="prose prose-invert max-w-none prose-custom text-lg selection:bg-yellow-100 selection:text-black"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        color: '#fcf4cf', // Aged Paper Cream
      }}
    />
  );
};

export default MarkdownView;
