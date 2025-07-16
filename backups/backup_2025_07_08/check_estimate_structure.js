// Проверка структуры estimates и связей с клиентами
// Запустите в консоли браузера

async function checkEstimateStructure() {
  console.log('🔍 Проверяем структуру estimates...');
  
  // 1. Получаем estimate с прямым client_id
  const { data: estimate1, error: error1 } = await window.supabase
    .from('estimates')
    .select('*')
    .not('client_id', 'is', null)
    .limit(1)
    .single();
    
  console.log('Estimate с client_id:', estimate1);
  
  // 2. Проверяем, есть ли клиент с таким ID
  if (estimate1?.client_id) {
    const { data: client, error: clientError } = await window.supabase
      .from('clients')
      .select('*')
      .eq('id', estimate1.client_id)
      .single();
      
    console.log('Клиент найден:', client);
    console.log('Ошибка клиента:', clientError);
  }
  
  // 3. Проверяем estimate через job
  const { data: estimate2, error: error2 } = await window.supabase
    .from('estimates')
    .select(`
      *,
      jobs!inner(
        id,
        client_id,
        clients!inner(*)
      )
    `)
    .limit(1)
    .maybeSingle();
    
  console.log('Estimate через jobs:', estimate2);
  console.log('Ошибка через jobs:', error2);
  
  // 4. Получаем estimate и отдельно получаем клиента
  const { data: simpleEstimate } = await window.supabase
    .from('estimates')
    .select('*')
    .limit(1)
    .single();
    
  console.log('\n📋 Простой estimate:', simpleEstimate);
  
  // Проверяем разные способы получить клиента
  if (simpleEstimate) {
    // Способ 1: Прямой client_id
    if (simpleEstimate.client_id) {
      const { data: directClient } = await window.supabase
        .from('clients')
        .select('*')
        .eq('id', simpleEstimate.client_id)
        .single();
        
      console.log('✅ Клиент по прямому ID:', directClient);
    }
    
    // Способ 2: Через job
    if (simpleEstimate.job_id) {
      const { data: job } = await window.supabase
        .from('jobs')
        .select('*, clients(*)')
        .eq('id', simpleEstimate.job_id)
        .single();
        
      console.log('✅ Job с клиентом:', job);
    }
    
    // Способ 3: Проверяем client_name и client_email в самом estimate
    console.log('📧 Email в estimate:', simpleEstimate.client_email);
    console.log('👤 Имя в estimate:', simpleEstimate.client_name);
  }
  
  // 5. Тестируем отправку с найденными данными
  console.log('\n🚀 Тестируем отправку...');
  
  if (simpleEstimate) {
    // Подготавливаем данные для отправки
    const testData = {
      estimateId: simpleEstimate.id,
      sendToClient: true,
      customMessage: 'Test from debugging script'
    };
    
    console.log('Отправляем:', testData);
    
    const { data, error } = await window.supabase.functions.invoke('send-estimate', {
      body: testData
    });
    
    if (error) {
      console.error('❌ Ошибка отправки:', error);
      
      // Пробуем прямой fetch для большей информации
      const response = await fetch(
        `${window.supabase.supabaseUrl}/functions/v1/send-estimate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.supabase.anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData)
        }
      );
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      try {
        const responseJson = JSON.parse(responseText);
        console.log('Response JSON:', responseJson);
      } catch (e) {
        console.log('Response is not JSON');
      }
    } else {
      console.log('✅ Успешно отправлено:', data);
    }
  }
}

// Дополнительная функция для проверки структуры таблиц
async function checkTableStructure() {
  console.log('\n📊 Проверяем структуру таблиц...');
  
  // Проверяем колонки в estimates
  const { data: estimates } = await window.supabase
    .from('estimates')
    .select('*')
    .limit(0);
    
  console.log('Колонки estimates:', Object.keys(estimates || {}));
  
  // Проверяем колонки в clients
  const { data: clients } = await window.supabase
    .from('clients')
    .select('*')
    .limit(0);
    
  console.log('Колонки clients:', Object.keys(clients || {}));
}

// Запускаем проверки
checkEstimateStructure();
checkTableStructure();
