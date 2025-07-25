// تحميل البيانات من ملف JSON
let travelData = null;

document.addEventListener("DOMContentLoaded", function () {
  // تحميل البيانات عند بدء التطبيق
  fetch('travel_recommendation_api.json')
    .then(response => response.json())
    .then(data => {
      travelData = data;
      console.log('تم تحميل البيانات بنجاح:', data);
      // عرض جميع البيانات في البداية
      displayAllData();
    })
    .catch(error => console.error('خطأ في تحميل البيانات:', error));
});

function displayCountries(countries) {
  const container = document.getElementById("countries-container");

  countries.forEach((country) => {
    const countryTitle = document.createElement("h2");
    countryTitle.textContent = country.name;
    container.appendChild(countryTitle);

    country.cities.forEach((city) => {
      const cityDiv = document.createElement("div");
      cityDiv.classList.add("item");

      cityDiv.innerHTML = `
        <h3>${city.name}</h3>
        <img src="${city.imageUrl}" alt="${city.name}" width="200" />
        <p>${city.description}</p>
      `;

      container.appendChild(cityDiv);
    });
  });
}

function displayTemples(temples) {
  const container = document.getElementById("temples-container");

  temples.forEach((temple) => {
    const templeDiv = document.createElement("div");
    templeDiv.classList.add("item");

    templeDiv.innerHTML = `
      <h3>${temple.name}</h3>
      <img src="${temple.imageUrl}" alt="${temple.name}" width="200" />
      <p>${temple.description}</p>
    `;

    container.appendChild(templeDiv);
  });
}

function displayBeaches(beaches) {
  const container = document.getElementById("beaches-container");
  if (!beaches) return;
  
  container.innerHTML = ""; // مسح المحتوى السابق

  beaches.forEach((beach) => {
    const beachDiv = document.createElement("div");
    beachDiv.classList.add("item");

    beachDiv.innerHTML = `
      <h3>${beach.name}</h3>
      <img src="${beach.imageUrl || beach.image}" alt="${beach.name}" width="200" />
      <p>${beach.description}</p>
    `;

    container.appendChild(beachDiv);
  });
}

// دالة عرض جميع البيانات
function displayAllData() {
  if (travelData) {
    displayCountries(travelData.countries);
    displayTemples(travelData.temples);
    displayBeaches(travelData.beaches);
  }
}

// دالة البحث
function performSearch() {
  const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
  const recommendationList = document.getElementById('recommendationList');
  
  if (!searchInput) {
    alert('الرجاء إدخال كلمة مفتاحية للبحث');
    return;
  }

  clearResults();
  let results = [];
  
  // البحث في الشواطئ
  if (searchInput.includes('شاطئ') || searchInput.includes('beach')) {
    results = travelData.beaches || [];
  } 
  // البحث في المعابد
  else if (searchInput.includes('معبد') || searchInput.includes('temple')) {
    results = travelData.temples || [];
  } 
  // البحث في الدول
  else if (searchInput.includes('دولة') || searchInput.includes('country')) {
    results = travelData.countries || [];
  }

  results.forEach(item => {
    const card = createResultCard(item);
    recommendationList.appendChild(card);
  });

  if (results.length === 0) {
    recommendationList.innerHTML = '<p>لم يتم العثور على نتائج</p>';
  }
}

// دالة إنشاء بطاقة نتيجة
function createResultCard(item) {
  const card = document.createElement('div');
  card.classList.add('result-card');
  card.style.cssText = `
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    margin: 10px;
  `;

  const timeDisplay = item.timeZone ? 
    `<p style="margin-top: 10px;">التوقيت المحلي: <span id="time-${item.name}"></span></p>` : '';

  card.innerHTML = `
    <img src="${item.imageUrl || item.image}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover;">
    <div style="padding: 15px;">
      <h3 style="margin: 0 0 10px 0;">${item.name}</h3>
      <p style="margin: 0;">${item.description}</p>
      ${timeDisplay}
    </div>
  `;

  if (item.timeZone) {
    updateLocalTime(item.name, item.timeZone);
    setInterval(() => updateLocalTime(item.name, item.timeZone), 60000);
  }

  return card;
}

// دالة تحديث التوقيت المحلي
function updateLocalTime(locationName, timeZone) {
  const options = {
    timeZone: timeZone,
    hour12: true,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  
  const localTime = new Date().toLocaleTimeString('ar-SA', options);
  const timeElement = document.getElementById(`time-${locationName}`);
  if (timeElement) {
    timeElement.textContent = localTime;
  }
}

// دالة مسح النتائج
function clearResults() {
  const recommendationList = document.getElementById('recommendationList');
  recommendationList.innerHTML = '';
  document.getElementById('searchInput').value = '';
}
