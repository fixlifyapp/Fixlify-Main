# Полная инструкция по настройке автоматической синхронизации Telnyx

## 🚀 Быстрый старт

### 1. Откройте страницу управления номерами
Перейдите на `/phone-management` в вашем приложении Fixlify

### 2. Проверьте статус
- Если видите "Connected to Telnyx" ✅ - всё готово!
- Если видите "Telnyx Not Connected" ⚠️ - настройте API ключ

## 📋 Полная настройка

### Шаг 1: Получите Telnyx API Key

1. Войдите в [Telnyx Mission Control](https://portal.telnyx.com/)
2. Перейдите в **Account Settings** → **API Keys**
3. Создайте новый API key или используйте существующий
4. Скопируйте ключ (начинается с `KEY`)

### Шаг 2: Добавьте API Key в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod)
2. Перейдите в **Settings** → **Edge Functions**
3. Добавьте секрет:
   ```
   TELNYX_API_KEY = ваш_ключ_здесь
   ```

### Шаг 3: Разверните функции (если ещё не сделано)

```bash
# Windows
supabase functions deploy telnyx-phone-numbers
supabase functions deploy sync-telnyx-numbers
supabase functions deploy telnyx-webhook-handler

# Или все сразу
supabase functions deploy
```

### Шаг 4: Настройте Webhooks в Telnyx (опционально)

1. В Telnyx Portal перейдите в **Account Settings** → **Webhooks**
2. Нажмите **Add Webhook URL**
3. Введите URL:
   ```
   https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-webhook-handler
   ```
4. Выберите события:
   - ✅ Number Order - Phone Numbers Created
   - ✅ Phone Number - Created
   - ✅ Phone Number - Updated
   - ✅ Phone Number - Deleted
   - ✅ Phone Number - Ported Out

5. Сохраните webhook

## 🔄 Как работает синхронизация

### Автоматическая синхронизация происходит:
1. **При открытии страницы** - сразу загружает все номера
2. **Каждые 5 минут** - если включена опция Auto-sync
3. **При событиях Telnyx** - через webhooks (покупка, удаление номера)

### Ручная синхронизация:
- Кнопка **"Sync Now"** - мгновенная синхронизация
- Обновление списка - кнопка 🔄 справа вверху

## 📊 Что синхронизируется

- ✅ Все ваши активные номера из Telnyx
- ✅ Информация о регионе и городе
- ✅ Статус номера (active/available)
- ✅ Connection ID и Messaging Profile
- ✅ Дата покупки

## 🧪 Тестирование

### Проверка через консоль браузера:

1. Откройте консоль (F12)
2. Вставьте и запустите:

```javascript
// Быстрая проверка синхронизации
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`,
  },
  body: JSON.stringify({ action: 'test_telnyx_connection' })
}).then(r => r.json()).then(data => {
  console.log(data.success ? '✅ Telnyx connected!' : '❌ Connection failed');
});
```

### Полный тест:
Используйте файл `test-telnyx-auto-sync.js`

## ❓ Частые вопросы

### Номера не появляются?
1. Проверьте API ключ
2. Нажмите "Sync Now"
3. Проверьте консоль на ошибки

### Как часто происходит синхронизация?
- При загрузке страницы
- Каждые 5 минут (если включено)
- При нажатии "Sync Now"
- Мгновенно через webhooks

### Можно ли добавить номер вручную?
Да! Используйте вкладку "Manual Add"

### Что делать если номер удален из Telnyx?
Он автоматически пометится как "inactive" при следующей синхронизации

## 🛠 Дополнительные настройки

### Изменить интервал синхронизации
В файле `TelnyxPhoneSync.tsx` измените:
```javascript
// 5 минут по умолчанию
5 * 60 * 1000
```

### Отключить автосинхронизацию при загрузке
Снимите галочку "Auto-sync every 5 minutes"

## 📞 Поддержка

При проблемах проверьте:
1. Логи в Supabase Dashboard → Functions → Logs
2. Консоль браузера
3. Статус Telnyx API: https://status.telnyx.com/
