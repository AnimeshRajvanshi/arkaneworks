document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const menuLinks = document.querySelector('.menu-links');
  const dropdowns = document.querySelectorAll('.dropdown');
  const revealTargets = document.querySelectorAll('.content-block, .reveal');
  const canvas = document.querySelector('.animation-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const scrollArrow = document.querySelector('.scroll-arrow');
  const scrollProgress = document.querySelector('.scroll-progress');

  // Mobile menu toggle
  if (menuButton && menuLinks) {
    menuButton.addEventListener('click', () => {
      menuButton.classList.toggle('open');
      menuLinks.classList.toggle('open');
    });
  }

  // Mobile dropdown toggle
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 860) {
        e.preventDefault();
        dropdown.classList.toggle('open');
      }
    });
  });

  // Debounce helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Scroll progress hairline under the header
  function updateProgress() {
    if (!scrollProgress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    scrollProgress.style.transform = `scaleX(${p})`;
  }

  // Reveal-on-scroll with a slight stagger for elements entering together
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${Math.min(i * 70, 280)}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));

  // Scroll arrow visibility
  function updateScrollArrow() {
    if (!scrollArrow) return;
    const pageBottom = document.body.scrollHeight - window.innerHeight;
    if (window.scrollY >= pageBottom - 100) {
      scrollArrow.classList.remove('visible');
    } else {
      scrollArrow.classList.add('visible');
    }
  }

  if (scrollArrow) {
    scrollArrow.classList.add('visible');
    updateScrollArrow();
  }

  window.addEventListener('scroll', () => {
    updateProgress();
  }, { passive: true });
  window.addEventListener('scroll', debounce(updateScrollArrow, 16), { passive: true });
  updateProgress();

  // ------------------------------------------------------------
  // Scroll-driven frame animation (project pages with a canvas)
  // ------------------------------------------------------------
  if (canvas && ctx) {
    const frameFolder = canvas.dataset.frameFolder;
    const frameCount = 120;
    const frames = [];
    let loadedFrames = 0;
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    document.body.appendChild(loadingIndicator);

    // Resize canvas to viewport
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load and display first frame immediately
    const firstFrame = new Image();
    firstFrame.src = `/assets/${frameFolder}/frame_001.png`;
    firstFrame.onload = () => {
      drawFrame(firstFrame, 1);
      if (!isWrongWay) {
        canvas.classList.add('visible');
      }
    };
    firstFrame.onerror = () => {
      loadingIndicator.innerHTML = 'Failed to load animation';
    };
    frames[0] = firstFrame;

    // Preload remaining frames
    for (let i = 2; i <= frameCount; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `/assets/${frameFolder}/frame_${paddedIndex}.png`;
      img.onload = () => {
        loadedFrames++;
        if (loadedFrames === frameCount - 1) {
          loadingIndicator.remove();
        }
      };
      img.onerror = () => {
        loadingIndicator.innerHTML = 'Failed to load animation';
      };
      frames[i - 1] = img;
    }

    // Draw frame helper — anchored to the bottom-right of the viewport
    function drawFrame(img, opacity) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (img) {
        const aspectRatio = 1280 / 720;
        const canvasAspect = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;
        if (canvasAspect > aspectRatio) {
          drawHeight = canvas.height;
          drawWidth = drawHeight * aspectRatio;
          offsetX = canvas.width - drawWidth;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = drawWidth / aspectRatio;
          offsetX = 0;
          offsetY = canvas.height - drawHeight;
        }
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        ctx.globalAlpha = 1;
      }
    }

    // Animation scrub logic
    const isWrongWay = frameFolder === 'wrongway_frames';
    const videoSection = document.querySelector('.video-background');
    const referencesSection = document.querySelector('.content-block:last-child');
    let animationStart = 0;
    let animationEnd = 0;
    function updateAnimation() {
      if (!referencesSection) return;
      const scrollY = window.scrollY;
      const referencesTop = referencesSection.getBoundingClientRect().top + scrollY;
      const viewportHeight = window.innerHeight;
      if (isWrongWay && videoSection) {
        animationStart = videoSection.getBoundingClientRect().bottom + scrollY;
        animationEnd = referencesTop - viewportHeight;
      } else {
        animationStart = 0;
        animationEnd = referencesTop - viewportHeight;
      }
      const scrollRange = animationEnd - animationStart;
      if (scrollRange <= 0) {
        if (!isWrongWay && frames[0]) {
          drawFrame(frames[0], 1);
          canvas.classList.add('visible');
        }
        return;
      }
      const scrollProgressRatio = Math.min(Math.max((scrollY - animationStart) / scrollRange, 0), 1);
      let frameIndex = Math.floor(scrollProgressRatio * (frameCount - 1));
      let opacity = isWrongWay ? (scrollProgressRatio > 0 ? 1 : 0) : 1;
      // Persist last frame after animation ends
      if (scrollY >= animationEnd) {
        frameIndex = frameCount - 1;
        opacity = 1;
      }
      drawFrame(frames[frameIndex], opacity);
      requestAnimationFrame(updateAnimation);
    }

    // Start animation
    if (isWrongWay && videoSection) {
      const videoObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) {
          canvas.classList.add('visible');
          drawFrame(frames[0], 1);
        } else {
          canvas.classList.remove('visible');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }, { threshold: 0 });
      videoObserver.observe(videoSection);
    } else {
      if (frames[0]) {
        drawFrame(frames[0], 1);
        canvas.classList.add('visible');
      }
    }
    updateAnimation();
  }

  // ------------------------------------------------------------
  // Media interactions
  // ------------------------------------------------------------
  const modal = document.createElement('div');
  modal.className = 'enlarge-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(8,8,8,0.92)';
  modal.style.zIndex = '1000';
  modal.style.display = 'none';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.cursor = 'zoom-out';
  document.body.appendChild(modal);

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.innerHTML = '';
  });

  // Double click to enlarge images and videos (full colour in the modal)
  document.querySelectorAll('.project-image, .project-video').forEach(el => {
    el.addEventListener('dblclick', () => {
      let clone;
      if (el.tagName === 'VIDEO') {
        clone = el.cloneNode(true);
      } else {
        clone = new Image();
        clone.src = el.src;
      }
      clone.style.maxWidth = '90%';
      clone.style.maxHeight = '90%';
      clone.style.filter = 'none';
      modal.appendChild(clone);
      modal.style.display = 'flex';
    });
  });

  // Image stacks: click to cycle, double-click to enlarge
  document.querySelectorAll('.image-stack').forEach(stack => {
    const images = stack.querySelectorAll('.stack-image');
    images.forEach((img, idx) => {
      img.style.zIndex = images.length - idx;

      img.addEventListener('mouseover', () => {
        img.style.transform = 'scale(1.02)';
      });
      img.addEventListener('mouseout', () => {
        img.style.transform = 'scale(1)';
      });

      img.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const clone = new Image();
        clone.src = img.src;
        clone.style.maxWidth = '90%';
        clone.style.maxHeight = '90%';
        modal.appendChild(clone);
        modal.style.display = 'flex';
      });
    });

    stack.addEventListener('click', (e) => {
      if (!e.target.classList.contains('stack-image')) return;
      const zIndices = Array.from(images, img => parseInt(img.style.zIndex));
      const maxZ = Math.max(...zIndices);
      images.forEach(img => {
        const z = parseInt(img.style.zIndex);
        img.style.zIndex = z === maxZ ? Math.min(...zIndices) - 1 : z + 1;
      });
    });
  });

  // Background video sizing: always show the full frame, anchored top
  const backgroundVideos = document.querySelectorAll('.background-video');

  function smartVideoResize() {
    backgroundVideos.forEach(video => {
      if (!video.videoWidth || !video.videoHeight) return;
      video.style.objectFit = 'contain';
      video.style.objectPosition = 'top center';
    });
  }

  backgroundVideos.forEach(video => {
    video.addEventListener('loadedmetadata', smartVideoResize);
  });
  window.addEventListener('resize', debounce(smartVideoResize, 100));
  smartVideoResize();
});
