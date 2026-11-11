// =====================================================================
// அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்
// Backend API Server (Node.js + Express + PostgreSQL)
// =====================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { query, withTransaction, initDb, pool } = require('./db');
const { MARGAZHI_DAYS } = require('./margazhi_data');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nagadevi_temple_secret_key_2027';

// Middleware
app.use(cors());
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

// Fallback in-memory storage for when PostgreSQL is not connected or in local development
let memoryBookings = [];
let memoryAuditLogs = [];
let useMemoryStore = false;

// Initialize DB schema on startup
initDb().catch(err => {
    console.log('⚠️ Running with in-memory persistence fallback:', err.message);
    useMemoryStore = true;
});

// Helper: Generate unique booking reference (e.g. NDK-MRG-2027-7K2X)
function generateReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `NDK-MRG-2027-${code}`;
}

// Admin Authentication Middleware
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'அங்கீகரிக்கப்படாத அணுகல். தயவுசெய்து மீண்டும் உள்நுழையவும்.'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'அமர்வு காலாவதியானது. தயவுசெய்து மீண்டும் உள்நுழையவும்.'
        });
    }
}

// ---------------------------------------------------------------------
// 1. HEALTH CHECK
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        temple: 'அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்',
        festivalYear: 2027,
        dbConnected: !useMemoryStore,
        timestamp: new Date().toISOString()
    });
});

// ---------------------------------------------------------------------
// 2. MARGAZHI CALENDAR AVAILABILITY (PUBLIC)
// ---------------------------------------------------------------------
app.get('/api/margazhi/calendar', async (req, res) => {
    try {
        let activeBookings = [];

        if (!useMemoryStore) {
            try {
                const result = await query(
                    `SELECT margazhi_day, booking_status, payment_status, booking_reference, devotee_name, family_members, mobile_number, created_at
                     FROM bookings 
                     WHERE booking_status != 'CANCELLED'
                     ORDER BY CASE WHEN booking_status = 'CONFIRMED' THEN 1 ELSE 2 END, created_at DESC`
                );
                activeBookings = result.rows;
            } catch (dbErr) {
                console.warn('DB query failed, using memory store:', dbErr.message);
                activeBookings = memoryBookings.filter(b => b.booking_status !== 'CANCELLED');
            }
        } else {
            activeBookings = memoryBookings.filter(b => b.booking_status !== 'CANCELLED');
        }

        const bookingMap = new Map();
        activeBookings.forEach(b => {
            const dayKey = parseInt(b.margazhi_day, 10);
            if (!bookingMap.has(dayKey)) {
                bookingMap.set(dayKey, b);
            }
        });

        const calendar = MARGAZHI_DAYS.map(dayInfo => {
            const booking = bookingMap.get(dayInfo.day);
            let status = 'AVAILABLE'; // கிடைக்கும்
            let statusTamil = 'கிடைக்கும்';
            let isBooked = false;

            if (booking) {
                isBooked = true;
                if (booking.booking_status === 'CONFIRMED') {
                    status = 'BOOKED';
                    statusTamil = 'முன்பதிவு செய்யப்பட்டது';
                } else {
                    status = 'PENDING';
                    statusTamil = 'நிலுவையில் உள்ளது';
                }
            }

            let parsedFamily = [];
            if (booking && booking.family_members) {
                try {
                    parsedFamily = typeof booking.family_members === 'string' 
                        ? JSON.parse(booking.family_members) 
                        : booking.family_members;
                } catch (e) {
                    parsedFamily = [];
                }
            }

            return {
                ...dayInfo,
                status,
                statusTamil,
                isBooked,
                bookingReference: booking ? (booking.booking_reference || booking.reference) : null,
                devoteeName: booking ? (booking.devotee_name || booking.devoteeName) : null,
                familyMembers: parsedFamily,
                bookingStatus: booking ? (booking.booking_status || booking.bookingStatus) : null,
                paymentStatus: booking ? (booking.payment_status || booking.paymentStatus) : null
            };
        });

        res.json({
            success: true,
            festivalYear: 2027,
            totalDays: 30,
            calendar
        });
    } catch (err) {
        console.error('Error fetching calendar:', err);
        res.status(500).json({
            success: false,
            message: 'நாட்காட்டி விபரங்களை பெறுவதில் பிழை ஏற்பட்டது.'
        });
    }
});

// ---------------------------------------------------------------------
// 3. BOOK MARGAZHI POOJA (TRANSACTION SAFE)
// ---------------------------------------------------------------------
app.post('/api/margazhi/book', async (req, res) => {
    const {
        margazhi_day,
        devotee_name,
        mobile_number,
        address,
        nakshatram,
        rasi,
        gothram,
        prayer_notes,
        contribution_amount,
        payment_method,
        payment_reference,
        payment_screenshot
    } = req.body;

    // Server-side validation
    const dayNum = parseInt(margazhi_day, 10);
    if (!dayNum || dayNum < 1 || dayNum > 30) {
        return res.status(400).json({
            success: false,
            message: 'தவறான மார்கழி நாள் தேர்வு (1 முதல் 30 வரை மட்டுமே).'
        });
    }

    let parsedMembers = [];
    if (Array.isArray(req.body.family_members)) {
        parsedMembers = req.body.family_members
            .filter(m => m && typeof m.name === 'string' && m.name.trim().length > 0)
            .slice(0, 5)
            .map(m => ({
                name: m.name.trim(),
                relationship: (m.relationship || '').trim()
            }));
    }

    const primaryName = (devotee_name || (parsedMembers[0] ? parsedMembers[0].name : '')).trim();

    if (!primaryName) {
        return res.status(400).json({
            success: false,
            message: 'பக்தர் / குடும்பத்தலைவர் பெயர் கட்டாயமாகும்.'
        });
    }

    if (parsedMembers.length === 0) {
        parsedMembers = [{
            name: primaryName,
            relationship: 'குடும்பத்தலைவர்'
        }];
    }

    let cleanMobile = (mobile_number || '').replace(/\D/g, '');
    if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
        cleanMobile = cleanMobile.slice(2);
    } else if (cleanMobile.length === 11 && cleanMobile.startsWith('0')) {
        cleanMobile = cleanMobile.slice(1);
    }
    if (cleanMobile.length !== 10) {
        return res.status(400).json({
            success: false,
            message: 'சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்.'
        });
    }

    const dayMeta = MARGAZHI_DAYS.find(d => d.day === dayNum);
    if (!dayMeta) {
        return res.status(400).json({
            success: false,
            message: 'தேர்ந்தெடுக்கப்பட்ட நாள் பஞ்சாங்கத்தில் காணப்படவில்லை.'
        });
    }

    const cleanAmount = parseFloat(contribution_amount) || 500;
    const cleanPayMethod = payment_method === 'UPI' ? 'UPI' : 'OFFLINE';
    const reference = generateReference();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    // Calculate expiry (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
        if (!useMemoryStore) {
            try {
                const newBooking = await withTransaction(async (client) => {
                    // Check if date is already booked with row-level locking
                    const checkRes = await client.query(
                        `SELECT id, booking_reference, booking_status 
                         FROM bookings 
                         WHERE pooja_date = $1 AND booking_status != 'CANCELLED' 
                         FOR UPDATE`,
                        [dayMeta.date]
                    );

                    if (checkRes.rows.length > 0) {
                        const existing = checkRes.rows[0];
                        const err = new Error('ALREADY_BOOKED');
                        err.existing = existing;
                        throw err;
                    }

                    // Insert booking
                    const insertSql = `
                        INSERT INTO bookings (
                            booking_reference, pooja_date, margazhi_day, tamil_date,
                            devotee_name, family_members, mobile_number, address, nakshatram, rasi, gothram,
                            prayer_notes, contribution_amount, payment_method, payment_status,
                            payment_reference, payment_screenshot, booking_status, ip_address, user_agent, expires_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
                        ) RETURNING *;
                    `;

                    const values = [
                        reference,
                        dayMeta.date,
                        dayNum,
                        dayMeta.tamilDate,
                        primaryName,
                        JSON.stringify(parsedMembers),
                        cleanMobile,
                        (address || '').trim(),
                        (nakshatram || '').trim(),
                        (rasi || '').trim(),
                        (gothram || '').trim(),
                        (prayer_notes || '').trim(),
                        cleanAmount,
                        cleanPayMethod,
                        'PENDING',
                        (payment_reference || '').trim(),
                        (payment_screenshot || '').trim(),
                        'PENDING',
                        clientIp,
                        userAgent,
                        expiresAt
                    ];

                    const insertRes = await client.query(insertSql, values);
                    const booking = insertRes.rows[0];

                    // Insert audit log
                    await client.query(
                        `INSERT INTO audit_logs (booking_id, booking_reference, action, performed_by, ip_address, notes)
                         VALUES ($1, $2, 'BOOKING_CREATED', 'DEVOTEE', $3, $4)`,
                        [booking.id, reference, clientIp, `புதிய முன்பதிவு உருவாக்கப்பட்டது: ${dayMeta.tamilDate} (${parsedMembers.length} நபர்கள்)`]
                    );

                    return booking;
                });

                return res.status(201).json({
                    success: true,
                    message: 'தங்கள் மார்கழி பூஜை முன்பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
                    booking: {
                        id: newBooking.id,
                        reference: newBooking.booking_reference,
                        booking_reference: newBooking.booking_reference,
                        margazhiDay: newBooking.margazhi_day,
                        margazhi_day: newBooking.margazhi_day,
                        tamilDate: newBooking.tamil_date,
                        tamil_date: newBooking.tamil_date,
                        poojaDate: dayMeta.formattedDate,
                        pooja_date: dayMeta.date,
                        tamilDay: dayMeta.tamilDay,
                        devoteeName: newBooking.devotee_name,
                        devotee_name: newBooking.devotee_name,
                        familyMembers: newBooking.family_members || parsedMembers,
                        family_members: newBooking.family_members || parsedMembers,
                        mobileNumber: newBooking.mobile_number,
                        mobile_number: newBooking.mobile_number,
                        bookingStatus: newBooking.booking_status,
                        booking_status: newBooking.booking_status,
                        paymentStatus: newBooking.payment_status,
                        payment_status: newBooking.payment_status,
                        paymentMethod: newBooking.payment_method,
                        payment_method: newBooking.payment_method,
                        contributionAmount: newBooking.contribution_amount,
                        contribution_amount: newBooking.contribution_amount,
                        expiresAt: newBooking.expires_at,
                        expires_at: newBooking.expires_at
                    }
                });
            } catch (txErr) {
                if (txErr.message === 'ALREADY_BOOKED') {
                    return res.status(409).json({
                        success: false,
                        message: 'மன்னிக்கவும்! இந்த மார்கழி நாள் ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது. மற்றொரு நாளைத் தேர்ந்தெடுக்கவும்.'
                    });
                }
                console.error('⚠️ PostgreSQL booking error:', txErr);
                return res.status(500).json({
                    success: false,
                    message: 'முன்பதிவு செய்வதில் பிழை ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
                });
            }
        }

        // Memory Store Fallback
        const existing = memoryBookings.find(b => b.margazhi_day === dayNum && b.booking_status !== 'CANCELLED');
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'மன்னிக்கவும்! இந்த மார்கழி நாள் ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது. மற்றொரு நாளைத் தேர்ந்தெடுக்கவும்.'
            });
        }

        const memBooking = {
            id: memoryBookings.length + 1,
            booking_reference: reference,
            pooja_date: dayMeta.date,
            margazhi_day: dayNum,
            tamil_date: dayMeta.tamilDate,
            devotee_name: primaryName,
            family_members: parsedMembers,
            mobile_number: cleanMobile,
            address: (address || '').trim(),
            nakshatram: (nakshatram || '').trim(),
            rasi: (rasi || '').trim(),
            gothram: (gothram || '').trim(),
            prayer_notes: (prayer_notes || '').trim(),
            contribution_amount: cleanAmount,
            payment_method: cleanPayMethod,
            payment_status: 'PENDING',
            payment_reference: (payment_reference || '').trim(),
            payment_screenshot: (payment_screenshot || '').trim(),
            booking_status: 'PENDING',
            ip_address: clientIp,
            user_agent: userAgent,
            expires_at: expiresAt,
            created_at: new Date()
        };

        memoryBookings.push(memBooking);
        memoryAuditLogs.push({
            id: memoryAuditLogs.length + 1,
            booking_id: memBooking.id,
            booking_reference: reference,
            action: 'BOOKING_CREATED',
            performed_by: 'DEVOTEE',
            created_at: new Date(),
            notes: `புதிய முன்பதிவு: ${dayMeta.tamilDate} (${parsedMembers.length} நபர்கள்)`
        });

        res.status(201).json({
            success: true,
            message: 'தங்கள் மார்கழி பூஜை முன்பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!',
            booking: {
                id: memBooking.id,
                reference: memBooking.booking_reference,
                margazhiDay: memBooking.margazhi_day,
                tamilDate: memBooking.tamil_date,
                poojaDate: dayMeta.formattedDate,
                tamilDay: dayMeta.tamilDay,
                devoteeName: memBooking.devotee_name,
                familyMembers: memBooking.family_members,
                mobileNumber: memBooking.mobile_number,
                bookingStatus: memBooking.booking_status,
                paymentStatus: memBooking.payment_status,
                paymentMethod: memBooking.payment_method,
                contributionAmount: memBooking.contribution_amount,
                expiresAt: memBooking.expires_at
            }
        });
    } catch (err) {
        console.error('Booking creation error:', err);
        res.status(500).json({
            success: false,
            message: 'முன்பதிவு செய்வதில் தொழில்நுட்பக் கோளாறு ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
        });
    }
});

// ---------------------------------------------------------------------
// 4. LOOKUP BOOKING STATUS (PUBLIC BY REFERENCE OR MOBILE)
// ---------------------------------------------------------------------
app.get('/api/margazhi/booking/:identifier', async (req, res) => {
    const identifier = req.params.identifier.trim();
    if (!identifier) {
        return res.status(400).json({
            success: false,
            message: 'முன்பதிவு எண் அல்லது கைபேசி எண்ணை உள்ளிடவும்.'
        });
    }

    try {
        let bookings = [];

        if (!useMemoryStore) {
            try {
                const result = await query(
                    `SELECT id, booking_reference, margazhi_day, tamil_date, pooja_date,
                            devotee_name, family_members, mobile_number, nakshatram, rasi, gothram,
                            contribution_amount, payment_method, payment_status,
                            booking_status, created_at, expires_at
                     FROM bookings
                     WHERE UPPER(booking_reference) = UPPER($1) OR mobile_number = $1
                     ORDER BY created_at DESC`,
                    [identifier]
                );
                bookings = result.rows;
            } catch (dbErr) {
                const qUpper = identifier.toUpperCase();
                bookings = memoryBookings.filter(b => (b.booking_reference && b.booking_reference.toUpperCase() === qUpper) || b.mobile_number === identifier);
            }
        } else {
            const qUpper = identifier.toUpperCase();
            bookings = memoryBookings.filter(b => (b.booking_reference && b.booking_reference.toUpperCase() === qUpper) || b.mobile_number === identifier);
        }

        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'குறிப்பிட்ட முன்பதிவு எண் அல்லது கைபேசி எண்ணிற்கு எவ்வித தகவலும் காணப்படவில்லை.'
            });
        }

        const formatted = bookings.map(b => {
            const dayMeta = MARGAZHI_DAYS.find(d => d.day === b.margazhi_day);
            return {
                reference: b.booking_reference,
                margazhiDay: b.margazhi_day,
                tamilDate: b.tamil_date,
                poojaDate: dayMeta ? dayMeta.formattedDate : b.pooja_date,
                tamilDay: dayMeta ? dayMeta.tamilDay : '',
                devoteeName: b.devotee_name,
                familyMembers: typeof b.family_members === 'string' ? JSON.parse(b.family_members || '[]') : (b.family_members || []),
                mobileNumber: b.mobile_number.slice(0, 3) + '****' + b.mobile_number.slice(7),
                bookingStatus: b.booking_status,
                paymentStatus: b.payment_status,
                paymentMethod: b.payment_method,
                contributionAmount: b.contribution_amount,
                createdAt: b.created_at
            };
        });

        res.json({
            success: true,
            count: formatted.length,
            bookings: formatted
        });
    } catch (err) {
        console.error('Error looking up booking:', err);
        res.status(500).json({
            success: false,
            message: 'முன்பதிவு தகவலைப் பெறுவதில் பிழை ஏற்பட்டது.'
        });
    }
});

// ---------------------------------------------------------------------
// 5. ADMIN LOGIN
// ---------------------------------------------------------------------
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'பயனர் பெயர் மற்றும் கடவுச்சொல் இரண்டும் தேவை.'
        });
    }

    try {
        let adminUser = null;

        if (!useMemoryStore) {
            try {
                const result = await query(
                    `SELECT * FROM admin_users WHERE username = $1 AND is_active = TRUE`,
                    [username.trim()]
                );
                if (result.rows.length > 0) {
                    adminUser = result.rows[0];
                }
            } catch (dbErr) {
                console.warn('DB admin lookup failed, using fallback check:', dbErr.message);
            }
        }

        // Fallback default admin check
        const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
        const defaultPassword = process.env.ADMIN_PASSWORD || 'nagadevi2027';

        let isValid = false;
        let adminPayload = null;

        if (adminUser) {
            isValid = await bcrypt.compare(password, adminUser.password_hash);
            if (isValid) {
                adminPayload = {
                    id: adminUser.id,
                    username: adminUser.username,
                    name: adminUser.full_name,
                    role: adminUser.role
                };
            }
        } else if (username === defaultUsername && password === defaultPassword) {
            isValid = true;
            adminPayload = {
                id: 1,
                username: defaultUsername,
                name: 'திருக்கோயில் தலைமை நிர்வாகி',
                role: 'SUPER_ADMIN'
            };
        }

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.'
            });
        }

        const token = jwt.sign(adminPayload, JWT_SECRET, { expiresIn: '12h' });

        res.json({
            success: true,
            message: 'நிர்வாகக் குழு முகப்பில் வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்.',
            token,
            admin: adminPayload
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({
            success: false,
            message: 'உள்நுழைவதில் பிழை ஏற்பட்டது.'
        });
    }
});

// ---------------------------------------------------------------------
// 6. ADMIN GET ALL BOOKINGS (WITH FILTERS & SEARCH)
// ---------------------------------------------------------------------
app.get('/api/admin/bookings', authenticateAdmin, async (req, res) => {
    const { status, search } = req.query;

    try {
        let bookings = [];

        if (!useMemoryStore) {
            try {
                let sql = `SELECT * FROM bookings WHERE 1=1`;
                const params = [];

                if (status && ['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
                    params.push(status);
                    sql += ` AND booking_status = $${params.length}`;
                }

                if (search && search.trim()) {
                    params.push(`%${search.trim()}%`);
                    sql += ` AND (devotee_name ILIKE $${params.length} OR mobile_number ILIKE $${params.length} OR booking_reference ILIKE $${params.length} OR family_members::text ILIKE $${params.length})`;
                }

                sql += ` ORDER BY margazhi_day ASC, created_at DESC`;

                const result = await query(sql, params);
                bookings = result.rows;
            } catch (dbErr) {
                bookings = [...memoryBookings];
            }
        } else {
            bookings = memoryBookings.filter(b => {
                if (status && b.booking_status !== status) return false;
                if (search && search.trim()) {
                    const q = search.trim().toLowerCase();
                    const famStr = JSON.stringify(b.family_members || '').toLowerCase();
                    const matches = (b.devotee_name || '').toLowerCase().includes(q) ||
                                    (b.mobile_number || '').includes(q) ||
                                    (b.booking_reference || '').toLowerCase().includes(q) ||
                                    famStr.includes(q);
                    if (!matches) return false;
                }
                return true;
            });
            bookings.sort((a, b) => a.margazhi_day - b.margazhi_day);
        }

        const enhanced = bookings.map(b => {
            const dayMeta = MARGAZHI_DAYS.find(d => d.day === b.margazhi_day);
            return {
                ...b,
                formattedDate: dayMeta ? dayMeta.formattedDate : b.pooja_date,
                tamilDay: dayMeta ? dayMeta.tamilDay : ''
            };
        });

        res.json({
            success: true,
            count: enhanced.length,
            bookings: enhanced
        });
    } catch (err) {
        console.error('Error fetching admin bookings:', err);
        res.status(500).json({
            success: false,
            message: 'முன்பதிவு பட்டியலை பெறுவதில் பிழை.'
        });
    }
});

// ---------------------------------------------------------------------
// 7. ADMIN UPDATE BOOKING STATUS (CONFIRM / CANCEL)
// ---------------------------------------------------------------------
app.patch('/api/admin/booking/:id/status', authenticateAdmin, async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    const status = req.body.status || req.body.booking_status;
    const reason = req.body.reason || req.body.cancellation_reason;

    if (!['CONFIRMED', 'CANCELLED', 'PENDING'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'தவறான முன்பதிவு நிலை.'
        });
    }

    const adminName = req.admin.name || req.admin.username;

    try {
        let updated = null;

        if (!useMemoryStore) {
            try {
                const oldRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
                if (oldRes.rows.length === 0) {
                    return res.status(404).json({ success: false, message: 'முன்பதிவு காணப்படவில்லை.' });
                }
                const oldBooking = oldRes.rows[0];

                if (oldBooking.booking_status === 'CANCELLED' && status !== 'CANCELLED') {
                    const conflict = await query(
                        `SELECT id, devotee_name FROM bookings 
                         WHERE pooja_date = $1 AND id != $2 AND booking_status != 'CANCELLED'`,
                        [oldBooking.pooja_date, bookingId]
                    );
                    if (conflict.rows.length > 0) {
                        return res.status(409).json({
                            success: false,
                            message: `இந்த மார்கழி நாளுக்கு (${oldBooking.tamil_date}) ஏற்கனவே மற்றொரு செயலில் உள்ள முன்பதிவு (${conflict.rows[0].devotee_name}) உள்ளது. எனவே இதை மீண்டும் செயல்படுத்த முடியாது.`
                        });
                    }
                }

                const updateRes = await query(
                    `UPDATE bookings 
                     SET booking_status = $1, cancellation_reason = $2, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $3 
                     RETURNING *`,
                    [status, reason || null, bookingId]
                );
                updated = updateRes.rows[0];

                // Audit Log
                await query(
                    `INSERT INTO audit_logs (booking_id, booking_reference, action, performed_by, notes)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [bookingId, updated.booking_reference, `STATUS_${status}`, adminName, `நிலை மாற்றம்: ${oldBooking.booking_status} -> ${status}`]
                );
            } catch (dbErr) {
                console.warn('DB update failed, using memory fallback:', dbErr.message);
            }
        }

        if (!updated) {
            const idx = memoryBookings.findIndex(b => b.id === bookingId);
            if (idx === -1) {
                return res.status(404).json({ success: false, message: 'முன்பதிவு காணப்படவில்லை.' });
            }
            const oldStatus = memoryBookings[idx].booking_status;

            if (oldStatus === 'CANCELLED' && status !== 'CANCELLED') {
                const conflict = memoryBookings.find(b => b.pooja_date === memoryBookings[idx].pooja_date && b.id !== bookingId && b.booking_status !== 'CANCELLED');
                if (conflict) {
                    return res.status(409).json({
                        success: false,
                        message: `இந்த மார்கழி நாளுக்கு (${memoryBookings[idx].tamil_date}) ஏற்கனவே மற்றொரு செயலில் உள்ள முன்பதிவு (${conflict.devotee_name}) உள்ளது. எனவே இதை மீண்டும் செயல்படுத்த முடியாது.`
                    });
                }
            }

            memoryBookings[idx].booking_status = status;
            memoryBookings[idx].cancellation_reason = reason || null;
            memoryBookings[idx].updated_at = new Date();
            updated = memoryBookings[idx];

            memoryAuditLogs.push({
                id: memoryAuditLogs.length + 1,
                booking_id: bookingId,
                booking_reference: updated.booking_reference,
                action: `STATUS_${status}`,
                performed_by: adminName,
                created_at: new Date(),
                notes: `நிலை மாற்றம்: ${oldStatus} -> ${status}`
            });
        }

        res.json({
            success: true,
            message: `முன்பதிவு நிலை '${status}' என வெற்றிகரமாக புதுப்பிக்கப்பட்டது!`,
            booking: updated
        });
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({
            success: false,
            message: 'முன்பதிவு நிலையை மாற்றுவதில் பிழை ஏற்பட்டது.'
        });
    }
});

// ---------------------------------------------------------------------
// 8. ADMIN VERIFY PAYMENT
// ---------------------------------------------------------------------
app.patch('/api/admin/booking/:id/payment', authenticateAdmin, async (req, res) => {
    const bookingId = parseInt(req.params.id, 10);
    const { payment_status, notes } = req.body;

    if (!['VERIFIED', 'EXEMPT', 'FAILED', 'PENDING'].includes(payment_status)) {
        return res.status(400).json({
            success: false,
            message: 'தவறான கட்டண நிலை.'
        });
    }

    const adminName = req.admin.name || req.admin.username;

    try {
        let updated = null;

        if (!useMemoryStore) {
            try {
                const oldRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
                if (oldRes.rows.length === 0) {
                    return res.status(404).json({ success: false, message: 'முன்பதிவு காணப்படவில்லை.' });
                }

                // If verifying payment, also automatically confirm booking if it is pending
                const updateRes = await query(
                    `UPDATE bookings 
                     SET payment_status = $1::varchar, 
                         booking_status = CASE WHEN $1::varchar = 'VERIFIED' AND booking_status = 'PENDING' THEN 'CONFIRMED' ELSE booking_status END,
                         updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $2 
                     RETURNING *`,
                    [payment_status, bookingId]
                );
                updated = updateRes.rows[0];

                await query(
                    `INSERT INTO audit_logs (booking_id, booking_reference, action, performed_by, notes)
                     VALUES ($1, $2, 'PAYMENT_VERIFIED', $3, $4)`,
                    [bookingId, updated.booking_reference, adminName, `கட்டண சரிபார்ப்பு: ${payment_status}. குறிப்பு: ${notes || '-'}`]
                );
            } catch (dbErr) {
                console.warn('DB payment update failed, using memory fallback:', dbErr.message);
            }
        }

        if (!updated) {
            const idx = memoryBookings.findIndex(b => b.id === bookingId);
            if (idx === -1) {
                return res.status(404).json({ success: false, message: 'முன்பதிவு காணப்படவில்லை.' });
            }
            memoryBookings[idx].payment_status = payment_status;
            if (payment_status === 'VERIFIED' && memoryBookings[idx].booking_status === 'PENDING') {
                memoryBookings[idx].booking_status = 'CONFIRMED';
            }
            memoryBookings[idx].updated_at = new Date();
            updated = memoryBookings[idx];

            memoryAuditLogs.push({
                id: memoryAuditLogs.length + 1,
                booking_id: bookingId,
                booking_reference: updated.booking_reference,
                action: 'PAYMENT_VERIFIED',
                performed_by: adminName,
                created_at: new Date(),
                notes: `கட்டண சரிபார்ப்பு: ${payment_status}`
            });
        }

        res.json({
            success: true,
            message: 'கட்டணம் வெற்றிகரமாக சரிபார்க்கப்பட்டு பதிவு செய்யப்பட்டது!',
            booking: updated
        });
    } catch (err) {
        console.error('Error verifying payment:', err);
        res.status(500).json({
            success: false,
            message: 'கட்டணத்தை சரிபார்ப்பதில் பிழை.'
        });
    }
});

// ---------------------------------------------------------------------
// 8.1 ADMIN MANUAL BOOKING ADD
// ---------------------------------------------------------------------
app.post('/api/admin/bookings/manual', authenticateAdmin, async (req, res) => {
    try {
        const {
            margazhi_day,
            devotee_name,
            family_members,
            mobile_number,
            address,
            contribution_amount,
            payment_method,
            payment_status,
            booking_status,
            payment_reference,
            payment_screenshot,
            notes
        } = req.body;

        const dayNum = parseInt(margazhi_day, 10);
        if (!dayNum || dayNum < 1 || dayNum > 30) {
            return res.status(400).json({ success: false, message: 'தவறான மார்கழி நாள் தேர்வு (1 முதல் 30 வரை மட்டுமே).' });
        }

        const dayMeta = MARGAZHI_DAYS.find(d => d.day === dayNum);
        if (!dayMeta) {
            return res.status(400).json({ success: false, message: 'தேர்ந்தெடுக்கப்பட்ட நாள் பஞ்சாங்கத்தில் காணப்படவில்லை.' });
        }

        let parsedMembers = [];
        if (Array.isArray(family_members)) {
            parsedMembers = family_members
                .filter(m => m && typeof m.name === 'string' && m.name.trim().length > 0)
                .slice(0, 5)
                .map(m => ({ name: m.name.trim(), relationship: (m.relationship || '').trim() }));
        }

        const primaryName = (devotee_name || (parsedMembers[0] ? parsedMembers[0].name : '')).trim();
        if (!primaryName) {
            return res.status(400).json({ success: false, message: 'முதன்மை பக்தர் / குடும்ப உறுப்பினர் பெயர் கட்டாயமாகும்.' });
        }

        if (parsedMembers.length === 0) {
            parsedMembers = [{ name: primaryName, relationship: 'முதன்மை பக்தர்' }];
        }

        let cleanMobile = (mobile_number || '').replace(/\D/g, '');
        if (cleanMobile.length === 12 && cleanMobile.startsWith('91')) {
            cleanMobile = cleanMobile.slice(2);
        } else if (cleanMobile.length === 11 && cleanMobile.startsWith('0')) {
            cleanMobile = cleanMobile.slice(1);
        }
        const cleanAmount = parseFloat(contribution_amount) || 500;
        const cleanPayMethod = payment_method === 'UPI' ? 'UPI' : 'OFFLINE';
        const cleanPayStatus = payment_status === 'VERIFIED' ? 'VERIFIED' : 'PENDING';
        const cleanBookStatus = booking_status === 'PENDING' ? 'PENDING' : 'CONFIRMED';
        const reference = generateReference();
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const adminName = (req.admin && req.admin.username) ? req.admin.username : 'ADMIN';

        if (!useMemoryStore) {
            try {
                const checkRes = await query(
                    `SELECT id, booking_reference FROM bookings 
                     WHERE pooja_date = $1 AND booking_status != 'CANCELLED'`,
                    [dayMeta.date]
                );

                if (checkRes.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: `மார்கழி நாள் ${dayNum} (${dayMeta.tamilDate}) ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது.`
                    });
                }

                const insertSql = `
                    INSERT INTO bookings (
                        booking_reference, pooja_date, margazhi_day, tamil_date,
                        devotee_name, family_members, mobile_number, address,
                        contribution_amount, payment_method, payment_status,
                        payment_reference, payment_screenshot, booking_status, ip_address, user_agent
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'ADMIN_MANUAL'
                    ) RETURNING *;
                `;
                const values = [
                    reference, dayMeta.date, dayNum, dayMeta.tamilDate,
                    primaryName, JSON.stringify(parsedMembers), cleanMobile, (address || '').trim(),
                    cleanAmount, cleanPayMethod, cleanPayStatus,
                    (payment_reference || notes || 'நேரடி நிர்வாக முன்பதிவு').trim(),
                    (payment_screenshot || '').trim(),
                    cleanBookStatus, clientIp
                ];
                const insertRes = await query(insertSql, values);
                const booking = insertRes.rows[0];

                await query(
                    `INSERT INTO audit_logs (booking_id, booking_reference, action, performed_by, ip_address, notes)
                     VALUES ($1, $2, 'MANUAL_BOOKING_CREATED', $3, $4, $5)`,
                    [booking.id, reference, adminName, clientIp, `நிர்வாகியால் நேரடி முன்பதிவு சேர்க்கப்பட்டது: ${dayMeta.tamilDate} - ${primaryName}`]
                );

                return res.status(201).json({
                    success: true,
                    message: 'நேரடி முன்பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது!',
                    booking
                });
            } catch (dbErr) {
                console.error('DB manual booking error:', dbErr);
                return res.status(500).json({
                    success: false,
                    message: 'நேரடி முன்பதிவு சேர்க்க முடியவில்லை: ' + (dbErr.message || 'தரவுத்தள பிழை')
                });
            }
        }

        const conflict = memoryBookings.find(b => b.margazhi_day === dayNum && b.booking_status !== 'CANCELLED');
        if (conflict) {
            return res.status(409).json({
                success: false,
                message: `மார்கழி நாள் ${dayNum} (${dayMeta.tamilDate}) ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது.`
            });
        }

        const memBooking = {
            id: memoryBookings.length + 1,
            booking_reference: reference,
            pooja_date: dayMeta.date,
            margazhi_day: dayNum,
            tamil_date: dayMeta.tamilDate,
            devotee_name: primaryName,
            family_members: parsedMembers,
            mobile_number: cleanMobile,
            address: (address || '').trim(),
            contribution_amount: cleanAmount,
            payment_method: cleanPayMethod,
            payment_status: cleanPayStatus,
            payment_reference: (payment_reference || notes || 'நேரடி நிர்வாக முன்பதிவு').trim(),
            payment_screenshot: (payment_screenshot || '').trim(),
            booking_status: cleanBookStatus,
            ip_address: clientIp,
            created_at: new Date().toISOString()
        };
        memoryBookings.unshift(memBooking);

        memoryAuditLogs.unshift({
            id: memoryAuditLogs.length + 1,
            booking_id: memBooking.id,
            booking_reference: reference,
            action: 'MANUAL_BOOKING_CREATED',
            performed_by: adminName,
            ip_address: clientIp,
            notes: `நிர்வாகியால் நேரடி முன்பதிவு சேர்க்கப்பட்டது: ${dayMeta.tamilDate} - ${primaryName}`,
            created_at: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'நேரடி முன்பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது!',
            booking: memBooking
        });
    } catch (e) {
        res.status(500).json({ success: false, message: 'நேரடி முன்பதிவில் பிழை: ' + e.message });
    }
});

// ---------------------------------------------------------------------
// 8.2 ADMIN CHANGE BOOKING DATE
// ---------------------------------------------------------------------
app.patch('/api/admin/booking/:id/change-date', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { new_margazhi_day } = req.body;
        const newDayNum = parseInt(new_margazhi_day, 10);

        if (!newDayNum || newDayNum < 1 || newDayNum > 30) {
            return res.status(400).json({ success: false, message: 'தவறான மார்கழி நாள் தேர்வு (1 முதல் 30 வரை மட்டுமே).' });
        }

        const newDayMeta = MARGAZHI_DAYS.find(d => d.day === newDayNum);
        if (!newDayMeta) {
            return res.status(400).json({ success: false, message: 'தேர்ந்தெடுக்கப்பட்ட நாள் பஞ்சாங்கத்தில் காணப்படவில்லை.' });
        }

        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const adminName = (req.admin && req.admin.username) ? req.admin.username : 'ADMIN';

        if (!useMemoryStore) {
            try {
                // Check if target day is booked by another active booking
                const conflict = await query(
                    `SELECT id, devotee_name FROM bookings 
                     WHERE pooja_date = $1 AND id::text != $2::text AND booking_reference != $2::text AND booking_status != 'CANCELLED'`,
                    [newDayMeta.date, String(id)]
                );

                if (conflict.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: `மார்கழி நாள் ${newDayNum} (${newDayMeta.tamilDate}) ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது. வேறு நாளைத் தேர்ந்தெடுக்கவும்.`
                    });
                }

                const updateRes = await query(
                    `UPDATE bookings 
                     SET margazhi_day = $1, pooja_date = $2, tamil_date = $3, updated_at = CURRENT_TIMESTAMP
                     WHERE id::text = $4::text OR booking_reference = $4::text
                     RETURNING *`,
                    [newDayNum, newDayMeta.date, newDayMeta.tamilDate, String(id)]
                );

                if (updateRes.rows.length === 0) {
                    return res.status(404).json({ success: false, message: 'முன்பதிவு விவரம் காணப்படவில்லை.' });
                }

                const updated = updateRes.rows[0];
                await query(
                    `INSERT INTO audit_logs (booking_id, booking_reference, action, performed_by, ip_address, notes)
                     VALUES ($1, $2, 'DATE_CHANGED', $3, $4, $5)`,
                    [updated.id, updated.booking_reference, adminName, clientIp, `தேதி மாற்றப்பட்டது: புதிய நாள் ${newDayMeta.tamilDate} (${newDayMeta.formattedDate})`]
                );

                return res.json({
                    success: true,
                    message: `பூஜை தேதி வெற்றிகரமாக ${newDayMeta.tamilDate} என மாற்றப்பட்டது!`,
                    booking: updated
                });
            } catch (err) {
                console.error('DB date change failed:', err);
                return res.status(500).json({
                    success: false,
                    message: 'பூஜை தேதியை மாற்றுவதில் பிழை: ' + (err.message || 'தரவுத்தள பிழை')
                });
            }
        }

        const conflictMem = memoryBookings.find(b => b.margazhi_day === newDayNum && String(b.id) !== String(id) && b.booking_reference !== id && b.booking_status !== 'CANCELLED');
        if (conflictMem) {
            return res.status(409).json({
                success: false,
                message: `மார்கழி நாள் ${newDayNum} (${newDayMeta.tamilDate}) ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது.`
            });
        }

        const b = memoryBookings.find(item => String(item.id) === String(id) || item.booking_reference === id);
        if (!b) {
            return res.status(404).json({ success: false, message: 'முன்பதிவு விவரம் காணப்படவில்லை.' });
        }

        const oldDay = b.tamil_date || `மார்கழி ${b.margazhi_day}`;
        b.margazhi_day = newDayNum;
        b.pooja_date = newDayMeta.date;
        b.tamil_date = newDayMeta.tamilDate;
        b.updated_at = new Date().toISOString();

        memoryAuditLogs.unshift({
            id: memoryAuditLogs.length + 1,
            booking_id: b.id,
            booking_reference: b.booking_reference,
            action: 'DATE_CHANGED',
            performed_by: adminName,
            ip_address: clientIp,
            notes: `தேதி மாற்றப்பட்டது: பழைய நாள்: ${oldDay} -> புதிய நாள்: ${newDayMeta.tamilDate}`,
            created_at: new Date().toISOString()
        });

        res.json({
            success: true,
            message: `பூஜை தேதி வெற்றிகரமாக ${newDayMeta.tamilDate} என மாற்றப்பட்டது!`,
            booking: b
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'தேதி மாற்றத்தில் பிழை: ' + err.message });
    }
});

// ---------------------------------------------------------------------
// 8.3 ADMIN REMOVE / CANCEL BOOKING
// ---------------------------------------------------------------------
app.delete('/api/admin/booking/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const adminName = (req.admin && req.admin.username) ? req.admin.username : 'ADMIN';

        if (!useMemoryStore) {
            try {
                const delRes = await query(
                    `UPDATE bookings 
                     SET booking_status = 'CANCELLED', cancellation_reason = 'ADMIN_REMOVED', updated_at = CURRENT_TIMESTAMP
                     WHERE id::text = $1::text OR booking_reference = $1::text
                     RETURNING *`,
                    [String(id)]
                );

                if (delRes.rows.length === 0) {
                    return res.status(404).json({ success: false, message: 'முன்பதிவு விவரம் காணப்படவில்லை.' });
                }

                const cancelled = delRes.rows[0];
                await query(
                    `INSERT INTO audit_logs (booking_id, booking_reference, action, performed_by, ip_address, notes)
                     VALUES ($1, $2, 'BOOKING_REMOVED', $3, $4, $5)`,
                    [cancelled.id, cancelled.booking_reference, adminName, clientIp, `நிர்வாகியால் முன்பதிவு நீக்கப்பட்டது: ${cancelled.tamil_date} - ${cancelled.devotee_name}`]
                );

                return res.json({
                    success: true,
                    message: 'முன்பதிவு வெற்றிகரமாக நீக்கப்பட்டது. இந்த நாள் மீண்டும் முன்பதிவுக்குக் கிடைக்கும்.',
                    booking: cancelled
                });
            } catch (err) {
                console.error('DB delete failed:', err);
                return res.status(500).json({
                    success: false,
                    message: 'முன்பதிவை நீக்குவதில் பிழை: ' + (err.message || 'தரவுத்தள பிழை')
                });
            }
        }

        const bIndex = memoryBookings.findIndex(item => String(item.id) === String(id) || item.booking_reference === id);
        if (bIndex === -1) {
            return res.status(404).json({ success: false, message: 'முன்பதிவு விவரம் காணப்படவில்லை.' });
        }

        const cancelled = memoryBookings[bIndex];
        cancelled.booking_status = 'CANCELLED';
        cancelled.cancellation_reason = 'ADMIN_REMOVED';

        memoryAuditLogs.unshift({
            id: memoryAuditLogs.length + 1,
            booking_id: cancelled.id,
            booking_reference: cancelled.booking_reference,
            action: 'BOOKING_REMOVED',
            performed_by: adminName,
            ip_address: clientIp,
            notes: `நிர்வாகியால் முன்பதிவு நீக்கப்பட்டது: ${cancelled.tamil_date} - ${cancelled.devotee_name}`,
            created_at: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'முன்பதிவு வெற்றிகரமாக நீக்கப்பட்டது. இந்த நாள் மீண்டும் முன்பதிவுக்குக் கிடைக்கும்.',
            booking: cancelled
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'முன்பதிவு நீக்குவதில் பிழை: ' + err.message });
    }
});

// ---------------------------------------------------------------------
// 9. ADMIN SUMMARY STATISTICS
// ---------------------------------------------------------------------
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        let totalBookings = 0;
        let confirmedCount = 0;
        let pendingCount = 0;
        let totalContribution = 0;

        if (!useMemoryStore) {
            try {
                const resStats = await query(`
                    SELECT 
                        COUNT(*) FILTER (WHERE booking_status != 'CANCELLED') AS active_count,
                        COUNT(*) FILTER (WHERE booking_status = 'CONFIRMED') AS confirmed_count,
                        COUNT(*) FILTER (WHERE booking_status = 'PENDING') AS pending_count,
                        COALESCE(SUM(contribution_amount) FILTER (WHERE payment_status = 'VERIFIED'), 0) AS total_contribution
                    FROM bookings
                `);
                const row = resStats.rows[0];
                totalBookings = parseInt(row.active_count, 10);
                confirmedCount = parseInt(row.confirmed_count, 10);
                pendingCount = parseInt(row.pending_count, 10);
                totalContribution = parseFloat(row.total_contribution);
            } catch (dbErr) {
                const active = memoryBookings.filter(b => b.booking_status !== 'CANCELLED');
                totalBookings = active.length;
                confirmedCount = active.filter(b => b.booking_status === 'CONFIRMED').length;
                pendingCount = active.filter(b => b.booking_status === 'PENDING').length;
                totalContribution = active.reduce((sum, b) => b.payment_status === 'VERIFIED' ? sum + (b.contribution_amount || 0) : sum, 0);
            }
        } else {
            const active = memoryBookings.filter(b => b.booking_status !== 'CANCELLED');
            totalBookings = active.length;
            confirmedCount = active.filter(b => b.booking_status === 'CONFIRMED').length;
            pendingCount = active.filter(b => b.booking_status === 'PENDING').length;
            totalContribution = active.reduce((sum, b) => b.payment_status === 'VERIFIED' ? sum + (b.contribution_amount || 0) : sum, 0);
        }

        const availableCount = Math.max(0, 30 - totalBookings);

        res.json({
            success: true,
            stats: {
                totalDays: 30,
                confirmedCount,
                pendingCount,
                availableCount,
                totalContribution
            }
        });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ success: false, message: 'புள்ளிவிபரங்களைப் பெறுவதில் பிழை.' });
    }
});

// ---------------------------------------------------------------------
// 10. ADMIN AUDIT LOGS
// ---------------------------------------------------------------------
app.get('/api/admin/audit-logs', authenticateAdmin, async (req, res) => {
    try {
        let logs = [];
        if (!useMemoryStore) {
            try {
                const resLogs = await query(`
                    SELECT * FROM audit_logs 
                    ORDER BY created_at DESC 
                    LIMIT 50
                `);
                logs = resLogs.rows;
            } catch (dbErr) {
                logs = memoryAuditLogs.slice(-50).reverse();
            }
        } else {
            logs = memoryAuditLogs.slice(-50).reverse();
        }

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        res.status(500).json({ success: false, message: 'கணக்காய்வு பதிவுகளைப் பெறுவதில் பிழை.' });
    }
});

// ---------------------------------------------------------------------
// 11. AUTOMATIC EXPIRY POLICY WORKER
// ---------------------------------------------------------------------
async function checkBookingExpirations() {
    try {
        const now = new Date();
        if (!useMemoryStore) {
            try {
                const expiredRes = await query(`
                    UPDATE bookings 
                    SET booking_status = 'CANCELLED', cancellation_reason = 'காலாவதியானது (காலக்கெடு முடிந்தது)' 
                    WHERE booking_status = 'PENDING' 
                      AND payment_status = 'PENDING' 
                      AND (payment_screenshot IS NULL OR payment_screenshot = '')
                      AND expires_at < NOW() 
                    RETURNING id, booking_reference, margazhi_day
                `);

                if (expiredRes.rows.length > 0) {
                    console.log(`⏱️ Auto-cancelled ${expiredRes.rows.length} expired pending bookings`);
                    for (const b of expiredRes.rows) {
                        await query(
                            `INSERT INTO audit_logs (booking_id, booking_reference, action, performed_by, notes)
                             VALUES ($1, $2, 'AUTO_EXPIRED', 'SYSTEM', 'காலக்கெடு முடிந்ததால் தானாக ரத்து செய்யப்பட்டது')`,
                            [b.id, b.booking_reference]
                        );
                    }
                }
            } catch (dbErr) {
                // Ignore silent check
            }
        } else {
            memoryBookings.forEach(b => {
                if (b.booking_status === 'PENDING' && b.payment_status === 'PENDING' && (!b.payment_screenshot || b.payment_screenshot === '') && new Date(b.expires_at) < now) {
                    b.booking_status = 'CANCELLED';
                    b.cancellation_reason = 'காலாவதியானது (காலக்கெடு முடிந்தது)';
                    memoryAuditLogs.push({
                        id: memoryAuditLogs.length + 1,
                        booking_id: b.id,
                        booking_reference: b.booking_reference,
                        action: 'AUTO_EXPIRED',
                        performed_by: 'SYSTEM',
                        created_at: new Date(),
                        notes: 'தானாக ரத்து செய்யப்பட்டது'
                    });
                }
            });
        }
    } catch (err) {
        console.error('Error checking booking expirations:', err.message);
    }
}

// Run expiry check every 10 minutes
setInterval(checkBookingExpirations, 10 * 60 * 1000);

// Start server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🪔 ஸ்ரீ நாகதேவி அம்மன் திருக்கோயில் சர்வர் இயங்குகிறது`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`🗄️ Database: PostgreSQL (with memory-store auto fallback)`);
    console.log(`📅 திருவிழா ஆண்டு: 2027`);
    console.log(`=======================================================`);
});

module.exports = app;
