PYTHON ?= python3
VENV_DIR ?= .venv
PYTHON_BIN := $(VENV_DIR)/bin/python
PIP := $(VENV_DIR)/bin/pip
FRONTEND_DIR := nextjs
FLASK_APP := app

.DEFAULT_GOAL := help

.PHONY: help install frontend-install build-frontend run-frontend run-backend run-models run-poisson run-negbinom run-zinb clean

help:
	@echo "Available targets:"
	@echo "  install          - Create a Python venv and install backend/model dependencies"
	@echo "  run-models       - Run all three model notebooks (Poisson, Negative Binomial, ZINB)"
	@echo "  run-poisson      - Run Poisson with features notebook"
	@echo "  run-negbinom     - Run Negative Binomial with features notebook"
	@echo "  run-zinb         - Run ZINB with features notebook"
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

run-models: run-poisson run-negbinom run-zinb
	@echo "All models have been executed successfully!"

run-poisson: install
	@echo "Running Poisson with features model..."
	$(PYTHON_BIN) -m jupyter nbconvert --to notebook --execute --inplace pipeline/poisson_with_features.ipynb

run-negbinom: install
	@echo "Running Negative Binomial with features model..."
	$(PYTHON_BIN) -m jupyter nbconvert --to notebook --execute --inplace pipeline/neg_with_features.ipynb

run-zinb: install
	@echo "Running ZINB with features model..."
	$(PYTHON_BIN) -m jupyter nbconvert --to notebook --execute --inplace pipeline/ZINB_with_feature.ipynb

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
