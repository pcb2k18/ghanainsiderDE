'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Code, Eye } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  minHeight = '400px',
}: RichTextEditorProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual');

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'align',
    'color',
    'background',
    'blockquote',
    'code-block',
  ];

  return (
    <div className="space-y-3">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode('visual')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            viewMode === 'visual'
              ? 'bg-brand-500/20 text-brand-400'
              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
          }`}
        >
          <Eye className="h-4 w-4" />
          Visual
        </button>
        <button
          type="button"
          onClick={() => setViewMode('html')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            viewMode === 'html'
              ? 'bg-brand-500/20 text-brand-400'
              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
          }`}
        >
          <Code className="h-4 w-4" />
          HTML
        </button>
      </div>

      {/* Editor */}
      {viewMode === 'visual' ? (
        <div className="rich-text-editor">
          <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            style={{ minHeight }}
          />
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<h2>Your HTML here...</h2>"
          className="textarea font-mono text-sm"
          style={{ minHeight }}
        />
      )}

      <style jsx global>{`
        .rich-text-editor .quill {
          border: 1px solid rgb(38 38 38);
          border-radius: 0.75rem;
          background: rgb(23 23 23);
        }

        .rich-text-editor .ql-toolbar {
          border: none;
          border-bottom: 1px solid rgb(38 38 38);
          border-radius: 0.75rem 0.75rem 0 0;
          background: rgb(23 23 23);
          padding: 12px;
        }

        .rich-text-editor .ql-container {
          border: none;
          border-radius: 0 0 0.75rem 0.75rem;
          font-size: 16px;
          font-family: inherit;
          min-height: ${minHeight};
        }

        .rich-text-editor .ql-editor {
          color: rgb(212 212 212);
          min-height: ${minHeight};
          padding: 16px;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgb(115 115 115);
          font-style: normal;
        }

        .rich-text-editor .ql-stroke {
          stroke: rgb(163 163 163);
        }

        .rich-text-editor .ql-fill {
          fill: rgb(163 163 163);
        }

        .rich-text-editor .ql-picker-label {
          color: rgb(163 163 163);
        }

        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          stroke: rgb(96 165 250);
          fill: rgb(96 165 250);
        }

        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: rgb(96 165 250);
        }

        .rich-text-editor .ql-editor h1,
        .rich-text-editor .ql-editor h2,
        .rich-text-editor .ql-editor h3 {
          color: rgb(245 245 245);
          font-weight: 700;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }

        .rich-text-editor .ql-editor h2 {
          font-size: 1.5em;
        }

        .rich-text-editor .ql-editor h3 {
          font-size: 1.25em;
        }

        .rich-text-editor .ql-editor a {
          color: rgb(96 165 250);
        }

        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid rgb(96 165 250);
          padding-left: 16px;
          margin-left: 0;
          margin-right: 0;
          color: rgb(163 163 163);
        }

        .rich-text-editor .ql-editor code {
          background: rgb(38 38 38);
          padding: 2px 6px;
          border-radius: 4px;
          color: rgb(251 191 36);
        }

        .rich-text-editor .ql-editor pre {
          background: rgb(23 23 23);
          border: 1px solid rgb(38 38 38);
          border-radius: 0.5rem;
          padding: 16px;
          overflow-x: auto;
        }

        .rich-text-editor .ql-editor pre code {
          background: transparent;
          padding: 0;
          color: rgb(212 212 212);
        }
      `}</style>
    </div>
  );
}
