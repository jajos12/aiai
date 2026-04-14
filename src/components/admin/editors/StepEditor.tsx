'use client';

import { useState } from 'react';
import type { Step, GoDeeper } from '@/core/types';
import MathEditor from '../shared/MathEditor';
import QuizEditor from './QuizEditor';
import VideoUploader from './VideoUploader';
import ImageUploader from './ImageUploader';

interface StepEditorProps {
  step: Step;
  onChange: (updates: Partial<Step>) => void;
  onRemove?: () => void;
}

export default function StepEditor({ step, onChange, onRemove }: StepEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'quiz' | 'deeper'>('content');

  const updateContent = (updates: Partial<Step['content']>) => {
    onChange({ content: { ...step.content, ...updates } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={step.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Step title"
          className="flex-1 text-lg font-semibold bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            Delete Step
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
        {(['content', 'media', 'quiz', 'deeper'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize"
            style={{
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
            }}
          >
            {tab === 'deeper' ? 'Go Deeper' : tab}
            {tab === 'quiz' && step.quiz && <span className="ml-1">✓</span>}
            {tab === 'media' && (step.content.video || step.content.image) && <span className="ml-1">✓</span>}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Main Content
            </label>
            <MathEditor
              value={step.content.text}
              onChange={(text) => updateContent({ text })}
              minHeight="200px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Interaction Hint (optional)
            </label>
            <input
              type="text"
              value={step.interactionHint || ''}
              onChange={(e) => onChange({ interactionHint: e.target.value })}
              placeholder="Hint for learners about what to try..."
              className="w-full p-3 rounded-lg outline-none"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Lesson Note (required, detailed)
            </label>
            <MathEditor
              value={step.content.authorNote || ''}
              onChange={(authorNote) => updateContent({ authorNote })}
              placeholder="Write a detailed note for this step: learning goal, explanation, common mistakes, and guidance."
              minHeight="140px"
            />
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Step Image</h4>
            <ImageUploader
              image={step.content.image}
              onChange={(image) => updateContent({ image })}
            />
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Step Video</h4>
            <VideoUploader
              video={step.content.video}
              onChange={(video) => updateContent({ video })}
            />
          </div>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div>
          {step.quiz ? (
            <QuizEditor
              quiz={step.quiz}
              onChange={(quiz) => onChange({ quiz })}
              onRemove={() => onChange({ quiz: undefined })}
            />
          ) : (
            <div className="text-center p-8">
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>No quiz for this step yet.</p>
              <button
                onClick={() => onChange({ quiz: { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' } })}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Add Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deeper' && (
        <GoDeeperEditor
          goDeeper={step.content.goDeeper}
          onChange={(goDeeper) => updateContent({ goDeeper })}
        />
      )}
    </div>
  );
}

interface GoDeeperEditorProps {
  goDeeper?: GoDeeper;
  onChange: (goDeeper: GoDeeper | undefined) => void;
}

function GoDeeperEditor({ goDeeper, onChange }: GoDeeperEditorProps) {
  const [enabled, setEnabled] = useState(!!goDeeper);

  const handleEnable = () => {
    if (enabled) {
      onChange(undefined);
    } else {
      onChange({ explanation: '', math: '' });
    }
    setEnabled(!enabled);
  };

  if (!enabled) {
    return (
      <div className="text-center p-8">
        <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Add formal mathematical content for advanced learners.</p>
        <button
          onClick={handleEnable}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          Add Go Deeper Section
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Go Deeper Section</h3>
        <button
          onClick={handleEnable}
          className="text-sm text-red-500 hover:underline"
        >
          Remove
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Mathematical Formula (LaTeX)
        </label>
        <textarea
          value={goDeeper?.math || ''}
          onChange={(e) => onChange({ ...goDeeper!, math: e.target.value })}
          placeholder="e.g., E = mc^2 or \frac{d}{dx}"
          rows={3}
          className="w-full p-3 rounded-lg outline-none resize-none font-mono text-sm"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        />
        {goDeeper?.math && (
          <div className="mt-2 p-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Preview:</p>
            <MathEditor value={goDeeper.math} onChange={() => {}} minHeight="60px" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Explanation
        </label>
        <MathEditor
          value={goDeeper?.explanation || ''}
          onChange={(explanation) => onChange({ ...goDeeper!, explanation })}
          placeholder="Explain the mathematical concepts..."
          minHeight="150px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          References (optional)
        </label>
        <div className="space-y-2">
          {goDeeper?.references?.map((ref, i) => (
            <div key={i} className="flex gap-2 items-start p-2 rounded" style={{ background: 'var(--bg-surface)' }}>
              <input
                type="text"
                value={ref.title}
                onChange={(e) => {
                  const refs = [...(goDeeper?.references || [])];
                  refs[i] = { ...ref, title: e.target.value };
                  onChange({ ...goDeeper!, references: refs });
                }}
                placeholder="Title"
                className="flex-1 p-2 rounded text-sm outline-none"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={ref.author}
                onChange={(e) => {
                  const refs = [...(goDeeper?.references || [])];
                  refs[i] = { ...ref, author: e.target.value };
                  onChange({ ...goDeeper!, references: refs });
                }}
                placeholder="Author"
                className="w-32 p-2 rounded text-sm outline-none"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
              />
              <input
                type="number"
                value={ref.year || ''}
                onChange={(e) => {
                  const refs = [...(goDeeper?.references || [])];
                  refs[i] = { ...ref, year: parseInt(e.target.value) || undefined };
                  onChange({ ...goDeeper!, references: refs });
                }}
                placeholder="Year"
                className="w-20 p-2 rounded text-sm outline-none"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => {
                  const refs = (goDeeper?.references || []).filter((_, idx) => idx !== i);
                  onChange({ ...goDeeper!, references: refs.length ? refs : undefined });
                }}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const refs = [...(goDeeper?.references || []), { title: '', author: '' }];
              onChange({ ...goDeeper!, references: refs });
            }}
            className="text-sm"
            style={{ color: 'var(--accent)' }}
          >
            + Add reference
          </button>
        </div>
      </div>
    </div>
  );
}
