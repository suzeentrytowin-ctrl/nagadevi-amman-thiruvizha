document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------
    // 1. CINEMATIC LOADER SEQUENCE
    // --------------------------------------------------------
    const loader = document.getElementById('loader');
    const loaderVideo = document.getElementById('loader-bg-video');
    const lamps = document.querySelectorAll('.kuthu-vilakku');
    const omSymbol = document.querySelector('.om-symbol');
    const titles = document.querySelectorAll('.loader-title, .loader-subtitle');
    
    // Simulate cinematic loading timeline
    setTimeout(() => {
        if(lamps.length > 0) lamps.forEach(lamp => lamp.classList.add('loader-anim-lamp'));
    }, 500); // Light lamps

    setTimeout(() => {
        if(omSymbol) omSymbol.classList.add('loader-anim-om');
    }, 1500); // Show Om

    setTimeout(() => {
        titles.forEach(title => title.classList.add('loader-anim-title'));
    }, 2500); // Show Text

    function hideLoader() {
        if (loader.classList.contains('hidden')) return;
        loader.classList.add('hidden');
        setTimeout(() => loader.style.display = 'none', 1000);
        
        // After loader finishes, check for audio autoplay
        checkAudioPlayback();
    }

    if (loaderVideo) {
        loaderVideo.addEventListener('ended', hideLoader);
        
        // Fallback in case video is blocked or fails to play
        loaderVideo.addEventListener('loadedmetadata', () => {
            setTimeout(hideLoader, (loaderVideo.duration * 1000) + 500);
        });
        
        // Extra fallback
        setTimeout(hideLoader, 15000);
    } else {
        setTimeout(hideLoader, 4500);
    }

    // --------------------------------------------------------
    // 2. AUDIO MANAGEMENT (AUTOPLAY & OVERLAY)
    // --------------------------------------------------------
    const bgm = document.getElementById('bgm');
    const musicBtn = document.getElementById('music-toggle');
    const equalizer = document.querySelector('.equalizer');
    const musicIcon = document.querySelector('.music-icon');
    
    bgm.volume = 0.1; // 10% volume as requested

    function checkAudioPlayback() {
        // Attempt to play audio automatically
        const playPromise = bgm.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Autoplay successful
                showPlayingState();
            }).catch(error => {
                // Autoplay blocked by browser policy
                console.log("Autoplay blocked. User can start music via the navbar icon.");
            });
        }
    }

    // Toggle Music Button
    musicBtn.addEventListener('click', () => {
        if (bgm.paused) {
            bgm.play();
            showPlayingState();
        } else {
            bgm.pause();
            showPausedState();
        }
    });

    function showPlayingState() {
        equalizer.classList.remove('hidden');
        musicIcon.classList.add('hidden');
    }

    function showPausedState() {
        equalizer.classList.add('hidden');
        musicIcon.classList.remove('hidden');
    }

    // --------------------------------------------------------
    // 3. STICKY NAVBAR & GLASSMORPHISM
    // --------------------------------------------------------
    const header = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --------------------------------------------------------
    // 4. MOBILE MENU (HAMBURGER)
    // --------------------------------------------------------
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // --------------------------------------------------------
    // 5. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
    // --------------------------------------------------------
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Optional: stop observing once shown for performance
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(el => scrollObserver.observe(el));

    // --------------------------------------------------------
    // 6. PARALLAX EFFECT FOR HERO SECTION
    // --------------------------------------------------------
    const parallaxBg = document.querySelector('.parallax-bg');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        if (scrollPosition < window.innerHeight) {
            // Move background at 40% scroll speed
            parallaxBg.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        }
    });

    // --------------------------------------------------------
    // 7. GLOWING BORDER ONLY IN HERO SECTION
    // --------------------------------------------------------
    const heroSection = document.getElementById('home');
    const templeBorder = document.querySelector('.temple-border-frame');
    
    if (heroSection && templeBorder) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    templeBorder.classList.add('glowing');
                } else {
                    templeBorder.classList.remove('glowing');
                }
            });
        }, { threshold: 0.1 });
        heroObserver.observe(heroSection);
    }

    // --------------------------------------------------------
    // 8. FESTIVAL COUNTDOWN TIMER (02 AUGUST 2027, 5:00 PM IST)
    // --------------------------------------------------------
    const countDownDate = new Date("Aug 02, 2027 17:00:00 GMT+0530").getTime();
    
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minsEl = document.getElementById("minutes");
    const secsEl = document.getElementById("seconds");
    const countdownContainer = document.getElementById("countdown");

    if (countdownContainer && daysEl) {
        const x = setInterval(function() {
            const now = new Date().getTime();
            const distance = countDownDate - now;

            if (distance < 0) {
                clearInterval(x);
                countdownContainer.innerHTML = "<h2 style='color: var(--accent-gold); text-shadow: 0 0 10px var(--accent-gold); margin-top: 20px;'>திருவிழா இனிதே தொடங்கியது!</h2>";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.innerText = days.toString().padStart(2, '0');
            hoursEl.innerText = hours.toString().padStart(2, '0');
            minsEl.innerText = minutes.toString().padStart(2, '0');
            secsEl.innerText = seconds.toString().padStart(2, '0');
        }, 1000);
    }

    // --------------------------------------------------------
    // 9. INLINE GALLERY CAROUSEL & LIGHTBOX
    // --------------------------------------------------------
    const galleries = document.querySelectorAll('.event-gallery');
    
    galleries.forEach(gallery => {
        const track = gallery.querySelector('.gallery-track');
        const prevBtn = gallery.querySelector('.prev-btn');
        const nextBtn = gallery.querySelector('.next-btn');
        const images = gallery.querySelectorAll('.gallery-img');
        
        if (!track || images.length <= 1) {
            // Hide buttons if 1 or 0 images
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
            return; 
        }

        let currentIndex = 0;
        
        nextBtn.addEventListener('click', () => {
            currentIndex++;
            if (currentIndex >= images.length) currentIndex = 0;
            updateGallery();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex--;
            if (currentIndex < 0) currentIndex = images.length - 1;
            updateGallery();
        });

        function updateGallery() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    });

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.gallery-img');

    if (lightbox && lightboxImg) {
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
            });
        });

        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }

    // --------------------------------------------------------
    // 10. MARGAZHI DAILY POOJA BOOKING & CALENDAR MODULE
    // --------------------------------------------------------
    const MARGAZHI_DAYS = [
        { day: 1, tamilDate: "மார்கழி 01", date: "2026-12-16", formattedDate: "16.12.2026", tamilDay: "புதன்கிழமை" },
        { day: 2, tamilDate: "மார்கழி 02", date: "2026-12-17", formattedDate: "17.12.2026", tamilDay: "வியாழக்கிழமை" },
        { day: 3, tamilDate: "மார்கழி 03", date: "2026-12-18", formattedDate: "18.12.2026", tamilDay: "வெள்ளிக்கிழமை" },
        { day: 4, tamilDate: "மார்கழி 04", date: "2026-12-19", formattedDate: "19.12.2026", tamilDay: "சனிக்கிழமை" },
        { day: 5, tamilDate: "மார்கழி 05", date: "2026-12-20", formattedDate: "20.12.2026", tamilDay: "ஞாயிற்றுக்கிழமை" },
        { day: 6, tamilDate: "மார்கழி 06", date: "2026-12-21", formattedDate: "21.12.2026", tamilDay: "திங்கட்கிழமை" },
        { day: 7, tamilDate: "மார்கழி 07", date: "2026-12-22", formattedDate: "22.12.2026", tamilDay: "செவ்வாய்க்கிழமை" },
        { day: 8, tamilDate: "மார்கழி 08", date: "2026-12-23", formattedDate: "23.12.2026", tamilDay: "புதன்கிழமை" },
        { day: 9, tamilDate: "மார்கழி 09", date: "2026-12-24", formattedDate: "24.12.2026", tamilDay: "வியாழக்கிழமை" },
        { day: 10, tamilDate: "மார்கழி 10", date: "2026-12-25", formattedDate: "25.12.2026", tamilDay: "வெள்ளிக்கிழமை" },
        { day: 11, tamilDate: "மார்கழி 11", date: "2026-12-26", formattedDate: "26.12.2026", tamilDay: "சனிக்கிழமை" },
        { day: 12, tamilDate: "மார்கழி 12", date: "2026-12-27", formattedDate: "27.12.2026", tamilDay: "ஞாயிற்றுக்கிழமை" },
        { day: 13, tamilDate: "மார்கழி 13", date: "2026-12-28", formattedDate: "28.12.2026", tamilDay: "திங்கட்கிழமை" },
        { day: 14, tamilDate: "மார்கழி 14", date: "2026-12-29", formattedDate: "29.12.2026", tamilDay: "செவ்வாய்க்கிழமை" },
        { day: 15, tamilDate: "மார்கழி 15", date: "2026-12-30", formattedDate: "30.12.2026", tamilDay: "புதன்கிழமை" },
        { day: 16, tamilDate: "மார்கழி 16", date: "2026-12-31", formattedDate: "31.12.2026", tamilDay: "வியாழக்கிழமை" },
        { day: 17, tamilDate: "மார்கழி 17", date: "2027-01-01", formattedDate: "01.01.2027", tamilDay: "வெள்ளிக்கிழமை" },
        { day: 18, tamilDate: "மார்கழி 18", date: "2027-01-02", formattedDate: "02.01.2027", tamilDay: "சனிக்கிழமை" },
        { day: 19, tamilDate: "மார்கழி 19", date: "2027-01-03", formattedDate: "03.01.2027", tamilDay: "ஞாயிற்றுக்கிழமை" },
        { day: 20, tamilDate: "மார்கழி 20", date: "2027-01-04", formattedDate: "04.01.2027", tamilDay: "திங்கட்கிழமை" },
        { day: 21, tamilDate: "மார்கழி 21", date: "2027-01-05", formattedDate: "05.01.2027", tamilDay: "செவ்வாய்க்கிழமை" },
        { day: 22, tamilDate: "மார்கழி 22", date: "2027-01-06", formattedDate: "06.01.2027", tamilDay: "புதன்கிழமை" },
        { day: 23, tamilDate: "மார்கழி 23", date: "2027-01-07", formattedDate: "07.01.2027", tamilDay: "வியாழக்கிழமை" },
        { day: 24, tamilDate: "மார்கழி 24", date: "2027-01-08", formattedDate: "08.01.2027", tamilDay: "வெள்ளிக்கிழமை" },
        { day: 25, tamilDate: "மார்கழி 25", date: "2027-01-09", formattedDate: "09.01.2027", tamilDay: "சனிக்கிழமை" },
        { day: 26, tamilDate: "மார்கழி 26", date: "2027-01-10", formattedDate: "10.01.2027", tamilDay: "ஞாயிற்றுக்கிழமை" },
        { day: 27, tamilDate: "மார்கழி 27", date: "2027-01-11", formattedDate: "11.01.2027", tamilDay: "திங்கட்கிழமை" },
        { day: 28, tamilDate: "மார்கழி 28", date: "2027-01-12", formattedDate: "12.01.2027", tamilDay: "செவ்வாய்க்கிழமை" },
        { day: 29, tamilDate: "மார்கழி 29", date: "2027-01-13", formattedDate: "13.01.2027", tamilDay: "புதன்கிழமை" },
        { day: 30, tamilDate: "மார்கழி 30", date: "2027-01-14", formattedDate: "14.01.2027", tamilDay: "வியாழக்கிழமை" }
    ];

    // API Base URL Detection
    const API_BASE = window.TEMPLE_API_URL || 
        ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5000'
            ? '/api'
            : ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
                ? 'http://localhost:5000/api'
                : 'https://nagadevi-temple-api.onrender.com/api'));

    let currentCalendarData = [];
    let selectedMargazhiDay = null;

    // Local Storage Helpers for resilient zero-cost offline & GitHub Pages support
    function getLocalBookings() {
        try {
            return JSON.parse(localStorage.getItem('nagadevi_margazhi_bookings') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveLocalBooking(booking) {
        const bookings = getLocalBookings();
        bookings.push(booking);
        localStorage.setItem('nagadevi_margazhi_bookings', JSON.stringify(bookings));
    }

    function updateLocalBooking(id, changes) {
        const bookings = getLocalBookings();
        const idx = bookings.findIndex(b => b.id === id || b.booking_reference === id);
        if (idx !== -1) {
            bookings[idx] = { ...bookings[idx], ...changes, updated_at: new Date().toISOString() };
            localStorage.setItem('nagadevi_margazhi_bookings', JSON.stringify(bookings));
            return bookings[idx];
        }
        return null;
    }

    // Reference generator
    function generateBookingRef() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `NDK-MRG-2027-${code}`;
    }

    // 10.1 Load Calendar
    async function loadMargazhiCalendar() {
        const grid = document.getElementById('margazhi-calendar-grid');
        if (!grid) return;

        try {
            const cacheBuster = `?_t=${Date.now()}`;
            const response = await fetch(`${API_BASE}/margazhi/calendar${cacheBuster}`, { 
                cache: 'no-store',
                signal: AbortSignal.timeout(4000) 
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.calendar) {
                    currentCalendarData = data.calendar;
                    renderCalendarGrid(currentCalendarData);

                    // Sync localStorage with DB bookings so offline fallback stays consistent
                    try {
                        const dbBookings = data.calendar
                            .filter(c => c.isBooked)
                            .map(c => ({
                                id: c.bookingReference || ('DB-' + c.day),
                                booking_reference: c.bookingReference,
                                reference: c.bookingReference,
                                margazhi_day: c.day,
                                margazhiDay: c.day,
                                pooja_date: c.date,
                                poojaDate: c.formattedDate,
                                tamil_date: c.tamilDate,
                                tamilDate: c.tamilDate,
                                tamilDay: c.tamilDay,
                                devotee_name: c.devoteeName,
                                devoteeName: c.devoteeName,
                                family_members: c.familyMembers || [],
                                familyMembers: c.familyMembers || [],
                                booking_status: c.bookingStatus || 'CONFIRMED',
                                bookingStatus: c.bookingStatus || 'CONFIRMED',
                                payment_status: c.paymentStatus || 'VERIFIED',
                                paymentStatus: c.paymentStatus || 'VERIFIED'
                            }));
                        localStorage.setItem('nagadevi_margazhi_bookings', JSON.stringify(dbBookings));
                    } catch (syncErr) {
                        console.warn('LocalStorage sync skipped:', syncErr);
                    }

                    // If currently selected day was booked, close booking form
                    if (selectedMargazhiDay) {
                        const sel = currentCalendarData.find(d => d.day === selectedMargazhiDay);
                        if (sel && sel.status !== 'AVAILABLE') {
                            hideBookingForm();
                        }
                    }

                    return;
                }
            }
            throw new Error('API calendar response not ok');
        } catch (err) {
            // Graceful fallback to client storage (ideal for GitHub Pages without active backend)
            const localBookings = getLocalBookings().filter(b => b.booking_status !== 'CANCELLED');
            const bookingMap = new Map();
            localBookings.forEach(b => bookingMap.set(b.margazhi_day || b.margazhiDay, b));

            currentCalendarData = MARGAZHI_DAYS.map(dayInfo => {
                const booking = bookingMap.get(dayInfo.day);
                let status = 'AVAILABLE';
                let statusTamil = 'கிடைக்கும்';
                let isBooked = false;

                if (booking) {
                    isBooked = true;
                    if (booking.booking_status === 'CONFIRMED' || booking.bookingStatus === 'CONFIRMED') {
                        status = 'BOOKED';
                        statusTamil = 'முன்பதிவு செய்யப்பட்டது';
                    } else {
                        status = 'PENDING';
                        statusTamil = 'நிலுவையில் உள்ளது';
                    }
                }

                return {
                    ...dayInfo,
                    status,
                    statusTamil,
                    isBooked,
                    bookingReference: booking ? (booking.booking_reference || booking.reference) : null,
                    devoteeName: booking ? (booking.devotee_name || booking.devoteeName) : null,
                    familyMembers: booking ? (booking.family_members || booking.familyMembers || []) : [],
                    bookingStatus: booking ? (booking.booking_status || booking.bookingStatus) : null,
                    paymentStatus: booking ? (booking.payment_status || booking.paymentStatus) : null
                };
            });

            renderCalendarGrid(currentCalendarData);

            if (selectedMargazhiDay) {
                const sel = currentCalendarData.find(d => d.day === selectedMargazhiDay);
                if (sel && sel.status !== 'AVAILABLE') {
                    hideBookingForm();
                }
            }
        }
    }

    // 10.2 Render Calendar Grid
    function renderCalendarGrid(calendarData) {
        const grid = document.getElementById('margazhi-calendar-grid');
        if (!grid) return;

        grid.innerHTML = '';

        calendarData.forEach(day => {
            const card = document.createElement('div');
            const statusClass = day.status === 'AVAILABLE' ? 'available' : (day.status === 'PENDING' ? 'pending' : 'booked');
            card.className = `margazhi-day-card ${statusClass}`;
            card.dataset.day = day.day;

            if (selectedMargazhiDay === day.day) {
                card.classList.add('selected');
            }

            const devoteeHtml = day.devoteeName ? `
                <div class="day-devotee-badge" title="உபயதாரர்: ${day.devoteeName}">
                    🪔 <strong>${day.devoteeName}</strong>
                    ${(day.familyMembers && day.familyMembers.length > 1) ? `<span style="font-size:0.7rem; font-weight:normal; opacity:0.85;"> (+${day.familyMembers.length - 1})</span>` : ''}
                </div>
                <span class="day-view-details-hint">விவரம் காண்க 👁️</span>
            ` : '';

            card.innerHTML = `
                <div>
                    <div class="day-badge-tamil">${day.tamilDate}</div>
                    <div class="day-meta-gregorian">ஆங்கில தேதி: <strong>${day.formattedDate}</strong></div>
                    <div class="day-meta-dayname">${day.tamilDay}</div>
                    ${devoteeHtml}
                </div>
                <div class="day-status-pill ${statusClass}">
                    ${day.statusTamil}
                </div>
            `;

            if (day.status === 'AVAILABLE') {
                card.addEventListener('click', () => {
                    selectMargazhiDay(day);
                });
            } else {
                card.title = day.status === 'BOOKED' 
                    ? `முன்பதிவு விபரம் காண்க (உபயதாரர்: ${day.devoteeName || 'பக்தர்'})` 
                    : `சரிபார்ப்பு நிலுவையில் உள்ளது (உபயதாரர்: ${day.devoteeName || 'பக்தர்'})`;
                card.addEventListener('click', () => {
                    showPublicSlotDetails(day);
                });
            }

            grid.appendChild(card);
        });
    }

    // 10.2.1 Public Booked Slot Details Modal
    function showPublicSlotDetails(day) {
        const modal = document.getElementById('public-slot-details-modal');
        const body = document.getElementById('public-slot-details-body');
        if (!modal || !body) return;

        const members = (day.familyMembers && day.familyMembers.length > 0)
            ? day.familyMembers
            : [{ name: day.devoteeName || 'பக்தர்' }];

        const membersHtml = members.map((m, idx) => `
            <li style="margin-bottom: 5px;">
                <strong>${m.name}</strong> ${m.relationship ? `<small style="color: var(--copper);">(${m.relationship})</small>` : ''}
            </li>
        `).join('');

        const statusBadge = day.status === 'BOOKED' 
            ? '<span class="status-pill available">உறுதி செய்யப்பட்டது</span>'
            : '<span class="status-pill pending">சரிபார்ப்பு பரிசீலனையில் உள்ளது</span>';

        body.innerHTML = `
            <div class="receipt-box">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h4 style="color: var(--primary-maroon); font-size: 1.25rem;">ஸ்ரீ நாகதேவி அம்மன் திருக்கோயில்</h4>
                    <p style="font-size: 0.9rem; color: var(--copper);">சிங்கிரிபாளையம், ஈரோடு மாவட்டம் | மார்கழி பூஜை உபயதாரர் விபரம்</p>
                    <div class="receipt-ref-code">${day.bookingReference || 'NDK-MRG-2027'}</div>
                </div>

                <table class="receipt-table">
                    <tr>
                        <td class="label">தமிழ் தேதி:</td>
                        <td><strong>${day.tamilDate}</strong></td>
                    </tr>
                    <tr>
                        <td class="label">ஆங்கில தேதி:</td>
                        <td><strong>${day.formattedDate}</strong> (${day.tamilDay})</td>
                    </tr>
                    <tr>
                        <td class="label">பூஜை நேரம்:</td>
                        <td>அதிகாலை 4:30 - 6:00 மணி (உஷத்கால பூஜை)</td>
                    </tr>
                    <tr>
                        <td class="label">பூஜை உபயதாரர்:</td>
                        <td><strong style="color: var(--primary-maroon); font-size: 1.05rem;">${day.devoteeName || 'பக்தர்'}</strong></td>
                    </tr>
                    <tr>
                        <td class="label">அர்ச்சனை குடும்ப உறுப்பினர்கள் (${members.length} நபர்கள்):</td>
                        <td>
                            <ol style="margin: 0; padding-left: 18px;">
                                ${membersHtml}
                            </ol>
                        </td>
                    </tr>
                    <tr>
                        <td class="label">முன்பதிவு நிலை:</td>
                        <td>${statusBadge}</td>
                    </tr>
                </table>

                <div style="margin-top: 15px; padding: 12px; background: #FFF; border-radius: 8px; border: 1px dashed var(--accent-gold); text-align: center;">
                    <p style="font-size: 0.85rem; color: var(--primary-maroon); margin: 0;">
                        ✨ இந்த நாளுக்கான மார்கழி உஷத்கால பூஜை உபயம் அன்புடன் பதிவு செய்யப்பட்டுள்ளது. தாங்கள் விரும்பும் மற்றொரு கிடைக்கும் நாளைத் தேர்ந்தெடுக்கலாம்.
                    </p>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    const closePublicSlotBtn = document.getElementById('close-public-slot-modal-btn');
    const dismissPublicSlotBtn = document.getElementById('dismiss-public-slot-modal-btn');
    if (closePublicSlotBtn) closePublicSlotBtn.addEventListener('click', () => {
        const m = document.getElementById('public-slot-details-modal');
        if (m) m.classList.add('hidden');
    });
    if (dismissPublicSlotBtn) dismissPublicSlotBtn.addEventListener('click', () => {
        const m = document.getElementById('public-slot-details-modal');
        if (m) m.classList.add('hidden');
    });

    // 10.3 Select Day & Open Booking Form
    function selectMargazhiDay(dayMeta) {
        selectedMargazhiDay = dayMeta.day;

        // Highlight selected day in grid
        document.querySelectorAll('.margazhi-day-card').forEach(el => {
            el.classList.remove('selected');
            if (parseInt(el.dataset.day, 10) === dayMeta.day) {
                el.classList.add('selected');
            }
        });

        // Populate Form
        const formWrapper = document.getElementById('booking-form-wrapper');
        const dayInput = document.getElementById('form-margazhi-day');
        const banner = document.getElementById('selected-day-banner');

        if (dayInput) dayInput.value = dayMeta.day;
        if (banner) {
            banner.innerHTML = `
                <div>🪔 தமிழ் தேதி: <strong>${dayMeta.tamilDate}</strong> | ஆங்கில தேதி: <strong>${dayMeta.formattedDate}</strong> (${dayMeta.tamilDay})</div>
                <div style="font-size: 0.95rem; margin-top: 5px; opacity: 0.95;">
                    அதிகாலை 4:30 - 6:00 மணி (உஷத்கால பூஜை) | உபயக் கட்டணம்: ₹500/- (ஒரு பூஜைக்கு அதிகபட்சம் 5 குடும்ப உறுப்பினர்கள் வரை)
                </div>
            `;
        }

        if (formWrapper) {
            formWrapper.classList.remove('hidden');
            formWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // 10.3.1 Dynamic Family Members Manager (Max 5 members)
    const familyContainer = document.getElementById('family-members-container');
    const addMemberBtn = document.getElementById('add-family-member-btn');
    const familyCountBadge = document.getElementById('family-count-badge');

    function updateFamilyMemberCount() {
        if (!familyContainer) return;
        const memberCards = familyContainer.querySelectorAll('.family-member-card');
        const count = memberCards.length;
        if (familyCountBadge) {
            familyCountBadge.innerText = `${count} / 5 நபர்கள்`;
        }
        if (addMemberBtn) {
            if (count >= 5) {
                addMemberBtn.disabled = true;
                addMemberBtn.innerText = 'அதிகபட்சம் 5 நபர்கள் சேர்க்கப்பட்டுவிட்டனர்';
            } else {
                addMemberBtn.disabled = false;
                addMemberBtn.innerText = '➕ கூடுதல் குடும்ப உறுப்பினரைச் சேர்க்க (அதிகபட்சம் 5 நபர்கள் வரை)';
            }
        }
    }

    if (addMemberBtn && familyContainer) {
        addMemberBtn.addEventListener('click', () => {
            const currentMembers = familyContainer.querySelectorAll('.family-member-card');
            if (currentMembers.length >= 5) return;

            const nextIndex = currentMembers.length + 1;
            const newCard = document.createElement('div');
            newCard.className = 'family-member-card';
            newCard.dataset.memberIndex = nextIndex;

            newCard.innerHTML = `
                <div class="member-card-title">
                    <span>குடும்ப உறுப்பினர் ${nextIndex}</span>
                    <button type="button" class="remove-member-btn" aria-label="உறுப்பினரை நீக்கு">🗑️ நீக்கு</button>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label>குடும்ப உறுப்பினர் பெயர் <span class="required">*</span></label>
                    <input type="text" class="member-name-input" placeholder="எ.கா: குடும்ப உறுப்பினர் பெயர்" required>
                </div>
            `;

            newCard.querySelector('.remove-member-btn').addEventListener('click', () => {
                newCard.remove();
                familyContainer.querySelectorAll('.family-member-card').forEach((card, idx) => {
                    card.dataset.memberIndex = idx + 1;
                    const titleSpan = card.querySelector('.member-card-title span');
                    if (idx === 0) {
                        titleSpan.innerHTML = 'குடும்ப உறுப்பினர் 1 (முதன்மை பக்தர்) <span class="required">*</span>';
                    } else {
                        titleSpan.innerText = `குடும்ப உறுப்பினர் ${idx + 1}`;
                    }
                });
                updateFamilyMemberCount();
            });

            familyContainer.appendChild(newCard);
            updateFamilyMemberCount();
        });
    }

    function resetFamilyMembers() {
        if (!familyContainer) return;
        const cards = familyContainer.querySelectorAll('.family-member-card');
        cards.forEach((c, idx) => {
            if (idx > 0) c.remove();
        });
        const firstInputs = cards[0]?.querySelectorAll('input');
        if (firstInputs) firstInputs.forEach(i => i.value = '');
        updateFamilyMemberCount();
    }

    // Close Form Button
    const closeFormBtn = document.getElementById('close-booking-form-btn');
    const cancelFormBtn = document.getElementById('cancel-booking-btn');
    // Screenshot upload compression & preview
    let currentPaymentScreenshot = '';
    const screenshotInput = document.getElementById('form-payment-screenshot');
    const screenshotPreviewContainer = document.getElementById('screenshot-preview-container');
    const screenshotPreviewImg = document.getElementById('screenshot-preview-img');
    const removeScreenshotBtn = document.getElementById('remove-screenshot-btn');

    if (screenshotInput) {
        screenshotInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('தயவுசெய்து சரியான படக் கோப்பைத் (Image file) தேர்ந்தெடுக்கவும்.');
                screenshotInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (loadEvt) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 800;

                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    currentPaymentScreenshot = canvas.toDataURL('image/jpeg', 0.75);
                    if (screenshotPreviewImg) screenshotPreviewImg.src = currentPaymentScreenshot;
                    if (screenshotPreviewContainer) screenshotPreviewContainer.classList.remove('hidden');
                };
                img.src = loadEvt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeScreenshotBtn) {
        removeScreenshotBtn.addEventListener('click', () => {
            currentPaymentScreenshot = '';
            if (screenshotInput) screenshotInput.value = '';
            if (screenshotPreviewContainer) screenshotPreviewContainer.classList.add('hidden');
            if (screenshotPreviewImg) screenshotPreviewImg.src = '';
        });
    }

    function hideBookingForm() {
        const formWrapper = document.getElementById('booking-form-wrapper');
        if (formWrapper) formWrapper.classList.add('hidden');
        selectedMargazhiDay = null;
        document.querySelectorAll('.margazhi-day-card').forEach(el => el.classList.remove('selected'));
        resetFamilyMembers();
        currentPaymentScreenshot = '';
        if (screenshotInput) screenshotInput.value = '';
        if (screenshotPreviewContainer) screenshotPreviewContainer.classList.add('hidden');
        if (screenshotPreviewImg) screenshotPreviewImg.src = '';
    }
    if (closeFormBtn) closeFormBtn.addEventListener('click', hideBookingForm);
    if (cancelFormBtn) cancelFormBtn.addEventListener('click', hideBookingForm);

    // Payment Radio Switcher
    const upiRadio = document.getElementById('pay-upi-radio');
    const offlineRadio = document.getElementById('pay-offline-radio');
    const upiDetailsCard = document.getElementById('upi-details-card');

    if (upiRadio && offlineRadio && upiDetailsCard) {
        upiRadio.addEventListener('change', () => {
            if (upiRadio.checked) upiDetailsCard.classList.remove('hidden');
        });
        offlineRadio.addEventListener('change', () => {
            if (offlineRadio.checked) upiDetailsCard.classList.add('hidden');
        });
    }

    // 10.4 Handle Booking Form Submit
    const bookingForm = document.getElementById('margazhi-booking-form');
    const formAlert = document.getElementById('booking-form-alert');
    const submitBtn = document.getElementById('submit-booking-btn');

    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formAlert.classList.add('hidden');
            formAlert.className = 'form-alert hidden';

            const dayEl = document.getElementById('form-margazhi-day');
            const day = dayEl ? parseInt(dayEl.value, 10) : null;

            const mobileEl = document.getElementById('form-mobile-number');
            const mobileNumber = mobileEl ? mobileEl.value.replace(/\D/g, '') : '';

            const addrEl = document.getElementById('form-address');
            const address = addrEl ? addrEl.value.trim() : '';

            const contribEl = document.getElementById('form-contribution');
            const contribution = contribEl ? (parseFloat(contribEl.value) || 500) : 500;

            const paymentRadio = document.querySelector('input[name="payment_method"]:checked');
            const paymentMethod = paymentRadio ? paymentRadio.value : 'UPI';

            const paymentRefEl = document.getElementById('form-payment-ref');
            const paymentRef = paymentRefEl ? paymentRefEl.value.trim() : '';

            // Collect Family Members (Max 5)
            const memberCards = familyContainer ? familyContainer.querySelectorAll('.family-member-card') : [];
            const familyMembers = [];
            memberCards.forEach((card, idx) => {
                const nameInp = card.querySelector('.member-name-input');
                const mName = nameInp ? nameInp.value.trim() : '';
                if (mName) {
                    familyMembers.push({
                        name: mName,
                        relationship: idx === 0 ? 'முதன்மை பக்தர்' : `குடும்ப உறுப்பினர் ${idx + 1}`
                    });
                }
            });

            // Client Validation
            if (!day || day < 1 || day > 30) {
                showAlert(formAlert, 'error', 'தயவுசெய்து நாள்காட்டியில் ஒரு நாளைத் தேர்ந்தெடுக்கவும்.');
                return;
            }

            if (familyMembers.length === 0 || !familyMembers[0].name) {
                showAlert(formAlert, 'error', 'குடும்ப உறுப்பினர் பெயரை உள்ளிடவும்.');
                return;
            }

            if (mobileNumber.length !== 10) {
                showAlert(formAlert, 'error', 'சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்.');
                return;
            }

            if (paymentMethod === 'UPI' && !currentPaymentScreenshot) {
                showAlert(formAlert, 'error', 'யுபிஐ வழி கட்டணம் செலுத்தியதற்கான திரைப்பதிவை (Payment Screenshot) தயவுசெய்து பதிவேற்றவும்.');
                return;
            }

            const primaryDevotee = familyMembers[0].name;

            submitBtn.disabled = true;
            submitBtn.innerText = 'பதிவு செய்யப்படுகிறது...';

            const payload = {
                margazhi_day: day,
                devotee_name: primaryDevotee,
                family_members: familyMembers,
                mobile_number: mobileNumber,
                address,
                contribution_amount: contribution,
                payment_method: paymentMethod,
                payment_reference: paymentRef,
                payment_screenshot: currentPaymentScreenshot
            };

            const dayMeta = MARGAZHI_DAYS.find(d => d.day === day);

            try {
                let bookingResponse = null;

                try {
                    const res = await fetch(`${API_BASE}/margazhi/book`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: AbortSignal.timeout(5000)
                    });

                    const data = await res.json();
                    if (!res.ok) {
                        showAlert(formAlert, 'error', data.message || 'முன்பதிவு செய்வதில் பிழை ஏற்பட்டது.');
                        submitBtn.disabled = false;
                        submitBtn.innerText = '🪔 முன்பதிவை உறுதி செய்';
                        return;
                    }
                    bookingResponse = data.booking;
                } catch (apiErr) {
                    // Fallback to client-side database
                    const existing = getLocalBookings().find(b => b.margazhi_day === day && b.booking_status !== 'CANCELLED');
                    if (existing) {
                        showAlert(formAlert, 'error', 'மன்னிக்கவும்! இந்த மார்கழி நாள் ஏற்கனவே முன்பதிவு செய்யப்பட்டுள்ளது.');
                        submitBtn.disabled = false;
                        submitBtn.innerText = '🪔 முன்பதிவை உறுதி செய்';
                        return;
                    }

                    const ref = generateBookingRef();
                    bookingResponse = {
                        id: 'LOC-' + Date.now(),
                        reference: ref,
                        booking_reference: ref,
                        margazhi_day: day,
                        margazhiDay: day,
                        tamil_date: dayMeta.tamilDate,
                        tamilDate: dayMeta.tamilDate,
                        pooja_date: dayMeta.date,
                        poojaDate: dayMeta.formattedDate,
                        tamilDay: dayMeta.tamilDay,
                        devotee_name: primaryDevotee,
                        devoteeName: primaryDevotee,
                        family_members: familyMembers,
                        familyMembers: familyMembers,
                        mobile_number: mobileNumber,
                        mobileNumber: mobileNumber,
                        address,
                        contribution_amount: contribution,
                        contributionAmount: contribution,
                        payment_method: paymentMethod,
                        paymentMethod: paymentMethod,
                        payment_reference: paymentRef,
                        payment_screenshot: currentPaymentScreenshot,
                        paymentScreenshot: currentPaymentScreenshot,
                        payment_status: 'PENDING',
                        paymentStatus: 'PENDING',
                        booking_status: 'PENDING',
                        bookingStatus: 'PENDING',
                        created_at: new Date().toISOString()
                    };

                    saveLocalBooking(bookingResponse);
                }

                // Show Success Modal
                showBookingSuccessModal(bookingResponse, dayMeta);
                bookingForm.reset();
                hideBookingForm();
                loadMargazhiCalendar();

            } catch (fatalErr) {
                showAlert(formAlert, 'error', 'முன்பதிவு சமர்ப்பிப்பில் எதிர்பாராத பிழை: ' + fatalErr.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = '🪔 முன்பதிவை உறுதி செய்';
            }
        });
    }

    function showAlert(el, type, msg) {
        if (!el) return;
        el.className = `form-alert ${type}`;
        el.innerText = msg;
        el.classList.remove('hidden');
    }

    // 10.5 Booking Success Modal
    function showBookingSuccessModal(booking, dayMeta) {
        const modal = document.getElementById('booking-success-modal');
        const details = document.getElementById('booking-success-details');
        if (!modal || !details) return;

        const ref = booking.reference || booking.booking_reference;
        const tamilDate = booking.tamilDate || booking.tamil_date || (dayMeta ? dayMeta.tamilDate : '');
        const poojaDate = booking.poojaDate || (dayMeta ? dayMeta.formattedDate : '');
        const tamilDay = booking.tamilDay || (dayMeta ? dayMeta.tamilDay : '');
        const name = booking.devoteeName || booking.devotee_name;
        const mobile = booking.mobileNumber || booking.mobile_number;
        const amount = booking.contributionAmount || booking.contribution_amount || 500;
        const payMethod = (booking.paymentMethod || booking.payment_method) === 'UPI' ? 'நேரடி யுபிஐ (UPI)' : 'கோயிலில் நேரடி கட்டணம்';
        const members = (booking.familyMembers || booking.family_members || []).length > 0
            ? (booking.familyMembers || booking.family_members)
            : [{ name: name }];

        const membersListHtml = members.map((m, idx) => `
            <li style="margin-bottom: 4px;">
                <strong>${m.name}</strong>
            </li>
        `).join('');

        details.innerHTML = `
            <div class="receipt-box" id="printable-receipt">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h4 style="color: var(--primary-maroon); font-size: 1.25rem;">ஸ்ரீ நாகதேவி அம்மன் திருக்கோயில்</h4>
                    <p style="font-size: 0.9rem; color: var(--copper);">சிங்கிரிபாளையம், ஈரோடு மாவட்டம் | மார்கழி பூஜை முன்பதிவு ரசீது</p>
                    <div class="receipt-ref-code">${ref}</div>
                </div>

                <table class="receipt-table">
                    <tr>
                        <td class="label">தமிழ் தேதி:</td>
                        <td><strong>${tamilDate}</strong></td>
                    </tr>
                    <tr>
                        <td class="label">ஆங்கில தேதி:</td>
                        <td><strong>${poojaDate}</strong> (${tamilDay})</td>
                    </tr>
                    <tr>
                        <td class="label">பூஜை நேரம்:</td>
                        <td>அதிகாலை 4:30 - 6:00 மணி (உஷத்கால பூஜை)</td>
                    </tr>
                    <tr>
                        <td class="label">அர்ச்சனை உறுப்பினர்கள் (${members.length} நபர்கள்):</td>
                        <td>
                            <ol style="margin: 0; padding-left: 18px;">
                                ${membersListHtml}
                            </ol>
                        </td>
                    </tr>
                    <tr>
                        <td class="label">தொடர்பு கைபேசி:</td>
                        <td>${mobile}</td>
                    </tr>
                    <tr>
                        <td class="label">பூஜை கட்டணம்:</td>
                        <td><strong>₹${amount}</strong> (${payMethod})</td>
                    </tr>
                    <tr>
                        <td class="label">முன்பதிவு நிலை:</td>
                        <td><span class="status-pill pending">நிலுவையில் உள்ளது (சரிபார்க்கப்பட வேண்டும்)</span></td>
                    </tr>
                </table>

                ${(booking.paymentMethod || booking.payment_method) === 'UPI' ? `
                    <div style="margin-top: 15px; padding: 12px; background: #FFF; border-radius: 8px; border: 1px dashed var(--accent-gold); text-align: center;">
                        <p style="font-size: 0.88rem; color: var(--primary-maroon); margin-bottom: 6px;">
                            <strong>யுபிஐ வழி கட்டணம் ₹${amount} செலுத்த:</strong> naganaveen1414@okaxis
                        </p>
                        <p style="font-size: 0.82rem; color: #666;">காணிக்கை செலுத்திய பின் நிர்வாகி சரிபார்த்து முன்பதிவை உறுதி செய்வார்.</p>
                    </div>
                ` : `
                    <div style="margin-top: 15px; padding: 12px; background: #FFF; border-radius: 8px; border: 1px dashed var(--border-gold); text-align: center;">
                        <p style="font-size: 0.88rem; color: var(--primary-maroon);">
                            நேரடி கட்டணத்தை திருக்கோயில் அலுவலகத்தில் சமர்ப்பித்து முன்பதிவை உறுதிசெய்து கொள்ளவும்.
                        </p>
                    </div>
                `}

                <p style="text-align: center; font-size: 0.82rem; color: #777; margin-top: 15px;">
                    தொடர்புக்கு: 79046 89991 / 97154 81878 | ஓம் ஸ்ரீ நாகதேவி அம்மன் துணை
                </p>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    // Modal Close handlers
    const closeSuccessBtn = document.getElementById('close-success-modal-btn');
    const dismissSuccessBtn = document.getElementById('dismiss-success-modal-btn');
    const printReceiptBtn = document.getElementById('print-booking-btn');

    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', () => document.getElementById('booking-success-modal').classList.add('hidden'));
    if (dismissSuccessBtn) dismissSuccessBtn.addEventListener('click', () => document.getElementById('booking-success-modal').classList.add('hidden'));
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // 10.6 View Switcher (Calendar vs Lookup)
    const tabCalendar = document.getElementById('tab-btn-calendar');
    const tabLookup = document.getElementById('tab-btn-lookup');
    const calendarView = document.getElementById('calendar-view');
    const lookupView = document.getElementById('lookup-view');

    if (tabCalendar && tabLookup && calendarView && lookupView) {
        tabCalendar.addEventListener('click', () => {
            tabCalendar.classList.add('active');
            tabLookup.classList.remove('active');
            calendarView.classList.remove('hidden');
            lookupView.classList.add('hidden');
            hideBookingForm();
        });

        tabLookup.addEventListener('click', () => {
            tabLookup.classList.add('active');
            tabCalendar.classList.remove('active');
            lookupView.classList.remove('hidden');
            calendarView.classList.add('hidden');
            hideBookingForm();
        });
    }

    // 10.7 Booking Status Lookup
    const lookupForm = document.getElementById('booking-lookup-form');
    const lookupInput = document.getElementById('lookup-input');
    const lookupResultBox = document.getElementById('lookup-result-box');

    if (lookupForm && lookupInput && lookupResultBox) {
        lookupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = lookupInput.value.trim();
            if (!query) return;

            lookupResultBox.innerHTML = '<p style="text-align:center;">தேடப்படுகிறது...</p>';
            lookupResultBox.classList.remove('hidden');

            try {
                let bookings = [];

                try {
                    const res = await fetch(`${API_BASE}/margazhi/booking/${encodeURIComponent(query)}`, {
                        signal: AbortSignal.timeout(3500)
                    });
                    if (res.ok) {
                        const data = await res.json();
                        bookings = data.bookings || [];
                    }
                } catch (netErr) {
                    const cleanQ = query.toLowerCase();
                    bookings = getLocalBookings().filter(b => 
                        (b.booking_reference && b.booking_reference.toLowerCase() === cleanQ) ||
                        (b.mobile_number && b.mobile_number === query)
                    );
                }

                if (bookings.length === 0) {
                    lookupResultBox.innerHTML = `
                        <div class="form-alert error" style="margin-top: 10px;">
                            குறிப்பிட்ட முன்பதிவு எண் அல்லது கைபேசி எண்ணிற்கு எவ்வித தகவலும் காணப்படவில்லை.
                        </div>
                    `;
                    return;
                }

                lookupResultBox.innerHTML = bookings.map(b => {
                    const statusClass = b.booking_status === 'CONFIRMED' || b.bookingStatus === 'CONFIRMED' ? 'available' : (b.booking_status === 'CANCELLED' || b.bookingStatus === 'CANCELLED' ? 'booked' : 'pending');
                    const statusText = b.booking_status === 'CONFIRMED' || b.bookingStatus === 'CONFIRMED' ? 'உறுதி செய்யப்பட்டது' : (b.booking_status === 'CANCELLED' || b.bookingStatus === 'CANCELLED' ? 'ரத்து செய்யப்பட்டது' : 'சரிபார்ப்பு நிலுவையில்');
                    const payStatus = b.payment_status === 'VERIFIED' || b.paymentStatus === 'VERIFIED' ? 'சரிபார்க்கப்பட்டது' : 'நிலுவையில்';

                    const dayMeta = MARGAZHI_DAYS.find(d => d.day === (b.margazhi_day || b.margazhiDay));
                    const tDate = dayMeta ? dayMeta.tamilDate : (b.tamil_date || b.tamilDate || '');
                    const eDate = dayMeta ? `${dayMeta.formattedDate} (${dayMeta.tamilDay})` : (b.pooja_date || b.poojaDate || '');

                    return `
                        <div class="lookup-result-item">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <h4>🪔 ${tDate} | ஆங்கில தேதி: ${eDate}</h4>
                                <span class="status-pill ${statusClass}">${statusText}</span>
                            </div>
                            <p><strong>முன்பதிவு எண்:</strong> <code>${b.booking_reference || b.reference}</code></p>
                            <p><strong>பக்தர் பெயர்:</strong> ${b.devotee_name || b.devoteeName}</p>
                            <p><strong>கட்டண நிலை:</strong> ${payStatus} (${b.payment_method || b.paymentMethod})</p>
                        </div>
                    `;
                }).join('');

            } catch (err) {
                lookupResultBox.innerHTML = `<div class="form-alert error">தேடுவதில் பிழை ஏற்பட்டது: ${err.message}</div>`;
            }
        });
    }

    // --------------------------------------------------------
    // 11. ADMIN DASHBOARD & AUTHENTICATION
    // --------------------------------------------------------
    const adminNavTrigger = document.getElementById('admin-nav-trigger');
    const adminFooterTrigger = document.getElementById('admin-footer-trigger');
    const adminModal = document.getElementById('admin-modal');
    const closeAdminModalBtn = document.getElementById('close-admin-modal-btn');
    const adminLoginView = document.getElementById('admin-login-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginAlert = document.getElementById('admin-login-alert');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminRefreshBtn = document.getElementById('admin-refresh-btn');
    const adminExportBtn = document.getElementById('admin-export-btn');
    const adminStatusFilter = document.getElementById('admin-status-filter');
    const adminSearchInput = document.getElementById('admin-search-input');
    const toggleAuditBtn = document.getElementById('toggle-audit-log-btn');
    const auditContainer = document.getElementById('admin-audit-log-container');

    let adminBookingsCache = [];

    function openAdminModal() {
        if (!adminModal) return;
        adminModal.classList.remove('hidden');

        const token = sessionStorage.getItem('nagadevi_admin_token');
        if (token) {
            showAdminDashboard();
        } else {
            showAdminLogin();
        }
    }

    if (adminNavTrigger) adminNavTrigger.addEventListener('click', openAdminModal);
    if (adminFooterTrigger) adminFooterTrigger.addEventListener('click', openAdminModal);
    if (closeAdminModalBtn) closeAdminModalBtn.addEventListener('click', () => adminModal.classList.add('hidden'));

    function showAdminLogin() {
        adminLoginView.classList.remove('hidden');
        adminDashboardView.classList.add('hidden');
    }

    function showAdminDashboard() {
        adminLoginView.classList.add('hidden');
        adminDashboardView.classList.remove('hidden');
        loadAdminStats();
        loadAdminBookings();
    }

    // Admin Login Handler
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-user-input').value.trim();
            const password = document.getElementById('admin-pass-input').value;

            adminLoginAlert.classList.add('hidden');

            try {
                let success = false;
                let token = null;

                try {
                    const res = await fetch(`${API_BASE}/admin/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password }),
                        signal: AbortSignal.timeout(4000)
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        success = true;
                        token = data.token;
                    } else {
                        showAlert(adminLoginAlert, 'error', data.message || 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.');
                        return;
                    }
                } catch (netErr) {
                    // Fallback local admin check
                    if (username === 'admin' && (password === 'nagadevi2027' || password === 'admin')) {
                        success = true;
                        token = 'local_admin_token_' + Date.now();
                    } else {
                        showAlert(adminLoginAlert, 'error', 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்.');
                        return;
                    }
                }

                if (success && token) {
                    sessionStorage.setItem('nagadevi_admin_token', token);
                    sessionStorage.setItem('nagadevi_admin_user', username);
                    showAdminDashboard();
                }

            } catch (err) {
                showAlert(adminLoginAlert, 'error', 'உள்நுழைவில் பிழை: ' + err.message);
            }
        });
    }

    // Admin Logout
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('nagadevi_admin_token');
            sessionStorage.removeItem('nagadevi_admin_user');
            showAdminLogin();
        });
    }

    // 11.1 Load Admin Stats
    async function loadAdminStats() {
        const token = sessionStorage.getItem('nagadevi_admin_token');
        try {
            const res = await fetch(`${API_BASE}/admin/stats?_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store',
                signal: AbortSignal.timeout(4000)
            });
            if (res.status === 401) {
                sessionStorage.removeItem('nagadevi_admin_token');
                showAdminLogin();
                return;
            }
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.stats) {
                    renderStats(data.stats);
                    return;
                }
            }
        } catch (e) {
            // Local fallback
        }

        const local = getLocalBookings();
        const active = local.filter(b => b.booking_status !== 'CANCELLED');
        const confirmed = active.filter(b => b.booking_status === 'CONFIRMED' || b.bookingStatus === 'CONFIRMED').length;
        const pending = active.filter(b => b.booking_status === 'PENDING' || b.bookingStatus === 'PENDING').length;
        const available = Math.max(0, 30 - active.length);
        const totalContribution = active.reduce((sum, b) => (b.payment_status === 'VERIFIED' || b.paymentStatus === 'VERIFIED' ? sum + (parseFloat(b.contribution_amount || b.contributionAmount) || 0) : sum), 0);

        renderStats({
            totalDays: 30,
            confirmedCount: confirmed,
            pendingCount: pending,
            availableCount: available,
            totalContribution
        });
    }

    function renderStats(stats) {
        document.getElementById('stat-total-days').innerText = stats.totalDays || 30;
        document.getElementById('stat-confirmed-count').innerText = stats.confirmedCount || 0;
        document.getElementById('stat-pending-count').innerText = stats.pendingCount || 0;
        document.getElementById('stat-available-count').innerText = stats.availableCount || 0;
        document.getElementById('stat-total-contribution').innerText = '₹' + (stats.totalContribution || 0);
    }

    // 11.2 Load Admin Bookings
    async function loadAdminBookings() {
        const token = sessionStorage.getItem('nagadevi_admin_token');
        const tbody = document.getElementById('admin-bookings-tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">முன்பதிவுகள் ஏற்றப்படுகின்றன...</td></tr>';

        try {
            const res = await fetch(`${API_BASE}/admin/bookings?_t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store',
                signal: AbortSignal.timeout(4000)
            });
            if (res.status === 401) {
                sessionStorage.removeItem('nagadevi_admin_token');
                alert('நிர்வாக அமர்வு காலாவதியானது. தயவுசெய்து மீண்டும் உள்நுழையவும்.');
                showAdminLogin();
                return;
            }
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.bookings) {
                    adminBookingsCache = data.bookings;
                    renderAdminTable();
                    return;
                }
            }
        } catch (e) {
            // Local fallback
        }

        adminBookingsCache = getLocalBookings();
        renderAdminTable();
    }

    // 11.3 Render Admin Table
    function renderAdminTable() {
        const tbody = document.getElementById('admin-bookings-tbody');
        if (!tbody) return;

        const statusFilter = adminStatusFilter ? adminStatusFilter.value : 'ALL';
        const searchVal = adminSearchInput ? adminSearchInput.value.trim().toLowerCase() : '';

        const filtered = adminBookingsCache.filter(b => {
            const status = b.booking_status || b.bookingStatus;
            if (statusFilter !== 'ALL' && status !== statusFilter) return false;

            if (searchVal) {
                const name = (b.devotee_name || b.devoteeName || '').toLowerCase();
                const mobile = (b.mobile_number || b.mobileNumber || '').toLowerCase();
                const ref = (b.booking_reference || b.reference || '').toLowerCase();
                if (!name.includes(searchVal) && !mobile.includes(searchVal) && !ref.includes(searchVal)) {
                    return false;
                }
            }
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding: 25px; color: #777;">முன்பதிவுகள் எதுவும் காணப்படவில்லை.</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(b => {
            const dayMeta = MARGAZHI_DAYS.find(d => d.day === (b.margazhi_day || b.margazhiDay));
            const dayLabel = dayMeta ? `${dayMeta.tamilDate} (${dayMeta.formattedDate})` : `நாள் ${b.margazhi_day}`;
            const ref = b.booking_reference || b.reference;
            const name = b.devotee_name || b.devoteeName;
            const mobile = b.mobile_number || b.mobileNumber;
            const amount = b.contribution_amount || b.contributionAmount || 500;
            const method = b.payment_method || b.paymentMethod;
            const payStatus = b.payment_status || b.paymentStatus;
            const bookStatus = b.booking_status || b.bookingStatus;
            const id = b.id;
            const members = b.family_members || b.familyMembers || [];
            const memberCountBadge = members.length > 1 ? ` <span class="admin-badge" style="font-size: 0.72rem;">+${members.length - 1} நபர்கள்</span>` : '';

            const payPill = payStatus === 'VERIFIED' ? '<span class="status-pill available">சரிபார்க்கப்பட்டது</span>' : '<span class="status-pill pending">நிலுவை</span>';
            const bookPill = bookStatus === 'CONFIRMED' ? '<span class="status-pill available">உறுதி செய்யப்பட்டது</span>' : (bookStatus === 'CANCELLED' ? '<span class="status-pill booked">ரத்து செய்யப்பட்டது</span>' : '<span class="status-pill pending">நிலுவையில்</span>');

            const hasScreenshot = Boolean(b.payment_screenshot || b.paymentScreenshot);
            const screenshotBtn = hasScreenshot ? `<button type="button" class="table-action-btn screenshot" onclick="window.viewScreenshot('${id}')">📸 ரசீது</button>` : '';

            return `
                <tr>
                    <td><strong>${dayLabel}</strong></td>
                    <td><code>${ref}</code></td>
                    <td>${name}${memberCountBadge}</td>
                    <td><a href="tel:${mobile}" style="color: var(--primary-maroon); font-weight: bold;">${mobile}</a></td>
                    <td>₹${amount} <small>(${method})</small></td>
                    <td>${payPill}</td>
                    <td>${bookPill}</td>
                    <td>
                        <div class="action-btn-group">
                            ${bookStatus !== 'CONFIRMED' ? `<button type="button" class="table-action-btn confirm" onclick="window.updateBookingStatus('${id}', 'CONFIRMED')">உறுதி</button>` : ''}
                            ${payStatus !== 'VERIFIED' ? `<button type="button" class="table-action-btn verify" onclick="window.verifyBookingPayment('${id}')">கட்டணம்</button>` : ''}
                            <button type="button" class="table-action-btn change-date" onclick="window.changeBookingDate('${id}')">📅 தேதி</button>
                            ${screenshotBtn}
                            <button type="button" class="table-action-btn details" onclick="window.viewBookingDetails('${id}')">விவரம்</button>
                            <button type="button" class="table-action-btn remove-booking" onclick="window.removeBooking('${id}')">🗑️ நீக்கு</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    if (adminStatusFilter) adminStatusFilter.addEventListener('change', renderAdminTable);
    if (adminSearchInput) adminSearchInput.addEventListener('input', renderAdminTable);
    if (adminRefreshBtn) adminRefreshBtn.addEventListener('click', () => {
        loadAdminStats();
        loadAdminBookings();
    });

    // 11.4 Global actions for table buttons
    window.updateBookingStatus = async function(id, status) {
        const tamilStatus = status === 'CONFIRMED' ? 'உறுதி செய்ய' : 'ரத்து செய்ய';
        if (!confirm(`இந்த முன்பதிவை ${tamilStatus} விரும்புகிறீர்களா?`)) return;

        const token = sessionStorage.getItem('nagadevi_admin_token');
        try {
            const res = await fetch(`${API_BASE}/admin/booking/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                alert(`முன்பதிவு நிலை வெற்றிகரமாக மாற்றப்பட்டது!`);
            } else {
                updateLocalBooking(id, { booking_status: status });
                alert(`முன்பதிவு நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது.`);
            }
        } catch (e) {
            updateLocalBooking(id, { booking_status: status });
            alert(`முன்பதிவு நிலை வெற்றிகரமாக புதுப்பிக்கப்பட்டது.`);
        }

        loadAdminStats();
        loadAdminBookings();
        loadMargazhiCalendar();
    };

    window.verifyBookingPayment = async function(id) {
        if (!confirm('இந்த முன்பதிவிற்கான காணிக்கை/கட்டணத்தை சரிபார்த்து உறுதி செய்ய விரும்புகிறீர்களா?')) return;

        const token = sessionStorage.getItem('nagadevi_admin_token');
        try {
            const res = await fetch(`${API_BASE}/admin/booking/${id}/payment`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ payment_status: 'VERIFIED' })
            });

            if (res.ok) {
                alert('கட்டணம் வெற்றிகரமாக சரிபார்க்கப்பட்டு முன்பதிவு உறுதி செய்யப்பட்டது!');
            } else {
                updateLocalBooking(id, { payment_status: 'VERIFIED', booking_status: 'CONFIRMED' });
                alert('கட்டணம் சரிபார்க்கப்பட்டது.');
            }
        } catch (e) {
            updateLocalBooking(id, { payment_status: 'VERIFIED', booking_status: 'CONFIRMED' });
            alert('கட்டணம் சரிபார்க்கப்பட்டது.');
        }

        loadAdminStats();
        loadAdminBookings();
        loadMargazhiCalendar();
    };

    // 11.4.1 Admin Change Booking Date
    window.changeBookingDate = function(id) {
        const b = adminBookingsCache.find(item => item.id == id || item.booking_reference == id);
        if (!b) return;

        const modal = document.getElementById('admin-change-date-modal');
        const idInput = document.getElementById('change-date-booking-id');
        const currentInfo = document.getElementById('change-date-current-info');
        const select = document.getElementById('change-date-select');
        const alertBox = document.getElementById('change-date-alert');
        if (!modal || !idInput || !select) return;

        alertBox.classList.add('hidden');
        idInput.value = id;

        const dayMeta = MARGAZHI_DAYS.find(d => d.day === (b.margazhi_day || b.margazhiDay));
        const currentTamilDate = dayMeta ? dayMeta.tamilDate : `மார்கழி நாள் ${b.margazhi_day}`;
        currentInfo.innerText = `தற்போதைய நாள்: ${currentTamilDate} | பக்தர்: ${b.devotee_name || b.devoteeName}`;

        // Find available days (available days from current calendar data + current day itself)
        const bookedDays = new Set(
            adminBookingsCache
                .filter(item => (item.booking_status !== 'CANCELLED' && String(item.id) !== String(id) && item.booking_reference !== id))
                .map(item => item.margazhi_day || item.margazhiDay)
        );

        const availableDays = MARGAZHI_DAYS.filter(d => !bookedDays.has(d.day));

        select.innerHTML = availableDays.map(d => `
            <option value="${d.day}" ${d.day === (b.margazhi_day || b.margazhiDay) ? 'selected' : ''}>
                ${d.tamilDate} - ${d.formattedDate} (${d.tamilDay})
            </option>
        `).join('');

        modal.classList.remove('hidden');
    };

    const changeDateForm = document.getElementById('admin-change-date-form');
    if (changeDateForm) {
        changeDateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('change-date-booking-id').value;
            const newDay = parseInt(document.getElementById('change-date-select').value, 10);
            const alertBox = document.getElementById('change-date-alert');
            const token = sessionStorage.getItem('nagadevi_admin_token');

            try {
                const res = await fetch(`${API_BASE}/admin/booking/${id}/change-date`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ new_margazhi_day: newDay })
                });

                const data = await res.json();
                if (!res.ok) {
                    alertBox.className = 'form-alert error';
                    alertBox.innerText = data.message || 'தேதி மாற்றத்தில் பிழை ஏற்பட்டது.';
                    alertBox.classList.remove('hidden');
                    return;
                }

                alert(data.message || 'பூஜை தேதி வெற்றிகரமாக மாற்றப்பட்டது!');
            } catch (err) {
                // Local fallback
                const dayMeta = MARGAZHI_DAYS.find(d => d.day === newDay);
                updateLocalBooking(id, {
                    margazhi_day: newDay,
                    margazhiDay: newDay,
                    pooja_date: dayMeta.date,
                    poojaDate: dayMeta.formattedDate,
                    tamil_date: dayMeta.tamilDate,
                    tamilDate: dayMeta.tamilDate,
                    tamilDay: dayMeta.tamilDay
                });
                alert('பூஜை தேதி வெற்றிகரமாக மாற்றப்பட்டது!');
            }

            document.getElementById('admin-change-date-modal').classList.add('hidden');
            loadAdminStats();
            loadAdminBookings();
            loadMargazhiCalendar();
        });
    }

    const closeChangeDateBtn = document.getElementById('close-change-date-modal-btn');
    const cancelChangeDateBtn = document.getElementById('cancel-change-date-btn');
    if (closeChangeDateBtn) closeChangeDateBtn.addEventListener('click', () => {
        document.getElementById('admin-change-date-modal').classList.add('hidden');
    });
    if (cancelChangeDateBtn) cancelChangeDateBtn.addEventListener('click', () => {
        document.getElementById('admin-change-date-modal').classList.add('hidden');
    });

    // 11.4.2 Admin Remove / Cancel Booking
    window.removeBooking = async function(id) {
        if (!confirm('இந்த முன்பதிவை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? இதனால் இந்த நாள் மீண்டும் பொது முன்பதிவுக்குக் கிடைக்கும்.')) return;

        const token = sessionStorage.getItem('nagadevi_admin_token');
        try {
            const res = await fetch(`${API_BASE}/admin/booking/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'முன்பதிவு வெற்றிகரமாக நீக்கப்பட்டது.');
            } else {
                updateLocalBooking(id, { booking_status: 'CANCELLED' });
                alert('முன்பதிவு வெற்றிகரமாக நீக்கப்பட்டது.');
            }
        } catch (e) {
            updateLocalBooking(id, { booking_status: 'CANCELLED' });
            alert('முன்பதிவு வெற்றிகரமாக நீக்கப்பட்டது.');
        }

        loadAdminStats();
        loadAdminBookings();
        loadMargazhiCalendar();
    };

    // 11.4.3 Admin View Payment Screenshot
    window.viewScreenshot = function(id) {
        const b = adminBookingsCache.find(item => item.id == id || item.booking_reference == id);
        if (!b) return;

        const screenshot = b.payment_screenshot || b.paymentScreenshot;
        if (!screenshot) {
            alert('இந்த முன்பதிவிற்கு ரசீது திரைப்பதிவு பதிவேற்றப்படவில்லை.');
            return;
        }

        const modal = document.getElementById('admin-screenshot-modal');
        const img = document.getElementById('admin-screenshot-view-img');
        const info = document.getElementById('screenshot-modal-devotee-info');
        if (!modal || !img) return;

        const dayMeta = MARGAZHI_DAYS.find(d => d.day === (b.margazhi_day || b.margazhiDay));
        info.innerText = `பக்தர்: ${b.devotee_name || b.devoteeName} | ${dayMeta ? dayMeta.tamilDate : ''} | முன்பதிவு: ${b.booking_reference || b.reference}`;
        img.src = screenshot;

        modal.classList.remove('hidden');
    };

    const closeScreenshotBtn = document.getElementById('close-screenshot-modal-btn');
    const dismissScreenshotBtn = document.getElementById('dismiss-screenshot-modal-btn');
    if (closeScreenshotBtn) closeScreenshotBtn.addEventListener('click', () => {
        document.getElementById('admin-screenshot-modal').classList.add('hidden');
    });
    if (dismissScreenshotBtn) dismissScreenshotBtn.addEventListener('click', () => {
        document.getElementById('admin-screenshot-modal').classList.add('hidden');
    });

    // 11.4.4 Admin Manual Booking Modal Setup
    const addManualBtn = document.getElementById('admin-add-manual-btn');
    const manualModal = document.getElementById('admin-manual-modal');
    const manualForm = document.getElementById('admin-manual-form');
    const manualDaySelect = document.getElementById('manual-margazhi-day');
    const manualFamilyContainer = document.getElementById('manual-family-container');
    const manualAddMemberBtn = document.getElementById('manual-add-member-btn');
    const manualCountBadge = document.getElementById('manual-family-count-badge');
    const closeManualBtn = document.getElementById('close-manual-modal-btn');
    const cancelManualBtn = document.getElementById('cancel-manual-btn');
    const manualAlert = document.getElementById('manual-form-alert');

    function updateManualFamilyCount() {
        if (!manualFamilyContainer || !manualCountBadge) return;
        const count = manualFamilyContainer.querySelectorAll('.family-member-card').length;
        manualCountBadge.innerText = `${count} / 5 நபர்கள்`;
        if (manualAddMemberBtn) {
            manualAddMemberBtn.disabled = count >= 5;
        }
    }

    if (manualAddMemberBtn && manualFamilyContainer) {
        manualAddMemberBtn.addEventListener('click', () => {
            const currentMembers = manualFamilyContainer.querySelectorAll('.family-member-card');
            if (currentMembers.length >= 5) return;

            const nextIndex = currentMembers.length + 1;
            const newCard = document.createElement('div');
            newCard.className = 'family-member-card';
            newCard.innerHTML = `
                <div class="member-card-title">
                    <span>குடும்ப உறுப்பினர் ${nextIndex}</span>
                    <button type="button" class="remove-member-btn" aria-label="உறுப்பினரை நீக்கு">🗑️ நீக்கு</button>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label>குடும்ப உறுப்பினர் பெயர் <span class="required">*</span></label>
                    <input type="text" class="manual-member-name-input" placeholder="எ.கா: உறுப்பினர் பெயர்" required>
                </div>
            `;

            newCard.querySelector('.remove-member-btn').addEventListener('click', () => {
                newCard.remove();
                manualFamilyContainer.querySelectorAll('.family-member-card').forEach((card, idx) => {
                    const titleSpan = card.querySelector('.member-card-title span');
                    if (idx === 0) {
                        titleSpan.innerHTML = 'குடும்ப உறுப்பினர் 1 (முதன்மை பக்தர்) <span class="required">*</span>';
                    } else {
                        titleSpan.innerText = `குடும்ப உறுப்பினர் ${idx + 1}`;
                    }
                });
                updateManualFamilyCount();
            });

            manualFamilyContainer.appendChild(newCard);
            updateManualFamilyCount();
        });
    }

    if (addManualBtn && manualModal && manualDaySelect) {
        addManualBtn.addEventListener('click', () => {
            manualAlert.classList.add('hidden');
            manualForm.reset();

            // Populate available days
            const bookedDays = new Set(
                adminBookingsCache
                    .filter(item => item.booking_status !== 'CANCELLED')
                    .map(item => item.margazhi_day || item.margazhiDay)
            );

            const availableDays = MARGAZHI_DAYS.filter(d => !bookedDays.has(d.day));
            if (availableDays.length === 0) {
                alert('அனைத்து 30 மார்கழி நாட்களும் முன்பதிவு செய்யப்பட்டுள்ளன!');
                return;
            }

            manualDaySelect.innerHTML = availableDays.map(d => `
                <option value="${d.day}">${d.tamilDate} - ${d.formattedDate} (${d.tamilDay})</option>
            `).join('');

            // Reset members to 1
            const extraCards = manualFamilyContainer.querySelectorAll('.family-member-card');
            extraCards.forEach((c, idx) => { if (idx > 0) c.remove(); });
            const firstInp = manualFamilyContainer.querySelector('.manual-member-name-input');
            if (firstInp) firstInp.value = '';
            updateManualFamilyCount();

            manualModal.classList.remove('hidden');
        });
    }

    if (closeManualBtn) closeManualBtn.addEventListener('click', () => {
        if (manualModal) manualModal.classList.add('hidden');
    });
    if (cancelManualBtn) cancelManualBtn.addEventListener('click', () => {
        if (manualModal) manualModal.classList.add('hidden');
    });

    if (manualForm) {
        manualForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            manualAlert.classList.add('hidden');

            const day = parseInt(manualDaySelect.value, 10);
            const mobile = document.getElementById('manual-mobile').value.replace(/\D/g, '');
            const address = document.getElementById('manual-address').value.trim();
            const payMethod = document.getElementById('manual-pay-method').value;
            const payStatus = document.getElementById('manual-pay-status').value;
            const bookStatus = document.getElementById('manual-book-status').value;
            const notes = document.getElementById('manual-notes').value.trim();

            const memberInps = manualFamilyContainer.querySelectorAll('.manual-member-name-input');
            const familyMembers = [];
            memberInps.forEach((inp, idx) => {
                const val = inp.value.trim();
                if (val) {
                    familyMembers.push({
                        name: val,
                        relationship: idx === 0 ? 'முதன்மை பக்தர்' : `குடும்ப உறுப்பினர் ${idx + 1}`
                    });
                }
            });

            if (!day || day < 1 || day > 30) {
                manualAlert.className = 'form-alert error';
                manualAlert.innerText = 'தயவுசெய்து மார்கழி நாளைத் தேர்ந்தெடுக்கவும்.';
                manualAlert.classList.remove('hidden');
                return;
            }

            if (familyMembers.length === 0 || !familyMembers[0].name) {
                manualAlert.className = 'form-alert error';
                manualAlert.innerText = 'முதன்மை பக்தர் பெயரை உள்ளிடவும்.';
                manualAlert.classList.remove('hidden');
                return;
            }

            if (mobile.length !== 10) {
                manualAlert.className = 'form-alert error';
                manualAlert.innerText = 'சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்.';
                manualAlert.classList.remove('hidden');
                return;
            }

            const payload = {
                margazhi_day: day,
                devotee_name: familyMembers[0].name,
                family_members: familyMembers,
                mobile_number: mobile,
                address,
                contribution_amount: 500,
                payment_method: payMethod,
                payment_status: payStatus,
                booking_status: bookStatus,
                payment_reference: notes || 'நிர்வாக நேரடி முன்பதிவு',
                notes
            };

            const token = sessionStorage.getItem('nagadevi_admin_token');
            const submitBtn = document.getElementById('manual-submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerText = 'சேர்க்கப்படுகிறது...';

            let savedBooking = null;

            try {
                const res = await fetch(`${API_BASE}/admin/bookings/manual`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!res.ok) {
                    if (res.status === 401) {
                        sessionStorage.removeItem('nagadevi_admin_token');
                        alert('நிர்வாக அமர்வு காலாவதியானது. தயவுசெய்து மீண்டும் உள்நுழையவும்.');
                        manualModal.classList.add('hidden');
                        showAdminLogin();
                        return;
                    }
                    manualAlert.className = 'form-alert error';
                    manualAlert.innerText = data.message || 'நேரடி முன்பதிவு சேர்க்க முடியவில்லை.';
                    manualAlert.classList.remove('hidden');
                    submitBtn.disabled = false;
                    submitBtn.innerText = '🪔 முன்பதிவை உறுதி செய்து சேர்';
                    return;
                }

                savedBooking = data.booking;
                alert(data.message || 'நேரடி முன்பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது!');
            } catch (err) {
                // Local fallback
                const dayMeta = MARGAZHI_DAYS.find(d => d.day === day);
                const ref = generateBookingRef();
                savedBooking = {
                    id: 'LOC-M-' + Date.now(),
                    reference: ref,
                    booking_reference: ref,
                    margazhi_day: day,
                    margazhiDay: day,
                    tamil_date: dayMeta.tamilDate,
                    tamilDate: dayMeta.tamilDate,
                    pooja_date: dayMeta.date,
                    poojaDate: dayMeta.formattedDate,
                    tamilDay: dayMeta.tamilDay,
                    devotee_name: familyMembers[0].name,
                    devoteeName: familyMembers[0].name,
                    family_members: familyMembers,
                    familyMembers: familyMembers,
                    mobile_number: mobile,
                    mobileNumber: mobile,
                    address,
                    contribution_amount: 500,
                    contributionAmount: 500,
                    payment_method: payMethod,
                    paymentMethod: payMethod,
                    payment_status: payStatus,
                    paymentStatus: payStatus,
                    booking_status: bookStatus,
                    bookingStatus: bookStatus,
                    payment_reference: notes || 'நிர்வாக நேரடி முன்பதிவு',
                    created_at: new Date().toISOString()
                };
                alert('நேரடி முன்பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது!');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = '🪔 முன்பதிவை உறுதி செய்து சேர்';
            }

            if (savedBooking) {
                saveLocalBooking(savedBooking);
            }

            manualModal.classList.add('hidden');
            await loadAdminStats();
            await loadAdminBookings();
            await loadMargazhiCalendar();
        });
    }

    window.viewBookingDetails = function(id) {
        const b = adminBookingsCache.find(item => item.id == id || item.booking_reference == id);
        if (!b) return;

        const dayMeta = MARGAZHI_DAYS.find(d => d.day === (b.margazhi_day || b.margazhiDay));
        const members = b.family_members || b.familyMembers || [];
        const membersList = members.length > 0 
            ? members.map((m, idx) => `  ${idx + 1}. ${m.name}`).join('\n')
            : (b.devotee_name || b.devoteeName);

        const info = `
முன்பதிவு எண்: ${b.booking_reference || b.reference}
தமிழ் தேதி: ${dayMeta ? dayMeta.tamilDate : ''}
ஆங்கில தேதி: ${dayMeta ? dayMeta.formattedDate : ''} (${dayMeta ? dayMeta.tamilDay : ''})
முதன்மை பக்தர்: ${b.devotee_name || b.devoteeName}
தொடர்பு கைபேசி: ${b.mobile_number || b.mobileNumber}
முகவரி: ${b.address || '-'}

குடும்ப உறுப்பினர்கள் (${members.length || 1} நபர்கள்):
${membersList}

பூஜை உபயக் கட்டணம்: ₹${b.contribution_amount || b.contributionAmount || 500} (${b.payment_method || b.paymentMethod})
கட்டண நிலை: ${b.payment_status || b.paymentStatus}
முன்பதிவு நிலை: ${b.booking_status || b.bookingStatus}
யுபிஐ குறிப்பு எண்: ${b.payment_reference || '-'}
        `;
        alert(info);
    };

    // 11.5 Export to CSV (Tamil)
    if (adminExportBtn) {
        adminExportBtn.addEventListener('click', () => {
            if (adminBookingsCache.length === 0) {
                alert('ஏற்றுமதி செய்ய முன்பதிவுகள் எதுவும் இல்லை.');
                return;
            }

            let csv = '\uFEFF'; // UTF-8 BOM for proper Tamil rendering in Excel
            csv += 'மார்கழி நாள் (தமிழ்),ஆங்கில தேதி,கிழமை,முன்பதிவு எண்,முதன்மை பக்தர் பெயர்,குடும்ப உறுப்பினர்கள் (அனைத்து பெயர்கள்),கைபேசி,முகவரி,கட்டணம்,கட்டண முறை,கட்டண நிலை,முன்பதிவு நிலை\n';

            adminBookingsCache.forEach(b => {
                const dayMeta = MARGAZHI_DAYS.find(d => d.day === (b.margazhi_day || b.margazhiDay));
                const members = b.family_members || b.familyMembers || [];
                const membersStr = members.map((m, i) => `${i + 1}. ${m.name}`).join('; ');
                const row = [
                    dayMeta ? dayMeta.tamilDate : b.margazhi_day,
                    dayMeta ? dayMeta.formattedDate : '',
                    dayMeta ? dayMeta.tamilDay : '',
                    b.booking_reference || b.reference,
                    `"${(b.devotee_name || b.devoteeName || '').replace(/"/g, '""')}"`,
                    `"${membersStr.replace(/"/g, '""')}"`,
                    b.mobile_number || b.mobileNumber,
                    `"${(b.address || '').replace(/"/g, '""')}"`,
                    b.contribution_amount || b.contributionAmount || 500,
                    b.payment_method || b.paymentMethod,
                    b.payment_status || b.paymentStatus,
                    b.booking_status || b.bookingStatus
                ];
                csv += row.join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `நாகதேவி_மார்கழி_பூஜை_முன்பதிவுகள்_2027.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // 11.6 Toggle Audit Logs
    if (toggleAuditBtn && auditContainer) {
        toggleAuditBtn.addEventListener('click', async () => {
            const isHidden = auditContainer.classList.contains('hidden');
            if (isHidden) {
                auditContainer.classList.remove('hidden');
                const list = document.getElementById('admin-audit-list');
                list.innerHTML = 'கணக்காய்வு பதிவுகள் ஏற்றப்படுகின்றன...';

                const token = sessionStorage.getItem('nagadevi_admin_token');
                try {
                    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        signal: AbortSignal.timeout(3500)
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.logs && data.logs.length > 0) {
                            list.innerHTML = data.logs.map(l => `
                                <div class="audit-item">
                                    <div>
                                        <strong>${l.action}:</strong> ${l.notes || l.booking_reference} 
                                        <small>(${l.performed_by})</small>
                                    </div>
                                    <div class="audit-time">${new Date(l.created_at).toLocaleDateString('ta-IN')} ${new Date(l.created_at).toLocaleTimeString('ta-IN')}</div>
                                </div>
                            `).join('');
                            return;
                        }
                    }
                } catch (e) {
                    // Fallback
                }
                list.innerHTML = '<div style="color:#777; padding: 10px;">பதிவுகள் எதுவும் கிடைக்கவில்லை.</div>';
            } else {
                auditContainer.classList.add('hidden');
            }
        });
    }

    // Initial load
    loadMargazhiCalendar();
});
