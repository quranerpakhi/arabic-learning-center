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
    } else {
        dictSection.style.display = 'none';
    }
}

// আরবী থেকে বাংলা অর্থ বের করার ফাংশন
function searchArabicWord() {
    const word = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!word) {
        resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অনুগ্রহ করে একটি আরবী শব্দ লিখুন!</span>";
        return;
    }

    resultDiv.innerHTML = "<span style='color:#666; font-size:16px;'>অর্থ খোঁজা হচ্ছে...</span>";

    // ফ্রি এপিআই এর মাধ্যমে আরবী থেকে বাংলায় অনুবাদ
    const apiUrl = `https://translated.net{encodeURIComponent(word)}&langpair=ar|bn`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.responseData && data.responseData.translatedText) {
                resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${data.responseData.translatedText}</span>`;
            } else {
                resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>দুঃখিত, এই শব্দটির অর্থ খুঁজে পাওয়া যায়নি।</span>";
            }
        })
        .catch(() => {
            resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।</span>";
        });
}

