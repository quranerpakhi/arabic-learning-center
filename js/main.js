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

// নেটলিফাই বাটন চিরতরে ধ্বংস করার ডাইনামিক স্ক্রিপ্ট
function destroyNetlifyBadge() {
    // সম্ভাব্য সব উপায়ে নেটলিফাই এলিমেন্ট খুঁজে বের করা
    const selectors = [
        '#netlify-badge',
        '.netlify-badge',
        'iframe[src*="netlify"]',
        '[id*="netlify"]',
        '[class*="netlify"]'
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.remove(); // সরাসরি ওয়েবসাইট থেকে ডিভ বা বাটনটি ডিলিট করে দেওয়া
        });
    });
}

// পেজ লোড হওয়ার সাথে সাথে এবং প্রতি ১ সেকেন্ড পর পর এটি ব্যাকগ্রাউন্ডে চেক করবে
document.addEventListener("DOMContentLoaded", destroyNetlifyBadge);
window.addEventListener("load", destroyNetlifyBadge);
setInterval(destroyNetlifyBadge, 1000); // ১ সেকেন্ড পর পর বাটনটি আসলে তা মুছে দেবে
