/**
 * Compiles a y = f(x) expression for admin graph preview.
 * Only allows a conservative character set (no statements, no strings).
 */

const BLOCKED = /[;=`'"\\{}[\]]|=>|import|export|fetch|eval|Function|process|globalThis|window|document/i;

function translateMathCalls(expr: string): string {
  let t = expr.replace(/\^/g, '**').replace(/π/g, 'Math.PI').replace(/\bPI\b/g, 'Math.PI');
  const pairs: Array<[RegExp, string]> = [
    [/Math\.Math\./g, 'Math.'],
    [/\bsin\(/g, 'Math.sin('],
    [/\bcos\(/g, 'Math.cos('],
    [/\btan\(/g, 'Math.tan('],
    [/\bsqrt\(/g, 'Math.sqrt('],
    [/\babs\(/g, 'Math.abs('],
    [/\bexp\(/g, 'Math.exp('],
    [/\blog\(/g, 'Math.log('],
    [/\batan2\(/g, 'Math.atan2('],
    [/\bmin\(/g, 'Math.min('],
    [/\bmax\(/g, 'Math.max('],
    [/\bpow\(/g, 'Math.pow('],
  ];
  for (const [re, rep] of pairs) {
    t = t.replace(re, rep);
  }
  return t;
}

const SAFE_BODY = /^[0-9eE.+\-*/(),\sxMathsinocqrtabduPIw_]+$/;

export function tryCompileGraphY(source: string): ((x: number) => number) | null {
  const trimmed = source.trim();
  if (!trimmed) return () => 0;
  if (BLOCKED.test(trimmed) || trimmed.length > 400) return null;
  const body = translateMathCalls(trimmed);
  if (!SAFE_BODY.test(body)) return null;
  try {
    const fn = new Function('x', `"use strict"; return (${body});`) as (x: number) => number;
    const y0 = fn(0);
    if (typeof y0 !== 'number' || !Number.isFinite(y0)) return null;
    const y1 = fn(1);
    if (typeof y1 !== 'number' || !Number.isFinite(y1)) return null;
    return fn;
  } catch {
    return null;
  }
}
