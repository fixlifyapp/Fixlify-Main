// Детальная проверка структуры estimates и email полей
// Игнорируем ошибку EmailJS - она не влияет на нашу проверку

async function detailedEmailCheck() {
  console.clear();
  console.log('🔍 Детальная проверка email в системе...\n');
  
  try {
    // 1. Получаем пример estimate
    const { data: estimate, error: estError } = await window.supabase
      .from('estimates')
      .select('*')
      .limit(1)
      .single();
      
    if (estError) {
      console.error('Ошибка получения estimate:', estError);
      return;
    }
    
    console.log('📋 Структура estimate:');
    console.log('Поля с возможным email:');
    console.log('- client_email:', estimate.client_email);
    console.log('- email:', estimate.email);
    console.log('- client_id:', estimate.client_id);
    console.log('- job_id:', estimate.job_id);
    console.log('- client_name:', estimate.client_name);
    
    // 2. Если есть client_id, проверяем клиента
    if (estimate.client_id) {
      const { data: client } = await window.supabase
        .from('clients')
        .select('*')
        .eq('id', estimate.client_id)
        .single();
        
      if (client) {
        console.log('\n👤 Данные клиента:');
        console.log('- name:', client.name);
        console.log('- email:', client.email);
        console.log('- phone:', client.phone);
      }
    }
    
    // 3. Если есть job_id, проверяем job
    if (estimate.job_id) {
      const { data: job } = await window.supabase
        .from('jobs')
        .select('*, clients(*)')
        .eq('id', estimate.job_id)
        .single();
        
      if (job) {
        console.log('\n💼 Данные job:');
        console.log('- client_id:', job.client_id);
        if (job.clients) {
          console.log('- client name:', job.clients.name);
          console.log('- client email:', job.clients.email);
        }
      }
    }
    
    // 4. Проверяем все estimates
    const { data: allEstimates } = await window.supabase
      .from('estimates')
      .select('id, client_email, email, client_id')
      .limit(20);
      
    if (allEstimates) {
      const withClientEmail = allEstimates.filter(e => e.client_email).length;
      const withEmail = allEstimates.filter(e => e.email).length;
      const withClientId = allEstimates.filter(e => e.client_id).length;
      const withAnyEmail = allEstimates.filter(e => e.client_email || e.email).length;
      
      console.log('\n📊 Статистика по estimates (первые 20):');
      console.log(`- С client_email: ${withClientEmail}`);
      console.log(`- С email: ${withEmail}`);
      console.log(`- С client_id: ${withClientId}`);
      console.log(`- С любым email: ${withAnyEmail}`);
      console.log(`- Без email вообще: ${allEstimates.length - withAnyEmail}`);
    }
    
    // 5. Тестируем отправку
    console.log('\n🚀 Тестируем edge function с первым estimate...');
    
    const testPayload = {
      estimateId: estimate.id,
      sendToClient: true,
      customMessage: 'Test email check'
    };
    
    console.log('Отправляем:', testPayload);
    console.log('Email должен быть взят из:', {
      client_email: estimate.client_email,
      email: estimate.email,
      via_client_id: estimate.client_id ? 'Может быть получен через client_id' : 'Нет client_id'
    });
    
  } catch (error) {
    console.error('Общая ошибка:', error);
  }
}

// Функция для быстрого добавления email в estimate для теста
async function addTestEmail() {
  console.log('\n🔧 Добавляем тестовый email в первый estimate...');
  
  const { data: estimate } = await window.supabase
    .from('estimates')
    .select('*')
    .limit(1)
    .single();
    
  if (estimate && !estimate.client_email) {
    const { error } = await window.supabase
      .from('estimates')
      .update({
        client_email: 'test@example.com',
        client_name: 'Test Client'
      })
      .eq('id', estimate.id);
      
    if (error) {
      console.error('Ошибка обновления:', error);
    } else {
      console.log('✅ Email добавлен! Теперь можно тестировать отправку.');
    }
  } else if (estimate?.client_email) {
    console.log('✅ У estimate уже есть email:', estimate.client_email);
  }
}

// Запускаем проверку
detailedEmailCheck();

// Чтобы добавить тестовый email, раскомментируйте:
// addTestEmail();
