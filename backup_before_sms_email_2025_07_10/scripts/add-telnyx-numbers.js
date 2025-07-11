// Скрипт для добавления телефонных номеров из Telnyx
// Запустите в консоли браузера

async function addTelnyxNumber(phoneNumber, country = 'US', city = null, region = null) {
  // Очистка и форматирование номера
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formatted = cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  const areaCode = formatted.substring(2, 5);
  
  console.log(`📞 Добавляем номер: ${formatted} (${country})`);
  
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
      country_code: country,
      area_code: areaCode,
      locality: city,
      region: region,
      features: ['sms', 'voice', 'mms'],
      monthly_cost: 0,
      setup_cost: 0,
      purchased_at: new Date().toISOString()
    })
  });

  if (response.ok) {
    console.log('✅ Номер добавлен успешно!');
  } else {
    const error = await response.text();
    if (error.includes('duplicate')) {
      console.log('ℹ️ Этот номер уже есть в системе');
    } else {
      console.error('❌ Ошибка:', error);
    }
  }
}

// Примеры использования:
// addTelnyxNumber('289-819-2158', 'CA', 'Toronto', 'Ontario');
// addTelnyxNumber('416-555-1234', 'CA', 'Toronto', 'Ontario');
// addTelnyxNumber('212-555-1234', 'US', 'New York', 'NY');

// Показать все номера
async function showAllNumbers() {
  const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?order=created_at.desc', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
    }
  });
  
  const numbers = await response.json();
  console.log('\n📋 Все номера в системе:');
  numbers.forEach(n => {
    const flag = n.country_code === 'CA' ? '🇨🇦' : '🇺🇸';
    const location = n.locality ? `${n.locality}, ${n.region}` : n.region || '';
    console.log(`${flag} ${n.phone_number} - ${location} - ${n.status}`);
  });
}

console.log('✅ Функции загружены!');
console.log('Используйте: addTelnyxNumber("номер", "страна", "город", "регион")');
console.log('Или: showAllNumbers() для просмотра всех номеров');

// Показать текущие номера
showAllNumbers();
