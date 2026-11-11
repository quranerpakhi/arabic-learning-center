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

// ৫. নিজস্ব নিখুঁত শব্দের তালিকা (কুরআনের ও ক্লাসের গুরুত্বপূর্ণ শব্দসমূহ)
const customDictionary = {
    "تلقف": "গিলে ফেলা / লুফে নেওয়া (যেমন: মূসা আ.-এর লাঠি জাদুকরদের সাপগুলো গিলে ফেলেছিল)",
    "تَلْقَفُ": "গিলে ফেলা / লুফে নেওয়া",
    "تَلۡقَفُ": "গিলে ফেলা / লুফে নেওয়া",
    "كتب": "বইসমূহ / অনেক বই (كتاب এর বহুবচন)",
    "كُتُبٌ": "বইসমূহ / অনেক বই (كتاب এর বহুবচন)",
    "كتاب": "একটি বই",
    "كِتَابٌ": "একটি বই",
    "أقلام": "কলমসমূহ (قلم এর বহুবচন)",
    "أبواب": "দরজাসমূহ (باب এর বহুবচন)"
};

// ৬. আরবী থেকে বাংলা অর্থ বের করার মূল ফাংশন
async function searchArabicWord() {
    const rawWord = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!rawWord) return;

    // কুরআনিক বিশেষ চিহ্ন ও হরকত পরিষ্কার করে মূল অক্ষর বের করা (শুধুমাত্র নিজস্ব তালিকায় খোঁজার জন্য)
    const cleanWord = rawWord.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");

    // ১ম ধাপ: প্রথমে আপনার নিজস্ব তালিকায় শব্দটি খুঁজবে
    if (customDictionary[rawWord]) {
        resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${customDictionary[rawWord]}</span>`;
        return;
    }
    if (customDictionary[cleanWord]) {
        resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${customDictionary[cleanWord]}</span>`;
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    // ২য় ধাপ: গুগল ট্রান্সলেটে হরকতসহ আসল শব্দটি (rawWord) পাঠানো হবে, যাতে অর্থ না বদলায়
    try {
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
        const googleUrl = `${baseGoogle}?client=gtx&sl=ar&tl=bn&dt=t&q=${encodeURIComponent(rawWord)}`;
        
        const response = await fetch(googleUrl);
        const data = await response.json();
        
        if (data && data[0]) {
            let translatedText = "";
            data[0].forEach(item => {
                if (item[0]) translatedText += item[0];
            });
            resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${translatedText}</span>`;
            return;
        }
    } catch (e) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অর্থ খুঁজে পাওয়া যায়নি।</span>";
    }
}

