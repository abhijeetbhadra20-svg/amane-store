const cartBadge=document.getElementById('cartBadge');
const wishBadge=document.getElementById('wishBadge');
const toast=document.getElementById('toast');
let cart=0,wishes=0;
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>toast.classList.remove('show'),1800)}

document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>{cart++;cartBadge.textContent=cart;showToast('Added to bag ✓')}));
document.querySelectorAll('[data-wish]').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');wishes += btn.classList.contains('active')?1:-1;wishBadge.textContent=wishes;showToast(btn.classList.contains('active')?'Added to wishlist ♡':'Removed from wishlist')}));

document.getElementById('subscribeForm').addEventListener('submit',e=>{e.preventDefault();showToast('Thanks! Your 10% welcome offer is reserved.');e.target.reset()});

const search=document.getElementById('searchInput');
const products=[...document.querySelectorAll('.product')];
search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();let visible=0;products.forEach(p=>{const ok=p.dataset.name.includes(q);p.hidden=!ok;if(ok)visible++});document.getElementById('noResults').hidden=visible!==0});

document.getElementById('menuBtn').addEventListener('click',()=>showToast('Menu can be connected to your categories later.'));

document.querySelectorAll('.slider-arrow').forEach(btn=>btn.addEventListener('click',()=>showToast('Hero slider is ready for your future banners.')));

// Image replacement helper: drop your files into /assets using the names in index.html.
document.querySelectorAll('[data-image]').forEach(el=>{const src=el.dataset.image;const img=new Image();img.onload=()=>{el.style.backgroundImage=`url("${src}")`;el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.querySelectorAll('span,.image-hint').forEach(x=>x.style.display='none')};img.src=src});
