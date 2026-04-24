// === HEADER SCROLL ===
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
});

// === HAMBURGER MENU ===
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a =>
  a.addEventListener('click', () => navLinks?.classList.remove('open'))
);

// === ACTIVE NAV LINK ===
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});

// === HERO SLIDER ===
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
let current = 0;
let timer;

function goTo(idx) {
  slides[current]?.classList.remove('active');
  dots[current]?.classList.remove('active');
  current = (idx + slides.length) % slides.length;
  slides[current]?.classList.add('active');
  dots[current]?.classList.add('active');
}

function nextSlide() { goTo(current + 1); }

function startTimer() {
  clearInterval(timer);
  timer = setInterval(nextSlide, 5000);
}

if (slides.length) {
  slides[0].classList.add('active');
  dots[0]?.classList.add('active');
  startTimer();

  document.querySelector('.hero-arrow.next')?.addEventListener('click', () => { nextSlide(); startTimer(); });
  document.querySelector('.hero-arrow.prev')?.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startTimer(); }));
}

// === SCROLL REVEAL ===
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
reveals.forEach(r => observer.observe(r));
