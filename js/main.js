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

    // কুরআনের ডাটাবেস থেকে শব্দটির প্রসঙ্গ ও অর্থ বের করা
    try {
        const alQuranBase = ["https:/", "api.alquran.cloud", "v1"].join("/");
        let searchUrl = `${alQuranBase}/search/${encodeURIComponent(rawWord)}/all/quran-uthmani`;
        let searchRes = await fetch(searchUrl);
        let searchData = await searchRes.json();

        const hasMatches = searchData && searchData.data && 
                           Array.isArray(searchData.data.matches) && 
                           searchData.data.matches.length > 0;

        if (!hasMatches) {
            searchUrl = `${alQuranBase}/search/${encodeURIComponent(cleanRoot)}/all/quran-simple-clean`;
            searchRes = await fetch(searchUrl);
            searchData = await searchRes.json();
        }

        if (searchData && searchData.data && Array.isArray(searchData.data.matches) && searchData.data.matches.length > 0) {
            const match = searchData.data.matches.at(0);
            const surahNum = match.surah.number;
            const ayahNum = match.numberInSurah;

            const arAyahRes = await fetch(`${alQuranBase}/ayah/${surahNum}:${ayahNum}/quran-uthmani`);
            const arAyahData = await arAyahRes.json();

            if (arAyahData && arAyahData.data && arAyahData.data.text) {
                const fullAyahAr = arAyahData.data.text;
                const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
                
                const wordsInAyah = fullAyahAr.split(" ");
                let targetWord = rawWord;
                for (const w of wordsInAyah) {
                    if (w === rawWord || stripAll(w) === cleanRoot) {
                        targetWord = w;
                        break;
                    }
                }

                const contextualAyah = fullAyahAr.replace(targetWord, `【${targetWord}】`);
                const enCtxUrl = `${baseGoogle}?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(contextualAyah)}`;
                const bnCtxUrl = `${baseGoogle}?client=gtx&sl=ar&tl=bn&dt=t&q=${encodeURIComponent(contextualAyah)}`;

                const [ctxEnRes, ctxBnRes] = await Promise.all([
                    fetch(enCtxUrl),
                    fetch(bnCtxUrl)
                ]);

                const ctxEnData = await ctxEnRes.json();
                const ctxBnData = await ctxBnRes.json();

                let fullEn = "";
                if (Array.isArray(ctxEnData) && Array.isArray(ctxEnData.at(0))) {
                    ctxEnData.at(0).forEach(i => { 
                        if (Array.isArray(i) && i.at(0)) fullEn += i.at(0); 
                    });
                }

                let fullBn = "";
                if (Array.isArray(ctxBnData) && Array.isArray(ctxBnData.at(0))) {
                    ctxBnData.at(0).forEach(i => { 
                        if (Array.isArray(i) && i.at(0)) fullBn += i.at(0); 
                    });
                }

                const enMatch = fullEn.match(/【(.*?)】/);
                const bnMatch = fullBn.match(/【(.*?)】/);

                if (bnMatch && bnMatch.at(1)) wordBn = bnMatch.at(1).trim();
                if (enMatch && enMatch.at(1)) wordEn = enMatch.at(1).trim();
            }
        }
    } catch (qErr) {
        console.log("Contextual Quran translation finished.");
    }

    if (wordBn && wordBn !== rawWord) {
        let outputHTML = `বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">${wordBn}</span>`;
        if (wordEn) {
            outputHTML += `<div style="font-size:17px; color:#1e8449; margin-top:6px;">ইংরেজি অর্থ: <strong>${wordEn}</strong></div>`;
        }
        resultDiv.innerHTML = outputHTML;
        return;
    }

    // কুরআনে না পাওয়া গেলে সাধারণ আরবী শব্দের অনুবাদ
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
                queryWord = `هذه ${normalizedWord} كثيرة`;
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
            englishMeaning = englishMeaning
                .replace(/^(these|this|many)\s+/gi, "")
                .replace(/\s+(many|are many)$/gi, "");
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

