# Generating synthetic dataset and training RandomForestClassifier for reading disorder classification
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay
from sklearn.preprocessing import LabelEncoder

# Set random seed for reproducibility
np.random.seed(42)

# Number of samples
n_samples = 200

# Generate synthetic features
def generate_data():
    data = []

    for _ in range(n_samples):
        # Randomly choose a class
        label = np.random.choice(['normal', 'dislexia', 'tdah', 'dislexia_tdah'], p=[0.4, 0.2, 0.2, 0.2])

        if label == 'normal':
            wpm = np.random.normal(180, 15)
            error_rate = np.random.normal(0.02, 0.01)
            fluency = np.random.normal(0.85, 0.05)
            attention = np.random.normal(0.85, 0.05)
            comprehension = np.random.normal(0.9, 0.05)
        elif label == 'dislexia':
            wpm = np.random.normal(110, 15)
            error_rate = np.random.normal(0.15, 0.05)
            fluency = np.random.normal(0.55, 0.1)
            attention = np.random.normal(0.8, 0.1)
            comprehension = np.random.normal(0.7, 0.1)
        elif label == 'tdah':
            wpm = np.random.normal(160, 20)
            error_rate = np.random.normal(0.05, 0.02)
            fluency = np.random.normal(0.75, 0.1)
            attention = np.random.normal(0.5, 0.1)
            comprehension = np.random.normal(0.65, 0.1)
        elif label == 'dislexia_tdah':
            wpm = np.random.normal(100, 15)
            error_rate = np.random.normal(0.18, 0.05)
            fluency = np.random.normal(0.5, 0.1)
            attention = np.random.normal(0.45, 0.1)
            comprehension = np.random.normal(0.6, 0.1)

        data.append([wpm, error_rate, fluency, attention, comprehension, label])

    columns = ['words_per_minute', 'error_rate', 'fluency_score', 'attention_score', 'comprehension_score', 'label']
    return pd.DataFrame(data, columns=columns)

# Generate dataset
df = generate_data()

# Encode labels
le = LabelEncoder()
df['label_encoded'] = le.fit_transform(df['label'])

# Features and target
X = df.drop(['label', 'label_encoded'], axis=1)
y = df['label_encoded']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

# Train RandomForestClassifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# Predictions
y_pred = clf.predict(X_test)

# Classification report
report = classification_report(y_test, y_pred, target_names=le.classes_)
print("Classification Report:\n", report)

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=le.classes_)
plt.figure(figsize=(6, 6))
disp.plot(cmap='Blues', values_format='d')
plt.title("Confusion Matrix")
plt.savefig("/mnt/data/confusion_matrix.png")

# Feature importance
importances = clf.feature_importances_
feature_names = X.columns
indices = np.argsort(importances)[::-1]

plt.figure(figsize=(8, 5))
plt.title("Feature Importances")
plt.bar(range(X.shape[1]), importances[indices], align="center")
plt.xticks(range(X.shape[1]), feature_names[indices], rotation=45)
plt.tight_layout()
plt.savefig("/mnt/data/feature_importance.png")

# Class distribution
plt.figure(figsize=(6, 4))
df['label'].value_counts().plot(kind='bar', color='skyblue')
plt.title("Class Distribution")
plt.ylabel("Count")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("/mnt/data/class_distribution.png")

import joblib
joblib.dump(clf, "data/model.pkl")
joblib.dump(le, "data/label_encoder.pkl")
