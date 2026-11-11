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

    // বিশেষ তালিকায় থাকলে সেটি আগে দেখাবে
    if (customDictionary[rawWord]) {
        resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${customDictionary[rawWord]}</span>`;
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>সঠিক ব্যাকরণগত অর্থ খোঁজা হচ্ছে...</span>";

    try {
        // গুগল ডিকশনারি ইঞ্জিন (dt=t এর সাথে dt=bd যুক্ত করা হয়েছে যাতে একবচন, বহুবচন ও ক্রিয়ার সব অর্থ আসে)
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
        const googleUrl = `${baseGoogle}?client=gtx&sl=ar&tl=bn&dt=t&dt=bd&q=${encodeURIComponent(rawWord)}`;
        
        const response = await fetch(googleUrl);
        const data = await response.json();
        
        let mainMeaning = "";
        let extraMeanings = [];

        // মূল অর্থ সংগ্রহ করা
        if (data && data[0]) {
            data[0].forEach(item => {
                if (item[0]) mainMeaning += item[0];
            });
        }

        // ডিকশনারির বিস্তারিত অর্থ ও ক্রিয়ার রূপ (Noun, Verb, Plural ইত্যাদি) সংগ্রহ করা
        if (data && data[1]) {
            data[1].forEach(category => {
                const partOfSpeech = category[0]; // যেমন: verb, noun
                const wordsList = category[1];    // সমার্থক ও নিখুঁত অর্থের তালিকা
                if (wordsList && wordsList.length > 0) {
                    const topWords = wordsList.slice(0, 4).join(", ");
                    let banglaPos = partOfSpeech === "verb" ? "ক্রিয়া" : (partOfSpeech === "noun" ? "বিশেষ্য" : partOfSpeech);
                    extraMeanings.push(`<div style="font-size:15px; color:#2c3e50; margin-top:6px;"><strong>[${banglaPos}]:</strong> ${topWords}</div>`);
                }
            });
        }

        if (mainMeaning) {
            let finalHTML = `বাংলা অর্থ: <span style="color:#d35400; font-size:22px;">${mainMeaning}</span>`;
            
            // যদি অতিরিক্ত ব্যাকরণগত অর্থ পাওয়া যায় তবে সেগুলোও নিচে দেখাবে
            if (extraMeanings.length > 0) {
                finalHTML += `<div style="margin-top:10px; padding-top:8px; border-top:1px solid #eee; text-align:center;">${extraMeanings.join("")}</div>`;
            }
            
            resultDiv.innerHTML = finalHTML;
            return;
        }
    } catch (e) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন।</span>";
    }
}


