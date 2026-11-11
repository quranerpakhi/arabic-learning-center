// ১. ওয়েবসাইট লোড হওয়ার সাথে সাথে JSON থেকে ক্লাস নোট ও লিংক লোড করার কোড
document.addEventListener("DOMContentLoaded", function() {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            window.allData = data;
            if(document.getElementById('whatsapp-btn')) {
                document.getElementById('whatsapp-btn').href = data.live_classes.whatsapp_link;
            }
            if(document.getElementById('meet-btn')) {
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
    if(type === 'regular') {
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
    if (dictSection.style.display === 'none') {
        dictSection.style.display = 'block';
        document.getElementById('arabic-input').focus();
    } else {
        dictSection.style.display = 'none';
    }
}

let typingTimer;

// ৪. টাইপ করার সাথে সাথে অটো কাজ করার ফাংশন
function autoSearchArabic() {
    clearTimeout(typingTimer);
    const word = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');

    if (!word) {
        resultDiv.innerHTML = "";
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    typingTimer = setTimeout(() => {
        searchArabicWord();
    }, 500);
}

// ৫. নিজস্ব বিশেষ শব্দের ব্যাকআপ তালিকা (যেগুলো কুরআনে বা ক্লাসে বেশি ব্যবহৃত হয়)
const customDictionary = {
    "تَلْقَفُ": "গিলে ফেলা / লুফে নেওয়া",
    "تَلۡقَفُ": "গিলে ফেলা / লুফে নেওয়া"
};

// ৬. পৃথিবীর যেকোনো আরবী শব্দের নিখুঁত ও বিস্তারিত বাংলা অর্থ বের করার ফাংশন
async function searchArabicWord() {
    const rawWord = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!rawWord) return;

    if (customDictionary[rawWord]) {
        resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${customDictionary[rawWord]}</span>`;
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>সঠিক ব্যাকরণগত অর্থ খোঁজা হচ্ছে...</span>";

    try {
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
        
        // আরবী ব্যাকরণের নিয়ম: শব্দে তানভীন (ً ٌ ٍ) অথবা শুরুতে 'ال' থাকলে সেটি নিশ্চিতভাবে বিশেষ্য (Noun)
        const isDefinitelyNoun = /[\u064B\u064C\u064D]/.test(rawWord) || rawWord.startsWith("ال");

        // ধাপ ১: শব্দটির পদ প্রকরণ পরীক্ষা করা
        const checkUrl = `${baseGoogle}?client=gtx&sl=ar&tl=en&dt=t&dt=bd&q=${encodeURIComponent(rawWord)}`;
        const checkRes = await fetch(checkUrl);
        const checkData = await checkRes.json();

        let posTag = "";
        let isVerb = false;

        if (isDefinitelyNoun) {
            isVerb = false;
            posTag = "বিশেষ্য (Noun)";
        } else if (checkData && checkData && checkData && checkData) {
            const rawPos = checkData;
            if (rawPos === "verb") {
                isVerb = true;
                posTag = "ক্রিয়া (Verb)";
            } else if (rawPos === "noun") {
                posTag = "বিশেষ্য (Noun)";
            } else {
                posTag = rawPos;
            }
        }

        // ধাপ ২: ক্রিয়া এবং বিশেষ্যের জন্য আলাদা প্রসঙ্গ (Context) তৈরি করে নিখুঁত বাংলা অর্থ আনা
        let queryToTranslate = rawWord;
        if (!rawWord.includes(" ")) {
            if (isVerb) {
                queryToTranslate = `هو ${rawWord}`; // ক্রিয়াপদের সঠিক রূপের জন্য
            } else if (isDefinitelyNoun) {
                queryToTranslate = `هذه ${rawWord}`; // বিশেষ্য ও বহুবচন চেনানোর জন্য
            }
        }

        const bnUrl = `${baseGoogle}?client=gtx&sl=ar&tl=bn&dt=t&q=${encodeURIComponent(queryToTranslate)}`;
        const bnRes = await fetch(bnUrl);
        const bnData = await bnRes.json();

        let finalBangla = "";
        if (bnData && bnData) {
            bnData.forEach(item => {
                if (item && item) finalBangla += item;
            });
        }

        // বিশেষ্যের শুরুতে প্রসঙ্গ হিসেবে যুক্ত হওয়া 'এই ' বা 'এগুলো ' শব্দটি পরিষ্কার করা
        if (isDefinitelyNoun && finalBangla) {
            finalBangla = finalBangla.replace(/^(এই|এগুলো|এটি|এসব)\s+/g, "");
        }

        if (finalBangla) {
            let outputHTML = `বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">${finalBangla}</span>`;
            if (posTag) {
                outputHTML += `<div style="font-size:14px; color:#555; margin-top:6px;">পদ প্রকরণ: <strong>${posTag}</strong></div>`;
            }
            resultDiv.innerHTML = outputHTML;
            return;
        }
    } catch (e) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
    }
}


