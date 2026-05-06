# Trello E2E API Test Suite

Automated end-to-end and performance tests for the [Trello REST API](https://developer.atlassian.com/cloud/trello/rest/) using Playwright.

---

## What's covered

| File | Suite | Tests |
|---|---|---|
| `01-auth.spec.js` | Auth Validation | Valid/invalid credentials, schema |
| `02-boards.spec.js` | Board Management | Create, GET, UPDATE, negative cases |
| `03-lists.spec.js` | List Management | Create, GET, UPDATE, negative cases |
| `04-cards.spec.js` | Card Management | Create, GET, UPDATE, comment, move |
| `05-checklists-labels.spec.js` | Checklists & Labels | Create, add items, apply labels |
| `06-performance.spec.js` | Performance | Benchmarks, concurrency, rate limit |
| `07-cleanup.spec.js` | Cleanup | Delete card, archive lists, delete board |

**Total: 40+ tests across 7 files**

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/trello-e2e.git
cd trello-e2e
```

### 2. Install dependencies
```bash
npm install
```

### 3. Get your Trello credentials
- Go to **https://trello.com/power-ups/admin** → create a Power-Up → copy your **API Key**
- Generate a token:
  ```
  https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_KEY
  ```

### 4. Set up environment variables
```bash
cp .env.example .env
# Edit .env and fill in your key and token
```

---

## Running tests

```bash
# Run all tests
npm test

# Run only functional tests
npm run test:functional

# Run only performance tests
npm run test:performance

# Run only negative tests
npm run test:negative

# Open HTML report after run
npm run report

# Clean old reports
npm run clean
```

---

## Project structure

```
trello-e2e/
├── tests/
│   ├── 01-auth.spec.js
│   ├── 02-boards.spec.js
│   ├── 03-lists.spec.js
│   ├── 04-cards.spec.js
│   ├── 05-checklists-labels.spec.js
│   ├── 06-performance.spec.js
│   └── 07-cleanup.spec.js
├── utils/
│   ├── api.js        # auth helper, timedRequest, PERF thresholds
│   └── state.js      # shared IDs across tests
├── .github/
│   └── workflows/
│       └── trello-e2e.yml   # CI/CD pipeline
├── .env.example
├── .gitignore
├── playwright.config.js
├── package.json
└── README.md
```

---

## CI/CD

Tests run automatically via GitHub Actions on:
- Every push to `main`
- Every pull request to `main`
- Every weekday at 9am UTC (scheduled)
- Manual trigger from the Actions tab

### Add secrets to GitHub
Go to **Settings → Secrets and variables → Actions** and add:
- `TRELLO_API_KEY`
- `TRELLO_API_TOKEN`

---

## Performance thresholds

| Operation | Max allowed |
|---|---|
| GET resource | 1500ms |
| Create board | 3000ms |
| Create list | 2000ms |
| Create/update card | 2000ms |
| Delete | 2000ms |
| 10 concurrent GETs | 3000ms each |
