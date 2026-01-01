# Fixlify Code Evaluation System

## Цель

Создать систему автоматической оценки качества кода Fixlify с метриками, дашбордом и интеграцией в CI/CD.

---

## 📊 Ключевые Метрики для Оценки

### 1. Code Health Score (0-100)

Общий балл здоровья кода, рассчитанный на основе нескольких факторов:

```
Code Health = (
  TypeScript Coverage × 0.20 +
  Test Coverage × 0.25 +
  Complexity Score × 0.20 +
  Duplication Score × 0.15 +
  Security Score × 0.10 +
  Accessibility Score × 0.10
)
```

**Источник**: [CodeScene - Code Health](https://codescene.com/blog/measure-code-health-of-your-codebase)

### 2. Technical Debt Ratio

```
Technical Debt Ratio = (Remediation Cost / Development Cost) × 100%
```

- **Здоровый код**: < 5%
- **Требует внимания**: 5-10%
- **Критический**: > 10%

**Источник**: [Qodo - Code Quality Metrics](https://www.qodo.ai/blog/code-quality/)

### 3. Cyclomatic Complexity

Количество путей выполнения в функции:

| Сложность | Уровень Риска |
|-----------|---------------|
| 1-10 | Низкий риск |
| 11-20 | Средний риск |
| 21-50 | Высокий риск |
| 50+ | Критический |

### 4. Code Churn (Hotspots)

Файлы с частыми изменениями = потенциальные проблемы:

```
Hotspot Risk = Complexity × Churn × Ownership Concentration
```

### 5. Duplication Score

Процент дублированного кода (цель: < 3%)

---

## 🛠️ Что Мы Можем Построить

### Вариант A: Интеграция Существующих Инструментов

```bash
# Уже есть
- ESLint (правила для React/TypeScript)
- TypeScript Compiler (strict mode)
- Prettier (форматирование)

# Добавить
npm install -D @typescript-eslint/parser
npm install -D eslint-plugin-sonarjs # SonarQube правила
npm install -D eslint-plugin-security # Безопасность
npm install -D jscpd # Обнаружение дубликатов
npm install -D plato # Анализ сложности
```

### Вариант B: Собственная Система Оценки

Создать скрипт, который анализирует кодовую базу и генерирует отчёт:

```typescript
// scripts/code-health.ts
interface CodeHealthReport {
  overallScore: number;
  timestamp: Date;

  metrics: {
    typeScriptCoverage: number;     // % файлов с типами
    testCoverage: number;           // % покрытия тестами
    complexityScore: number;        // Средняя цикломатическая сложность
    duplicationScore: number;       // % дубликатов
    securityScore: number;          // Количество уязвимостей
    accessibilityScore: number;     // A11y compliance
  };

  hotspots: Array<{
    file: string;
    complexity: number;
    churn: number;
    riskScore: number;
  }>;

  technicalDebt: {
    totalMinutes: number;
    ratio: number;
    trend: 'improving' | 'stable' | 'declining';
  };

  issues: Array<{
    type: 'bug' | 'smell' | 'vulnerability' | 'debt';
    severity: 'critical' | 'major' | 'minor';
    file: string;
    line: number;
    message: string;
  }>;
}
```

---

## 📦 Рекомендуемые Инструменты

### Бесплатные (Open Source)

| Инструмент | Для Чего | Интеграция |
|------------|----------|------------|
| [ESLint + SonarJS](https://github.com/SonarSource/eslint-plugin-sonarjs) | Code Smells | npm install |
| [jscpd](https://github.com/kucherenko/jscpd) | Дубликаты | npm install |
| [Code Health Meter](https://github.com/helabenkhalfallah/code-health-meter) | JS/TS метрики | npm install |
| [Madge](https://github.com/pahen/madge) | Циклические зависимости | npm install |
| [Dependency Cruiser](https://github.com/sverweij/dependency-cruiser) | Архитектура | npm install |

### Платные (SaaS)

| Сервис | Цена | Возможности |
|--------|------|-------------|
| [SonarCloud](https://sonarcloud.io/) | Free для open source | Полный анализ |
| [CodeClimate](https://codeclimate.com/) | $16/user/month | Простой setup |
| [CodeScene](https://codescene.com/) | $30/dev/month | Hotspots, AI |
| [DeepScan](https://deepscan.io/) | Free tier available | React/TS фокус |

---

## 🚀 План Реализации

### Фаза 1: Quick Setup (Эта неделя)

```bash
# 1. Установить ESLint плагины
npm install -D eslint-plugin-sonarjs eslint-plugin-security

# 2. Обновить .eslintrc.cjs
```

```javascript
// .eslintrc.cjs
module.exports = {
  plugins: ['sonarjs', 'security'],
  extends: [
    'plugin:sonarjs/recommended',
    'plugin:security/recommended',
  ],
  rules: {
    // Complexity
    'sonarjs/cognitive-complexity': ['error', 15],
    'complexity': ['warn', 10],

    // Code Smells
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-identical-functions': 'error',

    // Security
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
  }
};
```

```bash
# 3. Добавить скрипты в package.json
```

```json
{
  "scripts": {
    "lint:quality": "eslint src --ext .ts,.tsx --format json -o reports/eslint-report.json",
    "duplicates": "jscpd src --reporters json --output reports/duplicates.json",
    "complexity": "npx code-health-meter analyze src --output reports/complexity.json",
    "code:health": "npm run lint:quality && npm run duplicates && npm run complexity"
  }
}
```

### Фаза 2: Dashboard (Следующая неделя)

Создать страницу `/admin/code-health` с визуализацией:

```tsx
// src/pages/admin/CodeHealthDashboard.tsx
export function CodeHealthDashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Overall Score Gauge */}
      <Card>
        <CardTitle>Code Health Score</CardTitle>
        <GaugeChart value={85} max={100} />
      </Card>

      {/* Technical Debt */}
      <Card>
        <CardTitle>Technical Debt</CardTitle>
        <TrendChart data={debtHistory} />
      </Card>

      {/* Hotspots Table */}
      <Card className="col-span-2">
        <CardTitle>Risk Hotspots</CardTitle>
        <HotspotsTable files={hotspots} />
      </Card>

      {/* Issues List */}
      <Card>
        <CardTitle>Issues by Severity</CardTitle>
        <IssuesList issues={issues} />
      </Card>
    </div>
  );
}
```

### Фаза 3: CI/CD Интеграция

```yaml
# .github/workflows/code-quality.yml
name: Code Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint:quality

      - name: Check Duplicates
        run: npm run duplicates

      - name: Analyze Complexity
        run: npm run complexity

      - name: Generate Report
        run: node scripts/generate-health-report.js

      - name: Comment on PR
        uses: actions/github-script@v6
        with:
          script: |
            const report = require('./reports/health-report.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Code Health Report\n\n` +
                    `**Score**: ${report.overallScore}/100\n` +
                    `**Issues**: ${report.issues.length}\n` +
                    `**Complexity**: ${report.avgComplexity}`
            });
```

---

## 📈 Метрики для Fixlify (Текущее Состояние)

Давайте измерим текущее состояние:

```bash
# Общая статистика
- Файлов TypeScript: ~200+
- Строк кода: ~30,000+
- Компонентов React: ~100+
- Edge Functions: ~15+
- Hooks: ~50+
```

### Известные Проблемы (Technical Debt)

| Проблема | Файлы | Приоритет |
|----------|-------|-----------|
| Дублированные Edge Functions | send-invoice, send-estimate | HIGH |
| Deprecated hooks с TODO | useInvoiceActions | MEDIUM |
| Console.log в продакшене | Много файлов | LOW |
| Отсутствие тестов | Все компоненты | HIGH |
| Type: any использования | ~20 мест | MEDIUM |

---

## 🎯 Целевые Показатели

| Метрика | Сейчас | Цель (3 мес) | Цель (6 мес) |
|---------|--------|--------------|--------------|
| Code Health Score | ? | 70 | 85 |
| Test Coverage | 0% | 30% | 60% |
| Duplication | ? | <5% | <3% |
| Avg Complexity | ? | <15 | <10 |
| Type Coverage | ~80% | 95% | 100% |
| Security Issues | ? | 0 critical | 0 all |

---

## 💡 Quick Wins (Сделать Сейчас)

1. **Добавить ESLint SonarJS** - 5 минут
2. **Запустить jscpd** - увидеть дубликаты
3. **Удалить console.log** - чище код
4. **Добавить strict: true** в tsconfig (уже есть?)
5. **Настроить husky pre-commit** - блокировать плохой код

---

## Источники

- [Qodo - Code Quality in 2025](https://www.qodo.ai/blog/code-quality/)
- [CodeScene - Code Health](https://codescene.com/blog/measure-code-health-of-your-codebase)
- [BrowserStack - Code Quality Metrics](https://www.browserstack.com/guide/software-code-quality-metrics)
- [SonarQube Metrics](https://docs.sonarsource.com/sonarqube-server/latest/user-guide/code-metrics/metrics-definition/)
- [Code Health Meter](https://github.com/helabenkhalfallah/code-health-meter)
- [DeepScan](https://deepscan.io/)

---

*Документ создан: Январь 2026*
