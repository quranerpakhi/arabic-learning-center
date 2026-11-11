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
function searchArabicWord() {
    const word = document.getElementById('arabic-input').value.trim();
    const resultDiv = document.getElementById('dict-result');
    
    if (!word) return;

    // গুগল ট্রান্সলেটের ফ্রি ও আনলিমিটেড এপিআই লিংক
    const apiUrl = `https://googleapis.com{encodeURIComponent(word)}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data[0] && data[0][0] && data[0][0][0]) {
                const translatedWord = data[0][0][0];
                resultDiv.innerHTML = `বাংলা অর্থ: <span style="color:#d35400;">${translatedWord}</span>`;
            } else {
                resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>দুঃখিত, অর্থ খুঁজে পাওয়া যায়নি।</span>";
            }
        })
        .catch(() => {
            resultDiv.innerHTML = "<span style='color:red; font-size:16px;'>অনুবাদ করতে সমস্যা হচ্ছে, আবার চেষ্টা করুন।</span>";
        });
}



