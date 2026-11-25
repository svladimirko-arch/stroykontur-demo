/* =========================================================
   СтройКонтур — демо-скрипты
   ========================================================= */
(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  /* --- Шапка при скролле --- */
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 30);
    revealSteps();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Мобильное меню --- */
  if (burger && nav) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-active');
      nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --- Подсказка прокрутки прайса на мобильных --- */
  document.querySelectorAll('.price__wrap').forEach(function (wrap) {
    if (wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('price__hint')) return;
    var hint = document.createElement('p');
    hint.className = 'price__hint';
    hint.textContent = 'Прокрутите таблицу вправо →';
    wrap.parentNode.insertBefore(hint, wrap.nextSibling);
  });

  /* --- Плавная прокрутка --- */
  document.querySelectorAll('a[data-scroll]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', id);
      }
    });
  });

  /* --- Появление блоков --- */
  var revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- Счётчики --- */
  var counters = document.querySelectorAll('[data-counter]');
  function runCounter(el) {
    var end = parseFloat(el.getAttribute('data-counter')) || 0;
    var start = performance.now();
    var duration = 1400;
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(end * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-counter'); });
  }

  /* --- Линия этапов --- */
  function revealSteps() {
    var steps = document.querySelectorAll('.step');
    if (!steps.length || !steps[0].parentNode) return;
    var line = document.getElementById('stepsProgress');
    var track = steps[0].parentNode.parentNode;
    if (!track) return;
    var rect = track.getBoundingClientRect();
    var progress = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - rect.top) / rect.height));
    steps.forEach(function (step, i) {
      step.classList.toggle('is-done', i / steps.length < progress);
    });
    if (line) line.style.width = (progress * 100) + '%';
  }

  /* --- Фильтр каталога --- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var catalogCards = document.querySelectorAll('.catalog__card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      var filter = chip.getAttribute('data-filter');
      catalogCards.forEach(function (card) {
        card.hidden = filter !== 'all' && card.getAttribute('data-cat') !== filter;
      });
    });
  });

  /* --- Лайтбокс --- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('is-open');
    if (lightboxImg) lightboxImg.removeAttribute('src');
  }
  document.querySelectorAll('[data-lightbox]').forEach(function (item) {
    item.addEventListener('click', function () {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = item.getAttribute('data-lightbox');
      lightboxImg.alt = item.getAttribute('data-caption') || '';
      lightbox.classList.add('is-open');
    });
  });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.closest('.lightbox__close')) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
      if (nav) nav.classList.remove('is-open');
      if (burger) burger.classList.remove('is-active');
    }
  });

  /* --- Формы: демо-отправка без бэкенда --- */
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // honeypot: спам-боты заполняют скрытое поле
      var honeypot = form.querySelector('.form__honeypot input');
      var msg = form.querySelector('.form__msg');
      if (honeypot && honeypot.value) return;

      var required = form.querySelectorAll('[required]');
      var ok = true;
      required.forEach(function (field) {
        if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) ok = false;
      });
      if (msg) msg.classList.remove('is-error');
      if (!ok) {
        if (msg) {
          msg.textContent = 'Пожалуйста, заполните обязательные поля и поставьте галочку согласия.';
          msg.classList.add('is-error');
        }
        return;
      }

      // ЗАГЛУШКА: здесь подключить отправку в AmoCRM / Telegram / бэкенд
      // и передать цель Яндекс.Метрики: ym(XXXXXXXX, 'reachGoal', 'lead');
      if (msg) msg.textContent = 'Заявка принята! В демо-версии данные никуда не отправляются.';
      form.reset();
    });
  });

  /* --- Текущий год в подвале --- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* --- Видео: запуск/остановка при видимости (экономия ресурсов) --- */
  var heroVideo = document.getElementById('heroVideo');
  if (heroVideo && 'IntersectionObserver' in window) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var p = heroVideo.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          heroVideo.pause();
        }
      });
    }, { threshold: 0.15 });
    videoObserver.observe(heroVideo);
  }
})();
