# Machine Learning — Lecture 4: Supervised Learning and Generalization

## 1. What supervised learning is

**Supervised learning** learns a mapping from inputs `X` to outputs `y` using labeled examples. When `y` is discrete, the task is **classification**; when `y` is continuous, it is **regression**.

The **hypothesis class** is the set of functions the model can represent. The **loss function** measures how wrong a prediction is. Training minimizes **empirical risk** — the average loss on the training set — but the real goal is to minimize **expected risk** on unseen data.

A **training set** is used to fit parameters, a **validation set** is used to tune hyperparameters and select models, and a **test set** is touched once at the end to estimate generalization. Leakage from the test set into training or model selection produces optimistic results that do not hold in deployment.

## 2. Linear regression

**Linear regression** predicts `ŷ = w·x + b`. For one feature, the model is a line; for `d` features, it is a hyperplane.

The standard loss is **mean squared error (MSE)**:

`L(w, b) = (1/n) Σ (yᵢ − ŷᵢ)²`

For ordinary least squares, the closed-form solution is `w = (XᵀX)⁻¹Xᵀy`. The normal equations require inverting a `d × d` matrix, which is expensive for large `d` and numerically unstable when features are collinear.

**Gradient descent** updates parameters in the direction of the negative gradient:

`w ← w − η ∂L/∂w`

where `η` is the **learning rate**. A learning rate that is too large diverges; one that is too small converges slowly. **Batch gradient descent** uses all examples per step, **stochastic gradient descent (SGD)** uses one example, and **mini-batch** uses a small batch. Mini-batch is the practical default because it balances noise and hardware efficiency.

**Feature scaling** matters for gradient descent: features with very different ranges produce elongated loss contours and slow convergence. Standardization (zero mean, unit variance) is common.

## 3. Logistic regression

**Logistic regression** is a linear classifier for binary labels. It computes a score `z = w·x + b`, then applies the **sigmoid**:

`σ(z) = 1 / (1 + e^(−z))`

The output is interpreted as `P(y = 1 | x)`. The decision boundary is the set where `σ(z) = 0.5`, which is the hyperplane `w·x + b = 0`.

Training minimizes **log loss** (binary cross-entropy):

`L = −(1/n) Σ [yᵢ log ŷᵢ + (1 − yᵢ) log(1 − ŷᵢ)]`

Unlike linear regression with MSE, logistic regression with log loss has a convex objective, so gradient descent converges to the global optimum. The gradient has the elegant form `(ŷ − y)x`.

**Multiclass logistic regression** uses the **softmax** function and categorical cross-entropy. The predicted class is the one with the highest probability.

## 4. Overfitting, underfitting, and the bias–variance tradeoff

**Underfitting** means the model is too simple to capture the underlying pattern: training error is high and validation error is also high. **Overfitting** means the model memorizes noise: training error is low but validation error is much higher.

The **bias–variance decomposition** writes expected squared error as:

`E[(y − ŷ)²] = bias² + variance + irreducible noise`

High-bias models are rigid (for example, linear regression on a nonlinear problem). High-variance models are sensitive to small changes in the training data (for example, a deep decision tree grown to purity). Increasing model capacity usually lowers bias and raises variance.

Diagnostics:

- If training and validation errors are both high and close, the model is **underfitting**; add capacity or better features.
- If training error is low but validation error is high, the model is **overfitting**; add regularization, more data, or reduce capacity.

**Regularization** adds a penalty on parameter size:

- **L2 (ridge)** adds `λ Σ wᵢ²`. It shrinks weights smoothly and handles collinearity.
- **L1 (lasso)** adds `λ Σ |wᵢ|`. It produces sparse solutions and performs feature selection.
- **Elastic net** combines both.

The regularization strength `λ` is a hyperparameter chosen on the validation set. As `λ` increases, bias rises and variance falls.

**Early stopping** halts training when validation loss stops improving. **Dropout** randomly deactivates units during training and acts as an ensemble regularizer. **Data augmentation** synthetically expands the training distribution.

## 5. Model evaluation

A **confusion matrix** for binary classification contains true positives (TP), false positives (FP), true negatives (TN), and false negatives (FN).

- **Accuracy** = `(TP + TN) / (TP + TN + FP + FN)`. It is misleading on imbalanced data: a classifier that always predicts the majority class can have high accuracy and zero recall for the minority class.
- **Precision** = `TP / (TP + FP)`. Of the items flagged positive, how many are truly positive.
- **Recall (sensitivity)** = `TP / (TP + FN)`. Of the truly positive items, how many were found.
- **F1 score** is the harmonic mean of precision and recall: `2PR / (P + R)`. It balances the two and is useful when both matter.

**ROC curves** plot true positive rate against false positive rate across thresholds. **AUC** is the area under the ROC curve; 0.5 is random and 1.0 is perfect. **Precision–recall curves** are more informative than ROC when the positive class is rare.

For regression, common metrics are **MAE** (mean absolute error), **MSE**, **RMSE**, and **R²**. R² measures the fraction of variance explained; it can be negative for a model worse than predicting the mean.

**Cross-validation** splits the data into `k` folds, trains on `k − 1`, and validates on the remaining fold, rotating `k` times. It gives a more stable estimate than a single split and is standard for small datasets. **Stratified k-fold** preserves class proportions in each fold. **Leave-one-out** is the extreme case with `k = n`.

**Hyperparameter tuning** uses grid search, random search, or Bayesian optimization. Random search is often more efficient than grid search when only a few hyperparameters matter.

## 6. Decision trees and ensembles

A **decision tree** recursively splits the feature space. Splits are chosen to maximize **information gain**, which is the reduction in entropy, or equivalently to minimize **Gini impurity**. Entropy for a node with class proportions `pᵢ` is `−Σ pᵢ log₂ pᵢ`. Gini impurity is `1 − Σ pᵢ²`.

A fully grown tree has low bias and high variance. **Pre-pruning** stops growth early using maximum depth, minimum samples per leaf, or minimum impurity decrease. **Post-pruning** grows the full tree and then removes branches that do not improve validation performance.

**Random forests** train many trees on bootstrap samples and random feature subsets, then average their predictions. Averaging reduces variance without increasing bias much. **Gradient boosting** builds trees sequentially, each fitting the residual errors of the current ensemble; it usually achieves lower bias than random forests but is more sensitive to hyperparameters and can overfit if not regularized.

## 7. Clustering (unsupervised, for contrast)

**k-means** partitions data into `k` clusters by alternating two steps: assign each point to the nearest centroid, then recompute centroids as the mean of assigned points. It minimizes within-cluster squared distance. The objective is non-convex, so initialization matters; **k-means++** spreads initial centroids to improve stability. The number of clusters is often chosen with the **elbow method** or **silhouette score**.

k-means assumes roughly spherical, similarly sized clusters and is sensitive to feature scaling. **DBSCAN** finds arbitrarily shaped clusters and labels low-density points as noise, but it is sensitive to its `eps` and `min_samples` parameters.

## 8. Practical checklist

1. Split the data before doing anything that learns from it; fit scalers on the training set only.
2. Establish a simple baseline (majority class, mean prediction, or logistic regression).
3. Check for leakage, duplicate rows across splits, and distribution shift.
4. Use cross-validation for model selection and keep the test set untouched.
5. Report metrics that match the cost of errors, not just accuracy.
6. Inspect errors and learning curves: they tell you whether the problem is bias or variance.
7. Prefer the simplest model that meets the requirement; complexity must earn its keep.
