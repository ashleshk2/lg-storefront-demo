/* LG Amazon Brand Store — Main JS v1 */

async function loadPartials() {
  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch('partials/header.html'),
      fetch('partials/footer.html')
    ]);
    const [headerHTML, footerHTML] = await Promise.all([
      headerRes.text(),
      footerRes.text()
    ]);
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    if (headerEl) headerEl.innerHTML = headerHTML;
    if (footerEl) footerEl.innerHTML = footerHTML;
  } catch (e) {
    console.warn('Could not load partials:', e.message);
  }
  initMobileNav();
  initActiveNav();
  initSmoothScroll();
  initNavDropdowns();
}

function initMobileNav() {
  const allBtn = document.querySelector('.amz-nav-all-btn');
  const drawer = document.querySelector('.amz-mobile-drawer');
  if (allBtn && drawer) {
    allBtn.addEventListener('click', function(e) {
      e.preventDefault();
      drawer.classList.toggle('open');
    });
  }
}

function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.brand-subnav-tabs a, .amz-mobile-drawer a').forEach(function(link) {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initNavDropdowns() {
  document.querySelectorAll('.brand-subnav-dropdown').forEach(function(dropdown) {
    var trigger = dropdown.querySelector('.brand-subnav-dropdown-trigger');
    var menu = dropdown.querySelector('.brand-subnav-dropdown-menu');
    if (!trigger || !menu) return;
    dropdown.addEventListener('mouseenter', function() {
      var rect = trigger.getBoundingClientRect();
      menu.style.top = rect.bottom + 'px';
      menu.style.left = Math.min(rect.left, window.innerWidth - 240) + 'px';
      dropdown.classList.add('open');
    });
    dropdown.addEventListener('mouseleave', function() {
      dropdown.classList.remove('open');
    });
  });
}

function initSmoothScroll() {
  const drawer = document.querySelector('.amz-mobile-drawer');
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const selector = this.getAttribute('href');
      if (!selector || selector === '#') return;
      const target = document.querySelector(selector);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (drawer) drawer.classList.remove('open');
      }
    });
  });
}

/* Scroll-reveal: Intersection Observer
   Applies .section-fade + staggered delays to major sections
   ============================================================ */
function initScrollReveal() {
  // Tag all major sections and content blocks for reveal
  const revealTargets = [
    '.section',
    '.stats-bar',
    '.cta-banner',
    '.trust-strip',
    '.feature-strip',
  ];

  // Individual card / tile stagger
  const staggerTargets = [
    { selector: '.hk-card',       delayStep: 80 },
    { selector: '.cat-tile',      delayStep: 70 },
    { selector: '.split-tile',    delayStep: 100 },
    { selector: '.industry-tile', delayStep: 80 },
    { selector: '.stat-item',     delayStep: 80 },
    { selector: '.trust-item',    delayStep: 60 },
  ];

  // Apply .section-fade to top-level reveal targets
  revealTargets.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      if (!el.classList.contains('section-fade')) {
        el.classList.add('section-fade');
      }
    });
  });

  // Apply staggered delays to grid children — but ONLY if not already inside
  // a parent that will be revealed (avoid double-animation)
  staggerTargets.forEach(function(cfg) {
    document.querySelectorAll(cfg.selector).forEach(function(el, idx) {
      el.classList.add('section-fade');
      el.style.transitionDelay = (idx % 4) * cfg.delayStep + 'ms';
    });
  });

  // Intersection observer — threshold 0 so any pixel entering viewport triggers reveal
  // rootMargin '0px' with no negative bottom ensures elements near/below fold are captured
  const observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once revealed, unobserve to save resources
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px 100px 0px' }
  );

  document.querySelectorAll('.section-fade').forEach(function(el) {
    observer.observe(el);
  });

  // Safety fallback: after 800ms reveal any elements that still haven't fired
  // (handles cases where observer doesn't trigger for off-screen elements on some browsers)
  setTimeout(function() {
    document.querySelectorAll('.section-fade:not(.visible)').forEach(function(el) {
      el.classList.add('visible');
    });
  }, 800);
}

/* Stats counter animation — animate stat numbers on reveal
   ============================================================ */
function initStatCounters() {
  document.querySelectorAll('.stat-num').forEach(function(el) {
    el.classList.add('section-fade');
  });
}

/* Hero image subtle parallax on scroll
   ============================================================ */
function initHeroParallax() {
  var heroImg = document.querySelector('.hero-video');
  if (!heroImg) return;
  var hero = document.querySelector('.hero-video-wrap');
  if (!hero) return;

  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        var scrollY = window.scrollY;
        var heroHeight = hero.offsetHeight;
        if (scrollY < heroHeight) {
          var pct = scrollY / heroHeight;
          heroImg.style.transform = 'translate(-50%, calc(-50% + ' + (pct * 40) + 'px))';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', function() {
  // Mark JS as active so CSS scroll-reveal rules engage
  document.documentElement.classList.add('js-ready');
  loadPartials();
  initScrollReveal();
  initStatCounters();
  initHeroParallax();
});
