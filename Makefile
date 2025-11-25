.PHONY: help install lint test build format

help:
	@echo "Common tasks:"
	@echo "  make install    Install JS deps (pnpm or npm) and prepare Python venvs as needed"
	@echo "  make lint       Run turbo lint pipeline across workspaces"
	@echo "  make test       Run turbo test pipeline across workspaces"
	@echo "  make build      Run turbo build pipeline across workspaces"

install:
	@echo "Install frontend dependencies with npm (or pnpm if preferred)."
	cd apps/corporate-website/frontend && npm install
	cd apps/design-your-space/frontend && npm install

lint:
	npx turbo run lint

test:
	npx turbo run test

build:
	npx turbo run build

format:
	@echo "Add format commands per language; hook into prettier/ruff/black as you enable them."
