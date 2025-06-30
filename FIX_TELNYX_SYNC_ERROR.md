# Решение проблемы с синхронизацией Telnyx

## Возможные причины ошибки:

### 1. TELNYX_API_KEY не установлен
Это самая частая причина. Проверьте в Supabase:
1. Откройте https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/settings/vault
2. Найдите TELNYX_API_KEY
3. Если его нет, добавьте:
   - Name: `TELNYX_API_KEY`
   - Value: `KEY...` (ваш ключ из Telnyx)

### 2. Edge функция не развернута
Разверните функцию:
```bash
supabase functions deploy telnyx-phone-numbers
```

### 3. Неверный API ключ
Проверьте ключ в Telnyx Portal:
- https://portal.telnyx.com/#/app/account/api-keys

## Быстрое решение - добавьте номера вручную:

### Вариант А: Через UI
1. Откройте `/phone-management`
2. Перейдите на вкладку "Manual Add"
3. Введите номер телефона
4. Нажмите "Add Number"

### Вариант Б: Через консоль (скопируйте и запустите)
```javascript
// Добавить номер +1 (XXX) XXX-XXXX
async function quickAddNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
      'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
    },
    body: JSON.stringify({
      phone_number: formatted,
      status: 'available',
      country_code: 'US',
      area_code: formatted.substring(2, 5),
      features: ['sms', 'voice', 'mms'],
      monthly_cost: 0,
      setup_cost: 0,
      purchased_at: new Date().toISOString()
    })
  });

  if (response.ok) {
    console.log('✅ Номер добавлен:', formatted);
  } else {
    console.error('❌ Ошибка:', await response.text());
  }
}

// Пример использования:
quickAddNumber('416-555-1234');  // Замените на ваш номер
```

### Вариант В: Через Supabase SQL Editor
```sql
INSERT INTO telnyx_phone_numbers (
    phone_number, status, country_code, area_code,
    features, monthly_cost, setup_cost, purchased_at
) VALUES (
    '+14165551234',  -- Ваш номер
    'available',
    'US',
    '416',
    ARRAY['sms', 'voice', 'mms']::text[],
    0.00,
    0.00,
    NOW()
) ON CONFLICT (phone_number) DO UPDATE SET status = 'available';
```

## Диагностика

Запустите в консоли браузера:
```javascript
// Скопируйте весь файл diagnose-telnyx-sync.js
```

Это покажет:
- ✅/❌ Статус подключения к Telnyx
- Детали ошибки
- Доступность edge функций

## Если ничего не помогает

1. **Проверьте логи функции**:
   - https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/telnyx-phone-numbers/logs

2. **Временное решение**:
   - Используйте ручное добавление номеров
   - Это работает всегда, даже без Telnyx API

3. **Обратитесь за помощью**:
   - Скопируйте вывод диагностики
   - Проверьте логи Supabase
   - Сообщите детали ошибки
