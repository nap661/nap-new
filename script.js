// --- Sessions ---
const SESSIONS = [
  { id:'plym-ct-2026-02-20', title:'Community Training – Plymouth',      date:'20 Feb 2026', location:'Stonehouse', tags:['Community','Free','In‑person'] },
  { id:'dev-p2p-2026-03-05', title:'P2P Training – Devonport',           date:'05 Mar 2026', location:'Devonport',  tags:['P2P','Free','In‑person'] },
  { id:'org-2026-03-12',     title:'Organisational Training – Plymouth', date:'12 Mar 2026', location:'Plymouth',   tags:['Workforce','Free','On‑site'] }
];

// DOM
const sessionsWrap = document.getElementById('sessions');
const cartDrawer   = document.getElementById('cartDrawer');
const cartItems    = document.getElementById('cartItems');
const cartCount    = document.getElementById('cartCount');
const openCart     = document.getElementById('openCart');
const closeCart    = document.getElementById('closeCart');
const toCheckout   = document.getElementById('toCheckout');
const summaryList  = document.getElementById('summaryList');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutMsg  = document.getElementById('checkoutMsg');

let cart = [];

// Render sessions
function renderSessions(){
  if (!sessionsWrap) return;
  sessionsWrap.innerHTML = SESSIONS.map(s => `
    <div class="card">
      <div class="title">${s.title}</div>
      <div class="meta">${s.date} • ${s.location}</div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn pink" onclick="addToCart('${s.id}')">Add to Cart</button>
        #checkoutBook Direct</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id){
  const s = SESSIONS.find(x => x.id === id);
  if (!s) return;
  if (!cart.find(x => x.id === id)) cart.push(s);
  renderCart();
}
function removeFromCart(id){
  cart = cart.filter(x => x.id !== id);
  renderCart();
}
function renderCart(){
  if (cartCount) cartCount.textContent = cart.length;
  if (cartItems){
    cartItems.innerHTML = cart.map(s => `
      <div class="cart-item">
        <div><strong>${s.title}</strong><div class="meta">${s.date} • ${s.location}</div></div>
        <button class="rm" onclick="removeFromCart('${s.id}')">Remove</button>
      </div>
    `).join('');
  }
}

// Drawer controls
if (openCart)  openCart.addEventListener('click', () => cartDrawer.classList.add('open'));
if (closeCart) closeCart.addEventListener('click', () => cartDrawer.classList.remove('open'));
if (toCheckout) toCheckout.addEventListener('click', () => {
  cartDrawer.classList.remove('open');
  document.querySelector('#checkout')?.scrollIntoView({behavior:'smooth'});
  if (summaryList) summaryList.innerHTML = cart.map(s => `<li>${s.title} — ${s.date} (${s.location})</li>`).join('');
});

// Submit → Google Sheets (ENDPOINT is defined in index.html)
if (checkoutForm){
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!cart.length){
      checkoutMsg.style.color='crimson';
      checkoutMsg.textContent='Your cart is empty. Add a session first.';
      return;
    }
    checkoutMsg.style.color='#0f1324';
    checkoutMsg.textContent='Sending booking…';

    const form = new FormData(checkoutForm);
    const payload = {
      name:  form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      notes: form.get('notes'),
      items: cart
    };

    try {
      const res  = await fetch(ENDPOINT, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload), mode:'cors'
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || `Booking failed (HTTP ${res.status})`);
      checkoutMsg.style.color='green';
      checkoutMsg.textContent='Booking received! Thank you.';
      cart=[]; renderCart(); checkoutForm.reset();
    } catch(err){
      checkoutMsg.style.color='crimson';
      checkoutMsg.textContent='Sorry—booking failed: ' + (err?.message || err);
    }
  });
}

// Init
renderSessions();
renderCart();

// Expose for inline handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
