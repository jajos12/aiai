import type { ModuleData } from '@/core/types';

const logisticRegressionModule: ModuleData = {
  id: 'logistic-regression',
  tierId: 1,
  clusterId: 'ml-fundamentals',
  title: 'Logistic Regression',
  description:
    'Classification, probabilities, and the sigmoid function. How machines learn to separate data into categories.',
  tags: ['classification', 'sigmoid', 'cross-entropy', 'logistic-regression'],
  prerequisites: ['linear-regression'],
  difficulty: 'beginner',
  estimatedMinutes: 45,
  steps: [
    {
      id: 'why-not-linear',
      title: 'Why Not Linear Regression?',
      visualizationProps: {
        mode: 'why-not-linear-manim',
        points: [
          { x: 1, y: 0, class: 0 },
          { x: 2, y: 0, class: 0 },
          { x: 3, y: 0, class: 0 },
          { x: 5, y: 1, class: 1 },
          { x: 6, y: 1, class: 1 },
          { x: 7, y: 1, class: 1 },
          { x: 15, y: 1, class: 1 },
        ],
      },
      content: {
        text:
          'The visualization above is the Manim lesson: same toy 0/1 points as in the module, ordinary least squares (OLS) on those labels, then why that breaks, and finally how a sigmoid turns a linear score into a proper probability and a clean classification rule. Read the Learning Note below for the full story with formulas and worked examples.',
        goDeeper: {
          explanation:
            'TWO DIFFERENT QUESTIONS\n\n' +
            'Regression asks: “What numerical value do we expect?” (price, temperature). Classification asks: “Which discrete label?” (spam or not, pass or fail). You can encode the positive class as 1 and the negative class as 0, but that number is a label, not a measured quantity on a continuous scale. Treating labels as real-valued targets and running linear regression is a category error: the machinery assumes Gaussian-ish noise around a line, not Bernoulli outcomes.\n\n' +
            'WHAT OLS IS ACTUALLY DOING ON 0/1 DATA\n\n' +
            'Ordinary least squares picks coefficients so that a linear predictor is close to the targets in mean squared error. With one feature x, write\n\n' +
            '$$\n' +
            '\\hat{y}(x) = w x + b\n' +
            '$$\n\n' +
            'and minimize\n\n' +
            '$$\n' +
            '\\frac{1}{n} \\sum_{i=1}^{n} \\bigl( y_i - (w x_i + b) \\bigr)^2\n' +
            '$$\n\n' +
            'for labels y_i ∈ {0, 1}. Geometrically, you are still tilting a line through a scatterplot. Nothing in the formula forces 0 ≤ ŷ(x) ≤ 1, so “predictions” can be −0.3 or 1.4. Those are not valid probabilities for “class 1.”\n\n' +
            'EXAMPLE: SPAM SCORE ON A 0–10 SCALE\n\n' +
            'Suppose x is a hand-crafted “spaminess” score. For many inboxes, most ham sits on the left (low x) and spam on the right (high x). A fitted line might look reasonable in the middle of the plot. But extrapolate slightly: the line keeps growing past 1, or dips below 0 on the left. If you then say “ŷ is the chance of spam,” you are interpreting meaningless values as probabilities.\n\n' +
            'OUTLIERS AND LEVERAGE (THE x = 15 POINT)\n\n' +
            'In the video’s dataset, most class-1 points sit near x = 5–7, but one positive example sits at x = 15. Under squared error, errors are amplified by squaring, and points far in x direction have high leverage: they can rotate the whole line to reduce their own residual, even when that hurts the fit for the bulk of the data. So one extreme example can drag predictions for ordinary cases in a way that has little to do with “probability of class 1.”\n\n' +
            'WHY SQUARED LOSS DOES NOT MATCH CLASSIFICATION\n\n' +
            'For binary outcomes, a principled model is “y is a coin flip whose bias depends on x.” The right objective is tied to likelihood (log loss / cross-entropy), not minimizing vertical distance to 0 and 1. MSE on probabilities under a sigmoid is also poorly behaved for optimization. The video motivates the geometry first; the dedicated log-loss step makes the loss side precise.\n\n' +
            'THE LOGISTIC FIX: LINEAR SCORE, SIGMOID PROBABILITY\n\n' +
            'Keep a linear score z = w x + b (in higher dimensions, z = w^T x + b). Turn it into a probability with the sigmoid:\n\n' +
            '$$\n' +
            'p(x) = \\sigma(z) = \\frac{1}{1 + e^{-z}}\n' +
            '$$\n\n' +
            'For every real z, σ(z) lies strictly between 0 and 1. Interpret p(x) as P(class 1 | x). The graph of p versus x is S-shaped, not a straight line through the dots—but the decision structure is still linear in x, because the 50% contour is where z = 0.\n\n' +
            'HOW CLASSIFICATION COMES OUT OF THE SIGMOID\n\n' +
            'A standard decision rule fixes threshold 1/2 (unless you later move it for cost-sensitive deployment):\n\n' +
            '$$\n' +
            '\\hat{y}(x) = \\begin{cases} 1 & \\text{if } p(x) \\ge \\tfrac{1}{2} \\\\[0.35em] 0 & \\text{if } p(x) < \\tfrac{1}{2} \\end{cases}\n' +
            '$$\n\n' +
            'Because σ is strictly increasing, p(x) ≥ 1/2 is equivalent to z ≥ 0, i.e.\n\n' +
            '$$\n' +
            'w x + b \\ge 0\n' +
            '$$\n\n' +
            'So the “boundary” between predicted 0 and 1 is a hyperplane in feature space (a single cutoff on the x-axis in 1D). The sigmoid does not change where the boundary is relative to the linear score; it fixes the interpretation of values away from the boundary as calibrated probabilities instead of arbitrary line heights.\n\n' +
            'MINI WORKED NUMBERS\n\n' +
            'Take z = w x + b with w = 0.5 and b = −3. At x = 4, z = −1, so p = σ(−1) ≈ 0.27 → predict class 0. At x = 8, z = 1, p ≈ 0.73 → predict class 1. The flip happens near x = 6 where z = 0. Compare to OLS on the same points: you might get ŷ(4) = 0.4 and ŷ(8) = 0.9 but also ŷ(20) = 1.6, which is not a probability.\n\n' +
            'SUMMARY\n\n' +
            'Linear regression on 0/1 labels is the wrong generative story and the wrong geometry for probabilities. Logistic regression separates (1) a linear evidence score z = w^T x + b from (2) a nonlinear map σ(z) that produces valid probabilities and (3) a threshold on p (equivalently on z) for hard classification. Watch the embedded video for the plot progression, and use the next steps for sigmoid detail and log loss.',
        },
      },
      interactionHint:
        'Video: play / pause / scrub. Same points as the lesson (including the high-x positive). If the file is missing, an in-browser walkthrough loads instead.',
    },
    {
      id: 'the-sigmoid-function',
      title: 'The Sigmoid Function',
      visualizationProps: {
        mode: 'sigmoid-manim',
      },
      content: {
        text:
          'The panel above is the Manim lesson: linear score z = wx + b on one axis, the sigmoid formula, then probability p = σ(z) versus x below — including z = 0 / p = 0.5, how w and b stretch and shift the curve, and why the S-shape saturates in the tails. The Learning Note below walks through the same ideas with formulas and concrete numbers.',
        goDeeper: {
          explanation:
            'FROM FEATURES TO A REAL-VALUED SCORE\n\n' +
            'Logistic regression does not feed raw features straight into a probability. It first forms a linear score (logit input) z from the input x. In one dimension,\n\n' +
            '$$\n' +
            'z(x) = w x + b\n' +
            '$$\n\n' +
            'and with many features, z(x) = w^T x + b. The weights w encode how strongly each feature pushes toward class 1; the bias b sets the baseline evidence when x = 0. The video’s top plot is exactly this affine map: a straight line in x, but z itself is unbounded — it can be any real number.\n\n' +
            'THE SIGMOID AS A SQUASHING MAP\n\n' +
            'The logistic sigmoid turns that score into a number strictly between 0 and 1:\n\n' +
            '$$\n' +
            '\\sigma(z) = \\frac{1}{1 + e^{-z}}\n' +
            '$$\n\n' +
            'Limits: as z → +∞, e^{-z} → 0 so σ(z) → 1; as z → −∞, e^{-z} dominates and σ(z) → 0. At z = 0, σ(0) = 1/2. So every possible z maps to a valid open-interval probability (never exactly 0 or 1 in finite-precision code we clip for stability). Symmetry: σ(−z) = 1 − σ(z), which matches “evidence for class 0” as one minus “evidence for class 1.”\n\n' +
            'COMPOSITION: x → z → p\n\n' +
            'The probability for class 1 given x is the composition\n\n' +
            '$$\n' +
            'p(x) = \\sigma\\bigl(z(x)\\bigr) = \\sigma(w x + b)\n' +
            '$$\n\n' +
            'Linear in x is z; p(x) is generally nonlinear in x because σ bends the line. The bottom plot in the video is p versus x: an S-curve when w ≠ 0. The decision threshold p = 1/2 lines up with z = 0 in the top plot — same boundary, two views.\n\n' +
            'WHY THE TAILS FLATTEN (SATURATION)\n\n' +
            'The derivative is σ′(z) = σ(z)(1 − σ(z)). It is largest at z = 0 (about 0.25) and shrinks toward 0 when |z| is large. Intuitively, once the model is already very confident (z ≫ 0 or z ≪ 0), moving x a little changes p only slightly — the curve hugs 0 and 1. In the middle range, small changes in z (hence in x) swing p quickly; that is where the model is “unsure.”\n\n' +
            'EXAMPLE: SAME z, TWO STORIES\n\n' +
            'Take z = 2: σ(2) = 1/(1+e^{-2}) ≈ 0.88. Interpretation: strong evidence for class 1. Take z = −0.5: σ(−0.5) ≈ 0.38 — leaning class 0 but not extreme. The video animates larger w and negative b to show how the S-curve steepens and slides along the x-axis; that is exactly changing how fast z grows with x and where z crosses zero.\n\n' +
            'LINEAR IN PARAMETERS VS NONLINEAR IN x\n\n' +
            'z is linear in (w, b) for fixed x, but p = σ(wx + b) is not linear in x. Training adjusts w and b so that, on average, high-z regions align with class-1 examples and low-z regions with class-0 examples, while σ keeps every prediction in probability range — unlike a raw line ŷ = wx + b fitted to 0/1 labels.\n\n' +
            'SUMMARY\n\n' +
            'The sigmoid is the bridge from an unbounded linear evidence score to a bounded probability. Watch the Manim clip for the paired z and p graphs; the next step places the z = 0 / p = 0.5 geometry in 2D as a decision boundary, then log loss explains how we fit w and b.',
        },
      },
      interactionHint:
        'Video: play / pause / scrub — linear z on top, σ and p(x) below. If the MP4 is missing, an in-browser sigmoid story loads instead.',
    },
    {
      id: 'decision-boundary',
      title: 'The Decision Boundary',
      visualizationProps: {
        mode: 'decision-boundary-manim',
      },
      content: {
        text:
          'The video uses the same six example points as this module: two features (x₁, x₂), two classes, and weights w₁ = w₂ = 1, b = −8 so the boundary is the line x₁ + x₂ = 8. The Learning Note below explains z, σ(z), half-spaces, and how this generalizes to more features.',
        goDeeper: {
          explanation:
            'LINEAR SCORE IN TWO DIMENSIONS\n\n' +
            'With two features, logistic regression forms\n\n' +
            '$$\n' +
            'z(x_1, x_2) = w_1 x_1 + w_2 x_2 + b\n' +
            '$$\n\n' +
            'and outputs P(class 1 | x) = σ(z). The weights w₁ and w₂ say how much each feature pushes the score up or down; the bias b shifts the whole decision structure.\n\n' +
            'WHERE IS p EXACTLY ONE-HALF?\n\n' +
            'Because σ(0) = 1/2 and σ is strictly increasing, the set of points with p = 1/2 is exactly the set where z = 0:\n\n' +
            '$$\n' +
            'w_1 x_1 + w_2 x_2 + b = 0\n' +
            '$$\n\n' +
            'In the (x₁, x₂) plane this is a straight line (as long as (w₁, w₂) ≠ (0, 0)). On one side of the line, z > 0 so p > 1/2 — predict class 1. On the other, z < 0 so p < 1/2 — predict class 0. The line itself is the decision boundary for the default 0.5 threshold.\n\n' +
            'WORKED LAYOUT FROM THE VIDEO\n\n' +
            'Take w₁ = w₂ = 1 and b = −8. Then z = x₁ + x₂ − 8 and the boundary is x₁ + x₂ = 8. Check the blue (class 0) points: (2, 2) gives z = −4; (3, 1) gives z = −4; (1, 3) gives z = −4 — all on the “class 0” side. The red (class 1) points: (6, 5) → z = 3; (7, 7) → z = 6; (5, 8) → z = 5 — all on the “class 1” side. So this line is a perfect separator for that toy dataset.\n\n' +
            'GEOMETRY: NORMAL TO THE BOUNDARY\n\n' +
            'The vector (w₁, w₂) points in the direction in which z increases fastest. It is perpendicular to the boundary line. Walking in the (w₁, w₂) direction moves you into the region where the model becomes more confident about class 1.\n\n' +
            'MORE THAN TWO FEATURES\n\n' +
            'With d features, z = w^T x + b and the boundary w^T x + b = 0 is a hyperplane in ℝᵈ: an affine subspace of dimension d − 1. The same story holds — two half-spaces, σ(z) in (0, 1), threshold at z = 0 unless you change the deployment threshold.\n\n' +
            'NOT THE SAME AS DRAWING A LINE THROUGH SCATTER LABELS\n\n' +
            'The boundary is not fit by least squares through y ∈ {0, 1} as heights. It comes from learning (w, b) so that σ(z) matches labels via log loss, then reading off z = 0. The next step in the module is that loss.\n\n' +
            'SUMMARY\n\n' +
            'The decision boundary is the z = 0 surface: a line in 2D, a hyperplane in higher dimensions. It is where the model is maximally uncertain (p = 1/2). The Manim clip plots the line with the module’s example points; training chooses w and b so that such a surface aligns with real data.',
        },
      },
      interactionHint:
        'Video: play / pause / scrub. If the MP4 is missing, a static 2D preview with the same line and points loads.',
    },
    {
      id: 'log-loss',
      title: 'Cross-Entropy Loss (Log Loss)',
      visualizationProps: {
        mode: 'log-loss-manim',
      },
      content: {
        text: 'We can\'t use MSE for classification. Instead, we use Log Loss. It heavily penalizes the model if it is absolutely confident but completely wrong.',
        goDeeper: {
          math: 'L = -[y \\log(p) + (1-y)\\log(1-p)]',
          explanation: 'If the true class is 1 (y=1), we want probability p to be near 1. If p=0.01, -log(0.01) is a massive penalty. Log Loss creates a smooth, convex bowl for optimization, whereas MSE on a sigmoid curve creates a bumpy, non-convex surface.',
        },
      },
      interactionHint:
        'Manim lesson video (cross-entropy / log loss). Use play/pause and scrub as needed. Re-render from `manim/cross_entropy_loss.py` → copy to `public/logistic-logloss-manim/CrossEntropyLossLesson.mp4`.',
    },
    {
      id: 'odds-and-log-odds',
      title: 'Odds and Log-Odds',
      visualizationProps: {
        mode: 'none',
      },
      content: {
        text: 'Probabilities live in (0, 1), but a linear model wants an unbounded target. Odds and log-odds are the standard bridge: we fit a straight line to log-odds, then map back to probabilities with the sigmoid.',
        goDeeper: {
          math:
            '\\begin{aligned}' +
            '\\text{Odds} &= \\frac{p}{1-p} \\\\' +
            '\\text{Log-odds (logit)}\\quad \\ell &= \\ln\\frac{p}{1-p} \\\\' +
            '\\text{Logistic model}\\quad \\ell &= w^{\\top} x + b \\\\' +
            'p &= \\sigma(\\ell) = \\frac{1}{1 + e^{-\\ell}}' +
            '\\end{aligned}',
          explanation:
            'FROM PROBABILITY TO ODDS\n\n' +
            'If the positive class has probability p, the complementary probability is 1 − p. The odds O = p / (1 − p) answer: “how many times more likely is success than failure?” At p = 0.5, odds are 1 (even). As p → 1, odds grow without bound; as p → 0, odds → 0. Unlike p, odds range over (0, ∞), which is already easier to compare multiplicatively.\n\n' +
            'WHY TAKE THE LOGARITHM?\n\n' +
            'Log-odds, ell = ln(O) = ln(p / (1 - p)), are also called the logit of p. They span the entire real line: p just above 0 gives very negative ell, p just below 1 gives very positive ell. That matches what a linear predictor w^T x + b naturally outputs (any real number) without ever hitting a ceiling at 0 or 1.\n\n' +
            'WHY A LINEAR MODEL ON LOG-ODDS?\n\n' +
            'Logistic regression is a generalized linear model: the linear part predicts the link-transformed mean. Here the link is the logit. Saying “we use a straight line” means the effect of features on the log-odds is additive: each feature x_j adds w_j x_j to the score. That is not the same as drawing a straight line through probability-vs-x in a scatterplot; in probability space the implied curve is S-shaped (sigmoid).\n\n' +
            'FROM LOG-ODDS BACK TO p\n\n' +
            'Given log-odds ell = w^T x + b, recover p with the inverse logit (sigmoid): p = 1 / (1 + e^(-ell)). This guarantees 0 < p < 1, so outputs stay valid probabilities. Compositionally: affine map to ell, then nonlinear squashing to p.\n\n' +
            'READING THE WEIGHTS (INTUITION)\n\n' +
            'Holding other inputs fixed, increasing x_j by one unit adds w_j to the log-odds. On the odds scale, that multiplies odds by e^(w_j). So coefficients act on a log scale: they describe how evidence shifts belief in multiplicative odds terms before conversion to p.\n\n' +
            'SUMMARY\n\n' +
            'A straight line cannot faithfully model bounded probabilities across the whole real line, but it can model log-odds. The logit link is what makes linear scores and valid probabilities compatible; training (e.g. log loss) adjusts w and b in log-odds space while predictions are read out as p = sigma(ell).',
        },
      },
    },
    {
      id: 'thresholding',
      title: 'Thresholds: The Decision Point',
      visualizationProps: {
        mode: 'none',
      },
      content: {
        text: 'The model usually outputs a probability p for the positive class. The threshold tau decides when we act as if the answer is “yes.” Changing tau trades off false alarms against misses — it does not retrain the model.',
        goDeeper: {
          explanation:
            'FROM PROBABILITY TO A HARD DECISION\n\n' +
            'Suppose the model outputs p = P(class 1 | x) in (0, 1). In deployment we often need a binary action: treat the case as class 1 or not. A threshold tau on p makes that rule explicit.\n\n' +
            '$$\n' +
            '\\hat{y} = \\begin{cases} 1 & \\text{if } p \\ge \\tau \\\\ 0 & \\text{if } p < \\tau \\end{cases}\n' +
            '$$\n\n' +
            'The learned weights and biases that produce p are fixed; only tau moves. You are choosing operating point on the same curve.\n\n' +
            'CONFUSION COUNTS (REMINDER)\n\n' +
            'True positive (TP): predict 1, truly 1. False positive (FP): predict 1, truly 0. False negative (FN): predict 0, truly 1. True negative (TN): predict 0, truly 0. Lowering tau tends to increase both TP and FP (more “yes” decisions). Raising tau does the opposite.\n\n' +
            'EXAMPLE: MEDICAL SCREENING\n\n' +
            'Missing a real case (FN) can be very costly. You may set tau = 0.1 so that even moderate p triggers follow-up. Precision may drop (more healthy people flagged), but recall of disease rises.\n\n' +
            'EXAMPLE: SPAM FILTER\n\n' +
            'A false positive deletes a real email. You might set tau = 0.9 so only very confident spam is removed. That reduces FP but may let more spam through (higher FN on spam).\n\n' +
            'DEFAULT tau = 0.5\n\n' +
            'When errors are roughly symmetric and you care about balanced accuracy, 0.5 is a common default. It is not special to the math — it is one point on the ROC curve.\n\n' +
            'SUMMARY\n\n' +
            'Thresholding is a policy layer on top of calibrated or ranked probabilities. Choose tau from the relative cost of FP vs FN and the prevalence of the positive class.',
        },
      },
    },
    {
      id: 'precision-recall',
      title: 'Precision vs Recall',
      visualizationProps: {
        mode: 'none',
      },
      content: {
        text: 'After you pick a threshold, two questions matter: of everything you labeled positive, how many were right (precision)? Of all real positives, how many did you catch (recall)? They often pull in opposite directions.',
        goDeeper: {
          explanation:
            'COUNTS FROM A CONFUSION MATRIX\n\n' +
            'Work from four counts: TP (predict positive, truly positive), FP (predict positive, truly negative), FN (predict negative, truly positive), TN (predict negative, truly negative). All metrics below are computed at a fixed threshold.\n\n' +
            'PRECISION: TRUST IN POSITIVE PREDICTIONS\n\n' +
            'Precision answers: when the model says “positive,” how often is it correct? It is the fraction of predicted positives that are true positives.\n\n' +
            '$$\n' +
            '\\text{Precision} = \\frac{\\mathrm{TP}}{\\mathrm{TP} + \\mathrm{FP}}\n' +
            '$$\n\n' +
            'If precision is low, many of your “yes” decisions are false alarms.\n\n' +
            'RECALL: COVERAGE OF REAL POSITIVES\n\n' +
            'Recall (same as sensitivity) answers: of everyone who was truly positive, what fraction did we detect?\n\n' +
            '$$\n' +
            '\\text{Recall} = \\frac{\\mathrm{TP}}{\\mathrm{TP} + \\mathrm{FN}}\n' +
            '$$\n\n' +
            'If recall is low, the model misses many real positives.\n\n' +
            'WORKED MINI EXAMPLE\n\n' +
            '100 emails: 10 are spam, 90 are not. The model flags 12 as spam; 8 of those are truly spam, 4 are mistakes. Then TP = 8, FP = 4. Among the 10 real spam emails it missed 2, so FN = 2, TN = 86. Precision = 8/12 ≈ 0.67. Recall = 8/10 = 0.80. Lowering the spam threshold would usually raise recall (catch more spam) but can drop precision (more ham mislabeled).\n\n' +
            'F1: ONE NUMBER BETWEEN BOTH\n\n' +
            'The harmonic mean penalizes extreme imbalance: you cannot get a high F1 by excelling on only one of precision or recall.\n\n' +
            '$$\n' +
            'F_1 = \\frac{2 \\cdot \\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}\n' +
            '$$\n\n' +
            'Use F1 when both false positives and false negatives matter and the positive class is rare or asymmetric costs are hard to encode directly.\n\n' +
            'TRADEOFF\n\n' +
            'Sweeping the threshold typically increases one of precision or recall while decreasing the other. The ROC and precision–recall curves summarize what is achievable without retraining.',
        },
      },
    },
    {
      id: 'roc-curve',
      title: 'The ROC Curve & AUC',
      visualizationProps: {
        mode: 'roc-auc-manim',
      },
      content: {
        text:
          'The Manim lesson plots TPR versus FPR as you sweep every possible classification threshold on fixed model scores: the diagonal is random guessing; a curve bowed upward means better separation. The shaded area is AUC. Expand the Learning Note for definitions, how AUC relates to ranking, and what it does not tell you.',
        goDeeper: {
          explanation:
            'FROM THRESHOLD TO A CURVE\n\n' +
            'Fix a trained model that outputs a score or probability for the positive class. Choose a threshold τ: predict positive if score ≥ τ, else negative. For that τ you get a confusion matrix and thus TPR (true positive rate, same as recall) and FPR (false positive rate):\n\n' +
            '$$\n' +
            '\\mathrm{TPR} = \\frac{\\mathrm{TP}}{\\mathrm{TP} + \\mathrm{FN}}, \\qquad\n' +
            '\\mathrm{FPR} = \\frac{\\mathrm{FP}}{\\mathrm{FP} + \\mathrm{TN}}\n' +
            '$$\n\n' +
            'Sweep τ from strict (almost never predict positive) to loose (almost always predict positive). Each τ gives one pair (FPR, TPR). Plotting FPR on the horizontal axis and TPR on the vertical axis traces the ROC curve. The video shows a toy monotone curve above the diagonal plus a shaded area under the ROC.\n\n' +
            'THE DIAGONAL (CHANCE)\n\n' +
            'If predictions are unrelated to labels, TPR and FPR move together — the ROC hugs the line TPR = FPR from (0, 0) to (1, 1). That is the reference for “no skill.” A useful model’s ROC should lie above that line for most of the sweep.\n\n' +
            'WHAT IS AUC?\n\n' +
            'AUC (area under the ROC curve) integrates TPR as a function of FPR between 0 and 1:\n\n' +
            '$$\n' +
            '\\mathrm{AUC} = \\int_0^1 \\mathrm{TPR}(\\mathrm{FPR}) \\, d(\\mathrm{FPR})\n' +
            '$$\n\n' +
            'In practice it is computed with discrete thresholds (trapezoidal rule on the plotted points). AUC = 1 means perfect ranking: you can choose a threshold with TPR = 1 and FPR = 0. AUC = 0.5 matches random ordering relative to the base rate on this plot. AUC < 0.5 usually means the model ranks positives worse than chance; inverting the prediction rule often flips AUC to 1 − AUC.\n\n' +
            'RANKING INTERPRETATION\n\n' +
            'AUC equals the probability that a randomly chosen positive example gets a higher score than a randomly chosen negative (with a tie-breaking convention). So it measures **discrimination** — how well scores order positives above negatives — not whether probabilities are calibrated. A well-calibrated model and a poorly calibrated one can share the same ROC if their score rankings match.\n\n' +
            'WHAT AUC DOES NOT REPLACE\n\n' +
            'It does not encode asymmetric costs (false positive vs false negative). It averages over thresholds rather than picking the operating point you will deploy. On highly imbalanced data, precision–recall curves sometimes tell a clearer story than ROC. Use AUC as one summary of ranking quality, then choose τ (or cost-sensitive rules) from business constraints.\n\n' +
            'SUMMARY\n\n' +
            'ROC summarizes every threshold at once; AUC summarizes the ROC as a single number tied to ranking. Watch the embedded clip for the geometry, then use thresholding and precision–recall steps when you care about a specific decision policy.',
        },
      },
      interactionHint:
        'Video: play / pause / scrub. If the MP4 is missing, a static ROC sketch loads.',
    },
    {
      id: 'softmax-multiclass',
      title: 'Softmax: Beyond Binary',
      visualizationProps: {
        mode: 'softmax-manim',
      },
      content: {
        text: 'Three or more classes need a whole probability vector, not a single p. The softmax turns K real-valued logits into K nonnegative scores that sum to 1 — a proper categorical distribution.',
        goDeeper: {
          math:
            '\\begin{aligned}' +
            'p_i &= \\frac{e^{z_i}}{\\sum_{j=1}^{K} e^{z_j}} \\\\' +
            'L &= -\\sum_{k=1}^{K} y_k \\log p_k' +
            '\\end{aligned}',
          explanation:
            'Each class gets a logit z_i from the last linear layer. Exponentiating makes every term positive; dividing by the sum normalizes to 1. Adding the same constant to all logits leaves p unchanged, which is why implementations subtract max(z) before exp (numerical stability). For K = 2, softmax on (z_1, z_2) is equivalent to a sigmoid on the difference z_1 - z_2. Training uses multi-class cross-entropy with a one-hot label y. Convolutional and transformer classifiers typically end with linear logits + softmax (or equivalent) for prediction.',
        },
      },
      interactionHint:
        'Manim video: formula, 3-class numeric example, bar chart, logit shift, K=2 ↔ sigmoid, multi-class cross-entropy. Re-render: `manim/softmax_lesson.py` → `public/logistic-softmax-manim/SoftmaxLesson.mp4`.',
    },
  ],
  playground: {
    description: 'Experiment with logistic regression in a 2D space. Can you separate the data points perfectly?',
    parameters: [
      { id: 'w1', label: 'Weight 1 (X-axis)', type: 'slider', min: -5, max: 5, step: 0.1, default: 1 },
      { id: 'w2', label: 'Weight 2 (Y-axis)', type: 'slider', min: -5, max: 5, step: 0.1, default: 1 },
      { id: 'b', label: 'Bias', type: 'slider', min: -20, max: 20, step: 0.5, default: -8 },
    ],
    tryThis: [
      'Make w1 and w2 highly positive. What happens to the decision boundary?',
      'Sweep the bias back and forth. Watch the line sweep across the screen.',
    ],
  },
  challenges: [
    {
      id: 'classify-data',
      title: 'Separate the Classes',
      description: 'Adjust the weights and bias to perfectly separate the blue points from the orange points, achieving a loss below 0.2.',
      props: {
        mode: 'challenge',
        points: [
          { x: 2, y: 8, class: 0 }, { x: 3, y: 7, class: 0 }, { x: 4, y: 9, class: 0 }, { x: 1, y: 6, class: 0 },
          { x: 6, y: 2, class: 1 }, { x: 8, y: 3, class: 1 }, { x: 7, y: 4, class: 1 }, { x: 9, y: 1, class: 1 },
        ],
      },
      completionCriteria: { type: 'threshold', target: 0.2, metric: 'log_loss' },
      hints: [
        'Pay attention to the slope. Should w1 and w2 have the same sign?',
        'If the colors are flipped, multiply all your weights and your bias by -1.',
      ],
    },
  ],
};

export default logisticRegressionModule;
