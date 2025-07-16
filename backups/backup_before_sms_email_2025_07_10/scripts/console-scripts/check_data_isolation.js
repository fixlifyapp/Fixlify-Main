// Проверка структуры данных: user_id vs organization_id
// Запустите в консоли браузера

async function checkDataStructure() {
  console.clear();
  console.log('🔍 Проверка структуры данных в системе...\n');
  
  // 1. Получаем текущего пользователя
  const { data: { user } } = await window.supabase.auth.getUser();
  console.log('👤 Текущий пользователь:', {
    id: user?.id,
    email: user?.email
  });
  
  // 2. Получаем профиль пользователя
  const { data: profile } = await window.supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();
    
  console.log('\n📋 Профиль пользователя:');
  console.log('- user_id:', profile?.id);
  console.log('- organization_id:', profile?.organization_id);
  console.log('- company_name:', profile?.company_name);
  console.log('- role:', profile?.role);
  
  // 3. Проверяем структуру основных таблиц
  console.log('\n📊 Проверяем структуру таблиц:');
  
  // Clients
  const { data: clients } = await window.supabase
    .from('clients')
    .select('*')
    .limit(2);
    
  if (clients && clients.length > 0) {
    console.log('\n👥 Clients:');
    const client = clients[0];
    console.log('- id:', client.id);
    console.log('- user_id:', client.user_id);
    console.log('- organization_id:', client.organization_id);
    console.log('- created_by:', client.created_by);
    console.log('Поля для изоляции:', {
      has_user_id: 'user_id' in client,
      has_organization_id: 'organization_id' in client,
      has_created_by: 'created_by' in client
    });
  }
  
  // Jobs
  const { data: jobs } = await window.supabase
    .from('jobs')
    .select('*')
    .limit(2);
    
  if (jobs && jobs.length > 0) {
    console.log('\n💼 Jobs:');
    const job = jobs[0];
    console.log('- id:', job.id);
    console.log('- user_id:', job.user_id);
    console.log('- organization_id:', job.organization_id);
    console.log('- client_id:', job.client_id);
    console.log('Поля для изоляции:', {
      has_user_id: 'user_id' in job,
      has_organization_id: 'organization_id' in job
    });
  }
  
  // Estimates
  const { data: estimates } = await window.supabase
    .from('estimates')
    .select('*')
    .limit(2);
    
  if (estimates && estimates.length > 0) {
    console.log('\n📄 Estimates:');
    const estimate = estimates[0];
    console.log('- id:', estimate.id);
    console.log('- user_id:', estimate.user_id);
    console.log('- organization_id:', estimate.organization_id);
    console.log('- client_id:', estimate.client_id);
    console.log('- job_id:', estimate.job_id);
    console.log('Поля для изоляции:', {
      has_user_id: 'user_id' in estimate,
      has_organization_id: 'organization_id' in estimate,
      has_client_id: 'client_id' in estimate
    });
  }
  
  // 4. Проверяем связи между таблицами
  console.log('\n🔗 Проверяем связи данных:');
  
  // Получаем estimate с полными данными
  const { data: estimateWithRelations } = await window.supabase
    .from('estimates')
    .select(`
      *,
      clients (
        id,
        name,
        email,
        user_id,
        organization_id
      ),
      jobs (
        id,
        client_id,
        user_id,
        organization_id
      )
    `)
    .limit(1)
    .single();
    
  if (estimateWithRelations) {
    console.log('\nEstimate с связями:');
    console.log('Estimate:', {
      user_id: estimateWithRelations.user_id,
      organization_id: estimateWithRelations.organization_id
    });
    
    if (estimateWithRelations.clients) {
      console.log('Client:', {
        user_id: estimateWithRelations.clients.user_id,
        organization_id: estimateWithRelations.clients.organization_id
      });
    }
    
    if (estimateWithRelations.jobs) {
      console.log('Job:', {
        user_id: estimateWithRelations.jobs.user_id,
        organization_id: estimateWithRelations.jobs.organization_id
      });
    }
    
    // Проверяем совпадение
    const sameUserId = estimateWithRelations.user_id === estimateWithRelations.clients?.user_id;
    const sameOrgId = estimateWithRelations.organization_id === estimateWithRelations.clients?.organization_id;
    
    console.log('\n✅ Проверка изоляции данных:');
    console.log('- Совпадает user_id:', sameUserId);
    console.log('- Совпадает organization_id:', sameOrgId);
  }
  
  // 5. Проверяем RLS политики
  console.log('\n🔒 Что используется для изоляции:');
  if (profile?.organization_id) {
    console.log('✅ Система использует ORGANIZATION_ID для мультитенантности');
    console.log('Organization ID:', profile.organization_id);
  } else {
    console.log('⚠️ Система использует USER_ID (нет organization_id в профиле)');
    console.log('User ID:', user?.id);
  }
  
  // 6. Рекомендации
  console.log('\n💡 Рекомендации:');
  console.log('1. Все таблицы должны иметь одинаковое поле для изоляции');
  console.log('2. RLS политики должны проверять это поле');
  console.log('3. При создании записей нужно заполнять правильное поле');
}

// Дополнительная проверка для конкретного estimate
async function checkEstimateAccess(estimateId) {
  console.log(`\n🔍 Проверка доступа к estimate ${estimateId}...`);
  
  const { data, error } = await window.supabase
    .from('estimates')
    .select(`
      *,
      clients!estimates_client_id_fkey(*),
      jobs(*)
    `)
    .eq('id', estimateId)
    .single();
    
  if (error) {
    console.error('❌ Ошибка доступа:', error);
    console.log('Возможные причины:');
    console.log('- RLS политика блокирует доступ');
    console.log('- Неправильный user_id или organization_id');
  } else {
    console.log('✅ Доступ есть!');
    console.log('Данные:', data);
  }
}

// Запускаем проверку
checkDataStructure();

// Для проверки конкретного estimate:
// checkEstimateAccess('estimate-id-here');
