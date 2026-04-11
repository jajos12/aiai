import type { ModuleData } from '@/core/types';

const linearRegressionModule: ModuleData = {
  id: 'linear-regression',
  tierId: 1,
  clusterId: 'ml-basics',
  title: 'Linear Regression',
  description:
    'Fitting lines to data points and understanding loss — the Hello World of Machine Learning.',
  tags: ['linear-regression', 'machine-learning', 'loss', 'optimization'],
  prerequisites: ['vectors', 'optimization'],
  difficulty: 'beginner',
  estimatedMinutes: 30,
  steps: [
    {
      id: 'what-is-a-model',
      title: 'What is a Model?',
      visualizationProps: {
        mode: 'static',
        points: [
          { x: 1, y: 2 },
          { x: 2, y: 3.5 },
          { x: 3, y: 4.5 },
          { x: 4, y: 6 },
        ],
        line: { m: 1.2, b: 0.8 },
      },
      content: {
        text: 'A model is a simplified rule that maps input to output. In linear regression, that rule is a straight line used to approximate trends in data. The points are real observations, while the line is our best attempt to summarize their pattern. If points stay close to the line, the model is doing well. If they are far away, the model is missing important structure.',
        goDeeper: {
          math: 'y = mx + b',
          explanation:
            'In machine learning, we often write this as f(x) = w*x + b, where w is the slope (weight) and b is the intercept (bias). The weight controls how strongly x affects prediction, and the bias shifts predictions up or down.',
        },
      },
    },
    {
      id: 'the-residuals',
      title: 'The Residuals',
      visualizationProps: {
        mode: 'residuals',
        points: [
          { x: 1, y: 2 },
          { x: 2, y: 3.5 },
          { x: 3, y: 4.5 },
          { x: 4, y: 6 },
        ],
        line: { m: 1, b: 1 },
        showResiduals: true,
      },
      content: {
        text: 'The vertical distance from each observed point to the prediction line is called a residual. For each point, we first compute the model prediction and then subtract it from the true value. If the point is above the line, residual is positive; if below, residual is negative. In the visualization, each dashed segment is one computed residual, not just a sketch. A good regression model makes these residuals small overall. Big AI idea: many deep models also learn residuals, meaning they learn what to change (a correction) instead of learning everything from scratch.',
        goDeeper: {
          math: 'e_i = y_i - \\hat{y}_i',
          explanation:
            'Formally, for each sample i: true value is y_i, prediction is y_hat_i = m*x_i + b, and residual is e_i = y_i - y_hat_i. Example: if x=2 and the line is y_hat = 1*x + 1, then y_hat = 3. If actual y=3.5, residual is e = 3.5 - 3 = 0.5. In ML/AI, residuals measure unexplained signal, and learning adjusts parameters to reduce aggregated residual error (usually MSE). In deep residual networks the same intuition appears as y = x + F(x): the network learns the correction F(x) instead of relearning the full mapping.',
        },
        authorNote:
          'Intuition: normal deep layers try to learn a full transformation; residual connections add a shortcut so the model can focus on small corrections. This usually makes deep networks easier to optimize.',
      },
      quiz: {
        question: 'If a point lies exactly on the line, what is its residual?',
        options: ['1', '0', '-1', 'Undefined'],
        correctIndex: 1,
        explanation: 'If the prediction is perfect (y_i = y_hat_i), the residual is 0.',
      },
    },
    {
      id: 'drag-to-fit',
      title: 'Drag to Fit: Minimizing MSE',
      visualizationProps: {
        mode: 'interactive',
        points: [
          { x: 1, y: 1 },
          { x: 2, y: 3 },
          { x: 3, y: 2.5 },
          { x: 4, y: 5 },
          { x: 5, y: 4.5 },
        ],
        line: { m: 0.5, b: 1 },
        draggableLine: true,
        showResiduals: true,
        showMSE: true,
      },
      content: {
        text: 'Drag the line to fit the points and watch the MSE number change live. MSE means "average squared prediction error" across all points: lower is better. In ML, MSE is a training objective for regression because it gives a single numeric score the optimizer can minimize. Squaring makes larger mistakes count much more than small ones. This is useful when you want models to strongly avoid large misses.',
        goDeeper: {
          math: '\\text{MSE} = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - (mx_i + b))^2',
          explanation: 'MSE takes each residual e_i = y_i - y_hat_i, squares it, then averages over all points. Example 1: residuals [1, -1, 2] -> squared [1, 1, 4] -> MSE = (1+1+4)/3 = 2. Example 2: residuals [0.2, -0.2, 0.1] -> squared [0.04, 0.04, 0.01] -> MSE = 0.03. In AI training, gradient descent updates parameters to reduce this value step by step.',
        },
        authorNote:
          'Interpretation tip: if MSE drops after you adjust the line, the model is fitting the observed data better on average.',
      },
      interactionHint: 'Drag the handles to change the slope and intercept',
    },
    {
      id: 'why-squared-error',
      title: 'Why Squared Error?',
      visualizationProps: {
        mode: 'squared-error',
        points: [
          { x: 2, y: 4 },
          { x: 4, y: 2 },
        ],
        line: { m: 0, b: 3 },
        draggableLine: true,
        showResiduals: true,
        showSquares: true,
        showMSE: true,
      },
      content: {
        text: 'Notice the literal squares drawn from the residuals. Larger residuals create much larger squares because the error is squared. This is exactly why MSE strongly penalizes large misses. In regression training, that pressure usually pushes the model to avoid extreme mistakes. Visually, the best line is the one that keeps total squared area as small as possible.',
        goDeeper: {
          explanation: 'Absolute error (L1) adds raw distances, while squared error (L2) adds squared distances. L2 gives a smooth bowl-like objective that works well with gradient-based optimization. That is why MSE is one of the default losses for basic regression tasks.',
        },
      },
      quiz: {
        question: 'Which of these models would the MSE penalize the most?',
        options: ['Two errors of 2', 'One error of 4', 'Four errors of 1', 'They are all penalized equally'],
        correctIndex: 1,
        explanation: 'Squaring an error of 4 gives 16. Two errors of 2 give 2^2 + 2^2 = 8. Four errors of 1 give 1^2 * 4 = 4. MSE strongly penalizes single large errors.',
      },
    },
    {
      id: 'gradient-descent-intuition',
      title: 'Gradient Descent in Relation to Linear Regression',
      visualizationProps: {
        mode: 'gradient-descent',
        showLandscape: true,
      },
      content: {
        text: 'Use the full-screen walkthrough above: press Play, read the chapter labels and captions, and watch 1D and 2D loss geometry, learning-rate behavior, and a noisy SGD sketch. On the next step you will drive gradient descent yourself on the linear-regression MSE surface in (m, b).',
        goDeeper: {
          math: '\\begin{aligned}\\hat{y} &= wx + b \\\\ J(w,b) &= \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2 \\\\ w &\\leftarrow w - \\alpha \\frac{\\partial J}{\\partial w} \\\\ b &\\leftarrow b - \\alpha \\frac{\\partial J}{\\partial b}\\end{aligned}',
          explanation: `Linear Regression is one of the simplest and most important algorithms in machine learning. It tries to model the relationship between an input variable and an output variable using a straight line. The goal is to find a line that best fits the given data so that predictions are as accurate as possible.

Suppose we have a dataset where we want to predict house prices based on house size. Each data point represents a pair of values: the size of the house and its price. If we plot these points on a graph, we will see scattered points in a two-dimensional space. Linear Regression tries to draw a straight line through these points in such a way that the line represents the overall trend of the data.

The equation of this line is given in the Key formulas card: the predicted output y-hat depends on the input x, a weight w (slope), and a bias b (intercept). Here, x is the input (house size), y-hat is the predicted price, w controls how steep the line is, and b controls where the line crosses the vertical axis. The main challenge is to find the correct values of w and b so that the line fits the data well.

At the beginning, we do not know the correct values of w and b, so we start with random or arbitrary values. Because these values are not yet tuned, the line will not fit the data properly. Some predicted values will be too high, and others will be too low. To measure how wrong the predictions are, we use a cost function. In Linear Regression, the most commonly used cost function is Mean Squared Error (MSE).

The cost function measures the difference between the real values and the predicted values. It averages the squared difference between each actual output y and its prediction y-hat across all points. If the predictions are far from the real values, the cost will be large. If the predictions are close to the real values, the cost will be small. The ultimate goal of Linear Regression is to minimize this cost function.

This is where Gradient Descent becomes essential. Gradient Descent is an optimization algorithm used to minimize the cost function by adjusting the parameters w and b. Instead of trying all possible values of w and b, Gradient Descent finds better values step by step by moving in the direction that reduces the cost.

To understand this, imagine standing on a hill and trying to reach the lowest point in a valley. You look at the slope around you and take a small step in the downward direction. Then you look again and take another step. After many steps, you eventually reach the lowest point. Gradient Descent works in the same spirit: the cost defines a surface over the parameters, and the algorithm moves along that surface toward a minimum.

Mathematically, Gradient Descent uses derivatives to determine the direction of movement. A derivative tells us how a function changes with respect to a variable. In this case, we compute how the cost changes when we change w and when we change b. Those partial derivatives are the gradients; they show how the cost responds to small changes in each parameter.

The update rules are written compactly in the Key formulas card. The Greek letter alpha is the learning rate. The learning rate controls how big the step is in each iteration. The derivative tells us the direction, and the learning rate controls how far we move in that direction.

If the learning rate is very small, the model will learn slowly because it takes tiny steps toward the minimum. If the learning rate is too large, the model may overshoot the minimum and fail to converge. Therefore, choosing the right learning rate is very important for Gradient Descent to work properly.

When we compute the derivatives of the MSE cost for Linear Regression, the expressions depend on the error between predicted and actual values. These derivatives guide the update of w and b. After each update, the line shifts slightly, and the cost usually decreases. This process continues until the cost is small enough or changes very little between steps, and the line fits the data well.

Geometrically, the MSE cost for ordinary linear regression forms a bowl-shaped surface in (w, b) space. The bottom of the bowl represents the minimum cost. Gradient Descent moves down this bowl step by step until it reaches the lowest region. At that point, we obtain the values of w and b that define the best-fitting line for this objective.

In practice, the process works as follows. First, we initialize w and b. Then we compute predictions using the linear model. After that, we calculate the cost and compute gradients. Next, we update the parameters using Gradient Descent. This process repeats for many iterations until the model converges.

The relationship between Linear Regression and Gradient Descent is therefore very direct. Linear Regression defines the prediction function and the cost function, while Gradient Descent provides a practical way to minimize that cost and learn the parameters. For small problems there are also closed-form solutions, but the same gradient-based idea scales to large datasets and high dimensions and is central to how modern systems are trained.

This idea extends far beyond Linear Regression. Gradient Descent and its variants underpin much of modern machine learning and deep learning. Neural networks, convolutional and recurrent models, and even large language models rely on gradient-based updates to reduce error. Linear Regression is often the clearest place to understand the pattern because the model is simple and the geometry is easy to picture.

In summary, Linear Regression models data with a straight line, and Gradient Descent helps find a strong line by minimizing prediction error under the chosen cost. The cost function measures how wrong the model is, the gradient shows how to improve w and b, and the learning rate controls how fast the model moves toward a good solution. Through repeated updates, the model gradually improves until it finds parameters that fit the data well.`,
        },
        authorNote:
          'The walkthrough is narrated on-screen. When you reach the hands-on step next, vary the learning rate and watch how the path and MSE change.',
      },
      interactionHint: 'Press Play in the visualization; Space also toggles play/pause.',
    },
    {
      id: 'gradient-descent-mse-playground',
      title: 'Hands-on: MSE surface in (m, b)',
      visualizationProps: {
        mode: 'gradient-descent-interactive',
      },
      content: {
        text: 'This is the same MSE objective as linear regression, but plotted over slope m and intercept b. Step the optimizer with different learning rates: too small moves slowly, too large can overshoot. Connect what you see to the formulas in the Learning Note and the long explanation on the previous step.',
        goDeeper: {
          math: 'J(m,b)=\\frac{1}{n}\\sum_i (y_i - (m x_i + b))^2',
          explanation:
            'Each Step Once applies one gradient-descent update on J using the fixed sample points in the demo. The contour ellipses are schematic guides for the bowl-shaped loss near the minimum.',
        },
        authorNote:
          'Try α = 0.01, then 0.05, then 0.15: compare path stability and how MSE decreases.',
      },
      interactionHint:
        'Adjust the learning-rate slider, then use Step Once repeatedly. Reset and compare a conservative vs aggressive α.',
    },
    {
      id: 'matrix-form',
      title: 'Linear Regression in Matrix Form',
      visualizationProps: {
        mode: 'matrix-animation',
      },
      content: {
        text: 'Watch the short narrated walkthrough above: it builds the design matrix X, the target vector y, the weight vector w, and the prediction ŷ = Xw, then sketches the loss and the normal equation. The same layout is how batch prediction is implemented in NumPy-style code.',
        goDeeper: {
          math: '\\hat{y} = Xw',
          explanation: 'The normal equation computes optimal weights directly: w = (X^T X)^(-1) X^T y. This avoids iterative gradient descent for small to medium problems. However, for very large feature spaces, iterative optimization is usually preferred for speed and memory reasons.',
        },
        authorNote:
          'Pause and rewind if needed — the on-screen matrices use three rows (n=3) and two columns (feature + bias) to keep the picture readable.',
      },
      interactionHint: 'Press Play in the visualization; Space toggles play/pause.',
    },
    {
      id: 'feature-scaling',
      title: 'The Danger of Different Scales',
      visualizationProps: {
        mode: 'scaling-three',
      },
      content: {
        text: 'Explore the 3D view above: two toy MSE bowls in weight space — a long narrow valley (like raw features on very different scales) versus a balanced bowl (like after per-feature standardization). Toggle side-by-side or single-bowl views, orbit the camera, and watch how gradient-descent paths differ.',
        goDeeper: {
          explanation: 'Standardization transforms each feature to approximately zero mean and unit variance. This makes gradient updates more balanced across dimensions and usually speeds convergence. It also improves numerical stability in many learning algorithms.',
        },
        authorNote:
          'The surfaces are idealized quadratics, not a literal dataset loss, but they show why ill-conditioning produces zig-zags and why rescaling improves geometry.',
      },
      interactionHint: 'Drag to orbit · use View buttons · toggle “Animate descent dot” to replay the path.',
    },
    {
      id: 'r-squared',
      title: 'R-Squared: Measuring Quality',
      visualizationProps: {
        mode: 'residuals-comparison',
        showRSquared: true,
      },
      content: {
        text: 'R-squared compares your model against a simple baseline that predicts the mean every time. It answers: how much of the output variability is explained by this line? Values closer to 1 indicate better fit, while values near 0 mean little improvement over baseline. This gives a quick quality signal beyond raw loss values. It is widely used in regression reporting.',
        goDeeper: {
          math: 'R^2 = 1 - \\frac{SS_{res}}{SS_{tot}}',
          explanation: 'SS_res is the model residual sum of squares, and SS_tot is total variance around the mean baseline. R^2 = 1 indicates perfect fit, while R^2 = 0 means no gain over predicting the mean. Negative R^2 can happen when a model performs worse than the mean baseline.',
        },
      },
      interactionHint:
        'Drag to orbit · adjust slope and intercept · orange dashed line = mean baseline; watch MSE and R² update.',
    },
  ],
  playground: {
    description: 'Explore linear regression by adding points and fitting lines.',
    parameters: [
      { id: 'pointCount', label: 'Number of Points', type: 'stepper', min: 2, max: 20, step: 1, default: 5 },
      { id: 'noise', label: 'Noise Level', type: 'slider', min: 0, max: 5, step: 0.5, default: 1 },
      { id: 'showResiduals', label: 'Show Residuals', type: 'toggle', default: true },
      { id: 'showMSE', label: 'Show Mean Squared Error', type: 'toggle', default: true },
    ],
    tryThis: [
      'Try placing an outlier point far away from the others. Watch how the line of best fit changes.',
      'Can you set the points perfectly in a line to get an MSE of 0?',
    ],
  },
  challenges: [
    {
      id: 'fit-the-line',
      title: 'Beat the Baseline',
      description: 'Manually fit the line so the MSE is under 0.5.',
      props: {
        mode: 'interactive',
        points: [
          { x: 1, y: 2.1 },
          { x: 2, y: 3.9 },
          { x: 3, y: 6.2 },
          { x: 4, y: 7.8 },
        ],
        line: { m: 1, b: 0 },
        draggableLine: true,
        showMSE: true,
      },
      completionCriteria: { type: 'threshold', target: 0.5, metric: 'mse' },
      hints: [
        'Try increasing the slope (m) first to roughly match the trend.',
        'Then adjust the intercept (b) to center the line among points.',
      ],
    },
  ],
};

export default linearRegressionModule;
