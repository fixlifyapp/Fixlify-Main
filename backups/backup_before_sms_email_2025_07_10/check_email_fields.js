// Проверка полей email в estimates/invoices
// Запустите это в консоли для диагностики

async function checkEmailFields() {
  console.log('🔍 Проверяем поля email в estimates и invoices...\n');
  
  // 1. Проверяем структуру estimates
  const { data: estimates } = await window.supabase
    .from('estimates')
    .select('*')
    .limit(5);
    
  if (estimates && estimates.length > 0) {
    console.log('📋 Пример estimate:');
    const est = estimates[0];
    console.log({
      id: est.id,
      estimate_number: est.estimate_number,
      client_id: est.client_id,
      client_email: est.client_email,
      client_name: est.client_name,
      email: est.email,
      job_id: est.job_id
    });
    
    // Проверяем все estimates на наличие email
    const withEmail = estimates.filter(e => e.client_email || e.email);
    const withClientId = estimates.filter(e => e.client_id);
    const withJobId = estimates.filter(e => e.job_id);
    
    console.log(`\n📊 Статистика estimates:`);
    console.log(`- Всего: ${estimates.length}`);
    console.log(`- С email: ${withEmail.length}`);
    console.log(`- С client_id: ${withClientId.length}`);
    console.log(`- С job_id: ${withJobId.length}`);
  }
  
  // 2. Проверяем структуру invoices
  const { data: invoices } = await window.supabase
    .from('invoices')
    .select('*')
    .limit(5);
    
  if (invoices && invoices.length > 0) {
    console.log('\n💰 Пример invoice:');
    const inv = invoices[0];
    console.log({
      id: inv.id,
      invoice_number: inv.invoice_number,
      client_id: inv.client_id,
      client_email: inv.client_email,
      client_name: inv.client_name,
      email: inv.email,
      job_id: inv.job_id
    });
  }
  
  // 3. Тестируем создание estimate с email
  console.log('\n🧪 Проверяем создание estimate с email...');
  
  // Получаем первого клиента
  const { data: client } = await window.supabase
    .from('clients')
    .select('*')
    .limit(1)
    .single();
    
  if (client) {
    console.log('Клиент для теста:', {
      id: client.id,
      name: client.name,
      email: client.email
    });
    
    // Проверяем, может ли edge function найти этот email
    const testEstimate = {
      client_id: client.id,
      client_email: client.email,
      client_name: client.name
    };
    
    console.log('\n✅ Edge function должна найти email в:', testEstimate);
  }
}

// Функция для добавления email в существующие estimates
async function fixMissingEmails() {
  console.log('\n🔧 Исправляем отсутствующие email...');
  
  // Получаем estimates без email
  const { data: estimatesNoEmail } = await window.supabase
    .from('estimates')
    .select('*, clients!estimates_client_id_fkey(*)')
    .is('client_email', null)
    .limit(10);
    
  if (estimatesNoEmail && estimatesNoEmail.length > 0) {
    console.log(`Найдено ${estimatesNoEmail.length} estimates без email`);
    
    for (const est of estimatesNoEmail) {
      if (est.clients?.email) {
        console.log(`Обновляем estimate ${est.estimate_number} с email: ${est.clients.email}`);
        
        const { error } = await window.supabase
          .from('estimates')
          .update({
            client_email: est.clients.email,
            client_name: est.clients.name
          })
          .eq('id', est.id);
          
        if (error) {
          console.error('Ошибка обновления:', error);
        } else {
          console.log('✅ Обновлено');
        }
      }
    }
  } else {
    console.log('✅ Все estimates уже имеют email');
  }
}

// Запускаем проверки
checkEmailFields();

// Раскомментируйте для исправления
// fixMissingEmails();
