// Диагностика проблемы с регистрацией
// Запустите это в консоли браузера на странице localhost:8080

console.log('🔍 Проверка подключения к Supabase...\n');

// 1. Проверка Supabase URL и ключа
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// 2. Проверка сети
async function testSupabaseConnection() {
  try {
    const response = await fetch('https://mqppvcrlvsgrsqelglod.supabase.co/auth/v1/health', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xcHB2Y3JsdnNncnNxZWxnbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1OTE3MDUsImV4cCI6MjA2MzE2NzcwNX0.My-KiqG1bCMqzUru4m59d4v18N3WGxNoNtFPOFAmhzg'
      }
    });
    
    if (response.ok) {
      console.log('✅ Подключение к Supabase работает');
    } else {
      console.error('❌ Проблема с подключением:', response.status);
    }
  } catch (error) {
    console.error('❌ Ошибка сети:', error);
  }
}

// 3. Проверка существующего пользователя
async function checkExistingUser() {
  try {
    // Импортируем supabase клиент
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Попробуем войти с существующими данными
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'petrusenkocorp@gmail.com',
      password: '2806456'
    });
    
    if (data?.user) {
      console.log('✅ Вход с существующим аккаунтом работает');
      console.log('User ID:', data.user.id);
    } else if (error) {
      console.error('❌ Ошибка входа:', error.message);
    }
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// 4. Альтернативный способ регистрации
console.log('\n📝 Альтернативный способ регистрации:');
console.log('1. Используйте существующий аккаунт: petrusenkocorp@gmail.com');
console.log('2. Или попробуйте другой email');
console.log('3. Или используйте Supabase Dashboard для создания пользователя');

// Запуск тестов
testSupabaseConnection();
console.log('\nДля проверки существующего аккаунта выполните: checkExistingUser()');

// Проверка CORS
console.log('\n🔒 Проверка CORS:');
console.log('Если видите CORS ошибки, возможные решения:');
console.log('1. Проверьте настройки CORS в Supabase Dashboard');
console.log('2. Используйте правильный URL: https://mqppvcrlvsgrsqelglod.supabase.co');
console.log('3. Убедитесь, что домен localhost:8080 разрешен');
