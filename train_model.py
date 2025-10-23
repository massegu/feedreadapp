import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# 📥 Cargar datos reales
df = pd.read_csv("data/readings.csv")

# 🧹 Verificar columnas necesarias
required_cols = ["words_per_minute", "error_rate", "fluency_score", "attention_score", "label"]
missing = [col for col in required_cols if col not in df.columns]
if missing:
    raise ValueError(f"Faltan columnas en readings.csv: {missing}")

# 🔠 Codificar etiquetas
le = LabelEncoder()
df["label_encoded"] = le.fit_transform(df["label"])

# 🎯 Separar características y etiquetas
X = df[["words_per_minute", "error_rate", "fluency_score", "attention_score"]]
y = df["label_encoded"]

# 🔀 Dividir en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)

# 🌲 Entrenar modelo
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 🧪 Evaluar modelo
y_pred = clf.predict(X_test)
report = classification_report(y_test, y_pred, target_names=le.classes_)
print("📊 Classification Report:\n", report)

# 📌 Matriz de confusión
cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=le.classes_)
plt.figure(figsize=(6, 6))
disp.plot(cmap="Blues", values_format="d")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.savefig("data/confusion_matrix.png")

# 📈 Importancia de características
importances = clf.feature_importances_
feature_names = X.columns
indices = importances.argsort()[::-1]

plt.figure(figsize=(8, 5))
plt.title("Feature Importances")
plt.bar(range(len(importances)), importances[indices], align="center")
plt.xticks(range(len(importances)), feature_names[indices], rotation=45)
plt.tight_layout()
plt.savefig("data/feature_importance.png")

# 💾 Guardar modelo y codificador
import joblib
joblib.dump(clf, "data/model.pkl")
joblib.dump(le, "data/label_encoder.pkl")
print("✅ Modelo y codificador guardados en data/")
