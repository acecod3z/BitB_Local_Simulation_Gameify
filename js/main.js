const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const dragBar = document.getElementById("dragBar");
const loginButton = document.getElementById("loginButton");
const closePopupButton = document.querySelector(".popup-close-btn"); // Get close button

let offsetX = 0, offsetY = 0, isDragging = false;

// Function to close popup
const closePopup = () => {
    popup.style.display = "none";
    overlay.style.display = "none";
}

// Show popup when login button is clicked
loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "block";
    overlay.style.display = "block";
});

// Hide popup when clicking overlay
overlay.addEventListener("click", closePopup);

// Hide popup when clicking close button
closePopupButton.addEventListener("click", closePopup);

// Dragging functionality
dragBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;
    dragBar.style.cursor = "grabbing";
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    dragBar.style.cursor = "grab";
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        popup.style.left = `${e.clientX - offsetX}px`;
        popup.style.top = `${e.clientY - offsetY}px`;
    }
});

// Theme Toggle Functionality
const themeToggleButton = document.getElementById('themeToggle');
const body = document.body;

// Function to apply theme
const applyTheme = (theme) => {
    if (theme === 'light') {
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
    }
};

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
applyTheme(savedTheme);

// Toggle theme on button click
themeToggleButton.addEventListener('click', () => {
    let currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Save preference
});

// --- New Carousel Logic ---
let carouselNextDom = document.getElementById('next');
let carouselPrevDom = document.getElementById('prev');

let carouselDom = document.querySelector('.carousel');
let carouselSliderDom = carouselDom ? carouselDom.querySelector('.carousel .list') : null;
let carouselThumbnailBorderDom = carouselDom ? carouselDom.querySelector('.carousel .thumbnail') : null;
let carouselThumbnailItemsDom = carouselThumbnailBorderDom ? carouselThumbnailBorderDom.querySelectorAll('.item') : [];
let carouselTimeDom = carouselDom ? carouselDom.querySelector('.carousel .time') : null;

// Only run if carousel elements exist
if (carouselDom && carouselSliderDom && carouselThumbnailBorderDom && carouselThumbnailItemsDom.length > 0 && carouselTimeDom && carouselNextDom && carouselPrevDom) {

    // Move first thumbnail item to the end initially for correct starting order
    carouselThumbnailBorderDom.appendChild(carouselThumbnailItemsDom[0]);

    let carouselTimeRunning = 3000; // Time for slide transition
    let carouselTimeAutoNext = 7000; // Time until auto slide

    carouselNextDom.onclick = function(){
        showCarouselSlider('next');    
    }

    carouselPrevDom.onclick = function(){
        showCarouselSlider('prev');    
    }

    let carouselRunTimeOut;
    let carouselRunNextAuto = setTimeout(() => {
        carouselNextDom.click();
    }, carouselTimeAutoNext);

    function showCarouselSlider(type){
        let carouselSliderItemsDom = carouselSliderDom.querySelectorAll('.carousel .list .item');
        let currentThumbnailItemsDom = document.querySelectorAll('.carousel .thumbnail .item'); // Re-query in case order changed
        
        if(type === 'next'){
            carouselSliderDom.appendChild(carouselSliderItemsDom[0]);
            carouselThumbnailBorderDom.appendChild(currentThumbnailItemsDom[0]);
            carouselDom.classList.add('next');
        } else {
            carouselSliderDom.prepend(carouselSliderItemsDom[carouselSliderItemsDom.length - 1]);
            carouselThumbnailBorderDom.prepend(currentThumbnailItemsDom[currentThumbnailItemsDom.length - 1]);
            carouselDom.classList.add('prev');
        }

        clearTimeout(carouselRunTimeOut);
        carouselRunTimeOut = setTimeout(() => {
            carouselDom.classList.remove('next');
            carouselDom.classList.remove('prev');
        }, carouselTimeRunning);

        clearTimeout(carouselRunNextAuto);
        carouselRunNextAuto = setTimeout(() => {
            carouselNextDom.click();
        }, carouselTimeAutoNext);
    }
} else {
    console.warn("Carousel elements not found, skipping carousel initialization.");
} 