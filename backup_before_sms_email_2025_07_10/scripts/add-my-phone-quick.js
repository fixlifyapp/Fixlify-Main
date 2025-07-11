// Добавить телефонный номер через консоль браузера
// Замените номер на ваш реальный

async function addMyPhoneNumber() {
  // ← ЗАМЕНИТЕ ЭТОТ НОМЕР НА ВАШ РЕАЛЬНЫЙ НОМЕР
  const MY_PHONE_NUMBER = '+14165551234'; // Пример: +14165551234
  
  const areaCode = MY_PHONE_NUMBER.substring(2, 5);
  
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
      'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
    },
    body: JSON.stringify({
      phone_number: MY_PHONE_NUMBER,
      status: 'available',
      country_code: 'US',
      area_code: areaCode,
      features: ['sms', 'voice', 'mms'],
      monthly_cost: 0,
      setup_cost: 0,
      purchased_at: new Date().toISOString()
    })
  });

  if (response.ok) {
    console.log('✅ Номер успешно добавлен!');
    
    // Показать все номера
    const allNumbers = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
      }
    }).then(r => r.json());
    
    console.log('Все номера в системе:');
    allNumbers.forEach(n => console.log(`📞 ${n.phone_number} - ${n.status}`));
  } else {
    const error = await response.json();
    console.error('❌ Ошибка:', error);
  }
}

// Запустите функцию
addMyPhoneNumber();
