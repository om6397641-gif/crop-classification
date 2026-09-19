/* ==========================================================================
   GeoVision Main Application Logic & UI Interactions
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  setupNavbar();
  setupQRModal();
  setupImageLightbox();
  setupSmoothScroll();
  setupPdfViewer();
});

// Navbar Scroll & Mobile Menu
function setupNavbar() {
  const navbarWrapper = document.querySelector(".navbar-wrapper");
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbarWrapper?.classList.add("scrolled");
    } else {
      navbarWrapper?.classList.remove("scrolled");
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", function () {
      navMenu.classList.toggle("mobile-active");
      const icon = mobileToggle.querySelector("i");
      if (icon) {
        if (navMenu.classList.contains("mobile-active")) {
          icon.className = "fas fa-times";
        } else {
          icon.className = "fas fa-bars";
        }
      }
    });

    // Close menu on link click
    navMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("mobile-active");
        const icon = mobileToggle.querySelector("i");
        if (icon) icon.className = "fas fa-bars";
      });
    });
  }
}

// QR Code Modal System
function setupQRModal() {
  const qrBackdrop = document.getElementById("qrModalBackdrop");
  const qrTriggerCard = document.getElementById("qrTriggerCard");
  const closeBtn = document.getElementById("qrModalClose");
  const qrTabBtns = document.querySelectorAll(".qr-tab-btn");
  const qrImage = document.getElementById("qrImageDisplay");

  const qrMap = {
    platform: "images/qr-platform.png",
    facebook: "images/qr-facebook.png",
    instagram: "images/qr-instagram.png",
    whatsapp: "images/qr-whatsapp.png"
  };

  if (qrTriggerCard && qrBackdrop) {
    qrTriggerCard.addEventListener("click", function () {
      qrBackdrop.classList.add("active");
    });
  }

  if (closeBtn && qrBackdrop) {
    closeBtn.addEventListener("click", function () {
      qrBackdrop.classList.remove("active");
    });
  }

  if (qrBackdrop) {
    qrBackdrop.addEventListener("click", function (e) {
      if (e.target === qrBackdrop) {
        qrBackdrop.classList.remove("active");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && qrBackdrop.classList.contains("active")) {
        qrBackdrop.classList.remove("active");
      }
    });
  }

  // QR Tab switching
  qrTabBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      qrTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetKey = btn.getAttribute("data-qr");
      if (qrImage && qrMap[targetKey]) {
        qrImage.src = qrMap[targetKey];
      }
    });
  });
}

// Image Lightbox Modal for Project Layouts
function setupImageLightbox() {
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("lightboxImage");

  document.querySelectorAll("[data-lightbox]").forEach(trigger => {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      const imgSrc = this.getAttribute("href") || this.getAttribute("data-src");
      if (lightboxModal && lightboxImage && imgSrc) {
        lightboxImage.src = imgSrc;
        lightboxModal.classList.add("active");
      }
    });
  });

  if (lightboxModal) {
    lightboxModal.addEventListener("click", function () {
      lightboxModal.classList.remove("active");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightboxModal.classList.contains("active")) {
        lightboxModal.classList.remove("active");
      }
    });
  }
}

// Smooth Scroll Setup
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId.length <= 1) return;

      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        e.preventDefault();
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}

// PDF.js Interactive Reader Engine
function setupPdfViewer() {
  const url = 'report.pdf';
  const canvas = document.getElementById('pdfRenderCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('pdfCanvasContainer');

  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 1.6;
  let isScrollMode = false;

  const pageNumElem = document.getElementById('pdfCurrentPage');
  const pageCountElem = document.getElementById('pdfTotalPages');
  const zoomLevelElem = document.getElementById('pdfZoomLevel');
  const loadingIndicator = document.getElementById('pdfLoadingIndicator');
  const thumbnailsContainer = document.getElementById('pdfThumbnailsSidebar');
  const allPagesContainer = document.getElementById('pdfAllPagesContainer');
  const singleModeBtn = document.getElementById('pdfSingleMode');
  const scrollModeBtn = document.getElementById('pdfScrollMode');

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    pdfjsLib.getDocument(url).promise.then(function (pdf) {
      pdfDoc = pdf;
      if (pageCountElem) pageCountElem.textContent = pdf.numPages;
      if (loadingIndicator) loadingIndicator.style.display = 'none';

      // Auto compute large fit scale on initial load
      pdf.getPage(1).then(function (firstPage) {
        if (container && container.clientWidth > 0) {
          const unscaled = firstPage.getViewport({ scale: 1 });
          const optimalScale = (container.clientWidth - 90) / unscaled.width;
          scale = Math.max(1.3, Math.min(optimalScale, 2.0));
        }
        renderPage(pageNum);
        renderThumbnails(pdf);
        renderAllPages(pdf);
      });
    }).catch(function (error) {
      console.warn('PDF.js loading error:', error);
      if (loadingIndicator) {
        loadingIndicator.innerHTML = `
          <div style="text-align:center; padding: 2rem;">
            <i class="fas fa-file-pdf" style="font-size: 3.5rem; color: #EF4444; margin-bottom: 1rem;"></i>
            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.25rem;">Official Technical Report (GF 4)</h4>
            <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">The 6-page project report is ready for viewing and download.</p>
            <a href="report.pdf" target="_blank" class="btn-primary" style="display:inline-flex;">
              <i class="fas fa-external-link-alt"></i> Open / Download PDF
            </a>
          </div>
        `;
      }
    });
  }

  function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function (page) {
      const viewport = page.getViewport({ scale: scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      const renderTask = page.render(renderContext);

      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    if (pageNumElem) pageNumElem.textContent = num;
    if (zoomLevelElem) zoomLevelElem.textContent = `${Math.round(scale * 100)}%`;

    if (container) {
      container.scrollTop = 0;
    }

    document.querySelectorAll('.pdf-thumb-item').forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx + 1 === num);
    });
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  }

  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  }

  function onZoomIn() {
    if (scale >= 2.8) return;
    scale += 0.2;
    if (isScrollMode) {
      renderAllPages(pdfDoc);
    } else {
      queueRenderPage(pageNum);
    }
    if (zoomLevelElem) zoomLevelElem.textContent = `${Math.round(scale * 100)}%`;
  }

  function onZoomOut() {
    if (scale <= 0.6) return;
    scale -= 0.2;
    if (isScrollMode) {
      renderAllPages(pdfDoc);
    } else {
      queueRenderPage(pageNum);
    }
    if (zoomLevelElem) zoomLevelElem.textContent = `${Math.round(scale * 100)}%`;
  }

  function onFitWidth() {
    if (container && pdfDoc) {
      pdfDoc.getPage(pageNum).then(function (page) {
        const unscaledViewport = page.getViewport({ scale: 1 });
        scale = Math.max(0.8, Math.min(2.5, (container.clientWidth - 90) / unscaledViewport.width));
        if (isScrollMode) {
          renderAllPages(pdfDoc);
        } else {
          queueRenderPage(pageNum);
        }
        if (zoomLevelElem) zoomLevelElem.textContent = `${Math.round(scale * 100)}%`;
      });
    }
  }

  document.getElementById('pdfPrevPage')?.addEventListener('click', onPrevPage);
  document.getElementById('pdfNextPage')?.addEventListener('click', onNextPage);
  document.getElementById('pdfZoomIn')?.addEventListener('click', onZoomIn);
  document.getElementById('pdfZoomOut')?.addEventListener('click', onZoomOut);
  document.getElementById('pdfFitWidth')?.addEventListener('click', onFitWidth);

  // View Mode Switcher
  if (singleModeBtn && scrollModeBtn && allPagesContainer) {
    singleModeBtn.addEventListener('click', () => {
      isScrollMode = false;
      singleModeBtn.classList.add('active');
      scrollModeBtn.classList.remove('active');
      canvas.style.display = 'block';
      allPagesContainer.style.display = 'none';
      queueRenderPage(pageNum);
    });

    scrollModeBtn.addEventListener('click', () => {
      isScrollMode = true;
      scrollModeBtn.classList.add('active');
      singleModeBtn.classList.remove('active');
      canvas.style.display = 'none';
      allPagesContainer.style.display = 'flex';
      renderAllPages(pdfDoc);
    });
  }

  function renderThumbnails(pdf) {
    if (!thumbnailsContainer) return;
    thumbnailsContainer.innerHTML = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const thumbBtn = document.createElement('button');
      thumbBtn.className = `pdf-thumb-item ${i === 1 ? 'active' : ''}`;
      thumbBtn.innerHTML = `
        <div class="pdf-thumb-icon"><i class="fas fa-file-pdf" style="color: ${i === 1 ? 'var(--accent-cyan)' : 'var(--text-secondary)'};"></i></div>
        <div class="pdf-thumb-text">Page ${i}</div>
      `;
      thumbBtn.addEventListener('click', () => {
        pageNum = i;
        if (isScrollMode) {
          const targetPageCanvas = document.getElementById(`pdfPageCanvas_${i}`);
          if (targetPageCanvas) targetPageCanvas.scrollIntoView({ behavior: 'smooth' });
        } else {
          queueRenderPage(pageNum);
        }
      });
      thumbnailsContainer.appendChild(thumbBtn);
    }
  }

  function renderAllPages(pdf) {
    if (!allPagesContainer || !pdf) return;
    allPagesContainer.innerHTML = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pageCanvas = document.createElement('canvas');
      pageCanvas.id = `pdfPageCanvas_${i}`;
      pageCanvas.className = 'pdf-page-scroll-canvas';
      allPagesContainer.appendChild(pageCanvas);

      pdf.getPage(i).then(function (page) {
        const viewport = page.getViewport({ scale: scale });
        pageCanvas.height = viewport.height;
        pageCanvas.width = viewport.width;

        const renderContext = {
          canvasContext: pageCanvas.getContext('2d'),
          viewport: viewport
        };
        page.render(renderContext);
      });
    }
  }
}

