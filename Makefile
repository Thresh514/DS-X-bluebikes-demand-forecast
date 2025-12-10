PYTHON ?= python3
VENV_DIR ?= .venv
PYTHON_BIN := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip
FRONTEND_DIR := nextjs
FLASK_APP := app

.DEFAULT_GOAL := help

.PHONY: help install frontend-install build-frontend run-frontend run-backend process-data train-model clean

help:
	@echo "Available targets:"
	@echo "  install          - Create a Python venv and install backend/model dependencies"
	@echo "  process-data     - Run the feature-filling script (requires data/feature.csv and data/2024_data files)"
	@echo "  train-model      - Train the XGBoost model (requires src/data/2023.csv)"
	@echo "  run-backend      - Start the Flask API (port 5000)"
	@echo "  frontend-install - Install Next.js dependencies with npm ci"
	@echo "  build-frontend   - Build the Next.js app"
	@echo "  run-frontend     - Start the Next.js dev server (port 3000)"
	@echo "  clean            - Remove virtualenvs, caches, and build artifacts"

install: $(VENV_DIR)/bin/activate

$(VENV_DIR)/bin/activate: requirements.txt
	$(PYTHON) -m venv $(VENV_DIR)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@touch $(VENV_DIR)/bin/activate

process-data: install
	@test -f data/feature.csv || { echo "Missing data/feature.csv. Please place the raw features file before running."; exit 1; }
	@test -f data/2024_data/station_features_2024.csv || { echo "Missing data/2024_data/station_features_2024.csv. Please add the station metadata."; exit 1; }
	$(PYTHON_BIN) pipeline/fill_features.py

train-model: install
	@test -f src/data/2023.csv || { echo "Missing training data at src/data/2023.csv. Provide the dataset before training."; exit 1; }
	$(PYTHON_BIN) pipeline/train_model.py

run-backend: install
	cd flask && ../$(PYTHON_BIN) -m flask --app $(FLASK_APP) run --host=0.0.0.0 --port=5000

frontend-install:
	cd $(FRONTEND_DIR) && npm ci

build-frontend: frontend-install
	cd $(FRONTEND_DIR) && npm run build

run-frontend: frontend-install
	cd $(FRONTEND_DIR) && npm run dev -- --hostname 0.0.0.0 --port 3000

clean:
	rm -rf $(VENV_DIR)
	find . -name '__pycache__' -type d -prune -exec rm -rf {} +
	rm -rf *.joblib
	rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/node_modules
	rm -f .coverage
