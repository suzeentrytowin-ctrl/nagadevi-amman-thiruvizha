# அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில் 🪔
## 27 ம் ஆண்டு நாக சதுர்த்தி திருவிழா 2027 & மார்கழி மாத உஷத்கால தினசரி பூஜை முன்பதிவு

ஈரோடு மாவட்டம், கோபி வட்டம், சிங்கிரிபாளையம் அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில் அதிகாரப்பூர்வ இணையதளம் மற்றும் மார்கழி மாத தினசரி பூஜை முன்பதிவு தளம்.

---

## 🌟 திட்ட சிறப்பம்சங்கள் (Project Highlights)

- **வடிவமைப்பு ஒருமைப்பாடு (Preserved Temple Aesthetics)**: பாரம்பரிய திருக்கோயில் வண்ணங்கள் (அரக்கு, பொன் வண்ணம், வெண்கலக் கோடுகள்), நாக வடிவ எல்லைகள் மற்றும் கூகுள் தமிழ் எழுத்துருக்கள் (`Noto Serif Tamil`, `Noto Sans Tamil`).
- **முழுமையான தமிழ் இடைமுகம் (100% Tamil User Interface)**: முகப்பு, திருவிழா அழைப்பிதழ், நிகழ்ச்சி நிரல், மார்கழி நாள்காட்டி, முன்பதிவு படிவம், ரசீது மற்றும் நிர்வாகக் கட்டுப்பாடு அனைத்தும் பிழையற்ற தமிழில்.
- **திருவிழா 2027 (Festival 2027 Schedule & Countdown)**:
  - **02 ஆகஸ்ட் 2027 (மாலை 5:00 மணி)**: கங்கணம் கட்டுதல் & திருவிழா தொடக்கம்
  - **05 ஆகஸ்ட் 2027 (மாலை 5:00 மணி)**: அம்மை அழைத்தல் & சக்திகரகம் பவனி
  - **06 ஆகஸ்ட் 2027 (முக்கிய திருவிழா)**: தீர்த்தக்குடங்கள், 108 சங்காபிஷேகம் & சந்தனகாப்பு அலங்கார பூஜை
  - **07 ஆகஸ்ட் 2027 (மாலை 5:00 மணி)**: மறுபூஜை & 1108 தீபங்கள்
  - நேரடி வினாடி-வினாடி கவுண்டவுன் (02 ஆகஸ்ட் 2027, மாலை 5:00 மணி இலக்கு).
- **மார்கழி மாத தினசரி பூஜை முன்பதிவு (Margazhi Daily Pooja Booking)**:
  - மார்கழி 01 முதல் மார்கழி 30 வரை (16.12.2026 முதல் 14.01.2027 வரை) 30 நாட்களுக்கான பஞ்சாங்க நாள்காட்டி.
  - ஒரு நாளுக்கு ஒரு குடும்பம் மட்டுமே (Strictly one devotee per date with DB unique constraint).
  - நிலைக் குறியீடுகள்: 🟢 கிடைக்கும், 🟡 நிலுவையில், 🔴 முன்பதிவு செய்யப்பட்டது.
  - தனித்துவமான முன்பதிவு எண் உருவாக்கம் (எ.கா: `NDK-MRG-2027-XXXX`).
  - பக்தர்கள் தங்கள் கைபேசி எண் அல்லது முன்பதிவு எண் மூலம் நிலையை அறியும் வசதி.
- **பூஜ்ஜிய-செலவு தொழில்நுட்பம் (Zero-Cost Technology Stack)**:
  - **முன்பக்கம் (Frontend)**: தூய HTML5, CSS3, Vanilla JavaScript (GitHub Pages தயார் நிலை).
  - **பின்பக்கம் (Backend)**: Node.js & Express API.
  - **தரவுத்தளம் (Database)**: Self-hosted PostgreSQL (`pg` transaction-safe row locking).
  - **கட்டணம் (Direct UPI Payment)**: மூன்றாம் தரப்பு கட்டண நுழைவாயில் கமிஷன் இன்றி நேரடி யுபிஐ QR வழி கட்டணம் (`naganaveen1414@okaxis`).
- **நிர்வாகக் கட்டுப்பாடு (Admin Management Dashboard)**:
  - பாதுகாப்பான நிர்வாகி உள்நுழைவு (JWT + bcrypt).
  - முன்பதிவுகளை உறுதி செய்தல், கட்டணங்களை சரிபார்த்தல், ரத்து செய்தல்.
  - அட்டவணையை தமிழ் CSV கோப்பாக ஏற்றுமதி செய்யும் வசதி.
  - விரிவான கணக்காய்வுப் பதிவேடு (Audit Logs).
  - தானியங்கி காலாவதி கொள்கை (24 மணிநேர நிலுவை தானியங்கி ரத்து).

---

## 📂 கோப்பு அமைப்பு (Folder Structure)

```text
/
├── index.html              # முதன்மை முகப்பு பக்கம் (HTML5 & Semantic Tamil Markup)
├── style.css               # திருக்கோயில் வண்ணங்கள், நாள்காட்டி & நிர்வாக பாணிகள்
├── script.js               # நாள்காட்டி, முன்பதிவு, நிர்வாகம் & ஒலி அமைப்பு
├── package.json            # Node.js சார்புகள் & கட்டளைகள்
├── .env.example            # சூழல் மாறிகள் மாதிரி
├── README.md               # ஆவணங்கள்
│
├── server/
│   ├── server.js           # Express API சர்வர்
│   ├── db.js               # PostgreSQL இணைப்பு & Transaction Runner
│   ├── schema.sql          # முழுமையான PostgreSQL DDL & அட்டவணைகள்
│   └── margazhi_data.js    # மார்கழி 30 நாட்கள் பஞ்சாங்க தரவு
│
├── scripts/
│   ├── backup.sh           # தானியங்கி PostgreSQL காப்புப்பிரதி (Backup)
│   └── restore.sh          # காப்புப்பிரதியை மீட்டமைக்கும் நிரல் (Restore)
│
└── assets/
    ├── images/             # திருக்கோயில் படங்கள் & யுபிஐ QR குறியீடு (qr.jpeg)
    ├── audio/              # மகுடி / பக்திப் பின்னணி இசை (magudi.mp3)
    └── icons/              # Favicon சின்னங்கள்
```

---

## 🚀 தொடங்குதல் மற்றும் நிறுவுதல் (Getting Started)

### 1. சார்புகளை நிறுவுதல் (Install Dependencies)

```bash
npm install
```

### 2. சூழல் மாறிகளை அமைத்தல் (Environment Configuration)

`.env.example` கோப்பைப் நகலெடுத்து `.env` உருவாக்கவும்:

```bash
cp .env.example .env
```

`.env` கோப்பில் தங்களின் PostgreSQL விபரங்களை உள்ளிடவும்:
```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGDATABASE=nagadevi_temple
PGUSER=postgres
PGPASSWORD=your_postgres_password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=nagadevi2027
```

### 3. PostgreSQL தரவுத்தளத்தை துவக்குதல் (Database Setup)

```bash
# தரவுத்தளத்தை உருவாக்க
createdb -U postgres nagadevi_temple

# ஸ்கீமாவை இறக்க
psql -U postgres -d nagadevi_temple -f server/schema.sql
```

### 4. சேவையகத்தை இயக்குதல் (Run Server)

```bash
npm start
```
இப்போது இணையதளம் `http://localhost:5000` முகவரியில் இயங்கும்.

---

## 🛡️ தரவுத்தள காப்புப்பிரதி மற்றும் மீட்டமைத்தல் (Backup & Restore)

### காப்புப்பிரதி எடுக்க (Automated Backup):
```bash
npm run backup
# அல்லது
bash scripts/backup.sh
```
காப்புப்பிரதி gzip சுருக்கப்பட்டு `./backups/nagadevi_db_YYYYMMDD_HHMMSS.sql.gz` என சேமிக்கப்படும்.

### மீட்டமைக்க (Restore):
```bash
bash scripts/restore.sh ./backups/nagadevi_db_20270101_120000.sql.gz
```

---

## 🌐 GitHub Pages நேரடி பயன்பாடு (GitHub Pages Hosting)

இத்தளத்தின் முன்பக்கம் (Frontend) GitHub Pages-ல் எந்தவொரு கட்டணமும் இன்றி இயங்கும் வகையில் வடிவமைக்கப்பட்டுள்ளது:

1. திட்டத்தை GitHub-ல் Push செய்யவும்.
2. Settings > Pages > `main` கிளையைத் தேர்ந்தெடுக்கவும்.
3. தங்களின் Node.js சேவையகம் இயங்கும்போது அது API வழி தானாக இணையும்; சேவையகம் துண்டிக்கப்பட்டிருந்தாலும் வாடிக்கையாளர் LocalStorage மூலம் இணையதளம் சீராக இயங்கும்.

---

*ஓம் ஸ்ரீ நாகதேவி அம்மன் துணை* 🪔
