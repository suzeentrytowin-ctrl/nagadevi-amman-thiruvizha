// =====================================================================
// அருள்மிகு புற்றுக்கண் நாகதேவி அம்மன் திருக்கோயில்
// மார்கழி மாத 30 நாட்கள் அதிகாரப்பூர்வ பஞ்சாங்க விபரம் (2026 - 2027)
// =====================================================================

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

module.exports = { MARGAZHI_DAYS };

