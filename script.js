document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-button');
  const menuLinks = document.querySelector('.menu-links');
  const dropdowns = document.querySelectorAll('.dropdown');
  const contentBlocks = document.querySelectorAll('.content-block');
  const canvas = document.querySelector('.animation-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const scrollArrow = document.querySelector('.scroll-arrow');

  // Debug: Log if scrollArrow is found
  if (!scrollArrow) {
    console.warn('Scroll arrow element not found. Ensure <div class="scroll-arrow"> exists in HTML.');
  }

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
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle('open');
      }
    });
  });

  // Debounce function to limit scroll event frequency
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

  // Intersection Observer for smooth content reveal
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // For index.html and projects.html, make all content visible
  if (currentPage === 'index.html' || currentPage === 'projects.html') {
    contentBlocks.forEach(block => block.classList.add('visible'));
  } else {
    // Use Intersection Observer for progressive reveal on project pages
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    contentBlocks.forEach(block => {
      observer.observe(block);
    });
  }

  // Scroll arrow visibility
  function updateScrollArrow() {
    if (!scrollArrow) return;

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const bodyScrollHeight = document.body.scrollHeight;
    const pageBottom = bodyScrollHeight - viewportHeight;

    // Hide arrow when near bottom of page
    if (scrollY >= pageBottom - 100) {
      scrollArrow.classList.remove('visible');
    } else {
      scrollArrow.classList.add('visible');
    }
  }

  // Initial scroll arrow visibility
  if (scrollArrow) {
    scrollArrow.classList.add('visible');
  }

  // Update arrow on scroll with debounce
  window.addEventListener('scroll', debounce(updateScrollArrow, 16));

  // Animation sequence (skip for about.html, index.html, projects.html)
  if (currentPage === 'about.html' || currentPage === 'index.html' || currentPage === 'projects.html') {
    return; // Skip canvas logic
  }

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

    // Draw frame helper
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

    // Animation logic
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
        // Ensure first frame is visible on load for non-video pages
        if (!isWrongWay && frames[0]) {
          drawFrame(frames[0], 1);
          canvas.classList.add('visible');
        }
        return;
      }
      const scrollProgress = Math.min(Math.max((scrollY - animationStart) / scrollRange, 0), 1);
      let frameIndex = Math.floor(scrollProgress * (frameCount - 1));
      let opacity = isWrongWay ? (scrollProgress > 0 ? 1 : 0) : 1;
      // Persist last frame after animation ends
      if (scrollY >= animationEnd) {
        frameIndex = frameCount - 1; // Last frame
        opacity = 1; // Keep visible
      }
      // Draw frame
      drawFrame(frames[frameIndex], opacity);
      requestAnimationFrame(updateAnimation);
    }

    // Start animation
    if (isWrongWay && videoSection) {
      const videoObserver = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) {
          canvas.classList.add('visible');
          drawFrame(frames[0], 1); // Draw first frame when video is out of view
        } else {
          canvas.classList.remove('visible');
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas during video
        }
      }, { threshold: 0 });
      videoObserver.observe(videoSection);
    } else {
      // Ensure canvas is visible on load for non-video pages
      if (frames[0]) {
        drawFrame(frames[0], 1);
        canvas.classList.add('visible');
      }
    }
    updateAnimation();
  }

  // New JS for media interactions
  const modal = document.createElement('div');
  modal.className = 'enlarge-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.8)';
  modal.style.zIndex = '1000';
  modal.style.display = 'none';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  document.body.appendChild(modal);

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
    modal.innerHTML = '';
  });

  // Double click to enlarge for images and videos
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
      modal.appendChild(clone);
      modal.style.display = 'flex';
    });
  });

  // For image stacks
  document.querySelectorAll('.image-stack').forEach(stack => {
    const images = stack.querySelectorAll('.stack-image');
    images.forEach((img, idx) => {
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.zIndex = images.length - idx; // Initial stacking

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
      if (e.target.classList.contains('stack-image')) return; // Avoid cycling on double click part
      // Cycle z-index
      const zIndices = Array.from(images, img => parseInt(img.style.zIndex));
      const maxZ = Math.max(...zIndices);
      images.forEach(img => {
        let z = parseInt(img.style.zIndex);
        if (z === maxZ) {
          img.style.zIndex = Math.min(...zIndices) - 1; // Send to back
        } else {
          img.style.zIndex = z + 1;
        }
      });
    });
  });

  // Smart video background resizing
  const backgroundVideos = document.querySelectorAll('.background-video');

  function smartVideoResize() {
    backgroundVideos.forEach(video => {
      if (!video.videoWidth || !video.videoHeight) return; // Wait for metadata

      const container = video.parentElement;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = containerWidth / containerHeight;

      // Calculate how much would be cropped with 'cover'
      // and how much empty space with 'contain'
      let coverCropPercent, containEmptyPercent;

      if (videoAspect > containerAspect) {
        // Video is wider - cover crops sides, contain shows top/bottom bars
        coverCropPercent = ((videoAspect / containerAspect) - 1) * 100;
        containEmptyPercent = ((containerAspect / videoAspect) - 1) * 100 * -1;
      } else {
        // Video is taller - cover crops top/bottom, contain shows side bars
        coverCropPercent = ((containerAspect / videoAspect) - 1) * 100;
        containEmptyPercent = ((videoAspect / containerAspect) - 1) * 100 * -1;
      }

      // If contain would show less than 5% empty space, use contain (show full video)
      // Otherwise use cover (fill page, crop video)
      if (containEmptyPercent < 5) {
        video.style.objectFit = 'contain';
      } else {
        video.style.objectFit = 'cover';
      }
    });
  }

  // Run on load and resize
  backgroundVideos.forEach(video => {
    video.addEventListener('loadedmetadata', smartVideoResize);
  });
  window.addEventListener('resize', debounce(smartVideoResize, 100));

  // Initial check
  smartVideoResize();
});
