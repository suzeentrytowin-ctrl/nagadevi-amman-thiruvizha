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
    // 8. FESTIVAL COUNTDOWN TIMER
    // --------------------------------------------------------
    const countDownDate = new Date("Aug 12, 2026 17:00:00").getTime();
    
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
});
