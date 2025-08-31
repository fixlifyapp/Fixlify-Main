# Supabase Deployment Guide - Безопасный деплой

## 🚨 ВАЖНО: Перед началом работы

### 1. Настройка локального окружения
```bash
# Установка Supabase CLI (если еще нет)
npm install -g supabase

# Инициализация проекта
supabase init

# Связка с production
supabase link --project-ref mqppvcrlvsgrsqelglod

# Выгрузка текущей схемы БД
supabase db pull

# Запуск локального Supabase
supabase start
```

## 📋 Правила безопасного деплоя

### ✅ ВСЕГДА делайте:
1. **Тестируйте локально** перед деплоем
2. **Создавайте миграции** для всех изменений БД
3. **Делайте бэкапы** перед критическими изменениями
4. **Деплойте по одной функции** при обновлении Edge Functions
5. **Используйте feature branches** для изменений

### ❌ НИКОГДА не делайте:
1. **Не меняйте БД напрямую** через Dashboard в production
2. **Не деплойте все функции сразу** командой `supabase functions deploy`
3. **Не удаляйте миграции** после их применения
4. **Не меняйте старые миграции** - создавайте новые

## 🔄 Workflow для разных типов изменений

### Изменения в БД (таблицы, RLS, triggers)
```bash
# 1. Создаем миграцию
supabase migration new add_new_feature

# 2. Пишем SQL в созданном файле
# supabase/migrations/[timestamp]_add_new_feature.sql

# 3. Тестируем локально
supabase db reset

# 4. Если все ОК - пушим в production
supabase db push
```

### Edge Functions
```bash
# 1. Тестируем функцию локально
supabase functions serve function-name

# 2. Деплоим ТОЛЬКО эту функцию
supabase functions deploy function-name

# 3. Проверяем логи
supabase functions logs function-name
```

### Secrets и Environment Variables
```bash
# Устанавливаем секреты
supabase secrets set KEY_NAME=value

# Проверяем список секретов
supabase secrets list
```

## 🔙 Откаты и восстановление

### Если что-то пошло не так:

#### 1. Откат миграции
```sql
-- Создаем новую миграцию для отката
-- supabase/migrations/[timestamp]_rollback_feature.sql
DROP TABLE IF EXISTS broken_table;
-- Восстанавливаем предыдущее состояние
```

#### 2. Откат Edge Function
```bash
# Деплоим предыдущую версию из git
git checkout HEAD~1 -- supabase/functions/function-name
supabase functions deploy function-name
```

#### 3. Полный откат БД (ОСТОРОЖНО!)
```bash
# Только если есть бэкап
supabase db reset --remote
```

## 📁 Структура проекта

```
supabase/
├── migrations/
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240102000000_add_rls_policies.sql
│   └── 20240103000000_add_functions.sql
├── functions/
│   ├── send-sms/
│   │   └── index.ts
│   ├── send-email/
│   │   └── index.ts
│   └── ai-dispatcher/
│       └── index.ts
└── seed.sql  # Данные для локального тестирования
```

## 🎯 Чек-лист перед деплоем

- [ ] Протестировано локально с `supabase start`
- [ ] Миграции применяются без ошибок (`supabase db reset`)
- [ ] Edge Functions работают локально (`supabase functions serve`)
- [ ] Создан бэкап важных данных
- [ ] Код закоммичен в git
- [ ] Создан PR и прошел review

## 🚀 Команды для деплоя

### Production деплой
```bash
# 1. Деплой миграций
supabase db push

# 2. Деплой конкретной функции
supabase functions deploy send-sms
supabase functions deploy send-email
supabase functions deploy ai-dispatcher

# 3. Обновление секретов (если нужно)
supabase secrets set TELNYX_API_KEY=xxx
```

### Мониторинг после деплоя
```bash
# Проверка логов функций
supabase functions logs send-sms --tail

# Проверка статуса
supabase status
```

## 💡 Best Practices

1. **Версионирование**: Все миграции нумеруются последовательно
2. **Атомарность**: Одна миграция = одна логическая операция
3. **Идемпотентность**: Миграции должны быть безопасны для повторного применения
4. **Документирование**: Комментарии в миграциях о том, что и зачем меняется
5. **Тестирование**: Всегда тестируйте с production-like данными локально

## 🆘 Troubleshooting

### Проблема: Edge Function не работает после деплоя
```bash
# Проверяем логи
supabase functions logs function-name

# Проверяем секреты
supabase secrets list

# Передеплоиваем с --no-verify-jwt если проблема с auth
supabase functions deploy function-name --no-verify-jwt
```

### Проблема: Миграция не применяется
```bash
# Смотрим статус миграций
supabase migration list

# Применяем конкретную миграцию
supabase db push --dry-run  # Сначала проверяем
supabase db push            # Затем применяем
```

### Проблема: Локальный Supabase не запускается
```bash
# Перезапускаем Docker
# Останавливаем все контейнеры
supabase stop

# Очищаем volumes
supabase stop --no-backup

# Запускаем заново
supabase start
```

## 📞 Контакты для критических ситуаций

- Supabase Dashboard: https://app.supabase.com/project/mqppvcrlvsgrsqelglod
- Документация: https://supabase.com/docs
- Support: support@supabase.com

---

**Remember**: Всегда тестируйте локально перед production деплоем!