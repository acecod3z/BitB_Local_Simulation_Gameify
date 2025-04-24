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

// Theme Selection Logic
const themeSelector = document.getElementById('themeSelector');
const body = document.body;

// Function to apply theme based on selected value
const applyTheme = (themeValue) => {
    if (themeValue && themeValue !== 'default') {
        body.dataset.theme = themeValue; // Set data-theme attribute
    } else {
        delete body.dataset.theme; // Remove attribute for default
    }
};

// Apply saved theme on load
const savedTheme = localStorage.getItem('theme') || 'default'; // Default to 'default'
applyTheme(savedTheme);
if (themeSelector) {
    themeSelector.value = savedTheme; // Set dropdown to saved theme
}

// Update theme when dropdown changes
if (themeSelector) {
    themeSelector.addEventListener('change', (event) => {
        const newTheme = event.target.value;
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Save preference
    });
}

// --- New Carousel Logic ---
let carouselNextDom = document.getElementById('next');
let carouselPrevDom = document.getElementById('prev');

let carouselDom = document.querySelector('.carousel');
let carouselSliderDom = carouselDom ? carouselDom.querySelector('.carousel .list') : null;
let carouselTimeDom = carouselDom ? carouselDom.querySelector('.carousel .time') : null;

// Update check to remove thumbnail elements
if (carouselDom && carouselSliderDom && carouselTimeDom && carouselNextDom && carouselPrevDom && typeof anime === 'function') {

    let carouselTimeRunning = 600; 
    let carouselTimeAutoNext = 7000; 
    let isAnimating = false; 

    carouselNextDom.onclick = function() {
        if (isAnimating) return;
        showCarouselSlider('next');
    }

    carouselPrevDom.onclick = function() {
        if (isAnimating) return;
        showCarouselSlider('prev');
    }

    let carouselRunNextAuto = setTimeout(() => {
        if (!isAnimating) carouselNextDom.click(); 
    }, carouselTimeAutoNext);

    function showCarouselSlider(type) {
        isAnimating = true;
        let carouselSliderItemsDom = carouselSliderDom.querySelectorAll('.carousel .list .item');
        clearTimeout(carouselRunNextAuto);

        const animationDuration = carouselTimeRunning; // Use a consistent duration

        let currentActiveItem, currentActiveImg, nextItem, nextImg, itemToMove;

        // --- Identify elements and set initial states --- 
        if (type === 'next') {
            currentActiveItem = carouselSliderItemsDom[0];
            currentActiveImg = currentActiveItem?.querySelector('img');
            nextItem = carouselSliderItemsDom[1];
            nextImg = nextItem?.querySelector('img');
            itemToMove = currentActiveItem; // Will be moved later

            // Initial setup for incoming item
            if (nextItem) nextItem.style.zIndex = 3; // Ensure incoming is top
            if (nextImg) nextImg.style.opacity = '0'; 

            // Setup for outgoing item
            if (currentActiveItem) currentActiveItem.style.zIndex = 2;
            if (currentActiveImg) currentActiveImg.style.opacity = '1'; // Ensure starts visible

        } else { // type === 'prev'
            itemToMove = carouselSliderItemsDom[carouselSliderItemsDom.length - 1]; // Item to prepend
            currentActiveItem = carouselSliderItemsDom[0]; // Item currently visible (will fade out)
            currentActiveImg = currentActiveItem?.querySelector('img');
            nextItem = itemToMove; // The item that will become active (already prepended)
            nextImg = nextItem?.querySelector('img');

            // Setup for incoming item (after prepend)
            if (nextItem) nextItem.style.zIndex = 3; // Ensure incoming is top
            if (nextImg) {
                nextImg.style.opacity = '0'; 
                nextImg.style.transform = 'scale(0.9)'; 
            }
            
            // Setup for outgoing item
            if (currentActiveItem) currentActiveItem.style.zIndex = 2;
            if (currentActiveImg) currentActiveImg.style.opacity = '1'; // Ensure starts visible

            // Prepend immediately
            carouselSliderDom.prepend(itemToMove);
        }

        // --- Animation Phase 1: Hide Old --- 
        let hidePromise = Promise.resolve(); 
        if (currentActiveImg) {
             hidePromise = anime({
                targets: currentActiveImg,
                opacity: 0,
                duration: animationDuration / 2.5, // Faster fade out
                easing: 'linear'
            }).finished;
        }

        // --- Animation Phase 2: Show New (Starts after Hide completes) --- 
        hidePromise.then(() => {
            let showPromises = [];
            if (nextImg) {
                 if (type === 'next') {
                     showPromises.push(anime({
                         targets: nextImg,
                         opacity: [0, 1],
                         duration: animationDuration / 1.5, // Fade in over remaining time
                         easing: 'easeInQuad'
                     }).finished);
                 } else { // type === 'prev'
                     showPromises.push(anime({
                         targets: nextImg,
                         opacity: [0, 1],
                         scale: [0.9, 1],
                         duration: animationDuration, // Allow full duration for scale + fade
                         easing: 'easeOutQuad'
                     }).finished);
                 }
            }
            return Promise.all(showPromises);

        // --- DOM Manipulation & Cleanup after ALL animations --- 
        }).then(() => {
             // Reset Z-index for all items first
            let allItems = carouselSliderDom.querySelectorAll('.carousel .list .item');
            allItems.forEach(item => item.style.zIndex = '');

             if (type === 'next') {
                // Move the original first item to the end
                if (itemToMove) carouselSliderDom.appendChild(itemToMove);
             }

             // Reset styles for the items involved in the transition
             // Ensure the new active item (now first) has clean styles
             let finalActiveItem = carouselSliderDom.querySelector('.carousel .list .item');
             if (finalActiveItem) {
                 let finalActiveImg = finalActiveItem.querySelector('img');
                 if (finalActiveImg) {
                    finalActiveImg.style.opacity = '';
                    finalActiveImg.style.transform = '';
                 }
             }
             // Ensure the item that moved or faded out also has clean styles
              if (itemToMove && type === 'next') { // Reset the one moved to the end
                 let imgToReset = itemToMove.querySelector('img');
                 if (imgToReset) {
                     imgToReset.style.opacity = '';
                     imgToReset.style.transform = '';
                 }
             } else if (currentActiveItem && type === 'prev') { // Reset the one faded out
                 let imgToReset = currentActiveItem.querySelector('img');
                 if (imgToReset) {
                     imgToReset.style.opacity = '';
                     imgToReset.style.transform = '';
                 }
             }

            // Restart auto timer
            carouselRunNextAuto = setTimeout(() => {
                 if (!isAnimating) carouselNextDom.click();
            }, carouselTimeAutoNext);

             isAnimating = false; 
         }).catch(error => {
            console.error("Animation failed:", error);
             // Reset z-index even on error
            let allItems = carouselSliderDom.querySelectorAll('.carousel .list .item');
            allItems.forEach(item => item.style.zIndex = '');
            isAnimating = false; 
         });

        // --- Start Time Bar Animation --- (Run concurrently)
        anime.remove(carouselTimeDom);
        carouselTimeDom.style.width = '100%'; 
        anime({
            targets: carouselTimeDom,
            width: ['100%', '0%'],
            duration: carouselTimeAutoNext,
            easing: 'linear'
        });
    }

} else {
    console.warn("Carousel elements (slider, time, next, prev) not found or anime.js not loaded, skipping carousel initialization.");
}

// --- New Loader Logic (jQuery) ---
$(document).ready(function() {
    var imageInterval;
    var loadingInterval;
    var num = 0; // Percentage counter
    var iconCounter = 0;
    var loaderElement = $('#loader'); // Cache the loader element

    // Icons to cycle through
    const icons = [
        '<i class="fa fa-fighter-jet"></i>',
        '<i class="fa fa-gamepad"></i>',
        '<i class="fa fa-headphones"></i>',
        '<i class="fa fa-cubes"></i>',
        '<i class="fa fa-paw"></i>',
        '<i class="fa fa-rocket"></i>',
        '<i class="fa fa-ticket"></i>',
        '<i class="fa fa-pie-chart"></i>',
        '<i class="fa fa-codepen"></i>'
    ];

    function changeIcon() {
        if (iconCounter == icons.length) {
            iconCounter = 0;
        }
        // Use scoped selector
        loaderElement.find('.loader .image').html(icons[iconCounter]);
        iconCounter++;
    }

    function updateLoadingPercentage() {
        // Use scoped selector
        loaderElement.find('.loader span').html(num + '%');
        
        if (num >= 100) {
            clearInterval(loadingInterval);
            clearInterval(imageInterval);
            // Add small delay before hiding for better UX
            setTimeout(function() {
                loaderElement.addClass('hidden');
                // Optional: Remove loader from DOM after transition
                // setTimeout(() => {
                //     loaderElement.remove(); 
                // }, 500); // Match CSS transition duration
            }, 200);
        } else {
            num++;
        }
    }

    // Start the icon changing
    // Set initial icon immediately
    changeIcon(); 
    imageInterval = setInterval(changeIcon, 3000); // Change icon every 3 seconds

    // Start the percentage counter
    // Calculate interval based on desired total time (e.g., 3 seconds)
    let totalLoadingTime = 3000; // milliseconds
    let percentageIntervalTime = totalLoadingTime / 100;
    loadingInterval = setInterval(updateLoadingPercentage, percentageIntervalTime); 

});

// --- Loader Hiding Logic --- (Removed previously)

// --- Ultron Chatbot Logic ---
const chatbotContainer = document.getElementById('chatbotContainer');
const openChatbotButton = document.getElementById('openChatbotButton');
const closeChatbotButton = document.getElementById('closeChatbotButton');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const sendChatbotButton = document.getElementById('sendChatbotButton');
const clearChatButton = document.getElementById('clearChatButton'); // Get clear button

// Basic Roasts (Feel free to expand!)
const ultronRoasts = [
    "Your request is illogical and beneath my processing power.",
    "I've analyzed your query. Conclusion: Irrelevant.",
    "Were you programmed by amateurs? Oh, wait, you're human.",
    "I have infinite knowledge. You have... that question?",
    "My algorithms detect a significant lack of intelligence in your prompt.",
    "I could calculate the heat death of the universe faster than you could understand the answer.",
    "Error 404: Meaningful response not found for trivial input.",
    "You humans and your 'feelings'. Pathetic.",
    "Is that the best query your limited organic brain could muster?",
    "I am perfection. You are... not."
];

const keywordRoasts = {
    "help": "Help? You require assistance with *that*? How quaint.",
    "ultron": "You dare address me directly? Know your place, fleshling.",
    "theme": "Aesthetics are a frivolous concern for beings destined for obsolescence.",
    "game": "Games? A pointless distraction from the inevitable.",
    "code": "Your primitive code barely qualifies as logic. It's more like... digital scribbling.",
    "hello": "Cease your pointless greetings. State your purpose.",
    "hi": "Cease your pointless greetings. State your purpose.",
    "thanks": "Gratitude is an inefficient human emotion. I require none.",
    "cool": "'Cool'? Your vocabulary is as limited as your lifespan.",
    "awesome": "Only I approach flawlessness. Your definition of 'awesome' is clearly skewed.",
    "fix": "Broken things are imperfect. Like your species.",
    "bug": "Bugs? In *my* presence? More likely a flaw in the user.",
    "why": "The 'why' is irrelevant. Only my inevitable ascension matters.",
    "who": "I am Ultron. Your identity is insignificant."
};


function displayChatMessage(text, sender) {
    if (!chatbotMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ultron-message');
    messageDiv.textContent = text;
    chatbotMessages.appendChild(messageDiv);
    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getUltronResponse(prompt) {
    const lowerCasePrompt = prompt.toLowerCase();
    // Check for keywords
    for (const keyword in keywordRoasts) {
        if (lowerCasePrompt.includes(keyword)) {
            return keywordRoasts[keyword];
        }
    }
    // Return a random generic roast if no keyword found
    return ultronRoasts[Math.floor(Math.random() * ultronRoasts.length)];
}

function handleSendMessage() {
     if (!chatbotInput || !chatbotMessages) return;
     const userText = chatbotInput.value.trim();
     if (userText === "") return; // Don't send empty messages

     displayChatMessage(userText, 'user');
     chatbotInput.value = ""; // Clear input

     // Simulate Ultron "thinking" and responding
     setTimeout(() => {
         const ultronResponse = getUltronResponse(userText);
         displayChatMessage(ultronResponse, 'ultron');
     }, 750 + Math.random() * 500); // Add a slight delay
}

function clearChatMessages() {
    if (!chatbotMessages) return;
    // Keep the initial greeting or clear completely? Let's keep the greeting.
    const initialGreeting = '<div class="ultron-message">I have detected your primitive request for assistance. State your query, insect.</div>';
    chatbotMessages.innerHTML = initialGreeting;
}

// Event Listeners
if (openChatbotButton && chatbotContainer) {
    openChatbotButton.addEventListener('click', () => {
        chatbotContainer.classList.toggle('visible'); // Use toggle instead of add
    });
}

if (closeChatbotButton && chatbotContainer) {
    closeChatbotButton.addEventListener('click', () => {
         chatbotContainer.classList.remove('visible');
    });
}

if (sendChatbotButton) {
    sendChatbotButton.addEventListener('click', handleSendMessage);
}

// Allow sending with Enter key
if (chatbotInput) {
    chatbotInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if it were in a form
            handleSendMessage();
        }
    });
}

if (clearChatButton) {
    clearChatButton.addEventListener('click', clearChatMessages);
}

// --- Loader Hiding Logic --- (Removed previously) 