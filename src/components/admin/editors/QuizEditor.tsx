'use client';

import type { Quiz } from '@/core/types';
import MathEditor from '../shared/MathEditor';

interface QuizEditorProps {
  quiz: Quiz;
  onChange: (quiz: Quiz) => void;
  onRemove?: () => void;
}

export default function QuizEditor({ quiz, onChange, onRemove }: QuizEditorProps) {
  const updateOption = (index: number, value: string) => {
    const newOptions = [...quiz.options];
    newOptions[index] = value;
    onChange({ ...quiz, options: newOptions });
  };

  const addOption = () => {
    onChange({ ...quiz, options: [...quiz.options, ''] });
  };

  const removeOption = (index: number) => {
    if (quiz.options.length <= 2) return;
    const newOptions = quiz.options.filter((_, i) => i !== index);
    let newCorrectIndex = quiz.correctIndex;
    if (index === quiz.correctIndex) {
      newCorrectIndex = 0;
    } else if (index < quiz.correctIndex) {
      newCorrectIndex--;
    }
    onChange({ ...quiz, options: newOptions, correctIndex: newCorrectIndex });
  };

  const setCorrectAnswer = (index: number) => {
    onChange({ ...quiz, correctIndex: index });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Quiz Configuration</h3>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-sm text-red-500 hover:underline"
          >
            Remove Quiz
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Question
        </label>
        <MathEditor
          value={quiz.question}
          onChange={(question) => onChange({ ...quiz, question })}
          placeholder="Enter your question (supports math: $x^2 + y^2$)"
          minHeight="80px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Answer Options
        </label>
        <div className="space-y-3">
          {quiz.options.map((option, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => setCorrectAnswer(i)}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors"
                style={{
                  borderColor: quiz.correctIndex === i ? 'var(--color-success)' : 'var(--border-subtle)',
                  background: quiz.correctIndex === i ? 'var(--color-success)' : 'transparent',
                  color: quiz.correctIndex === i ? 'white' : 'var(--text-muted)',
                }}
                title={quiz.correctIndex === i ? 'Correct answer' : 'Set as correct answer'}
              >
                {String.fromCharCode(65 + i)}
              </button>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 p-3 rounded-lg outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${quiz.correctIndex === i ? 'var(--color-success)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)',
                }}
              />
              {quiz.options.length > 2 && (
                <button
                  onClick={() => removeOption(i)}
                  className="p-2 rounded hover:bg-red-500/20 text-red-500"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {quiz.options.length < 6 && (
          <button
            onClick={addOption}
            className="mt-3 text-sm"
            style={{ color: 'var(--accent)' }}
          >
            + Add option
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Explanation (shown after answering)
        </label>
        <MathEditor
          value={quiz.explanation}
          onChange={(explanation) => onChange({ ...quiz, explanation })}
          placeholder="Explain why the correct answer is right..."
          minHeight="100px"
        />
      </div>

      <div className="p-4 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Quiz Preview</h4>
        <div className="space-y-2">
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{quiz.question || 'Your question here'}</p>
          {quiz.options.map((option, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded text-sm"
              style={{
                background: 'var(--bg-hover)',
                color: 'var(--text-primary)',
                outline: quiz.correctIndex === i ? '2px solid var(--color-success)' : 'none',
              }}
            >
              <span className="font-medium">{String.fromCharCode(65 + i)}.</span>
              <span>{option || `Option ${String.fromCharCode(65 + i)}`}</span>
              {quiz.correctIndex === i && <span className="ml-auto text-xs" style={{ color: 'var(--color-success)' }}>Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
