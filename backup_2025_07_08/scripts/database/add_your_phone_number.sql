-- Добавьте ваш новый телефонный номер
-- Замените +1XXXXXXXXXX на ваш реальный номер

INSERT INTO telnyx_phone_numbers (
    phone_number,
    status,
    country_code,
    area_code,
    features,
    monthly_cost,
    setup_cost,
    user_id,
    purchased_at,
    created_at,
    updated_at
) VALUES (
    '+1XXXXXXXXXX',  -- ← ЗАМЕНИТЕ НА ВАШ НОМЕР
    'available',     -- Статус: available = доступен для использования
    'US',
    'XXX',          -- ← Первые 3 цифры после +1
    ARRAY['sms', 'voice', 'mms']::text[],
    0.00,
    0.00,
    NULL,           -- NULL = доступен всем пользователям
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (phone_number) 
DO UPDATE SET
    status = 'available',
    user_id = NULL,
    updated_at = NOW();

-- Проверка результата
SELECT * FROM telnyx_phone_numbers ORDER BY created_at DESC;
