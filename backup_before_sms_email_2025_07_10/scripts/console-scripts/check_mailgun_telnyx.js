// Проверка настройки Mailgun и Telnyx
// Запустите в консоли браузера

async function checkEmailSMSConfig() {
  console.clear();
  console.log('🔍 Проверка конфигурации Email/SMS...\n');
  
  // 1. Проверяем, что edge functions доступны
  console.log('📡 Проверяем edge functions...');
  
  const functions = ['send-estimate', 'send-invoice', 'send-estimate-sms', 'send-invoice-sms'];
  
  for (const func of functions) {
    try {
      const url = `${window.supabase.supabaseUrl}/functions/v1/${func}`;
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${window.supabase.anonKey}`
        }
      });
      
      console.log(`${func}: ${response.status === 200 ? '✅ Доступна' : '❌ Недоступна (статус: ' + response.status + ')'}`);
    } catch (err) {
      console.log(`${func}: ❌ Ошибка - ${err.message}`);
    }
  }
  
  // 2. Получаем estimate для теста
  console.log('\n📋 Получаем данные для теста...');
  
  const { data: estimate } = await window.supabase
    .from('estimates')
    .select(`
      *,
      clients!estimates_client_id_fkey(
        id,
        name,
        email,
        phone
      )
    `)
    .not('client_id', 'is', null)
    .limit(1)
    .single();
    
  if (!estimate) {
    console.error('❌ Не найден estimate с клиентом');
    return;
  }
  
  const clientEmail = estimate.clients?.email || estimate.client_email;
  const clientPhone = estimate.clients?.phone || estimate.client_phone;
  
  console.log('Estimate для теста:', {
    number: estimate.estimate_number,
    client: estimate.clients?.name || estimate.client_name,
    email: clientEmail,
    phone: clientPhone
  });
  
  if (!clientEmail) {
    console.error('❌ У клиента нет email! Добавьте email клиенту.');
    return;
  }
  
  // 3. Тестируем отправку email через Mailgun
  console.log('\n📧 Тестируем отправку Email (Mailgun)...');
  
  try {
    const { data, error } = await window.supabase.functions.invoke('send-estimate', {
      body: {
        estimateId: estimate.id,
        sendToClient: true,
        customMessage: 'Тест отправки через Mailgun'
      }
    });
    
    if (error) {
      console.error('❌ Ошибка:', error);
      
      // Детальная диагностика
      if (error.message?.includes('MAILGUN_API_KEY')) {
        console.error('🔑 Проблема с Mailgun API ключом');
        console.log('Проверьте в Supabase Dashboard > Edge Functions > Secrets');
      } else if (error.message?.includes('Client email not found')) {
        console.error('📧 Email клиента не найден');
        console.log('Нужно добавить email в данные клиента или estimate');
      } else if (error.message?.includes('Failed to send email')) {
        console.error('📮 Mailgun отклонил запрос');
        console.log('Проверьте домен и API ключ Mailgun');
      }
    } else {
      console.log('✅ Email отправлен успешно!', data);
    }
  } catch (err) {
    console.error('❌ Неожиданная ошибка:', err);
  }
  
  // 4. Тестируем отправку SMS через Telnyx (если есть телефон)
  if (clientPhone) {
    console.log('\n📱 Тестируем отправку SMS (Telnyx)...');
    
    try {
      const { data, error } = await window.supabase.functions.invoke('send-estimate-sms', {
        body: {
          estimateId: estimate.id,
          sendToClient: true,
          recipientPhone: clientPhone,
          customMessage: 'Тест SMS через Telnyx'
        }
      });
      
      if (error) {
        console.error('❌ Ошибка SMS:', error);
        
        if (error.message?.includes('TELNYX_API_KEY')) {
          console.error('🔑 Проблема с Telnyx API ключом');
        } else if (error.message?.includes('phone number')) {
          console.error('📱 Проблема с номером телефона');
        }
      } else {
        console.log('✅ SMS отправлен успешно!', data);
      }
    } catch (err) {
      console.error('❌ Неожиданная ошибка SMS:', err);
    }
  } else {
    console.log('\n📱 Пропускаем тест SMS - у клиента нет телефона');
  }
  
  // 5. Проверяем логи коммуникаций
  console.log('\n📊 Проверяем логи отправок...');
  
  const { data: communications } = await window.supabase
    .from('estimate_communications')
    .select('*')
    .eq('estimate_id', estimate.id)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (communications && communications.length > 0) {
    console.log(`Найдено ${communications.length} записей о коммуникациях:`);
    communications.forEach((comm, i) => {
      console.log(`${i + 1}. ${comm.communication_type} - ${comm.status} - ${new Date(comm.created_at).toLocaleString()}`);
    });
  } else {
    console.log('Нет записей о коммуникациях для этого estimate');
  }
}

// Функция для быстрого добавления email клиенту
async function addEmailToClient(clientId, email) {
  const { error } = await window.supabase
    .from('clients')
    .update({ email: email })
    .eq('id', clientId);
    
  if (error) {
    console.error('Ошибка добавления email:', error);
  } else {
    console.log('✅ Email добавлен клиенту!');
  }
}

// Запускаем проверку
checkEmailSMSConfig();

// Если нужно добавить email клиенту, используйте:
// addEmailToClient('client-id-here', 'client@example.com');
