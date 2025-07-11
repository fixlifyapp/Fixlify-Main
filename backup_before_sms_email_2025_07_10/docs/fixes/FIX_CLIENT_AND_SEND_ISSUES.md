# Исправление проблем с навигацией и отправкой

## Проблема 1: "Client not found" при клике на клиента

### Диагностика:
1. Откройте консоль браузера (F12)
2. Перейдите на страницу Clients
3. Запустите скрипт из `debug-client-navigation.js`
4. Проверьте, какие ID у клиентов

### Возможные причины:
- Неправильный формат ID клиента
- Проблема с React Router
- Отсутствие данных клиента

### Временное решение:
```javascript
// Прямая навигация к клиенту
function goToClient(clientId) {
  window.location.href = `/clients/${clientId}`;
}
```

## Проблема 2: Не отправляются Estimate/Invoice

### Проверка Edge функций:
```bash
# Проверьте, развернуты ли функции
supabase functions list

# Если нет, разверните:
supabase functions deploy send-estimate
supabase functions deploy send-invoice
```

### Проверка в консоли:
```javascript
// Тест отправки estimate
async function testSendEstimate(jobId) {
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/send-estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
      },
      body: JSON.stringify({ jobId })
    });
    
    const result = await response.json();
    console.log('Результат:', result);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

## Быстрые исправления:

### 1. Обновите страницу
- Ctrl + F5 (полная перезагрузка)
- Очистите кэш браузера

### 2. Проверьте консоль на ошибки
- Красные ошибки в консоли
- Network вкладка для проверки запросов

### 3. Проверьте права доступа
- Убедитесь, что вы авторизованы
- Проверьте токен в localStorage

## Если ничего не помогает:

1. Перезапустите dev сервер:
   ```bash
   Ctrl + C
   npm run dev
   ```

2. Проверьте базу данных:
   - Есть ли клиенты в таблице clients
   - Есть ли estimates/invoices в соответствующих таблицах

3. Проверьте логи Supabase:
   - Dashboard → Functions → Logs
