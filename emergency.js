const SCRIPT_URL = ' https://script.google.com/macros/s/AKfycbyGJ0RE64uxIy6eREGPWHEiqn59pqsEdPjszSPVsY1tBU7055sKQgtpjWgxa4d6I4Nusw/exec';

const productGrid = document.getElementById('product-grid');
const openFormBtn = document.getElementById('open-form-btn');
const registerModal = document.getElementById('register-modal');
const closeRegBtn = document.getElementById('close-reg-btn');
const productForm = document.getElementById('product-form');
const resultsCount = document.getElementById('results-count');

const successModal = document.getElementById('success-modal');
const successOkBtn = document.getElementById('success-ok-btn');

const tipsBtn = document.getElementById('tips-btn');
const tipsModal = document.getElementById('tips-modal');
const closeTipsBtn = document.getElementById('close-tips-btn');
const tipsAmountInput = document.getElementById('tips-amount');
const payerNameInput = document.getElementById('payer-name');
const upiPayLink = document.getElementById('upi-pay-link');

const searchBtn = document.getElementById('search-btn');
const areaSearch = document.getElementById('area-search');
const productFilter = document.getElementById('product-filter');
const chips = document.querySelectorAll('.chip');

// UPI Settings
const MY_UPI_ID = "8939717405@ybl";
const MERCHANT_NAME = "Namma Ooru 360"; 

let dataList = [];
let currentFilter = 'all';

// 2. கூகுள் ஷீட்டில் இருந்து தகவல்களை எடுத்தல்
async function loadDataFromSheet() {
    productGrid.innerHTML = `
        <div style="text-align:center; padding:40px; grid-column: 1/-1; color:#cda12c;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:28px; margin-bottom:10px;"></i>
            <p>விபரங்கள் லோடு ஆகிறது...</p>
        </div>`;
        
    try {
        const response = await fetch(SCRIPT_URL, { method: "GET" });
        dataList = await response.json();
        
        if (dataList.error) {
            console.error("Apps Script Error:", dataList.error);
            productGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>Apps Script பிழை ஏற்பட்டுள்ளது!</p></div>';
        } else {
            handleSearch(); 
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        productGrid.innerHTML = '<div style="text-align:center; padding:40px; grid-column: 1/-1; color:red;"><p>டேட்டா லோடு செய்வதில் பிழை ஏற்பட்டுள்ளது!</p></div>';
    }
}

// 3. கார்டுகளை உருவாக்குதல்
function renderCards(dataToRender = dataList) {
    productGrid.innerHTML = '';
    if (!Array.isArray(dataToRender)) return;
    
    resultsCount.textContent = `${dataToRender.length} பதிவுகள் உள்ளன`;

    if(dataToRender.length === 0) {
        productGrid.innerHTML = `
            <div style="text-align:center; padding:40px; color:#6B7280; grid-column: 1/-1;">
                <i class="fa-solid fa-folder-open" style="font-size:36px; margin-bottom:10px; color:#cbd5e1;"></i>
                <p>தற்சமயம் பதிவுகள் எதுவும் இல்லை!</p>
            </div>`;
        return;
    }

    dataToRender.forEach(item => {
        const card = document.createElement('div');
        card.className = 'expert-card';

        const title     = item.shopName  || item["shopName"]  || Object.values(item)[1] || "தலைப்பு இல்லை";
        const subTitle  = item.name      || item["name"]      || Object.values(item)[2] || "விபரம் இல்லை";
        const phone     = item.phone     || item["phone"]     || Object.values(item)[3] || "";
        const type      = item.type      || item["type"]      || Object.values(item)[4] || "cat1";
        const extraInfo = item.delivery  || item["delivery"]  || Object.values(item)[5] || "";
        const location  = item.location  || item["location"]  || Object.values(item)[6] || "இடம் இல்லை";

        let iconHtml = '<i class="fa-solid fa-truck-medical"></i>'; 
        let typeBadge = 'ஆம்புலன்ஸ்';
        
        if(type.toString().toLowerCase() === 'cat2') { iconHtml = '<i class="fa-solid fa-hospital"></i>'; typeBadge = 'மருத்துவமனை'; }
        if(type.toString().toLowerCase() === 'cat3') { iconHtml = '<i class="fa-solid fa-shield-halved"></i>'; typeBadge = 'போலீஸ்'; }
        if(type.toString().toLowerCase() === 'cat4') { iconHtml = '<i class="fa-solid fa-clock-medical"></i>'; typeBadge = '24H மெடிக்கல்'; }

        card.innerHTML = `
            <div class="card-left">
                <div class="avatar-container">${iconHtml}</div>
                <div class="expert-info">
                    <h4>${title} <span class="badge">${typeBadge}</span></h4>
                    <p class="shop-title"><i class="fa-solid fa-circle-info"></i> ${subTitle}</p>
                    <p class="delivery-tag"><i class="fa-solid fa-circle-nodes"></i> ${extraInfo}</p>
                    <p class="expert-loc"><i class="fa-solid fa-location-dot"></i> ${location}</p>
                </div>
            </div>
            <div class="card-right-actions">
                ${phone ? `<a href="tel:${phone}" class="call-btn-link" title="அழைக்க"><i class="fa-solid fa-phone"></i></a>` : ''}
                ${phone ? `<a href="https://wa.me/91${phone}?text=வணக்கம், உங்களின் ${title} பதிவு குறித்து விபரம் அறிய தொடர்புகொள்கிறேன்." target="_blank" class="wa-btn-link" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>` : ''}
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// 4. தேடுதல் மற்றும் ஃபில்டர் செயலாக்கம்
function handleSearch() {
    const searchText = areaSearch.value.toLowerCase().trim();
    
    const filtered = dataList.filter(item => {
        const itemType = (item.type || item["type"] || Object.values(item)[4] || "cat1").toString().toLowerCase();
        const itemLoc = (item.location || item["location"] || Object.values(item)[6] || "").toString().toLowerCase();
        const itemTitle = (item.shopName || item["shopName"] || Object.values(item)[1] || "").toString().toLowerCase();
        const itemSub = (item.name || item["name"] || Object.values(item)[2] || "").toString().toLowerCase();

        const matchesType = (currentFilter === 'all' || itemType === currentFilter);
        const matchesSearch = (itemLoc.includes(searchText) || itemTitle.includes(searchText) || itemSub.includes(searchText));

        return matchesType && matchesSearch;
    });

    renderCards(filtered);
}

function updateUpiLink() {
    const amount = tipsAmountInput.value || 100;
    const name = payerNameInput.value.trim() || "Web Donor";
    const note = encodeURIComponent(`Support from ${name}`);
    upiPayLink.href = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${note}`;
}

// 5. Events லிசனர்கள்
searchBtn.addEventListener('click', handleSearch);
productFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    chips.forEach(c => {
        if(c.getAttribute('data-filter') === currentFilter) c.classList.add('active');
        else c.classList.remove('active');
    });
    handleSearch();
});

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter');
        productFilter.value = currentFilter;
        handleSearch();
    });
});

openFormBtn.addEventListener('click', () => registerModal.style.display = 'flex');
closeRegBtn.addEventListener('click', () => registerModal.style.display = 'none');
tipsBtn.addEventListener('click', () => { tipsModal.style.display = 'flex'; updateUpiLink(); });
closeTipsBtn.addEventListener('click', () => tipsModal.style.display = 'none');
successOkBtn.addEventListener('click', () => successModal.style.display = 'none');

tipsAmountInput.addEventListener('input', updateUpiLink);
payerNameInput.addEventListener('input', updateUpiLink);

window.addEventListener('click', (e) => {
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === tipsModal) tipsModal.style.display = 'none';
});

// 6. ஃபார்ம் சப்மிட் செய்யும் போது கூகுள் ஷீட்டுக்கு அனுப்புதல்
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = productForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> பதிவாகிறது...`;

    const formData = {
        shopName: document.getElementById('shop-name').value, 
        name: document.getElementById('owner-name').value,     
        phone: document.getElementById('phone').value,         
        type: document.getElementById('prod-type').value,       
        delivery: document.getElementById('delivery-info').value,
        location: document.getElementById('location').value    
    };

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        registerModal.style.display = 'none';
        productForm.reset();
        successModal.style.display = 'flex';
        loadDataFromSheet();
    } catch (error) {
        console.error("Error:", error);
        alert("பதிவு செய்வதில் தோல்வி!");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

document.addEventListener('DOMContentLoaded', loadDataFromSheet);
