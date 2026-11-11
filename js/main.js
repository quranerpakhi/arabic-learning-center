// ওয়েবসাইট লোড হওয়ার সাথে সাথে JSON থেকে ডাটা রিড করবে
document.addEventListener("DOMContentLoaded", function() {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            window.allData = data; // ডাটা গ্লোবালি সেভ রাখা হলো
            
            // হোয়াটসঅ্যাপ এবং গুগল মিট লিংক অটো আপডেট
            document.getElementById('whatsapp-btn').href = data.live_classes.whatsapp_link;
            document.getElementById('meet-btn').href = data.live_classes.google_meet_link;
            
            // শুরুতে রেগুলার নোটগুলো দেখানো হবে
            filterNotes('regular');
        });
});

// বাটন ক্লিকে রেগুলার বা এক্সট্রা নোট ফিল্টার করার ফাংশন
function filterNotes(type) {
    const container = document.getElementById('notes-container');
    const title = document.getElementById('section-title');
    container.innerHTML = ""; // আগের বক্সগুলো মুছে ফেলা
    
    let notes = [];
    if(type === 'regular') {
        title.innerText = "রেগুলার ক্লাস নোটসমূহ";
        notes = window.allData.regular_notes;
    } else {
        title.innerText = "অতিরিক্ত (Extra) ক্লাস নোটসমূহ";
        notes = window.allData.extra_notes;
    }
    
    // লুপ চালিয়ে বক্স বা কার্ড তৈরি করা (Nexaverse স্টাইলে)
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

// নেটলিফাই আইফ্রেম ধরে সরাসরি ডিলিট করার আসল স্ক্রিপ্ট
function destroyNetlifyIframe() {
    const nlIframes = document.querySelectorAll('iframe[data-nl-ready], iframe[style*="2147483645"]');
    nlIframes.forEach(iframe => {
        iframe.remove();
    });
}

document.addEventListener("DOMContentLoaded", destroyNetlifyIframe);
window.addEventListener("load", destroyNetlifyIframe);
setInterval(destroyNetlifyBadge, 500); // ব্যাকআপ
setInterval(destroyNetlifyIframe, 500);

// ডিকশনারি বক্স খোলা এবং বন্ধ করার ফাংশন
function toggleDictionary() {
    const dictSection = document.getElementById('dictionary-section');
    if (dictSection.style.display === 'none') {
        dictSection.style.display = 'block';
        document.getElementById('arabic-input').focus(); // বক্স খোলার সাথে সাথে কার্সর চলে যাবে
    } else {
        dictSection.style.display = 'none';
    }
}

let typingTimer; // টাইপিং ট্র্যাক করার জন্য টাইমার

// টাইপ করার সাথে সাথে অটো কাজ করার ফাংশন
function autoSearchArabic() {
    clearTimeout(typingTimer); // ইউজার টাইপ করতে থাকলে আগের রিকোয়েস্ট বাতিল করবে
    const word = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');

    if (!word) {
        resultDiv.innerHTML = ""; // বক্স খালি করলে আগের অর্থ মুছে যাবে
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    // টাইপ করা থামানোর ঠিক ৫০০ মিলিসেকেন্ড (আধা সেকেন্ড) পর অটোমেটিক অর্থ খুঁজবে
    typingTimer = setTimeout(() => {
        searchArabicWord();
    }, 500);
}

// আরবী থেকে বাংলা অর্থ বের করার মূল ফাংশন
async function searchArabicWord() {
    const word = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!word) return;

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    // নিজস্ব নিখুঁত শব্দের তালিকা (হরকত ছাড়া ও হরকতসহ উভয়ই লিখতে পারেন)
const customDictionary = {
    "كتب": "বইসমূহ / অনেক বই (كتاب এর বহুবচন)",
    "كُتُبٌ": "বইসমূহ / অনেক বই (كتاب এর বহুবচন)",
    "كتاب": "একটি বই",
    "كِتَابٌ": "একটি বই",
    "أقلام": "কলমসমূহ (قلم এর বহুবচন)",
    "أَقْلَامٌ": "কলমসমূহ (قلم এর বহুবচন)",
    "أبواب": "দরজাসমূহ (باب এর বহুবচন)"
};

async function searchArabicWord() {
    const rawWord = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!rawWord) return;

    // আরবী হরকত (যের, যবর, পেশ, তানভীন) পরিষ্কার করার কোড
    const cleanWord = rawWord.replace(/[\u064B-\u065F\u0670]/g, "");

    // ১ম ধাপ: প্রথমে আপনার নিজস্ব তালিকায় শব্দটি খুঁজবে
    if (customDictionary[rawWord] || customDictionary[cleanWord]) {
        const exactMeaning = customDictionary[rawWord] || customDictionary[cleanWord];
        resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${exactMeaning}</span>`;
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    // ২য় ধাপ: তালিকায় না থাকলে গুগল ট্রান্সলেট থেকে আনবে (হরকত ছাড়া মূল শব্দ দিয়ে)
    try {
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
        const googleUrl = `${baseGoogle}?client=gtx&sl=ar&tl=bn&dt=t&q=${encodeURIComponent(cleanWord)}`;
        
        const response = await fetch(googleUrl);
        const data = await response.json();
        
        if (data && data[0] && data[0][0] && data[0][0][0]) {
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

    // ১ম চেষ্টা: গুগল ট্রান্সলেট সার্ভার (সবচেয়ে দ্রুত ও নিখুঁত)
    try {
        const baseGoogle = ["https:/", "translate." + "googleapis.com", "translate_a", "single"].join("/");
        const googleUrl = `${baseGoogle}?client=gtx&sl=ar&tl=bn&dt=t&q=${encodeURIComponent(word)}`;
        const response = await fetch(googleUrl);
        const data = await response.json();
        
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            let translatedText = "";
            data[0].forEach(item => {
                if (item[0]) translatedText += item[0];
            });
            resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${translatedText}</span>`;
            return;
        }
    } catch (e) {
        console.log("Google API failed, trying backup...");
    }

    // ২য় চেষ্টা (ব্যাকআপ): মাই-মেমোরি সার্ভার
    try {
        const baseMm = ["https:/", "api.mymemory." + "translated.net", "get"].join("/");
        const mmUrl = `${baseMm}?q=${encodeURIComponent(word)}&langpair=ar|bn`;
        const mmRes = await fetch(mmUrl);
        const mmData = await mmRes.json();

        if (mmData && mmData.responseData && mmData.responseData.translatedText) {
            resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${mmData.responseData.translatedText}</span>`;
            return;
        }
    } catch (err) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>দুঃখিত, এই মুহূর্তে অনুবাদ সার্ভার কাজ করছে না।</span>";
    }
}




