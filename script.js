/* ==========================================================================
   1. CONTROLE DE NAVEGAÇÃO E SPLASH PAGE
   ========================================================================== */

// ENTRAR NO SITE A PARTIR DA SPLASH PAGE
function enterSite(param1, param2) {
  let event = (param1 && param1.preventDefault) ? param1 : ((param2 && param2.preventDefault) ? param2 : null);
  let sectionId = (typeof param1 === 'string') ? param1 : param2;

  if (event) event.preventDefault();

  const splash = document.getElementById('splash-screen') || document.querySelector('.splash-screen');
  const mainSite = document.getElementById('main-site') || document.querySelector('.content');

  if (splash) {
    splash.style.transition = 'opacity 0.4s ease, visibility 0.4s ease';
    splash.style.opacity = '0';
    splash.style.visibility = 'hidden';

    setTimeout(() => {
      splash.classList.add('hidden');
      if (mainSite) mainSite.classList.remove('hidden');
      if (sectionId) switchSection(sectionId);
    }, 400);
  } else if (sectionId) {
    switchSection(sectionId);
  }
}

// VOLTAR PARA A SPLASH PAGE (INÍCIO)
function showSplash(param1, param2) {
  let event = (param1 && param1.preventDefault) ? param1 : ((param2 && param2.preventDefault) ? param2 : null);
  if (event) event.preventDefault();

  const splash = document.getElementById('splash-screen') || document.querySelector('.splash-screen');
  const mainSite = document.getElementById('main-site') || document.querySelector('.content');

  if (splash) {
    splash.classList.remove('hidden');
    splash.style.transition = 'opacity 0.4s ease, visibility 0.4s ease';
    
    requestAnimationFrame(() => {
      splash.style.opacity = '1';
      splash.style.visibility = 'visible';
    });
  }

  if (mainSite) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active-section'));
  }
}

// MUDAR DE SEÇÃO (JEONGYEON vs TWICE)
function switchSection(sectionId, event) {
  if (event && event.preventDefault) event.preventDefault();

  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active-section');
  });

  document.querySelectorAll('.btn-top, .nav-btn').forEach(btn => {
    btn.classList.remove('active-tab');
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('active-section');
    void targetSection.offsetWidth;
    targetSection.classList.add('active-section');
  }

  const activeNav = document.getElementById('nav-' + sectionId) || 
                    document.querySelector(`[onclick*="${sectionId}"]`);
  if (activeNav) {
    activeNav.classList.add('active-tab');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ==========================================================================
   2. FILTRAGEM DE CARDS (PHOTOCARDS)
   ========================================================================== */

function filterCards(category, event) {
  if (event) event.preventDefault();

  const buttons = document.querySelectorAll('.hashtags-filter .tag-btn, .filters .filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  if (event && (event.currentTarget || event.target)) {
    const clickedBtn = event.currentTarget || event.target;
    clickedBtn.classList.add('active');
  }

  const cards = document.querySelectorAll('.photocard-grid .card');

  cards.forEach(card => {
    const status = card.getAttribute('data-status');
    const isCategory = (category === 'all') || 
                       (status === category) || 
                       (card.classList.contains(category));

    if (isCategory) {
      card.style.display = '';
      card.classList.remove('animate-card');
      void card.offsetWidth;
      card.classList.add('animate-card');
    } else {
      card.style.display = 'none';
      card.classList.remove('animate-card');
    }
  });
}


/* ==========================================================================
   3. MODAL DE ZOOM E NAVEGAÇÃO POR TECLADO / SETAS (COM FADE SUAVE)
   ========================================================================== */

const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-img');
const captionText = document.getElementById('modal-caption');

let currentZoomCard = null;

document.addEventListener('click', function (e) {
  if (e.target && e.target.classList.contains('zoomable-img')) {
    if (modal && modalImg) {
      modal.style.display = 'block';
      
      const wrapper = e.target.closest('.merch-img-wrapper');
      if (wrapper) {
        const activeImg = wrapper.querySelector('img.active') || wrapper.querySelector('img');
        modalImg.src = activeImg ? activeImg.src : e.target.src;
      } else {
        modalImg.src = e.target.src;
      }

      currentZoomCard = e.target.closest('.card') || e.target.closest('.merch-img-wrapper').closest('.merch-card');
      updateModalCaption();
    }
  }
});

function updateModalCaption() {
  if (!currentZoomCard) {
    if (captionText) captionText.innerText = '';
    return;
  }

  const era = currentZoomCard.getAttribute('data-era') || '';   
  const name = currentZoomCard.getAttribute('data-name') || ''; 

  let caption = '';
  if (name && name !== 'undefined') caption += name;
  if (era && era !== 'undefined') caption += (caption ? ' - ' : '') + era;

  if (captionText) captionText.innerText = caption;
}

function closeModal() {
  if (modal) modal.style.display = 'none';
  currentZoomCard = null;
}

// Atalhos de teclado com transição suave (fade) e troca segura de imagens
document.addEventListener('keydown', function (e) {
  if (!modal || modal.style.display === 'none' || modal.style.display === '') return;

  if (e.key === 'Escape') {
    closeModal();
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    if (!currentZoomCard) return;

    const wrapper = currentZoomCard.querySelector('.merch-img-wrapper');
    if (!wrapper) return; 

    const img1 = wrapper.querySelector('.merch-img-1');
    const img2 = wrapper.querySelector('.merch-img-2');

    if (!img1 || !img2) return;

    modalImg.style.opacity = '0';

    setTimeout(() => {
      // Compara os caminhos finais para evitar problemas com URLs absolutas/relativas
      const isImg1Active = modalImg.src === img1.src || modalImg.src.endsWith(img1.getAttribute('src'));
      
      if (isImg1Active) {
        modalImg.src = img2.src;
      } else {
        modalImg.src = img1.src;
      }
      modalImg.style.opacity = '1';
    }, 200);
  }
});


/* ==========================================================================
   4. CARROSSEL DE IMAGENS (MERCH / GOODS - DUPLA CAMADA SUAVE)
   ========================================================================== */

function changeMerchImg(btn, direction, event) {
  if (event) event.stopPropagation();

  const wrapper = btn.closest('.merch-img-wrapper');
  const img1 = wrapper.querySelector('.merch-img-1');
  const img2 = wrapper.querySelector('.merch-img-2');

  if (!img1 || !img2) return;

  if (img1.classList.contains('active')) {
    img1.classList.remove('active');
    img2.classList.add('active');
  } else {
    img2.classList.remove('active');
    img1.classList.add('active');
  }
}


/* ==========================================================================
   5. SEGURANÇA E PREVENÇÕES GLOBAIS
   ========================================================================== */

document.addEventListener('contextmenu', function (e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

document.addEventListener('dragstart', function (e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});


/* ==========================================================================
   FUNÇÃO AUXILIAR PARA LER CSV DE FORMA SEGURA (EVITA ERRO COM VÍRGULAS)
   ========================================================================== */
function parseCSVLine(text) {
  let result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}


/* ==========================================================================
   CARREGAR DADOS DO GOOGLE SHEETS AUTOMATICAMENTE
   ========================================================================== */

// 1. CARREGAR PHOTOCARDS
async function loadPhotocards() {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZthiWwjh1KrW-adEfQTZIjEJDKk3GiwAsOg-y7ZiurJV3HbKL78utSiFYgms1WexfZO36ZQu7zoUD/pub?gid=0&single=true&output=csv';

  try {
    const response = await fetch(csvUrl);
    const data = await response.text();
    
    const rows = data.split('\n').slice(1);
    const grid = document.querySelector('.photocard-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    rows.forEach(row => {
      if (!row.trim()) return;
      const cols = parseCSVLine(row);
      const [id, name, tag, status, image] = cols;

      if (!id || !image) return;

      let badgeHtml = '';
      if (status === 'otw') {
        badgeHtml = '<div class="badge-otw"></div>';
      } else if (status === 'prio') {
        badgeHtml = '<div class="badge-prio"></div>';
      }

      const cardHTML = `
        <div class="card ${status}" data-status="${status}" data-name="${name}" data-tag="${tag}">
          <div class="card-img-wrapper">
            <img src="${image}" alt="${name}" class="zoomable-img" loading="lazy">
          </div>
          ${badgeHtml}
        </div>
      `;
      grid.insertAdjacentHTML('beforeend', cardHTML);
    });
  } catch (error) {
    console.error('Erro ao carregar photocards:', error);
  }
}

// 2. CARREGAR TWICE GOODS
async function loadTwiceGoods() {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZthiWwjh1KrW-adEfQTZIjEJDKk3GiwAsOg-y7ZiurJV3HbKL78utSiFYgms1WexfZO36ZQu7zoUD/pub?gid=1130988325&single=true&output=csv';

  try {
    const response = await fetch(csvUrl);
    const data = await response.text();
    
    const rows = data.split('\n').slice(1);
    const grid = document.querySelector('.merch-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    rows.forEach(row => {
      if (!row.trim()) return;
      const cols = parseCSVLine(row);
      
      const [id, title, desc, date, img1, img2] = cols;

      if (!id || !img1) return;

      let wrapperDataAttrs = `data-img1="${img1}"`;
      let carouselBtnHTML = '';
      let imagesHTML = `<img src="${img1}" alt="${title}" class="zoomable-img merch-img-1 active" loading="lazy">`;

      if (img2 && img2 !== '' && img2 !== 'undefined') {
        wrapperDataAttrs += ` data-img2="${img2}"`;
        carouselBtnHTML = `
          <button type="button" class="carousel-btn prev" onclick="changeMerchImg(this, -1, event)">&lt;</button>
          <button type="button" class="carousel-btn next" onclick="changeMerchImg(this, 1, event)">&gt;</button>
        `;
        imagesHTML += `<img src="${img2}" alt="${title}" class="zoomable-img merch-img-2" loading="lazy">`;
      }

      const merchHTML = `
        <div class="merch-card" data-name="${title}" data-era="${desc}" data-tag="${date}">
          <div class="merch-img-wrapper" ${wrapperDataAttrs}>
            ${carouselBtnHTML}
            ${imagesHTML}
          </div>
          <div class="merch-info">
            <span class="era">${desc || ''}</span>
            <h3 class="merch-title">${title}</h3>
            <span class="card-date">${date || ''}</span>
          </div>
        </div>
      `;
      grid.insertAdjacentHTML('beforeend', merchHTML);
    });
  } catch (error) {
    console.error('Erro ao carregar twice goods:', error);
  }
}

// Executa as funções assim que o site abrir
document.addEventListener('DOMContentLoaded', () => {
  loadPhotocards();
  loadTwiceGoods();
});