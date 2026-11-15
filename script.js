const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
menuButton.addEventListener('click', () => { const open = mobileNav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.textContent = open ? '×' : '☰'; });
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', () => { mobileNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.textContent = '☰'; }));

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => { if (isIntersecting) target.classList.add('visible'); else if (!reducedMotion) target.classList.remove('visible'); }), { threshold: .13 });
document.querySelectorAll('.reveal').forEach(item => reveals.observe(item));

const hero = document.querySelector('.hero');
const canvas = document.querySelector('#starfield');
const ctx = canvas.getContext('2d');
let stars = [], viewWidth = 0, viewHeight = 0, scale = 1, pointer = { x: -9999, y: -9999, active: false }, animationFrame, lastTime = 0;

function makeStar() {
  const layer = Math.random();
  return { x: Math.random() * viewWidth, y: Math.random() * viewHeight, vx: (Math.random() - .5) * (.08 + layer * .18), vy: (Math.random() - .5) * (.08 + layer * .18), drift: Math.random() * Math.PI * 2, driftSpeed: .00025 + Math.random() * .00055, size: .35 + layer * 1.45, alpha: .18 + layer * .7, trail: Math.random() > .71 };
}
function resizeStarfield() {
  scale = Math.min(devicePixelRatio || 1, 2); viewWidth = canvas.clientWidth; viewHeight = canvas.clientHeight;
  canvas.width = Math.floor(viewWidth * scale); canvas.height = Math.floor(viewHeight * scale); ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const amount = innerWidth < 700 ? 70 : Math.min(210, Math.max(130, Math.round(viewWidth * viewHeight / 6200)));
  stars = Array.from({ length: amount }, makeStar);
}
function renderStarfield(time) {
  const dt = Math.min(32, time - lastTime || 16); lastTime = time; ctx.clearRect(0, 0, viewWidth, viewHeight);
  stars.forEach(star => {
    star.drift += star.driftSpeed * dt;
    let dx = pointer.x - star.x, dy = pointer.y - star.y, distance = Math.hypot(dx, dy);
    if (pointer.active && distance < 180) { const pull = (1 - distance / 180) * .016; star.vx += (dx / Math.max(distance, 1)) * pull * dt; star.vy += (dy / Math.max(distance, 1)) * pull * dt; }
    star.vx += Math.cos(star.drift) * .002; star.vy += Math.sin(star.drift * .8) * .002;
    star.vx *= .992; star.vy *= .992; const oldX = star.x, oldY = star.y;
    star.x += star.vx * dt * .06; star.y += star.vy * dt * .06;
    if (star.x < -12) star.x = viewWidth + 12; if (star.x > viewWidth + 12) star.x = -12; if (star.y < -12) star.y = viewHeight + 12; if (star.y > viewHeight + 12) star.y = -12;
    if (star.trail) { ctx.beginPath(); ctx.strokeStyle = `rgba(245,245,245,${star.alpha * .25})`; ctx.lineWidth = Math.max(.35, star.size * .5); ctx.moveTo(oldX, oldY); ctx.lineTo(star.x, star.y); ctx.stroke(); }
    ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${star.alpha})`; ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fill();
  }); animationFrame = requestAnimationFrame(renderStarfield);
}
function startStarfield() { if (!reducedMotion) animationFrame = requestAnimationFrame(renderStarfield); }
if (ctx) { resizeStarfield(); if (reducedMotion) { ctx.fillStyle = 'rgba(245,245,245,.5)'; stars.forEach(star => ctx.fillRect(star.x, star.y, 1, 1)); } else { startStarfield(); addEventListener('resize', resizeStarfield, { passive: true }); hero.addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; }, { passive: true }); hero.addEventListener('pointerleave', () => { pointer.active = false; }); document.addEventListener('visibilitychange', () => { cancelAnimationFrame(animationFrame); if (!document.hidden) { lastTime = 0; startStarfield(); } }); } }

const form = document.querySelector('#contact-form');
let submitting = false;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function setFieldError(field, message = '') { field.classList.toggle('invalid', Boolean(message)); const messageNode = field.parentElement.querySelector('small'); if (messageNode) messageNode.textContent = message; }
function validateForm() {
  let valid = true; const required = [['name', 'Please enter your full name.'], ['email', 'Please enter a valid email address.'], ['subject', 'Please choose a subject.'], ['message', 'Please add a message.']];
  required.forEach(([name, text]) => { const field = form.elements[name]; const error = !field.value.trim() || (name === 'email' && !emailPattern.test(field.value)) ? text : ''; setFieldError(field, error); if (error) valid = false; }); return valid;
}
form.addEventListener('input', event => { const field = event.target; if (field.name === 'email') setFieldError(field, field.value && !emailPattern.test(field.value) ? 'Please enter a valid email address.' : ''); else if (field.required) setFieldError(field, field.value.trim() ? '' : ''); });
form.addEventListener('submit', async event => {
  event.preventDefault(); if (submitting || !validateForm()) return;
  const status = form.querySelector('.form-status'), button = form.querySelector('.submit-button'), endpoint = form.dataset.endpoint;
  if (!endpoint) { status.textContent = 'Online form delivery is not configured yet. Please email vamora.tech@gmail.com directly.'; status.className = 'form-status error'; return; }
  submitting = true; button.disabled = true; button.querySelector('span').textContent = 'Sending…'; status.textContent = '';
  try { const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) }); if (!response.ok) throw new Error('Submission failed'); form.reset(); status.textContent = 'Thank you — your message has been sent. We’ll be in touch soon.'; status.className = 'form-status success'; } catch { status.textContent = 'We could not send your message. Please email vamora.tech@gmail.com directly.'; status.className = 'form-status error'; } finally { submitting = false; button.disabled = false; button.querySelector('span').textContent = 'Send Message'; }
});
