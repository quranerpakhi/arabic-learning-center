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

let typingTimer;

// ৪. টাইপ করার সাথে সাথে অটো কাজ করা এবং ক্লিয়ার বাটন দেখানোর ফাংশন
function autoSearchArabic() {
    clearTimeout(typingTimer);
    const inputField = document.getElementById('arabic-input');
    const clearBtn = document.getElementById('clear-btn');
    const word = inputField.value.trim();
    const resultDiv = document.getElementById('dict-result');

    if (clearBtn) {
        clearBtn.style.display = inputField.value.length > 0 ? "block" : "none";
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

// ৬. নিজস্ব নিখুঁত শব্দের তালিকা
const customDictionary = {
    "تَلْقَفُ": "গিলে ফেলা / লুফে নেওয়া",
    "تَلۡقَفُ": "গিলে ফেলা / লুফে নেওয়া",
    "تلقف": "গিলে ফেলা / লুফে নেওয়া"
};

// ৭. আরবী থেকে বাংলা ও ইংরেজি অর্থ বের করার মূল ফাংশন
async function searchArabicWord() {
    const rawWord = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!rawWord) return;

    if (customDictionary.hasOwnProperty(rawWord)) {
        resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${customDictionary[rawWord]}</span>`;
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>সঠিক ব্যাকরণগত অর্থ খোঁজা হচ্ছে...</span>";

    try {
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");

        let normalizedWord = rawWord
            .replace(/\u06E1/g, "\u0652")
            .replace(/[\u06D6-\u06E0\u06E2-\u06ED]/g, "");

        const isDefinitelyNoun = /[\u064B\u064C\u064D]/.test(normalizedWord) || normalizedWord.startsWith("ال");

        const enUrl = `${baseGoogle}?client=gtx&sl=ar&tl=en&dt=t&dt=bd&q=${encodeURIComponent(normalizedWord)}`;
        const enRes = await fetch(enUrl);
        const enData = await enRes.json();

        let englishMeaning = "";
        let posTag = "";

        if (Array.isArray(enData) && Array.isArray(enData.at(0))) {
            enData.at(0).forEach(item => {
                if (Array.isArray(item) && typeof item.at(0) === "string") {
                    englishMeaning += item.at(0);
                }
            });
        }

        if (isDefinitelyNoun) {
            posTag = "বিশেষ্য (Noun)";
        } else if (Array.isArray(enData) && Array.isArray(enData.at(1))) {
            const firstCat = enData.at(1).at(0);
            if (Array.isArray(firstCat)) {
                const rawPos = firstCat.at(0);
                posTag = rawPos === "verb" ? "ক্রিয়া (Verb)" : (rawPos === "noun" ? "বিশেষ্য (Noun)" : rawPos);
            }
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
        }
    } catch (e) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
    }
}
