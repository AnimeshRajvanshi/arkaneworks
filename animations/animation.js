function initAnimation(canvasId, framePath, totalFrames, getStartPos, getEndPos, fadeInDistance, fadeOutDistance) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const frames = [];

    function loadFrames() {
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.src = `${framePath}${i.toString().padStart(3, '0')}.png`;
            frames.push(img);
        }
    }

    function drawFrame(frameIndex) {
        if (frames[frameIndex]) {
            const aspectRatio = 1280 / 720;
            const canvasAspect = canvas.width / canvas.height;
            let drawWidth, drawHeight, offsetX, offsetY;
            if (canvasAspect > aspectRatio) {
                drawHeight = canvas.height;
                drawWidth = drawHeight * aspectRatio;
                offsetX = (canvas.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = canvas.width;
                drawHeight = drawWidth / aspectRatio;
                offsetY = (canvas.height - drawHeight) / 2;
                offsetX = 0;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(frames[frameIndex], offsetX, offsetY, drawWidth, drawHeight);
        }
    }

    function handleScroll() {
        const scrollTop = window.scrollY;
        const startPos = getStartPos();
        const endPos = getEndPos();
        const animationHeight = endPos - startPos;
        if (scrollTop < startPos) {
            canvas.style.display = 'none';
        } else if (scrollTop > endPos) {
            canvas.style.display = 'none';
        } else {
            canvas.style.display = 'block';
            const animationFraction = (scrollTop - startPos) / animationHeight;
            const frameIndex = Math.min(totalFrames - 1, Math.floor(animationFraction * totalFrames));
            drawFrame(frameIndex);
            let opacity = 1;
            if (fadeInDistance > 0 && scrollTop < startPos + fadeInDistance) {
                opacity = (scrollTop - startPos) / fadeInDistance;
            } else if (fadeOutDistance > 0 && scrollTop > endPos - fadeOutDistance) {
                opacity = 1 - (scrollTop - (endPos - fadeOutDistance)) / fadeOutDistance;
            }
            canvas.style.opacity = opacity;
        }
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        handleScroll();
    });

    loadFrames();

    // Initial setup
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    handleScroll();
}
