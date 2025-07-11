// Диагностика проблемы с Telnyx синхронизацией
// Запустите это в консоли браузера, чтобы увидеть детальную ошибку

async function diagnoseTelnyxSync() {
  console.log('🔍 Диагностика Telnyx синхронизации...\n');
  
  const authToken = localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '');
  if (!authToken) {
    console.error('❌ Не авторизованы! Войдите в систему.');
    return;
  }

  // 1. Проверка подключения
  console.log('1️⃣ Проверка подключения к Telnyx...');
  try {
    const testResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ action: 'test_telnyx_connection' })
    });
    
    const testData = await testResponse.json();
    console.log('Ответ:', testData);
    
    if (!testData.success) {
      console.error('❌ Telnyx не подключен. Возможные причины:');
      console.error('   - TELNYX_API_KEY не установлен в Supabase');
      console.error('   - Неверный API ключ');
      console.error('   - Edge функция не развернута');
      return;
    }
    
    console.log('✅ Подключение успешно!');
  } catch (error) {
    console.error('❌ Ошибка при проверке подключения:', error);
    console.error('   Проверьте, что edge функция развернута');
    return;
  }

  // 2. Попытка синхронизации
  console.log('\n2️⃣ Попытка синхронизации...');
  try {
    const syncResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ action: 'list_available_from_telnyx' })
    });
    
    if (!syncResponse.ok) {
      console.error('❌ HTTP ошибка:', syncResponse.status);
      const errorText = await syncResponse.text();
      console.error('Текст ошибки:', errorText);
      return;
    }
    
    const syncData = await syncResponse.json();
    console.log('Ответ синхронизации:', syncData);
    
    if (syncData.success) {
      console.log(`✅ Найдено ${syncData.total} номеров`);
      if (syncData.available_numbers && syncData.available_numbers.length > 0) {
        console.log('Номера:');
        syncData.available_numbers.forEach(num => {
          console.log(`  📞 ${num.phone_number}`);
        });
      }
    } else {
      console.error('❌ Синхронизация не удалась:', syncData.error || syncData.message);
    }
    
  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error);
  }

  // 3. Проверка Supabase функций
  console.log('\n3️⃣ Проверка edge функций...');
  try {
    const healthResponse = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-phone-numbers', {
      method: 'OPTIONS'
    });
    
    if (healthResponse.ok) {
      console.log('✅ Edge функция доступна');
    } else {
      console.error('❌ Edge функция не отвечает');
    }
  } catch (error) {
    console.error('❌ Edge функция недоступна:', error);
  }

  // 4. Альтернативный метод
  console.log('\n4️⃣ Альтернатива: добавьте номера вручную');
  console.log('Используйте вкладку "Manual Add" или запустите:');
  console.log(`
// Добавить номер вручную
fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
    'Authorization': \`Bearer \${localStorage.getItem('fixlify-auth-token')?.replace(/['\"]/g, '')}\`
  },
  body: JSON.stringify({
    phone_number: '+1XXXXXXXXXX', // Ваш номер
    status: 'available',
    country_code: 'US',
    area_code: 'XXX',
    features: ['sms', 'voice', 'mms'],
    monthly_cost: 0,
    setup_cost: 0,
    purchased_at: new Date().toISOString()
  })
}).then(r => r.json()).then(console.log);
  `);
}

// Запуск диагностики
diagnoseTelnyxSync();
