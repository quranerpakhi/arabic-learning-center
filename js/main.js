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

    // আরবী অক্ষর ও হরকতকে স্ট্যান্ডার্ড রূপে আনার ফাংশন (যাতে কুরআনের যেকোনো ফন্টের বানান মিলে যায়)
    function normalizeArabic(text) {
        return text
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // সব হরকত, তাশদীদ ও ওয়াকফ চিহ্ন মোছা
            .replace(/[أإآٱ]/g, "ا") // সব ধরনের আলিফ ও হামযাকে সাধারণ আলিফে রূপান্তর
            .replace(/ى/g, "ي")      // আলিফ মাকসুরাকে সাধারণ ইয়া-তে রূপান্তর
            .replace(/ة/g, "ه");     // গোল তা-কে সাধারণ হা-তে রূপান্তর
    }

    const cleanRoot = normalizeArabic(rawWord);
    const normalizedWord = rawWord
        .replace(/\u06E1/g, "\u0652")
        .replace(/[\u06D6-\u06E0\u06E2-\u06ED]/g, "");

    let quranVerseContext = "";
    let quranExactBn = "";
    let quranExactEn = "";

    // ২য় ধাপ: অফিশিয়াল Quran.com V4 API থেকে সরাসরি আয়াত ও শব্দার্থ বের করা
    try {
        const quranApiBase = ["https:/", "://quran.com", "api", "v4"].join("/");
        // মূল অক্ষর দিয়ে কুরআনে সার্চ করা
        const searchRes = await fetch(`${quranApiBase}/search?q=${encodeURIComponent(cleanRoot)}&size=5&language=bn`);
        const searchData = await searchRes.json();

        if (searchData && searchData.search && Array.isArray(searchData.search.results) && searchData.search.results.length > 0) {
            const firstResult = searchData.search.results.at(0);
            const verseKey = firstResult.verse_key;

            if (verseKey) {
                quranVerseContext = `কুরআনের রেফারেন্স: <strong>সূরা ও আয়াত (${verseKey})</strong>`;
                
                // ওই আয়াতটির শব্দে শব্দে বাংলা ও ইংরেজি অর্থ একসাথে আনা
                const [bnRes, enRes] = await Promise.all([
                    fetch(`${quranApiBase}/verses/by_key/${verseKey}?language=bn&words=true&word_fields=text_uthmani,text_imlaei_simple`),
                    fetch(`${quranApiBase}/verses/by_key/${verseKey}?language=en&words=true&word_fields=text_uthmani,text_imlaei_simple`)
                ]);

                const bnData = await bnRes.json();
                const enData = await enRes.json();

                if (bnData && bnData.verse && Array.isArray(bnData.verse.words)) {
                    for (let i = 0; i < bnData.verse.words.length; i++) {
                        const w = bnData.verse.words.at(i);
                        if (w.char_type_name !== "word") continue;

                        const wNorm1 = normalizeArabic(w.text_uthmani || "");
                        const wNorm2 = normalizeArabic(w.text_imlaei_simple || "");
                        
                        // নর্মালাইজড মূল অক্ষরের সাথে ১০০% মিলিয়ে দেখা
                        if (wNorm1 === cleanRoot || wNorm2 === cleanRoot || wNorm1.includes(cleanRoot) || wNorm2.includes(cleanRoot)) {
                            if (w.translation && w.translation.text) {
                                quranExactBn = w.translation.text;
                            }
                            if (enData && enData.verse && Array.isArray(enData.verse.words)) {
                                const wEn = enData.verse.words.at(i);
                                if (wEn && wEn.translation && wEn.translation.text) {
                                    quranExactEn = wEn.translation.text;
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
    } catch (qErr) {
        console.log("Quran API error:", qErr);
    }

    // কুরআনের অফিশিয়াল বাংলা অর্থ পাওয়া গেলে সাথে সাথে দেখিয়ে দেবে
    if (quranExactBn) {
        let outputHTML = `বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">${quranExactBn}</span>`;
        if (quranExactEn) {
            outputHTML += `<div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>${quranExactEn}</strong></div>`;
        }
        if (quranVerseContext) {
            outputHTML += `<div style="font-size:13px; color:#008080; margin-top:6px; background:#e8f8f5; padding:4px 10px; border-radius:4px; display:inline-block;">📖 ${quranVerseContext}</div>`;
        }
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

