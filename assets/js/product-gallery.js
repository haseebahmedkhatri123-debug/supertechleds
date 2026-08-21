/**
 * ElectronicZ - Product Gallery & Image Zoom-on-Hover Feature
 *
 * Configurable parameters:
 */
const ZOOM_CONFIG = {
  scale: 2.2, // Magnification scale (2.2x zoom)
  transitionIn: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
  transitionOut: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), transform-origin 0.35s ease-out'
};

document.addEventListener('DOMContentLoaded', function() {
  
  /* ----------------------------------------------------
   * 1. Gallery Carousel Navigation Arrows
   * ---------------------------------------------------- */
  function initProductGalleryNav() {
    const tabsContainers = document.querySelectorAll('.single-product-tab');
    
    tabsContainers.forEach(function(tabsContainer) {
      const mainImgWrapper = tabsContainer.querySelector('.product-main-image-wrapper');
      if (!mainImgWrapper) return;

      // Remove legacy gallery navigation buttons if present
      const oldNavBtns = tabsContainer.querySelectorAll('.gallery-nav-btn');
      oldNavBtns.forEach(function(btn) {
        btn.remove();
      });

      // Check if main image nav buttons already exist, create if not
      let prevBtn = mainImgWrapper.querySelector('.main-img-nav-btn.prev-btn');
      let nextBtn = mainImgWrapper.querySelector('.main-img-nav-btn.next-btn');

      if (!prevBtn) {
        prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'main-img-nav-btn prev-btn';
        prevBtn.setAttribute('aria-label', 'Previous Image');
        prevBtn.innerHTML = '&#8249;'; // ‹
        mainImgWrapper.appendChild(prevBtn);
      }

      if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'main-img-nav-btn next-btn';
        nextBtn.setAttribute('aria-label', 'Next Image');
        nextBtn.innerHTML = '&#8250;'; // ›
        mainImgWrapper.appendChild(nextBtn);
      }

      function getTabLinks() {
        return Array.from(tabsContainer.querySelectorAll('.proudct-gallery-link, .w-tab-link'));
      }

      function getCurrentIndex(links) {
        const idx = links.findIndex(function(link) {
          return link.classList.contains('w--current');
        });
        return idx >= 0 ? idx : 0;
      }

      function goToTab(index) {
        const links = getTabLinks();
        if (!links.length) return;
        if (index < 0) index = links.length - 1;
        if (index >= links.length) index = 0;

        const targetLink = links[index];
        if (targetLink) {
          targetLink.click();
        }
      }

      prevBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const links = getTabLinks();
        const curr = getCurrentIndex(links);
        goToTab(curr - 1);
      };

      nextBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const links = getTabLinks();
        const curr = getCurrentIndex(links);
        goToTab(curr + 1);
      };
    });
  }

  /* ----------------------------------------------------
   * 2. Smooth Image Zoom-on-Hover
   * ---------------------------------------------------- */
  function initProductImageZoom() {
    // Only enable zoom on desktop fine pointer devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const mainWrappers = document.querySelectorAll('.product-main-image-wrapper');
    if (!mainWrappers.length) return;

    mainWrappers.forEach(function(mainWrapper) {
      let rafId = null;

      function resetZoom(container, img) {
        if (!img) return;
        if (rafId) cancelAnimationFrame(rafId);
        container.classList.remove('is-zooming');
        img.style.transition = ZOOM_CONFIG.transitionOut;
        img.style.transform = 'scale(1)';
        img.style.transformOrigin = 'center center';
      }

      function resetAllTabZooms() {
        const images = mainWrapper.querySelectorAll('.product-image');
        const containers = mainWrapper.querySelectorAll('.product-image-background');
        images.forEach(function(img) {
          img.style.transition = ZOOM_CONFIG.transitionOut;
          img.style.transform = 'scale(1)';
          img.style.transformOrigin = 'center center';
        });
        containers.forEach(function(cont) {
          cont.classList.remove('is-zooming');
        });
      }

      // Delegate mouse movements over the main image container
      mainWrapper.addEventListener('mousemove', function(e) {
        // If cursor is over navigation arrow buttons, reset zoom
        if (e.target.closest('.main-img-nav-btn')) {
          const container = mainWrapper.querySelector('.w-tab-pane.w--tab-active .product-image-background') || e.target.closest('.product-image-background');
          if (container) {
            const img = container.querySelector('.product-image');
            resetZoom(container, img);
          }
          return;
        }

        const container = e.target.closest('.product-image-background');
        if (!container) return;

        const img = container.querySelector('.product-image');
        if (!img) return;

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Calculate cursor position percentage relative to container bounds
        const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        if (!container.classList.contains('is-zooming')) {
          container.classList.add('is-zooming');
          img.style.transition = ZOOM_CONFIG.transitionIn;
        }

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function() {
          img.style.transformOrigin = `${xPercent.toFixed(2)}% ${yPercent.toFixed(2)}%`;
          img.style.transform = `scale(${ZOOM_CONFIG.scale})`;
        });
      });

      mainWrapper.addEventListener('mouseleave', function(e) {
        const containers = mainWrapper.querySelectorAll('.product-image-background');
        containers.forEach(function(container) {
          const img = container.querySelector('.product-image');
          resetZoom(container, img);
        });
      }, true);

      // Reset zoom whenever user clicks carousel arrows or thumbnail links
      const navBtns = mainWrapper.querySelectorAll('.main-img-nav-btn');
      navBtns.forEach(function(btn) {
        btn.addEventListener('click', resetAllTabZooms);
      });

      const parentTab = mainWrapper.closest('.single-product-tab');
      if (parentTab) {
        const galleryLinks = parentTab.querySelectorAll('.proudct-gallery-link');
        galleryLinks.forEach(function(link) {
          link.addEventListener('click', resetAllTabZooms);
        });
      }
    });
  }

  initProductGalleryNav();
  initProductImageZoom();
});
