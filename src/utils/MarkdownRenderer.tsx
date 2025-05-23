import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface MarkdownProps {
  content: string;
}

/**
 * MarkdownRenderer is a React component that takes markdown content as a string prop and renders it using ReactMarkdown.
 * It supports GitHub Flavored Markdown (GFM), including tables and headings.
 * Now includes a fade-in animation using Framer Motion.
 *
 * Usage:
 * <MarkdownRenderer content={markdownContent} />
 */

export const MarkdownRenderer: React.FC<MarkdownProps> = ({ content }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 6, ease: 'easeOut' }}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => (
          <h1 {...props} className="mt-2 mb-2 text-3xl font-bold" />
        ),
        h2: (props) => (
          <h2 {...props} className="mt-6 mb-2 text-2xl font-semibold" />
        ),
        h3: (props) => (
          <h3 {...props} className="mt-8 mb-4 text-xl font-semibold" />
        ),
        h4: (props) => (
          <h4 {...props} className="mt-8 mb-2 text-lg font-medium" />
        ),
        p: (props) => (
          <p {...props} className="mt-2 mb-2 last:mb-0 text-base leading-relaxed font-light" />
        ),
        a: (props) => (
          <a
            {...props}
            className="text-blue-500 hover:text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
        ul: (props) => (
          <ul {...props} className="list-disc ml-4 space-y-1" />
        ),
        ol: (props) => (
          <ol {...props} className="list-decimal ml-4 space-y-1" />
        ),
        table: (props) => (
          <table {...props} className="bg-default-50 table-auto border-collapse w-full my-4 rounded-md overflow-hidden" />
        ),
        thead: (props) => (
          <thead {...props} className="text-lg font-semibold bg-default-100" />
        ),
        tbody: (props) => <tbody {...props} />,
        tr: (props) => (
          <tr {...props} className="hover:bg-default-200 last:border-0" />
        ),
        th: (props) => (
          <th {...props} className="text-left px-4 py-2 font-medium" />
        ),
        td: (props) => (
          <td {...props} className="px-4 py-2" />
        ),
        code: ({ className, children, ...props }) => {
          return (
            <code className="text-default-600 text-sm px-1 rounded" {...props}>
              {children}
            </code>
          );
        },
        pre: ({ className, children, ...props }) => {
          return (
            <pre {...props} className="bg-default-50 p-4 rounded-xl overflow-x-auto my-4 text-sm">
              {children}
            </pre>
          );
        },
        img: (props) => (
          <img {...props} className="rounded-2xl my-4" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </motion.div>
);
