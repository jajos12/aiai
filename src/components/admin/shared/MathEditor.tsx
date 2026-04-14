'use client';

import { useState, useCallback } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = '' }: MathRendererProps) {
  const renderMath = useCallback((text: string): string => {
    let html = text;
    
    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="katex-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch {
        return `<span class="math-error">$$${math}$$</span>`;
      }
    });
    
    html = html.replace(/\$(.*?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return `<span class="math-error">$${math}$</span>`;
      }
    });
    
    return html;
  }, []);

  return (
    <div
      className={`math-content ${className}`}
      style={{ color: 'var(--text-primary)' }}
      dangerouslySetInnerHTML={{ __html: renderMath(content) }}
    />
  );
}

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function MathEditor({ value, onChange, placeholder = 'Enter content with math support (use $...$ for inline, $$...$$ for block)', minHeight = '150px' }: MathEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertMath = (type: 'inline' | 'block') => {
    const mathTemplate = type === 'inline' ? '$$' : '\n$$\n$$\n';
    const textarea = document.querySelector('textarea[data-math-editor]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + mathTemplate + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const insertCodeBlock = () => {
    const codeTemplate = '\n```\ncode here\n```\n';
    const textarea = document.querySelector('textarea[data-math-editor]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + codeTemplate + value.substring(end);
      onChange(newValue);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              background: activeTab === 'edit' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'edit' ? 'white' : 'var(--text-secondary)',
            }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              background: activeTab === 'preview' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'preview' ? 'white' : 'var(--text-secondary)',
            }}
          >
            Preview
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => insertMath('inline')}
            className="px-2 py-1 text-sm rounded transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            title="Insert inline math ($...$)"
          >
            $x$
          </button>
          <button
            type="button"
            onClick={() => insertMath('block')}
            className="px-2 py-1 text-sm rounded transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            title="Insert block math ($$...$$)"
          >
            $$x$$
          </button>
          <button
            type="button"
            onClick={insertCodeBlock}
            className="px-2 py-1 text-sm rounded transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
            title="Insert code block"
          >
            {'</>'}
          </button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <textarea
          data-math-editor
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 outline-none resize-none font-mono text-sm"
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            minHeight,
          }}
        />
      ) : (
        <div className="p-4" style={{ background: 'var(--bg-surface)', minHeight }}>
          {value ? (
            <MathRenderer content={value} />
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}

export const MathTemplates = {
  fractions: '\\frac{numerator}{denominator}',
  superscript: 'x^{exponent}',
  subscript: 'x_{subscript}',
  squareRoot: '\\sqrt{x}',
  sum: '\\sum_{i=1}^{n} x_i',
  integral: '\\int_{a}^{b} f(x) dx',
  limit: '\\lim_{x \\to \\infty}',
  matrix: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
  greek: { alpha: '\\alpha', beta: '\\beta', gamma: '\\gamma', delta: '\\delta', theta: '\\theta', lambda: '\\lambda', mu: '\\mu', sigma: '\\sigma', pi: '\\pi', omega: '\\omega' },
};
