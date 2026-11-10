-- =====================================================================
-- அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்
-- மார்கழி மாத தினசரி பூஜை முன்பதிவு & திருவிழா மேலாண்மை
-- PostgreSQL Database Schema
-- =====================================================================

-- 1. நிர்வாக பயனர்கள் அட்டவணை (Admin Users Table)
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) DEFAULT 'ADMIN',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. மார்கழி தினசரி பூஜை முன்பதிவுகள் அட்டவணை (Margazhi Pooja Bookings Table)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(32) UNIQUE NOT NULL,
    pooja_date DATE NOT NULL,
    margazhi_day INT NOT NULL CHECK (margazhi_day BETWEEN 1 AND 30),
    tamil_date VARCHAR(100) NOT NULL,
    devotee_name VARCHAR(150) NOT NULL,
    family_members JSONB DEFAULT '[]'::jsonb,
    mobile_number VARCHAR(20) NOT NULL,
    address TEXT,
    nakshatram VARCHAR(100),
    rasi VARCHAR(100),
    gothram VARCHAR(100),
    prayer_notes TEXT,
    contribution_amount NUMERIC(10, 2) DEFAULT 500.00,
    payment_method VARCHAR(50) DEFAULT 'OFFLINE' CHECK (payment_method IN ('UPI', 'OFFLINE')),
    payment_status VARCHAR(50) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'VERIFIED', 'EXEMPT', 'FAILED')),
    payment_reference VARCHAR(150),
    payment_screenshot TEXT,
    booking_status VARCHAR(50) DEFAULT 'PENDING' CHECK (booking_status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    cancellation_reason TEXT,
    ip_address VARCHAR(60),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CRITICAL CONSTRAINT: ஒரு நாளுக்கு ஒரு செயலில் உள்ள முன்பதிவு மட்டுமே (One active booking per date)
-- Only one booking where booking_status != 'CANCELLED' is allowed per date.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_pooja_date 
ON bookings (pooja_date) 
WHERE booking_status != 'CANCELLED';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_mobile ON bookings (mobile_number);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings (payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_margazhi_day ON bookings (margazhi_day);

-- 3. கணக்காய்வு பதிவேடு அட்டவணை (Audit Logs Table)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE SET NULL,
    booking_reference VARCHAR(32),
    action VARCHAR(60) NOT NULL,
    performed_by VARCHAR(100) DEFAULT 'SYSTEM',
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(60),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_booking_id ON audit_logs (booking_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs (created_at);

-- 4. திருக்கோயில் அமைப்பு அமைப்புகள் (System Settings Table)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
    ('temple_name', 'அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்', 'கோயில் பெயர்'),
    ('festival_year', '2027', 'திருவிழா ஆண்டு'),
    ('upi_id', 'naganaveen1414@okaxis', 'நேரடி யுபிஐ ஐடி'),
    ('upi_name', 'Naganaveen Naganaveen', 'யுபிஐ கணக்கு பெயர்'),
    ('booking_expiry_hours', '24', 'கட்டண சரிபார்ப்பு நிலுவை காலாவதி நேரம் (மணிநேரத்தில்)'),
    ('contact_phone_1', '79046 89991', 'தொடர்பு எண் 1'),
    ('contact_phone_2', '97154 81878', 'தொடர்பு எண் 2')
ON CONFLICT (setting_key) DO NOTHING;

-- Default Admin User (Password: nagadevi2027)
-- bcrypt hash for 'nagadevi2027' ($2b$10$OMjNKL3fzrLfx.bRP2hK/.AXx6ptrt6Zk086WOWjuKr8w3XP7xYk.)
INSERT INTO admin_users (username, password_hash, full_name, role)
VALUES 
    ('admin', '$2b$10$OMjNKL3fzrLfx.bRP2hK/.AXx6ptrt6Zk086WOWjuKr8w3XP7xYk.', 'திருக்கோயில் நிர்வாகி', 'SUPER_ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Migration checks
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;


