// 🚀 БЫСТРОЕ ДОБАВЛЕНИЕ ТЕЛЕФОННОГО НОМЕРА
// Скопируйте весь этот код в консоль браузера

// ЗАМЕНИТЕ ЭТОТ НОМЕР НА ВАШ РЕАЛЬНЫЙ!
const YOUR_PHONE_NUMBER = '+14165551234';  // Формат: +1XXXXXXXXXX

(async function addPhoneNumberNow() {
  console.log(`📞 Добавляем номер: ${YOUR_PHONE_NUMBER}`);
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
      'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
    },
    body: JSON.stringify({
      phone_number: YOUR_PHONE_NUMBER,
      status: 'available',
      country_code: 'US',
      area_code: YOUR_PHONE_NUMBER.substring(2, 5),
      features: ['sms', 'voice', 'mms'],
      monthly_cost: 0,
      setup_cost: 0,
      purchased_at: new Date().toISOString()
    })
  });

  if (response.ok) {
    console.log('✅ УСПЕШНО! Номер добавлен в систему.');
    console.log('🔄 Обновите страницу /phone-management чтобы увидеть номер');
    
    // Показать все номера
    const allNumbers = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?order=phone_number', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
      }
    }).then(r => r.json());
    
    console.log('\n📋 Все номера в системе:');
    allNumbers.forEach(n => {
      console.log(`${n.phone_number === YOUR_PHONE_NUMBER ? '🆕' : '📞'} ${n.phone_number} - ${n.status}`);
    });
  } else {
    const error = await response.text();
    if (error.includes('duplicate')) {
      console.log('ℹ️ Этот номер уже есть в системе');
    } else {
      console.error('❌ Ошибка:', error);
    }
  }
})();
