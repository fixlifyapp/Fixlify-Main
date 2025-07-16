# Полное руководство по бэкапу Supabase

## Что уже сделано

### 1. Локальные файлы скопированы ✅
- **Edge Functions**: Все функции из `supabase/functions` скопированы в `supabase-backup/functions`
- **Migrations**: Все миграции из `supabase/migrations` скопированы в `supabase-backup/migrations`
- **Config**: Конфигурация проекта `supabase/config.toml` скопирована

### 2. Документация создана ✅
- Инструкции по восстановлению
- Список необходимых переменных окружения
- Документация по хранилищу и авторизации

## Что нужно сделать вручную

### 1. Экспорт секретных ключей
Перейдите на: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets

Скопируйте все ключи:
- `TELNYX_API_KEY`
- `TELNYX_MESSAGING_PROFILE_ID`
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM_EMAIL`
- Другие API ключи

### 2. Экспорт базы данных

#### Вариант A: Через Supabase Dashboard
1. Перейдите: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/database/backups
2. Нажмите "Download backup"

#### Вариант B: Через pg_dump (рекомендуется)
```bash
# Полный дамп с данными
pg_dump postgresql://postgres:[YOUR-PASSWORD]@db.mqppvcrlvsgrsqelglod.supabase.co:5432/postgres > supabase-backup/database/full-dump.sql

# Или используйте connection string из Dashboard
```

### 3. Экспорт Storage файлов
1. Перейдите: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/storage/buckets
2. Для каждого bucket:
   - Скачайте все файлы
   - Сохраните политики доступа

### 4. Экспорт пользователей Auth
1. Перейдите: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/auth/users
2. Нажмите "Export users" (если доступно)
3. Сохраните настройки провайдеров авторизации

### 5. API ключи Supabase
Перейдите: https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/api

Скопируйте:
- `anon` key
- `service_role` key
- URL проекта

## Структура бэкапа

```
supabase-backup/
├── database/
│   ├── schema.sql         # Схема БД
│   ├── export-data.sql    # Скрипт для экспорта данных
│   └── tables/           # CSV файлы с данными (после экспорта)
├── functions/            # Edge Functions
├── migrations/          # SQL миграции
├── storage/            # Документация по хранилищу
├── auth/              # Документация по авторизации
├── config/            # Конфигурация и переменные
└── RESTORE_GUIDE.md   # Инструкция по восстановлению
```

## Восстановление на новом проекте

1. Создайте новый проект Supabase
2. Восстановите БД: `supabase db push`
3. Деплойте Edge Functions: `supabase functions deploy`
4. Настройте секреты в Dashboard
5. Восстановите Storage файлы
6. Настройте Auth провайдеры

## Важные замечания

- Бэкап создан: `C:\Users\petru\Downloads\TEST FIX SITE\3\Fixlify-Main-main\supabase-backup`
- Для полного бэкапа данных используйте pg_dump
- Сохраните все API ключи в безопасном месте
- Регулярно делайте бэкапы (минимум раз в неделю)
