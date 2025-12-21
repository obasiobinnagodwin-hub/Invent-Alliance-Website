-- Seed script for development/testing
-- WARNING: This script inserts test data. Do not run in production!

-- Clear existing test data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE page_views CASCADE;
-- TRUNCATE TABLE visitor_sessions CASCADE;
-- TRUNCATE TABLE system_metrics CASCADE;

-- Generate test visitor sessions
DO $$
DECLARE
    session_id_var VARCHAR(255);
    start_time_var TIMESTAMP WITH TIME ZONE;
    i INTEGER;
    day_offset INTEGER;
BEGIN
    FOR day_offset IN 0..6 LOOP
        start_time_var := CURRENT_TIMESTAMP - (day_offset || ' days')::INTERVAL;
        
        FOR i IN 1..(20 + FLOOR(RANDOM() * 50)) LOOP
            session_id_var := 'test-session-' || day_offset || '-' || i;
            
            INSERT INTO visitor_sessions (
                id,
                start_time,
                last_activity,
                page_views_count,
                ip_address,
                user_agent,
                referrer
            ) VALUES (
                session_id_var,
                start_time_var + (i || ' minutes')::INTERVAL,
                start_time_var + (i || ' minutes')::INTERVAL,
                0,
                '192.168.1.' || (FLOOR(RANDOM() * 255) + 1),
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                CASE 
                    WHEN RANDOM() > 0.5 THEN 'https://google.com'
                    WHEN RANDOM() > 0.3 THEN 'https://bing.com'
                    WHEN RANDOM() > 0.2 THEN 'https://facebook.com'
                    ELSE NULL
                END
            )
            ON CONFLICT (id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Generate test page views
DO $$
DECLARE
    paths TEXT[] := ARRAY['/', '/about-us', '/products-services', '/contacts', '/careers', '/blog'];
    session_ids VARCHAR(255)[];
    session_id_var VARCHAR(255);
    path_var TEXT;
    referrer_var TEXT;
    timestamp_var TIMESTAMP WITH TIME ZONE;
    day_offset INTEGER;
    i INTEGER;
    views_per_day INTEGER;
BEGIN
    -- Get all session IDs
    SELECT ARRAY_AGG(id) INTO session_ids FROM visitor_sessions;
    
    FOR day_offset IN 0..6 LOOP
        views_per_day := 20 + FLOOR(RANDOM() * 50);
        timestamp_var := CURRENT_TIMESTAMP - (day_offset || ' days')::INTERVAL;
        
        FOR i IN 1..views_per_day LOOP
            session_id_var := session_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(session_ids, 1))];
            path_var := paths[1 + FLOOR(RANDOM() * ARRAY_LENGTH(paths, 1))];
            
            IF RANDOM() > 0.4 THEN
                referrer_var := CASE 
                    WHEN RANDOM() > 0.5 THEN 'https://google.com'
                    WHEN RANDOM() > 0.3 THEN 'https://bing.com'
                    ELSE 'https://facebook.com'
                END;
            ELSE
                referrer_var := NULL;
            END IF;
            
            INSERT INTO page_views (
                session_id,
                path,
                timestamp,
                ip_address,
                user_agent,
                referrer
            ) VALUES (
                session_id_var,
                path_var,
                timestamp_var + (i || ' minutes')::INTERVAL,
                '192.168.1.' || (FLOOR(RANDOM() * 255) + 1),
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                referrer_var
            );
        END LOOP;
    END LOOP;
END $$;

-- Generate test system metrics
DO $$
DECLARE
    paths TEXT[] := ARRAY['/api/analytics', '/api/auth/login', '/', '/about-us', '/products-services'];
    methods TEXT[] := ARRAY['GET', 'POST'];
    timestamp_var TIMESTAMP WITH TIME ZONE;
    day_offset INTEGER;
    i INTEGER;
    requests_per_day INTEGER;
    status_code_var INTEGER;
BEGIN
    FOR day_offset IN 0..6 LOOP
        requests_per_day := 50 + FLOOR(RANDOM() * 100);
        timestamp_var := CURRENT_TIMESTAMP - (day_offset || ' days')::INTERVAL;
        
        FOR i IN 1..requests_per_day LOOP
            -- 95% success, 4% 404, 1% 500
            status_code_var := CASE
                WHEN RANDOM() > 0.95 THEN 500
                WHEN RANDOM() > 0.91 THEN 404
                ELSE 200
            END;
            
            INSERT INTO system_metrics (
                timestamp,
                response_time,
                status_code,
                path,
                method
            ) VALUES (
                timestamp_var + (i * 10 || ' seconds')::INTERVAL,
                50 + FLOOR(RANDOM() * 200),
                status_code_var,
                paths[1 + FLOOR(RANDOM() * ARRAY_LENGTH(paths, 1))],
                methods[1 + FLOOR(RANDOM() * ARRAY_LENGTH(methods, 1))]
            );
        END LOOP;
    END LOOP;
END $$;

-- Update session page_views_count based on actual page views
UPDATE visitor_sessions vs
SET page_views_count = (
    SELECT COUNT(*)
    FROM page_views pv
    WHERE pv.session_id = vs.id
);

