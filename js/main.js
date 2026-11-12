// ১. ওয়েবসাইট লোড হওয়ার সাথে সাথে JSON থেকে ক্লাস নোট ও লিংক লোড করার কোড
document.addEventListener("DOMContentLoaded", function() {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            window.allData = data;
            if (document.getElementById('whatsapp-btn')) {
                document.getElementById('whatsapp-btn').href = data.live_classes.whatsapp_link;
            }
            if (document.getElementById('meet-btn')) {
                document.getElementById('meet-btn').href = data.live_classes.google_meet_link;
            }
            filterNotes('regular');
        })
        .catch(err => console.log("JSON load error:", err));
});

// ২. রেগুলার বা এক্সট্রা নোট ফিল্টার করার ফাংশন
function filterNotes(type) {
    const container = document.getElementById('notes-container');
    const title = document.getElementById('section-title');
    if (!container || !window.allData) return;
    
    container.innerHTML = "";
    
    let notes = [];
    if (type === 'regular') {
        title.innerText = "রেগুলার ক্লাস নোটসমূহ";
        notes = window.allData.regular_notes;
    } else {
        title.innerText = "অতিরিক্ত (Extra) ক্লাস নোটসমূহ";
        notes = window.allData.extra_notes;
    }
    
    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
            <h3>${note.title}</h3>
            <a href="${note.link}" target="_blank" class="view-btn">নোট দেখুন (PDF)</a>
        `;
        container.appendChild(card);
    });
}

// ৩. ডিকশনারি বক্স খোলা এবং বন্ধ করার ফাংশন
function toggleDictionary() {
    const dictSection = document.getElementById('dictionary-section');
    if (dictSection.style.display === 'none' || dictSection.style.display === '') {
        dictSection.style.display = 'block';
        document.getElementById('arabic-input').focus();
    } else {
        dictSection.style.display = 'none';
    }
}

// কুরআন বক্স খোলা এবং বন্ধ করার ফাংশন
function toggleQuran() {
    const quranSection = document.getElementById('quran-section');
    const dictSection = document.getElementById('dictionary-section');
    
    // কুরআন খুললে ডিকশনারি বন্ধ হয়ে যাবে যাতে পেজ পরিষ্কার থাকে
    if (dictSection) dictSection.style.display = 'none';

    if (quranSection.style.display === 'none' || quranSection.style.display === '') {
        quranSection.style.display = 'block';
    } else {
        quranSection.style.display = 'none';
    }
}

let typingTimer;

// ৪. টাইপ করার সাথে সাথে অটো কাজ করা এবং ক্লিয়ার বাটন দেখানোর ফাংশন
function autoSearchArabic() {
    clearTimeout(typingTimer);
    const inputField = document.getElementById('arabic-input');
    const clearBtn = document.getElementById('clear-btn');
    const word = inputField.value.trim();
    const resultDiv = document.getElementById('dict-result');

    // বক্সে লেখা থাকলে (X) বাটন দেখাবে, নাহলে লুকিয়ে রাখবে
    if (inputField.value.length > 0) {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }

    if (!word) {
        resultDiv.innerHTML = "";
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    typingTimer = setTimeout(() => {
        searchArabicWord();
    }, 500);
}

// ক্লিয়ার (X) বাটনে ক্লিক করলে বক্স ও ফলাফল মুছে ফেলার ফাংশন
function clearArabicInput() {
    const inputField = document.getElementById('arabic-input');
    const clearBtn = document.getElementById('clear-btn');
    const resultDiv = document.getElementById('dict-result');

    inputField.value = "";
    resultDiv.innerHTML = "";
    clearBtn.style.display = "none";
    inputField.focus(); // মুছে ফেলার পর আবার টাইপ করার জন্য কার্সর বক্সে নিয়ে আসবে
}


// ৫. ক্লিয়ার (X) বাটনে ক্লিক করলে বক্স ও ফলাফল মুছে ফেলার ফাংশন
function clearArabicInput() {
    const inputField = document.getElementById('arabic-input');
    const clearBtn = document.getElementById('clear-btn');
    const resultDiv = document.getElementById('dict-result');

    inputField.value = "";
    resultDiv.innerHTML = "";
    if (clearBtn) clearBtn.style.display = "none";
    inputField.focus();
}

// ৬. নিজস্ব বিশেষ শব্দের তালিকা (বাংলা ও ইংরেজি উভয় অর্থসহ)
const customDictionary = {
    "تَلْقَفُ": { bn: "গিলে ফেলা / লুফে নেওয়া", en: "swallows / devours", pos: "ক্রিয়া (Verb)" },
    "تَلۡقَفُ": { bn: "গিলে ফেলা / লুফে নেওয়া", en: "swallows / devours", pos: "ক্রিয়া (Verb)" },
    "تلقف": { bn: "গিলে ফেলা / লুফে নেওয়া", en: "swallows / devours", pos: "ক্রিয়া (Verb)" },
    "عَصَاكَ": { bn: "তোমার লাঠি", en: "your staff / stick", pos: "বিশেষ্য (Noun)" },
    "عصاك": { bn: "তোমার লাঠি", en: "your staff / stick", pos: "বিশেষ্য (Noun)" },
    "يَأْفِكُونَ": { bn: "তারা মিথ্যা রচনা করে / ভেল্কিবাজি করে", en: "they falsify / invent", pos: "ক্রিয়া (Verb)" },
    "يَأۡفِكُونَ": { bn: "তারা মিথ্যা রচনা করে / ভেল্কিবাজি করে", en: "they falsify / invent", pos: "ক্রিয়া (Verb)" },
    "مَا يَأْفِكُونَ": { bn: "তারা যা মিথ্যা রচনা করছে", en: "what they falsify", pos: "বাক্যাংশ (Phrase)" },
    "مَا يَأۡفِكُونَ": { bn: "তারা যা মিথ্যা রচনা করছে", en: "what they falsify", pos: "বাক্যাংশ (Phrase)" }
};

// ৭. আরবী থেকে নির্ভুল বাংলা ও ইংরেজি অর্থ বের করার মূল ফাংশন
async function searchArabicWord() {
    const rawWord = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!rawWord) return;

    // ১ম ধাপ: নিজস্ব তালিকায় শব্দটি খুঁজবে
    if (customDictionary.hasOwnProperty(rawWord)) {
        const item = customDictionary[rawWord];
        resultDiv.innerHTML = `
            বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">${item.bn}</span>
            <div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>${item.en}</strong></div>
            <div style="font-size:14px; color:#555; margin-top:5px;">পদ প্রকরণ: <strong>${item.pos}</strong></div>
        `;
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>কুরআনিক ও সাধারণ অভিধানে অর্থ খোঁজা হচ্ছে...</span>";

    // আরবী অক্ষর ও হরকত পরিষ্কার করার ফাংশন
    function normalizeArabic(text) {
        return text
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
            .replace(/[أإآٱ]/g, "ا")
            .replace(/ى/g, "ي")
            .replace(/ة/g, "ه");
    }

    const cleanRoot = normalizeArabic(rawWord);
    const normalizedWord = rawWord
        .replace(/\u06E1/g, "\u0652")
        .replace(/[\u06D6-\u06E0\u06E2-\u06ED]/g, "");

    let quranVerseContext = "";
    let quranAyahBn = "";
    let quranAyahEn = "";

    // ২য় ধাপ: ১০০% CORS-মুক্ত AlQuran Cloud API দিয়ে কুরআনে শব্দটি খোঁজা
    try {
        const alQuranBase = ["https:/", "api.alquran.cloud", "v1"].join("/");
        // কুরআনের পরিষ্কার টেক্সট থেকে শব্দটি সার্চ করা
        const searchRes = await fetch(`${alQuranBase}/search/${encodeURIComponent(cleanRoot)}/all/quran-simple-clean`);
        const searchData = await searchRes.json();

        if (searchData && searchData.data && Array.isArray(searchData.data.matches) && searchData.data.matches.length > 0) {
            const match = searchData.data.matches.at(0);
            const surahNum = match.surah.number;
            const ayahNum = match.numberInSurah;
            quranVerseContext = `কুরআনের রেফারেন্স: <strong>${match.surah.englishName} (${surahNum}:${ayahNum})</strong>`;

            // ওই নির্দিষ্ট আয়াতটির অফিশিয়াল বাংলা (bn.bengali) এবং ইংরেজি (en.sahih) অনুবাদ একসাথে আনা
            const ayahRes = await fetch(`${alQuranBase}/ayah/${surahNum}:${ayahNum}/editions/bn.bengali,en.sahih`);
            const ayahData = await ayahRes.json();

            if (ayahData && Array.isArray(ayahData.data) && ayahData.data.length >= 2) {
                quranAyahBn = ayahData.data.at(0).text;
                quranAyahEn = ayahData.data.at(1).text;
            }
        }
    } catch (qErr) {
        console.log("AlQuran Cloud check finished.");
    }

    // কুরআনে শব্দটি পাওয়া গেলে সরাসরি কুরআনের অফিশিয়াল বাংলা ও ইংরেজি অর্থ দেখানো
    if (quranAyahBn) {
        // সম্পূর্ণ আয়াতের অনুবাদের পাশাপাশি নির্দিষ্ট শব্দটির অর্থ আলাদা করে বের করার জন্য গুগলকে কুরআনের আয়াতের প্রসঙ্গ দেওয়া
        let wordBn = "";
        let wordEn = "";
        try {
            const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
            // কুরআনের শব্দটির একক অনুবাদ নেওয়া
            const [gBnRes, gEnRes] = await Promise.all([
                fetch(`${baseGoogle}?client=gtx&sl=ar&tl=bn&dt=t&q=${encodeURIComponent(normalizedWord)}`),
                fetch(`${baseGoogle}?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(normalizedWord)}`)
            ]);
            const gBnData = await gBnRes.json();
            const gEnData = await gEnRes.json();
            
            if (Array.isArray(gBnData) && Array.isArray(gBnData.at(0))) {
                wordBn = gBnData.at(0).map(i => i.at(0)).join("");
            }
            if (Array.isArray(gEnData) && Array.isArray(gEnData.at(0))) {
                wordEn = gEnData.at(0).map(i => i.at(0)).join("");
            }
        } catch (e) {}

        let outputHTML = `
            <div style="background:#f9fbf9; border:1px solid #d5e8d4; border-radius:10px; padding:15px; margin-top:10px; text-align:right;" dir="rtl">
                <div style="font-size:13px; color:#008080; text-align:left; margin-bottom:8px;" dir="ltr">📖 ${quranVerseContext}</div>
                <div style="font-size:16px; color:#2c3e50; text-align:left; line-height:1.6;" dir="ltr">
                    <strong>আয়াতের বাংলা অনুবাদ:</strong> ${quranAyahBn}
                </div>
                <div style="font-size:15px; color:#1e8449; text-align:left; margin-top:6px; line-height:1.5;" dir="ltr">
                    <strong>ইংরেজি অনুবাদ:</strong> ${quranAyahEn}
                </div>
            </div>
        `;
        resultDiv.innerHTML = outputHTML;
        return;
    }

    // ৩য় ধাপ: কুরআনে না পাওয়া গেলে সাধারণ আরবী শব্দের জন্য গুগল ট্রান্সলেট ব্যবহার করা
    try {
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
        
        const checkUrl = `${baseGoogle}?client=gtx&sl=ar&tl=en&dt=t&dt=bd&q=${encodeURIComponent(normalizedWord)}`;
        const checkRes = await fetch(checkUrl);
        const checkData = await checkRes.json();

        let posTag = "";
        let isVerb = false;

        if (Array.isArray(checkData) && Array.isArray(checkData.at(1))) {
            const firstCat = checkData.at(1).at(0);
            if (Array.isArray(firstCat)) {
                const rawPos = firstCat.at(0);
                if (rawPos === "verb") {
                    isVerb = true;
                    posTag = "ক্রিয়া (Verb)";
                } else if (rawPos === "noun") {
                    posTag = "বিশেষ্য (Noun)";
                } else if (typeof rawPos === "string") {
                    posTag = rawPos;
                }
            }
        }

        let queryWord = normalizedWord;
        if (isVerb && !normalizedWord.includes(" ")) {
            queryWord = `هو ${normalizedWord}`;
        }

        const enUrl = `${baseGoogle}?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(queryWord)}`;
        const enRes = await fetch(enUrl);
        const enData = await enRes.json();

        let englishMeaning = "";
        if (Array.isArray(enData) && Array.isArray(enData.at(0))) {
            enData.at(0).forEach(item => {
                if (Array.isArray(item) && typeof item.at(0) === "string") {
                    englishMeaning += item.at(0);
                }
            });
        }

        let finalBangla = "";
        if (englishMeaning && englishMeaning.toLowerCase() !== normalizedWord.toLowerCase()) {
            const bnUrl = `${baseGoogle}?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(englishMeaning)}`;
            const bnRes = await fetch(bnUrl);
            const bnData = await bnRes.json();

            if (Array.isArray(bnData) && Array.isArray(bnData.at(0))) {
                bnData.at(0).forEach(item => {
                    if (Array.isArray(item) && typeof item.at(0) === "string") {
                        finalBangla += item.at(0);
                    }
                });
            }
        }

        if (finalBangla) {
            let outputHTML = `বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">${finalBangla}</span>`;
            if (englishMeaning) {
                outputHTML += `<div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>${englishMeaning}</strong></div>`;
            }
            if (posTag) {
                outputHTML += `<div style="font-size:14px; color:#555; margin-top:5px;">পদ প্রকরণ: <strong>${posTag}</strong></div>`;
            }
            resultDiv.innerHTML = outputHTML;
            return;
        } else {
            resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
        }
    } catch (e) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
    }
}

