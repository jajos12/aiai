'use client';

import { useMemo } from 'react';
import type { Module, Step } from '@/core/types';
import type { StepContentOverride } from '@/hooks/useLesson';
import { GoDeeper } from '@/components/lesson/GoDeeper';
import { AuthorNote } from '@/components/lesson/AuthorNote';
import { QuizBlock } from '@/components/lesson/QuizBlock';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** K-means guided steps: article-style Learning Note + embedded Manim player. */
const K_MEANS_GUIDED_STEP_IDS = new Set([
  'unsupervised-learning',
  'initializing-centroids',
  'assignment-step',
  'update-step',
  'distance-metrics-depth',
  'elbow-method',
  'silhouette-score',
  'initialization-sensitivity',
  'convergence-math',
]);

/** Attention module: long-form Learning Notes (paragraph blocks + optional display math). */
const ATTENTION_STEP_IDS = new Set([
  'the-database-analogy',
  'query-key-dot-product',
  'softmax-weights',
  'weighted-sum-values',
  'self-attention',
  'multi-head-attention',
  'scaling-factor-depth',
  'masked-attention',
  'cross-attention',
]);

/** Attention guided steps that embed a Manim MP4 (tall panel + top-right hint). */
const ATTENTION_MANIM_STEP_IDS = new Set([
  'the-database-analogy',
  'query-key-dot-product',
  'softmax-weights',
]);

/** Transformers guided steps that embed a Manim MP4. */
const TRANSFORMER_MANIM_STEP_IDS = new Set(['the-transformer-sandwich']);

/** Transformer module: article-style Learning Notes + Key formulas on every guided step. */
const TRANSFORMER_BLOCK_ARTICLE_STEP_IDS = new Set([
  'the-transformer-sandwich',
  'positional-encoding',
  'layer-normalization',
  'residual-connections',
  'feed-forward-networks',
  'encoder-vs-decoder',
  'embedding-space',
  'tokenization',
  'the-final-projection',
  'softmax-temperature',
  'weight-tying',
  'scaling-laws',
]);

interface StepViewerProps {
  step: Step;
  Visualization: Module['Visualization'];
  direction: 'next' | 'back';
  stepIndex: number;
  totalSteps: number;
  isCompleted: boolean;
  quizAnswer?: number;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
  onQuizAnswer: (answerIndex: number) => void;
  canGoNext: boolean;
  canGoBack: boolean;
  isLastStep: boolean;
  onFinishModule?: () => void;
  contentOverride?: StepContentOverride;
  isGeneratingLevel?: boolean;
  levelError?: string | null;
  onClearLevelError?: () => void;
}

export function StepViewer({
  step,
  Visualization,
  direction,
  stepIndex,
  totalSteps,
  isCompleted,
  quizAnswer,
  onComplete,
  onNext,
  onBack,
  onQuizAnswer,
  canGoNext,
  canGoBack,
  isLastStep,
  onFinishModule,
  contentOverride,
  isGeneratingLevel,
  levelError,
  onClearLevelError,
}: StepViewerProps) {
  const slideClass = direction === 'next' ? 'step-slide-next' : 'step-slide-back';
  const displayText = contentOverride?.text ?? step.content.text;
  const displayGoDeeper = contentOverride?.goDeeper ?? step.content.goDeeper;
  const goDeeperExplanation = displayGoDeeper?.explanation;
  const learningNote = goDeeperExplanation ?? step.quiz?.explanation;
  /** Multi-paragraph goDeeper notes (any module) get article layout + formula card when math is set. */
  const isExpandedCurriculumNote = Boolean(
    goDeeperExplanation &&
      goDeeperExplanation.length >= 420 &&
      /\n\s*\n/.test(goDeeperExplanation) &&
      goDeeperExplanation
        .split(/\n\s*\n/)
        .map((b) => b.trim())
        .filter((b) => b.length > 0).length >= 3,
  );
  const isArticleNote =
    (step.id === 'gradient-descent-intuition' && Boolean(learningNote && learningNote.length > 2000)) ||
    (step.id === 'odds-and-log-odds' && Boolean(learningNote && learningNote.length > 600)) ||
    (step.id === 'why-not-linear' && Boolean(learningNote && learningNote.length > 400)) ||
    (step.id === 'the-sigmoid-function' && Boolean(learningNote && learningNote.length > 400)) ||
    (step.id === 'decision-boundary' && Boolean(learningNote && learningNote.length > 400)) ||
    (step.id === 'roc-curve' && Boolean(learningNote && learningNote.length > 400)) ||
    (step.id === 'softmax-multiclass' && Boolean(learningNote && learningNote.length > 400)) ||
    (step.id === 'thresholding' && Boolean(learningNote && learningNote.length > 400)) ||
    (step.id === 'precision-recall' && Boolean(learningNote && learningNote.length > 400)) ||
    (K_MEANS_GUIDED_STEP_IDS.has(step.id) && Boolean(learningNote && learningNote.length > 320)) ||
    (ATTENTION_STEP_IDS.has(step.id) && Boolean(learningNote && learningNote.length > 280)) ||
    (TRANSFORMER_BLOCK_ARTICLE_STEP_IDS.has(step.id) && Boolean(learningNote && learningNote.length > 280)) ||
    isExpandedCurriculumNote;
  const noteLines = learningNote
    ? learningNote
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [];
  const hasBulletLines =
    !isArticleNote && noteLines.some((line) => line.startsWith('- ') || line.startsWith('• '));
  const articleBlocks = isArticleNote
    ? (learningNote ?? '')
        .split('\n\n')
        .map((block) => block.trim())
        .filter((block) => block.length > 0)
    : [];

  const showStepFormulaCard =
    Boolean(displayGoDeeper?.math) &&
    (step.id === 'gradient-descent-intuition' ||
      step.id === 'odds-and-log-odds' ||
      ATTENTION_STEP_IDS.has(step.id) ||
      TRANSFORMER_BLOCK_ARTICLE_STEP_IDS.has(step.id) ||
      isExpandedCurriculumNote);
  const formulaHtml = useMemo(() => {
    const latex = displayGoDeeper?.math;
    if (!latex) return '';
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return '';
    }
  }, [step.content.goDeeper?.math]);

  function renderArticleMathLatex(latex: string): string {
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return '';
    }
  }

  function isDisplayMathArticleBlock(block: string): boolean {
    const t = block.trim();
    return t.startsWith('$$') && t.endsWith('$$') && t.length > 4;
  }

  function articleMathInner(block: string): string {
    return block.trim().slice(2, -2).trim();
  }

  function handleContinue() {
    onComplete();
    if (isLastStep && onFinishModule) {
      onFinishModule();
    } else if (canGoNext) {
      onNext();
    }
  }

  function renderVisualization() {
    if (!Visualization) return null;
    return <Visualization presentation="guided" {...step.visualizationProps} />;
  }

  const hideVisualizationPanel =
    typeof step.visualizationProps?.mode === 'string' && step.visualizationProps.mode === 'none';

  const isAnimationEmbedStep =
    step.id === 'gradient-descent-intuition' ||
    step.id === 'matrix-form' ||
    step.id === 'feature-scaling' ||
    step.id === 'r-squared' ||
    step.id === 'why-not-linear' ||
    step.id === 'the-sigmoid-function' ||
    step.id === 'decision-boundary' ||
    step.id === 'roc-curve' ||
    step.id === 'log-loss' ||
    step.id === 'softmax-multiclass' ||
    ATTENTION_MANIM_STEP_IDS.has(step.id) ||
    TRANSFORMER_MANIM_STEP_IDS.has(step.id) ||
    K_MEANS_GUIDED_STEP_IDS.has(step.id);

  return (
    <div
      key={`step-${stepIndex}`}
      className={slideClass}
      style={{
        display: 'block',
      }}
    >
      {!hideVisualizationPanel && (
        <div
          style={{
            minHeight: isAnimationEmbedStep ? 'min(520px, 60vh)' : '320px',
            height: isAnimationEmbedStep
              ? 'clamp(560px, min(72vh, 900px), 920px)'
              : 'clamp(320px, 48vh, 520px)',
            maxHeight: isAnimationEmbedStep ? 'min(94vh, 960px)' : undefined,
            background: 'var(--bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: isAnimationEmbedStep ? 'stretch' : 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '1rem',
          }}
        >
          {renderVisualization()}

          {step.interactionHint && (
            <div
              style={{
                position: 'absolute',
                /* Bottom-left covers embedded player controls; keep walkthrough hints top-right */
                ...(step.id === 'gradient-descent-intuition' ||
                step.id === 'matrix-form' ||
                step.id === 'feature-scaling' ||
                step.id === 'r-squared' ||
                step.id === 'why-not-linear' ||
              step.id === 'the-sigmoid-function' ||
              step.id === 'decision-boundary' ||
              step.id === 'roc-curve' ||
              step.id === 'log-loss' ||
              step.id === 'softmax-multiclass' ||
              ATTENTION_MANIM_STEP_IDS.has(step.id) ||
              TRANSFORMER_MANIM_STEP_IDS.has(step.id) ||
              K_MEANS_GUIDED_STEP_IDS.has(step.id)
                ? {
                      top: '0.5rem',
                      right: '0.5rem',
                      bottom: 'auto',
                      left: 'auto',
                    }
                  : {
                      bottom: '0.5rem',
                      left: '0.5rem',
                    }),
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(10,14,39,0.82)',
                border: '1px solid rgba(99,102,241,0.2)',
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                maxWidth: '260px',
                lineHeight: 1.45,
                zIndex: 4,
                pointerEvents: 'none',
                backdropFilter: 'blur(6px)',
              }}
            >
              💡 {step.interactionHint}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          padding: '0.25rem 0 1.25rem 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--accent)',
            }}
          >
            Step {stepIndex + 1} of {totalSteps}
          </span>
          {isCompleted && (
            <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>✅</span>
          )}
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 0.75rem 0',
            letterSpacing: '-0.01em',
          }}
        >
          {step.title}
        </h2>

        {levelError && (
          <div
            style={{
              marginBottom: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '0.78rem',
              color: '#fca5a5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>⚠️ {levelError}</span>
            {onClearLevelError && (
              <button
                onClick={onClearLevelError}
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {contentOverride && !isGeneratingLevel && (
          <div
            style={{
              marginBottom: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.35)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            ✨ AI-rewritten
          </div>
        )}

        <div style={{ position: 'relative' }}>
          {isGeneratingLevel && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(var(--bg-base-rgb, 2,6,23),0.65)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: 'var(--accent)',
                fontStyle: 'italic',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid var(--accent)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              Generating explanation…
            </div>
          )}
          <p
            style={{
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              margin: 0,
              opacity: isGeneratingLevel ? 0.35 : 1,
              transition: 'opacity 200ms ease',
            }}
          >
            {displayText}
          </p>
        </div>

        {learningNote && (
          <div
            style={{
              marginTop: '0.85rem',
              border: isArticleNote ? '1px solid var(--border-subtle)' : '1px solid rgba(56, 189, 248, 0.35)',
              background: isArticleNote ? 'var(--bg-base)' : 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.92) 42%, rgba(12,74,110,0.2) 100%)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 0.95rem',
              boxShadow: '0 12px 30px rgba(2, 6, 23, 0.35)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.73rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#67e8f9',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Learning Note
            </p>

            {isArticleNote ? (
              <div
                style={{
                  marginTop: '0.6rem',
                  padding: '0.8rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  border: 'none',
                }}
              >
                {articleBlocks.map((block, idx) => {
                  if (isDisplayMathArticleBlock(block)) {
                    const html = renderArticleMathLatex(articleMathInner(block));
                    return (
                      <div
                        key={`article-block-${idx}`}
                        style={{
                          margin: idx === 0 ? 0 : '0.75rem 0 0 0',
                          padding: '0.55rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(2, 6, 23, 0.45)',
                          border: '1px solid rgba(99, 102, 241, 0.22)',
                          overflowX: 'auto',
                          lineHeight: 1.85,
                        }}
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    );
                  }
                  const clean = block.startsWith('- ') ? block.slice(2) : block;
                  const isSectionTitle =
                    clean === clean.toUpperCase() ||
                    clean.endsWith(':') ||
                    clean.startsWith('WHY ') ||
                    clean.startsWith('WHAT ') ||
                    clean.startsWith('HOW ') ||
                    clean.startsWith('WHICH ');
                  return (
                    <p
                      key={`article-block-${idx}`}
                      style={{
                        margin: idx === 0 ? 0 : '0.8rem 0 0 0',
                        fontSize: isSectionTitle ? '1.04rem' : '1.14rem',
                        lineHeight: isSectionTitle ? 1.6 : 1.86,
                        fontWeight: 400,
                        color: isSectionTitle ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontFamily: 'Inter, var(--font-body), sans-serif',
                      }}
                    >
                      {clean}
                    </p>
                  );
                })}
              </div>
            ) : hasBulletLines ? (
              <ul
                style={{
                  margin: '0.5rem 0 0 0',
                  paddingLeft: '1rem',
                  color: '#cbd5e1',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  fontFamily: 'Inter, var(--font-body), sans-serif',
                }}
              >
                {noteLines.map((line, idx) => {
                  const normalized = line.startsWith('- ') ? line.slice(2) : line.startsWith('• ') ? line.slice(2) : line;
                  return (
                    <li key={`note-line-${idx}`} style={{ marginBottom: '0.28rem' }}>
                      {normalized}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p
                style={{
                  margin: '0.45rem 0 0 0',
                  fontSize: '0.92rem',
                  lineHeight: 1.72,
                  color: '#cbd5e1',
                  fontFamily: 'Inter, var(--font-body), sans-serif',
                }}
              >
                {learningNote}
              </p>
            )}
          </div>
        )}

        {showStepFormulaCard && formulaHtml && (
          <div
            style={{
              marginTop: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(129, 140, 248, 0.45)',
              background:
                'linear-gradient(145deg, rgba(30, 27, 75, 0.55) 0%, rgba(15, 23, 42, 0.92) 55%, rgba(49, 46, 129, 0.15) 100%)',
              padding: '0.75rem 1rem 1rem',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.45)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#a5b4fc',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Key formulas
            </p>
            <div
              style={{
                marginTop: '0.65rem',
                padding: '0.65rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(2, 6, 23, 0.35)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                overflowX: 'auto',
                lineHeight: 1.85,
              }}
              dangerouslySetInnerHTML={{ __html: formulaHtml }}
            />
            {step.id === 'gradient-descent-intuition' && (
              <p
                style={{
                  margin: '0.55rem 0 0',
                  fontSize: '0.75rem',
                  lineHeight: 1.55,
                  color: 'var(--text-muted)',
                  fontFamily: 'Inter, var(--font-body), sans-serif',
                }}
              >
                Display math uses weight w and bias b (same role as slope and intercept in the interactive plot).
              </p>
            )}
            {step.id === 'odds-and-log-odds' && (
              <p
                style={{
                  margin: '0.55rem 0 0',
                  fontSize: '0.75rem',
                  lineHeight: 1.55,
                  color: 'var(--text-muted)',
                  fontFamily: 'Inter, var(--font-body), sans-serif',
                }}
              >
                The linear part predicts log-odds on the real line; σ is the inverse link that turns that score into a
                valid probability.
              </p>
            )}
          </div>
        )}

        {displayGoDeeper &&
          !ATTENTION_STEP_IDS.has(step.id) &&
          !TRANSFORMER_BLOCK_ARTICLE_STEP_IDS.has(step.id) &&
          step.id !== 'why-not-linear' &&
          step.id !== 'the-sigmoid-function' &&
          step.id !== 'decision-boundary' &&
          step.id !== 'roc-curve' &&
          step.id !== 'softmax-multiclass' &&
          step.id !== 'thresholding' &&
          step.id !== 'precision-recall' &&
          !K_MEANS_GUIDED_STEP_IDS.has(step.id) &&
          !(
            (step.id === 'gradient-descent-intuition' || step.id === 'odds-and-log-odds') &&
            showStepFormulaCard &&
            formulaHtml
          ) && (
            <GoDeeper data={displayGoDeeper} hideExplanation />
          )}

        {step.content.authorNote && (
          <AuthorNote content={step.content.authorNote} />
        )}

        {step.quiz && (
          <QuizBlock
            quiz={step.quiz}
            existingAnswer={quizAnswer}
            onAnswer={onQuizAnswer}
          />
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className="btn btn--ghost btn--sm"
            style={{
              opacity: canGoBack ? 1 : 0.3,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            ← Back
          </button>

          <button
            onClick={handleContinue}
            className="btn btn--primary btn--md"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            {isLastStep ? '🎉 Finish Module' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
