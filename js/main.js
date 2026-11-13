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
// দোআ ও যিকির বক্স খোলা এবং বন্ধ করার ফাংশন
function toggleDua() {
    const duaSection = document.getElementById('dua-section');
    const quranSection = document.getElementById('quran-section');
    const dictSection = document.getElementById('dictionary-section');
    
    // অন্য বক্স খোলা থাকলে তা বন্ধ করে দেবে যাতে পেজ পরিষ্কার থাকে
    if (quranSection) quranSection.style.display = 'none';
    if (dictSection) dictSection.style.display = 'none';

    if (duaSection.style.display === 'none' || duaSection.style.display === '') {
        duaSection.style.display = 'block';
    } else {
        duaSection.style.display = 'none';
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
            <div style="font-size:17px; color:#1e8449; margin-top:6px;">
                ইংরেজি অর্থ: <strong>${item.en}</strong>
            </div>
            <div style="font-size:14px; color:#555; margin-top:5px;">
                পদ প্রকরণ: <strong>${item.pos}</strong>
            </div>
        `;
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>সঠিক অর্থ খোঁজা হচ্ছে...</span>";

    const normalizedWord = rawWord
        .replace(/\u06E1/g, "\u0652")
        .replace(/[\u06D6-\u06E0\u06E2-\u06ED]/g, "");

    const stripAll = (str) => str
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه");

    const cleanRoot = stripAll(normalizedWord);
    let wordBn = "";
    let wordEn = "";

    // ২য় ধাপ: কুরআনের আয়াত খুঁজে সরাসরি ওয়ার্ড-বাই-ওয়ার্ড অর্থ বের করা
    try {
        const alQuranBase = ["https:/", "api.alquran.cloud", "v1"].join("/");
        const searchUrl = `${alQuranBase}/search/${encodeURIComponent(cleanRoot)}/all/quran-simple-clean`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData && searchData.data && Array.isArray(searchData.data.matches) && searchData.data.matches.length > 0) {
            const firstMatch = searchData.data.matches.at(0);
            const surahNum = firstMatch.surah.number;
            const ayahNum = firstMatch.numberInSurah;

            // CORS প্রক্সি ব্যবহার করে সরাসরি ://quran.com থেকে ওয়ার্ড-বাই-ওয়ার্ড বাংলা ও ইংরেজি অর্থ আনা
            const proxy = "https://corsproxy.io?";
            const quranBase = ["https:/", "://quran.com", "api", "v4", "verses", "by_key"].join("/");
            
            const bnTarget = encodeURIComponent(`${quranBase}/${surahNum}:${ayahNum}?language=bn&words=true&word_fields=text_imlaei_simple`);
            const enTarget = encodeURIComponent(`${quranBase}/${surahNum}:${ayahNum}?language=en&words=true&word_fields=text_imlaei_simple`);

            const [bnRes, enRes] = await Promise.all([
                fetch(`${proxy}${bnTarget}`),
                fetch(`${proxy}${enTarget}`)
            ]);

            if (bnRes.ok && enRes.ok) {
                const bnData = await bnRes.json();
                const enData = await enRes.json();

                if (bnData && bnData.verse && Array.isArray(bnData.verse.words)) {
                    for (let i = 0; i < bnData.verse.words.length; i++) {
                        const w = bnData.verse.words.at(i);
                        if (w.char_type_name !== "word") continue;

                        if (stripAll(w.text_imlaei_simple || "") === cleanRoot) {
                            wordBn = (w.translation && w.translation.text) ? w.translation.text : "";
                            if (enData && enData.verse && Array.isArray(enData.verse.words)) {
                                const wEn = enData.verse.words.at(i);
                                wordEn = (wEn && wEn.translation && wEn.translation.text) ? wEn.translation.text : "";
                            }
                            break;
                        }
                    }
                }
            }
        }
    } catch (qErr) {
        console.log("Quran lookup skipped.");
    }

    // কুরআনের অফিশিয়াল শব্দার্থ পাওয়া গেলে সেটি দেখাবে
    if (wordBn && wordBn !== rawWord) {
        let outputHTML = `বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">${wordBn}</span>`;
        if (wordEn) {
            outputHTML += `<div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>${wordEn}</strong></div>`;
        }
        resultDiv.innerHTML = outputHTML;
        return;
    }

    // ৩য় ধাপ: সাধারণ আরবী শব্দের অনুবাদ ও বহুবচন হ্যান্ডলিং (كُتُبٌ ও كَتَبَ ঠিক রাখার জন্য)
    try {
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
        const isDefinitelyNoun = /[\u064B\u064C\u064D]/.test(normalizedWord) || normalizedWord.startsWith("ال");

        const checkUrl = `${baseGoogle}?client=gtx&sl=ar&tl=en&dt=t&dt=bd&q=${encodeURIComponent(normalizedWord)}`;
        const checkRes = await fetch(checkUrl);
        const checkData = await checkRes.json();

        let posTag = "";
        let isVerb = false;

        if (isDefinitelyNoun) {
            posTag = "বিশেষ্য (Noun)";
        } else if (Array.isArray(checkData) && Array.isArray(checkData.at(1))) {
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
        if (!normalizedWord.includes(" ")) {
            if (isVerb) {
                queryWord = `هو ${normalizedWord}`;
            } else if (isDefinitelyNoun) {
                queryWord = `بعض ${normalizedWord}`;
            }
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

        if (isDefinitelyNoun && englishMeaning) {
            englishMeaning = englishMeaning.replace(/^some\s+/gi, "").trim();
        }

        let englishForBangla = englishMeaning;
        const isEnglishPlural = isDefinitelyNoun && englishMeaning.toLowerCase().endsWith("s") && !englishMeaning.toLowerCase().endsWith("ss");
        if (isEnglishPlural) {
            englishForBangla = `many ${englishMeaning}`;
        }

        let finalBangla = "";
        if (englishForBangla && englishForBangla.toLowerCase() !== normalizedWord.toLowerCase()) {
            const bnUrl = `${baseGoogle}?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(englishForBangla)}`;
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

// Contact সেকশন খোলা এবং বন্ধ করার ফাংশন
function toggleContact() {
    const contactSection = document.getElementById('contact-section');
    if (contactSection.style.display === 'none' || contactSection.style.display === '') {
        contactSection.style.display = 'block';
        contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        contactSection.style.display = 'none';
    }
}
// ইমেইলে ক্লিক করলে ঠিকানা কপি করার ফাংশন
function copyEmail(event) {
    const email = "quranerpakhi@protonmail.com";
    navigator.clipboard.writeText(email).then(() => {
        const btn = document.getElementById('email-copy-btn');
        const originalText = btn.innerText;
        btn.innerText = "✓ ইমেইল কপি হয়েছে!";
        btn.style.backgroundColor = "#27ae60";
        btn.style.color = "#ffffff";

        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "";
            btn.style.color = "";
        }, 2500);
    });
}
