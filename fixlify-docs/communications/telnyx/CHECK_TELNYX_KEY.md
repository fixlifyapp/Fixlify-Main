# Проверка Telnyx API Key

## Шаг 1: Разверните функцию проверки
```bash
supabase functions deploy check-telnyx-key
```

## Шаг 2: Проверьте наличие ключа

Запустите в консоли браузера:

```javascript
// Проверка установленных ключей
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/check-telnyx-key', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
  }
}).then(r => r.json()).then(data => {
  console.log('🔑 Статус ключей:');
  console.log('TELNYX_API_KEY:', data.telnyx_api_key);
  console.log('Другие ключи:', data.other_keys);
  
  if (!data.telnyx_api_key.exists) {
    console.error('❌ TELNYX_API_KEY НЕ УСТАНОВЛЕН!');
    console.log('\n📝 Инструкция по добавлению:');
    console.log('1. Откройте https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets');
    console.log('2. Нажмите "New secret"');
    console.log('3. Name: TELNYX_API_KEY');
    console.log('4. Value: ваш ключ из Telnyx (начинается с KEY)');
    console.log('5. Нажмите "Add secret"');
  } else {
    console.log('✅ Ключ установлен!');
    if (data.telnyx_api_key.isTestKey) {
      console.log('⚠️ Используется тестовый ключ');
    }
  }
});
```

## Если ключа нет, добавьте его:

### 1. Получите ключ из Telnyx
- Войдите в https://portal.telnyx.com/
- Account Settings → API Keys
- Создайте или скопируйте ключ

### 2. Добавьте в Supabase
- https://supabase.com/dashboard/project/mqppvcrlvsgrsqelglod/functions/secrets
- New secret
- Name: `TELNYX_API_KEY`
- Value: `KEY...` (ваш ключ)

### 3. Проверьте работу
После добавления ключа синхронизация должна заработать автоматически!

## Альтернатива - работа без API ключа

Если вы не хотите настраивать Telnyx API, просто добавляйте номера вручную:

```javascript
// Быстрое добавление номера
async function addNumber(phone) {
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
      'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
    },
    body: JSON.stringify({
      phone_number: phone,
      status: 'available',
      country_code: 'US',
      area_code: phone.substring(2, 5),
      features: ['sms', 'voice', 'mms'],
      monthly_cost: 0,
      setup_cost: 0,
      purchased_at: new Date().toISOString()
    })
  });
  
  console.log(response.ok ? '✅ Добавлено!' : '❌ Ошибка');
}

// Использование:
addNumber('+14165551234');  // Замените на ваш номер
```
