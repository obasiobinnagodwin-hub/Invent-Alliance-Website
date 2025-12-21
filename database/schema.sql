-- PostgreSQL Schema for IAL Website Analytics Dashboard
-- This schema supports user authentication and comprehensive analytics tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AUTHENTICATION TABLES
-- ============================================================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'viewer', 'editor')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Sessions table for tracking website visitor sessions
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id VARCHAR(255) PRIMARY KEY,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
    page_views_count INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    time_on_page INTEGER, -- milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_page_views_session FOREIGN KEY (session_id) REFERENCES visitor_sessions(id) ON DELETE CASCADE
);

-- System metrics table for API and performance tracking
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    response_time INTEGER NOT NULL, -- milliseconds
    status_code INTEGER NOT NULL,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD')),
    error_message TEXT,
    request_size INTEGER, -- bytes
    response_size INTEGER, -- bytes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);

-- Visitor sessions indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_start_time ON visitor_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_activity ON visitor_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip_address ON visitor_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_at ON visitor_sessions(created_at);

-- Page views indexes
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path_timestamp ON page_views(path, timestamp);

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_path ON system_metrics(path);
CREATE INDEX IF NOT EXISTS idx_system_metrics_status_code ON system_metrics(status_code);
CREATE INDEX IF NOT EXISTS idx_system_metrics_method ON system_metrics(method);
CREATE INDEX IF NOT EXISTS idx_system_metrics_path_timestamp ON system_metrics(path, timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_status_timestamp ON system_metrics(status_code, timestamp);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for visitor_sessions table
CREATE TRIGGER update_visitor_sessions_updated_at
    BEFORE UPDATE ON visitor_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update visitor session page_views_count
CREATE OR REPLACE FUNCTION update_session_page_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE visitor_sessions
    SET page_views_count = page_views_count + 1,
        last_activity = NEW.timestamp,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session when page view is inserted
CREATE TRIGGER update_session_on_page_view
    AFTER INSERT ON page_views
    FOR EACH ROW
    EXECUTE FUNCTION update_session_page_views();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for page views summary by path
CREATE OR REPLACE VIEW page_views_summary AS
SELECT 
    path,
    COUNT(*) as view_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    MIN(timestamp) as first_view,
    MAX(timestamp) as last_view
FROM page_views
GROUP BY path;

-- View for traffic sources summary
CREATE OR REPLACE VIEW traffic_sources_summary AS
SELECT 
    COALESCE(referrer, 'Direct') as source,
    COUNT(*) as visit_count,
    COUNT(DISTINCT session_id) as unique_sessions
FROM page_views
GROUP BY COALESCE(referrer, 'Direct');

-- View for system metrics summary
CREATE OR REPLACE VIEW system_metrics_summary AS
SELECT 
    DATE_TRUNC('day', timestamp) as date,
    COUNT(*) as total_requests,
    AVG(response_time) as avg_response_time,
    COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
    ROUND(100.0 * COUNT(*) FILTER (WHERE status_code >= 400) / COUNT(*), 2) as error_rate
FROM system_metrics
GROUP BY DATE_TRUNC('day', timestamp);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default admin user (password: admin123)
-- Password hash is bcrypt hash of 'admin123' with salt rounds 10
-- You should change this password immediately after first login!
-- Generated using: bcrypt.hashSync('admin123', 10)
INSERT INTO users (username, password_hash, email, role, is_active)
VALUES (
    'admin',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin@inventallianceco.com',
    'admin',
    TRUE
)
ON CONFLICT (username) DO NOTHING;

-- Note: The password hash above is for 'admin123'. 
-- To generate a new password hash, use Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('your-password', 10);
-- console.log(hash);

