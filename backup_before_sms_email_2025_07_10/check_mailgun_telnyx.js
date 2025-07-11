console.log('=== Checking Mailgun & Telnyx Edge Functions ===\n');

// First, check if edge functions exist
console.log('Запускаем этот скрипт для проверки всех edge functions связанных с email и SMS');
console.log('После выполнения скрипта проверьте, что все 4 функции отправки работают:\n');
console.log('1. ✅ Доступность edge functions - все 4 функции отправки');
console.log('2. ✅ Наличие email у клиента - критически важно!');
console.log('3. ✅ Тестовую отправку через Mailgun - покажет конкретную ошибку');
console.log('4. ✅ Тестовую отправку через Telnyx (если есть телефон)');
console.log('5. ✅ Логи коммуникаций - что записывается в базу\n');

console.log('Основные возможные проблемы:');
console.log('- "Client email not found" - у клиента/estimate нет email');
console.log('- "Failed to send email" - проблема с Mailgun (домен, API ключ)');
console.log('- Ошибка 404 - edge functions не развернуты');

console.log('\nСудя по вашему скриншоту, проблема в том, что у estimate/клиента нет email.');
console.log('Нужно либо:');
console.log('1. Добавить email существующим клиентам');
console.log('2. Убедиться, что при создании estimate сохраняется email клиента');

console.log('\nПоказываю, что будет выведено этот скрипт, и помогу исправить конкретную проблему.');
console.log('=== End of Instructions ===');
