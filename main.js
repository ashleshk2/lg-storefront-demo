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
  var revealTargets = [
    '.section',
    '.stats-bar',
    '.cta-banner',
    '.trust-strip',
    '.feature-strip',
    '.lg-spotlight',
    '.lg-feature-row',
    '.tv-feature-row',
  ];

  // Individual card / tile stagger — stagger resets per visual row (mod 4)
  var staggerTargets = [
    { selector: '.hk-card',              delayStep: 75  },
    { selector: '.cat-tile',             delayStep: 65  },
    { selector: '.split-tile',           delayStep: 90  },
    { selector: '.industry-tile',        delayStep: 75  },
    { selector: '.stat-item',            delayStep: 80  },
    { selector: '.trust-item',           delayStep: 55  },
    { selector: '.lg-product-card',      delayStep: 65  },
    { selector: '.cat-tile-card',        delayStep: 65  },
    { selector: '.use-case-tile',        delayStep: 50  },
    { selector: '.tv-lineup-tile',       delayStep: 65  },
    { selector: '.gaming-use-tile',      delayStep: 55  },
    { selector: '.gaming-prod-card',     delayStep: 80  },
    { selector: '.duo-card',             delayStep: 80  },
    { selector: '.product-card',         delayStep: 65  },
  ];

  // Apply .section-fade to top-level reveal targets
  revealTargets.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      if (!el.classList.contains('section-fade')) {
        el.classList.add('section-fade');
      }
    });
  });

  // Apply staggered delays to grid children
  // Delay resets at every 4 items so long grids don't have absurd delays
  staggerTargets.forEach(function(cfg) {
    document.querySelectorAll(cfg.selector).forEach(function(el, idx) {
      el.classList.add('section-fade');
      var posInRow = idx % 4;
      el.style.transitionDelay = (posInRow * cfg.delayStep) + 'ms';
    });
  });

  // Intersection observer — rootMargin pushes trigger point above fold edge
  var observer = new IntersectionObserver(
    function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px 80px 0px' }
  );

  document.querySelectorAll('.section-fade').forEach(function(el) {
    observer.observe(el);
  });

  // Safety fallback: after 900ms reveal any elements that still haven't fired
  setTimeout(function() {
    document.querySelectorAll('.section-fade:not(.visible)').forEach(function(el) {
      el.classList.add('visible');
    });
  }, 900);
}

/* Stats counter animation — count up when stat enters viewport
   ============================================================ */
function initStatCounters() {
  var statEls = document.querySelectorAll('.stat-num');
  if (!statEls.length) return;

  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var raw = el.textContent.trim();
      // Extract leading number (handles "12", "120M+", "4.9", etc.)
      var match = raw.match(/^(\d+\.?\d*)/);
      if (!match) return;
      var target = parseFloat(match[1]);
      var suffix = raw.slice(match[0].length);
      var isDecimal = raw.indexOf('.') !== -1;
      var duration = 1200;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = eased * target;
        el.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = raw; // Restore original exact value
        }
      }
      requestAnimationFrame(step);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statEls.forEach(function(el) {
    el.classList.add('section-fade');
    counterObserver.observe(el);
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

/* Sub-nav scrolled shadow
   ============================================================ */
function initSubnavScroll() {
  var subnav = document.querySelector('.brand-subnav');
  if (!subnav) return;
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        if (window.scrollY > 40) {
          subnav.classList.add('scrolled');
        } else {
          subnav.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* Split section slide-in
   ============================================================ */
function initSplitSlideIn() {
  // LG split sections: left side slides from left, right side from right
  document.querySelectorAll('.lg-split').forEach(function(split) {
    var children = split.children;
    if (children.length >= 2) {
      children[0].classList.add('split-slide-left');
      children[1].classList.add('split-slide-right');
    }
  });
  document.querySelectorAll('.tv-split').forEach(function(split) {
    var children = split.children;
    if (children.length >= 2) {
      children[0].classList.add('split-slide-left');
      children[1].classList.add('split-slide-right');
    }
  });
  // Observe these for the IntersectionObserver added after initScrollReveal
  document.querySelectorAll('.split-slide-left, .split-slide-right').forEach(function(el) {
    el.classList.add('section-fade-split');
  });
}

/* CTA hover lift — scale + shadow micro-interaction
   ============================================================ */
function initCtaHover() {
  var ctaSelectors = [
    '.btn-lg-hero',
    '.btn-brand',
    '.lg-split-pill',
    '.lg-split-pill-outline',
    '.lg-spotlight-pill',
    '.btn-gaming-primary',
    '.btn-gaming-tv',
    '.btn-cta-white',
    '.duo-cta',
  ];
  ctaSelectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(el) {
      el.style.transition = (el.style.transition || '') + ', transform 0.18s cubic-bezier(0.22,1,0.36,1)';
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Mark JS as active so CSS scroll-reveal rules engage
  document.documentElement.classList.add('js-ready');
  loadPartials();
  initScrollReveal();
  initStatCounters();
  initHeroParallax();
  initSubnavScroll();
  initSplitSlideIn();
  initCtaHover();
  // Second observer pass for split slide-ins (after they get their classes)
  setTimeout(function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 60px 0px' });
    document.querySelectorAll('.split-slide-left, .split-slide-right').forEach(function(el) {
      observer.observe(el);
    });
  }, 100);
});
