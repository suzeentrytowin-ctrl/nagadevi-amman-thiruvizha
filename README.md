# Sri Nagadevi Amman Temple Festival 🪔

A premium, production-ready, pure Tamil website built for the **Sri Nagadevi Amman Temple 26th Year Naga Chathurthi Festival**.

## 🌟 Project Highlights
- **100% Vanilla Tech Stack**: Built purely with HTML5, CSS3, and Vanilla JavaScript. Zero frameworks, zero bloat.
- **Universal Tamil Typography**: Uses Google Fonts (`Noto Serif Tamil` & `Noto Sans Tamil`) to ensure the pure Tamil font renders perfectly on ALL mobile devices and browsers, even if they lack native Tamil font support.
- **Premium Nagadevi Theme**: Deep maroon, golden glow, and subtle snake scale textures integrated with elegant animations.
- **60 FPS Animations**: CSS hardware-accelerated animations (transform/opacity) and Intersection Observers for buttery smooth scrolling.
- **Cinematic Experience**: 
  - Sequential loader (Bells -> Vilakku -> Om -> Name).
  - Devotional background music with smart autoplay handling (shows an elegant overlay if the browser blocks autoplay).
- **Mobile First**: 100% responsive from 320px screens up to 1440px desktop. Touch-friendly UI with zero horizontal overflow.

---

## 📂 Folder Structure

```text
/
│── index.html          # Main HTML structure, Semantic elements, Web Fonts
│── style.css           # Premium CSS, Variables, Animations, Media Queries
│── script.js           # BGM Logic, Loader, Intersection Observer, Mobile Menu
│── README.md           # Documentation
│── .gitignore          # Git ignores
│
└── assets/
    ├── images/         # Place your images here (Hero BG, Gallery etc.)
    ├── audio/          # Contains devotional.mp3 (BGM)
    ├── icons/          # Favicon (favicon.svg) and other SVG vectors
    └── fonts/          # Local font fallback folder
```

---

## 🎨 Customization Guide

### Changing the Audio (BGM)
1. Place your preferred devotional `.mp3` file in `assets/audio/`.
2. Open `index.html`.
3. Locate the `<audio id="bgm">` tag (around line 43).
4. Update the `<source src="assets/audio/YOUR_AUDIO.mp3">`.
*Note: The JS automatically sets volume to 10% and handles autoplay policies.*

### Modifying the Schedule (Timeline)
1. Open `index.html` and locate the `<section id="schedule">`.
2. To add a new event, duplicate an existing `<div class="timeline-item fade-in-up">` block.
3. Update the date, time, and title inside it.
4. To highlight a specific event (like a main Poojai), add the class `main-event` to the `timeline-item`.

---

## 🚀 GitHub Pages Deployment Guide

This project requires zero build tools. It is ready for instant deployment!

1. Initialize git in this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Nagadevi Amman Temple Website"
   ```
2. Create a new repository on GitHub.
3. Push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
4. On GitHub, go to your repository **Settings**.
5. Click on **Pages** in the left sidebar.
6. Under **Source**, select `Deploy from a branch`.
7. Under **Branch**, select `main` (and `/root` folder), then click **Save**.
8. Wait 1-2 minutes. Your premium Tamil temple website is now live! 🪔

---
*ஓம் ஸ்ரீ நாகதேவி அம்மன் துணை*
