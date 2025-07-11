    
    const data = await response.json();
    if (data && data.length > 0) {
      const number = data[0];
      console.log('\n📱 Информация о номере:');
      console.log(`Номер: ${number.phone_number}`);
      console.log(`Статус: ${number.status}`);
      console.log(`Страна: ${number.country_code} (${number.locality || 'N/A'}, ${number.region || 'N/A'})`);
      console.log(`AI Dispatcher: ${number.ai_dispatcher_enabled ? '✅ Включен' : '❌ Выключен'}`);
      console.log(`Функции: ${number.features ? number.features.join(', ') : 'sms, voice, mms'}`);
      
      if (number.ai_dispatcher_config && Object.keys(number.ai_dispatcher_config).length > 0) {
        console.log('\n🤖 Настройки AI Dispatcher:');
        console.log(number.ai_dispatcher_config);
      }
      
      return number;
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Функция для включения AI Dispatcher
async function enableAIDispatcher() {
  const phoneNumber = '+12898192158';
  console.log(`🤖 Включение AI Dispatcher для ${phoneNumber}...`);
  
  try {
    const response = await fetch(`https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?phone_number=eq.${encodeURIComponent(phoneNumber)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',        'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
      },
      body: JSON.stringify({
        ai_dispatcher_enabled: true,
        ai_dispatcher_config: {
          business_name: "Your Business Name",
          business_type: "HVAC",
          business_greeting: "Thank you for calling. How can I help you today?",
          voice_selection: "professional",
          emergency_detection_enabled: true,
          diagnostic_fee: 95,
          hourly_rate: 125,
          emergency_surcharge: 50
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ AI Dispatcher включен!');
      console.log('📞 Теперь позвоните на номер для тестирования');
    } else {
      console.error('❌ Ошибка включения:', await response.text());
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Функция для отправки тестового SMS
async function sendTestSMS(toNumber, message) {
  console.log(`📱 Отправка SMS на ${toNumber}...`);
  
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
      method: 'POST',      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
      },
      body: JSON.stringify({
        to: toNumber,
        from: '+12898192158',
        text: message || 'Test message from Fixlify system'
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ SMS отправлено!');
    } else {
      console.error('❌ Ошибка отправки:', result.error);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Меню функций
console.log('🎯 Доступные команды:');
console.log('1. checkPhoneNumberFeatures() - Проверить текущие настройки');
console.log('2. enableAIDispatcher() - Включить AI Dispatcher');
console.log('3. sendTestSMS("+1234567890", "Hello!") - Отправить тестовое SMS');
console.log('\n📞 Ваш номер: +1 (289) 819-2158');

// Автоматически проверяем текущий статус
checkPhoneNumberFeatures();    
    const data = await response.json();
    if (data && data.length > 0) {
      const number = data[0];
      console.log('\n📱 Информация о номере:');
      console.log(`Номер: ${number.phone_number}`);
      console.log(`Статус: ${number.status}`);
      console.log(`Страна: ${number.country_code} (${number.locality || 'N/A'}, ${number.region || 'N/A'})`);
      console.log(`AI Dispatcher: ${number.ai_dispatcher_enabled ? '✅ Включен' : '❌ Выключен'}`);
      console.log(`Функции: ${number.features ? number.features.join(', ') : 'sms, voice, mms'}`);
      
      if (number.ai_dispatcher_config && Object.keys(number.ai_dispatcher_config).length > 0) {
        console.log('\n🤖 Настройки AI Dispatcher:');
        console.log(number.ai_dispatcher_config);
      }
      
      return number;
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Функция для включения AI Dispatcher
async function enableAIDispatcher() {
  const phoneNumber = '+12898192158';
  console.log(`🤖 Включение AI Dispatcher для ${phoneNumber}...`);
  
  try {
    const response = await fetch(`https://mqppvcrlvsgrsqelglod.supabase.co/rest/v1/telnyx_phone_numbers?phone_number=eq.${encodeURIComponent(phoneNumber)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg',
        'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
      },      body: JSON.stringify({
        ai_dispatcher_enabled: true,
        ai_dispatcher_config: {
          business_name: "Your Business Name",
          business_type: "HVAC",
          business_greeting: "Thank you for calling. How can I help you today?",
          voice_selection: "professional",
          emergency_detection_enabled: true,
          diagnostic_fee: 95,
          hourly_rate: 125,
          emergency_surcharge: 50
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ AI Dispatcher включен!');
      console.log('📞 Теперь позвоните на номер для тестирования');
    } else {
      console.error('❌ Ошибка включения:', await response.text());
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Функция для отправки тестового SMS
async function sendTestSMS(toNumber, message) {
  console.log(`📱 Отправка SMS на ${toNumber}...`);
  
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/functions/v1/telnyx-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('fixlify-auth-token')?.replace(/['"]/g, '')}`
      },      body: JSON.stringify({
        to: toNumber,
        from: '+12898192158',
        text: message || 'Test message from Fixlify system'
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ SMS отправлено!');
    } else {
      console.error('❌ Ошибка отправки:', result.error);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Меню функций
console.log('🎯 Доступные команды:');
console.log('1. checkPhoneNumberFeatures() - Проверить текущие настройки');
console.log('2. enableAIDispatcher() - Включить AI Dispatcher');
console.log('3. sendTestSMS("+1234567890", "Hello!") - Отправить тестовое SMS');
console.log('\n📞 Ваш номер: +1 (289) 819-2158');

// Автоматически проверяем текущий статус
checkPhoneNumberFeatures();