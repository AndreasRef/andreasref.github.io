window.onload = function() {
    var footerHeight = document.getElementById('pageFooter').offsetHeight;
    document.body.style.paddingBottom = footerHeight + 'px';
};

// If you expect the footer size to change (e.g., responsive design), you might also want to handle window resize:
window.onresize = function() {
    var footerHeight = document.getElementById('pageFooter').offsetHeight;
    document.body.style.paddingBottom = footerHeight + 'px';
};

let clickCounts;

let nImg = 36;

function preload() {
    partyConnect("wss://demoserver.p5party.org", "blurry-likes");
    clickCounts = partyLoadShared("clickCounts", initClickCounts(nImg));
}

function initClickCounts(numImages) {
    let counts = {};
    for (let i = 0; i < numImages; i++) {
        
        let randomNum = Math.random();

        if (randomNum < 0.5) {
            counts['image' + i] = 0;
        } else if (randomNum > 0.80) {
            counts['image' + i] = Math.floor(Math.random() * 7) + 10;
        } else {
            counts['image' + i] = Math.floor(Math.random() * 7) + 1;
        }
    }
    return counts;
}

function setup() {
    noCanvas();
    createImageGrid(nImg); // Create a grid of 9 images
}

function createImageGrid(numImages) {
    const gridContainer = document.getElementById('gridContainer');
    for (let i = 0; i < numImages; i++) {
        const container = createElement('div').class('image-container').id('container' + i).parent(gridContainer);
        createElement('img').attribute('src', "img" + i + '.jpg').id('image' + i).mousePressed(() => blurImage(i)).parent(container);
        createElement('span', '❤️ 0').class('like-indicator').id('like' + i).parent(container);
    }
}


function blurImage(imageNumber) {
    clickCounts['image' + imageNumber]++;
    applyBlur();
    showLikeIndicator(imageNumber);
    fadeImage(imageNumber);
}

function fadeImage(imageNumber) {
    let img = document.getElementById('image' + imageNumber);
    if (img) {
        // Immediately set opacity to 0.9
        img.style.opacity = '0.9';

        // Clear any existing timeout to prevent overlap
        clearTimeout(img.fadeTimeout);

        // Reset opacity back to 1 after a short duration
        img.fadeTimeout = setTimeout(() => {
            img.style.opacity = '1';
        }, 1000); // Duration before the image returns to normal opacity
    }
}


function showLikeIndicator(imageNumber) {
    let likeIndicator = document.getElementById('like' + imageNumber);
    if (likeIndicator) {
        likeIndicator.innerText = `🤍 ${clickCounts['image' + imageNumber]}`;

        // Ensure animation is always visible on rapid clicks
        if (likeIndicator.style.opacity === '0' || likeIndicator.style.opacity === '') {
            likeIndicator.style.opacity = '1';  // Make visible
            likeIndicator.style.transform = 'scale(1.3)';  // Start animation
        }

        // Restart animation timer
        clearTimeout(likeIndicator.animationTimeout);
        likeIndicator.animationTimeout = setTimeout(() => {
            likeIndicator.style.opacity = '0';  // Hide after duration
            likeIndicator.style.transform = 'scale(1)';  // Reset scale
        }, 1000); // Duration of the entire animation
    }
}

function isSafari() {
    var userAgent = navigator.userAgent.toLowerCase(); 
    return /safari/.test(userAgent) && !/chrome/.test(userAgent);
}


function applyBlur() {
    for (let i = 0; i <= nImg-1; i++) {
        let img = document.getElementById('image' + i);
        if (img) {
            let blurValue = clickCounts['image' + i] * 1; // Adjust blur intensity
            img.style.filter = `blur(${blurValue}px)`;
        } else {
            console.error('Image with ID image' + i + ' not found.');
        }
    }
}

function draw() {
    applyBlur(); // Continuously apply blur
}

function openOverlay() {
    document.getElementById("aboutOverlay").style.width = "100%";
}

function closeOverlay() {
    document.getElementById("aboutOverlay").style.width = "0%";
}