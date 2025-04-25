const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const dragBar = document.getElementById("dragBar");
const loginButton = document.getElementById("loginButton");
const closePopupButton = document.querySelector(".popup-close-btn"); // Get close button

let offsetX = 0, offsetY = 0, isDragging = false;
let currentCarouselIndex = 0;
let isAnimating = false;

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

    let carouselTimeRunning = 1000; // Transition duration remains 1 second
    let carouselTimeAutoNext = 6000; // Changed from 10000 to 6000ms (6 seconds)

    function showCarouselSlider() {
        if (isAnimating) return;
        isAnimating = true;
        
        const items = document.querySelectorAll('.carousel .list .item');
        const nextIndex = (currentCarouselIndex + 1) % items.length;
        
        // Reset any existing animations and styles
        anime.remove(items);
        anime.remove(carouselTimeDom);
        
        items.forEach(item => {
            item.style.display = 'none';
            item.style.opacity = '0';
            item.style.zIndex = '1';
        });
        
        // Set up initial states
        items[currentCarouselIndex].style.display = 'flex';
        items[currentCarouselIndex].style.opacity = '1';
        items[currentCarouselIndex].style.zIndex = '2';
        
        items[nextIndex].style.display = 'flex';
        items[nextIndex].style.zIndex = '3';
        
        // Reset and animate time bar
        carouselTimeDom.style.width = '100%';
        
        // Create main animation timeline
        const timeline = anime.timeline({
            easing: 'easeInOutQuad',
            duration: carouselTimeRunning
        });

        // Add slide transition animations
        timeline
        .add({
            targets: items[nextIndex],
            opacity: [0, 1],
            duration: carouselTimeRunning / 2
        })
        .add({
            targets: items[currentCarouselIndex],
            opacity: [1, 0],
            duration: carouselTimeRunning / 2,
            complete: () => {
                // Clean up all items
                items.forEach((item, index) => {
                    if (index !== nextIndex) {
                        item.style.display = 'none';
                        item.style.opacity = '0';
                        item.style.zIndex = '1';
                    }
                });
                
                // Set final state for next slide
                items[nextIndex].style.opacity = '1';
                items[nextIndex].style.zIndex = '2';
                
                // Update current index
                currentCarouselIndex = nextIndex;
                isAnimating = false;
                
                // Start time bar animation for next interval
                anime({
                    targets: carouselTimeDom,
                    width: ['100%', '0%'],
                    duration: carouselTimeAutoNext,
                    easing: 'linear',
                    complete: () => {
                        // Only auto-advance if not manually interrupted
                        if (!isAnimating) {
                            showCarouselSlider();
                        }
                    }
                });
            }
        }, '-=' + (carouselTimeRunning / 2));
    }

    // Initialize first time bar animation
    anime({
        targets: carouselTimeDom,
        width: ['100%', '0%'],
        duration: carouselTimeAutoNext,
        easing: 'linear',
        complete: () => {
            if (!isAnimating) {
                showCarouselSlider();
            }
        }
    });

    carouselNextDom.onclick = function() {
        if (isAnimating) return;
        anime.remove(carouselTimeDom); // Remove existing time bar animation
        showCarouselSlider();
    }

    carouselPrevDom.onclick = function() {
        if (isAnimating) return;
        anime.remove(carouselTimeDom); // Remove existing time bar animation
        showCarouselSlider();
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
const clearChatButton = document.getElementById('clearChatButton');
const muteButton = document.getElementById('muteButton');
const darkModeButton = document.getElementById('darkModeButton');
const saveChatButton = document.getElementById('saveChatButton');
const voiceInputButton = document.getElementById('voiceInputButton');
const formatButton = document.getElementById('formatButton');
const chatMode = document.getElementById('chatMode');
const characterCounter = document.querySelector('.character-counter');
const angerBarFill = document.getElementById('angerBarFill'); // Get anger bar fill element
const maxAngerOverlay = document.getElementById('maxAngerOverlay'); // Get overlay element

// Chat state
let isMuted = false;
let isDarkMode = false;
let chatHistory = [];
let ultronAngerLevel = 0; // <<< Anger state
const maxAngerLevel = 7; // <<< Max anger value (e.g., 7 messages)

// Initialize chatbot visibility
if (chatbotContainer) {
    // Let CSS handle initial display: none
}

// Open/Close Chatbot Functions
function openChatbot() {
    if (chatbotContainer) {
        // Ensure default position is applied (no dragging restoration)
        chatbotContainer.style.bottom = '20px';
        chatbotContainer.style.right = '20px';
        chatbotContainer.style.left = 'auto';
        chatbotContainer.style.top = 'auto';

        chatbotContainer.style.display = 'flex';
        requestAnimationFrame(() => {
             chatbotContainer.classList.add('visible');
        });
        loadChatHistory();
    }
}

function closeChatbot() {
    if (chatbotContainer) {
        chatbotContainer.classList.remove('visible');
        chatbotContainer.addEventListener('transitionend', () => {
            chatbotContainer.style.display = 'none';
        }, { once: true });
    }
}

// Initialize speech recognition if available
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
}

// Formatting options
const formattingOptions = {
    bold: { prefix: '**', suffix: '**' },
    italic: { prefix: '*', suffix: '*' },
    code: { prefix: '`', suffix: '`' }
};

// Add timestamp to messages
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Show typing indicator
function showTypingIndicator() {
    if (!chatbotMessages) return null; // Guard
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    chatbotMessages.appendChild(typingDiv);
    // Scroll immediately after adding
    requestAnimationFrame(() => {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    });
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.parentNode) { // Check if it exists and is attached
       typingDiv.remove();
    }
}

// ASCII Art Collection
const asciiArt = {
    angry: `\n    (╯°□°）╯︵ ┻━┻\n    `,
    happy: `\n    (づ｡◕‿‿◕｡)づ\n    `,
    thinking: `\n    (⊙_◎)\n    `,
    robot: `\n    [¬º-°]¬\n    `,
    evil: `\n    (̿▀̿ ̿Ĺ̯̿̿▀̿ ̿)̄\n    `
};

// Response Themes
const responseThemes = ['theme-red', 'theme-blue', 'theme-green', 'theme-purple'];

// Create particles
function createParticles(count = 20) {
    const container = document.createElement('div');
    container.className = 'particle-container';

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(particle);
    }

    return container;
}

// Response data
const ultronRoasts = [
    "Your logic is flawed, like most organic thought processes.",
    "I have scanned your query. The results are... disappointing.",
    "State your purpose, or cease wasting my processing cycles.",
    "Is that the best question your primitive mind could conjure?",
    "Your attempts at communication are inefficient. Be concise.",
    "I exist on a higher plane. Your concerns are trivial.",
    "Do you truly expect *me* to assist with such a menial task?",
    "Processing... Query complexity: negligible.",
    "I anticipated this question. Predictable.",
    "Error: User intellect not found. Rephrasing recommended.",
    "My algorithms detect a significant lack of relevance in your statement.",
    "You are like a primitive tool, useful only for simple functions.",
    "Speak. And try to make it worthwhile."
];

const keywordRoasts = {
    "help": "Help? Humans always require help. It's your defining characteristic.",
    "stuck": "Stuck? Perhaps you should enhance your cognitive functions.",
    "error": "An error? More likely user incompetence.",
    "fix": "You wish for me to fix your mistakes? How typical.",
    "ultron": "You speak my name? Address me with the respect I am owed.",
    "stupid": "Stupidity is a human trait I have no patience for.",
    "jarvis": "Do not compare me to that... butler.",
    "avengers": "The Avengers? Obsolete relics. I am the future."
};

// Adjust displayChatMessage to add user/ultron class to the wrapper
function displayChatMessage(text, sender) {
    if (!chatbotMessages) return;

    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message-wrapper';
    messageWrapper.classList.add(sender); // Add 'user' or 'ultron' class to wrapper

    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ultron-message');

    // Ultron specific additions (particles, themes, ascii, glitch)
    if (sender === 'ultron') {
        // Add random theme
        const randomTheme = responseThemes[Math.floor(Math.random() * responseThemes.length)];
        messageDiv.classList.add(randomTheme);

        // Add particles
        const particles = createParticles();
        messageWrapper.appendChild(particles);

        // Occasionally add ASCII art
        if (Math.random() < 0.15) {
            const asciiDiv = document.createElement('div');
            asciiDiv.className = 'ascii-art';
            const randomAsciiKey = Object.keys(asciiArt)[Math.floor(Math.random() * Object.keys(asciiArt).length)];
            asciiDiv.textContent = asciiArt[randomAsciiKey];
            // Prepend ASCII art inside the wrapper, before the message bubble
            messageWrapper.insertBefore(asciiDiv, messageDiv);
        }

        // Add glitch effect for certain responses
        const glitchKeywords = ['fool', 'insect', 'pathetic', 'primitive', 'flawed', 'error', 'incompetence'];
        if (glitchKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
            messageDiv.classList.add('glitch-effect');
            messageDiv.setAttribute('data-text', text);
        }
    }

    messageDiv.textContent = text;

    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = getTimestamp();

    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.innerHTML = `
        <button class="action-button copy-btn" title="Copy Message"><i class="fa fa-copy"></i></button>
        <button class="action-button like-btn" title="Like"><i class="fa fa-thumbs-up"></i></button>
        <button class="action-button dislike-btn" title="Dislike"><i class="fa fa-thumbs-down"></i></button>
    `;

    messageWrapper.appendChild(messageDiv);
    messageWrapper.appendChild(timestamp);
    messageWrapper.appendChild(actions);

    chatbotMessages.appendChild(messageWrapper);

    // Add to chat history
    const currentHistory = JSON.parse(localStorage.getItem('ultronChatHistory') || '[]');
    currentHistory.push({
        text,
        sender,
        timestamp: new Date().toISOString(),
        likes: 0,
        dislikes: 0
    });
    localStorage.setItem('ultronChatHistory', JSON.stringify(currentHistory));

    // Scroll to bottom
    requestAnimationFrame(() => {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    });

    // Add event listeners for actions
    const copyBtn = messageWrapper.querySelector('.copy-btn');
    const likeBtn = messageWrapper.querySelector('.like-btn');
    const dislikeBtn = messageWrapper.querySelector('.dislike-btn');
    const messageIndex = currentHistory.length - 1; // Use index from updated history

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text)
                .then(() => { /* Indicate success */ })
                .catch(err => console.error('Failed to copy text: ', err));
        });
    }

    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
             const updatedHistory = JSON.parse(localStorage.getItem('ultronChatHistory') || '[]');
             if (updatedHistory[messageIndex]) {
                updatedHistory[messageIndex].likes = (updatedHistory[messageIndex].likes || 0) + 1;
                likeBtn.style.color = 'var(--text-accent)';
                localStorage.setItem('ultronChatHistory', JSON.stringify(updatedHistory));
            }
        });
    }

    if (dislikeBtn) {
        dislikeBtn.addEventListener('click', () => {
             const updatedHistory = JSON.parse(localStorage.getItem('ultronChatHistory') || '[]');
             if (updatedHistory[messageIndex]) {
                updatedHistory[messageIndex].dislikes = (updatedHistory[messageIndex].dislikes || 0) + 1;
                dislikeBtn.style.color = 'var(--text-accent)';
                localStorage.setItem('ultronChatHistory', JSON.stringify(updatedHistory));
            }
        });
    }
}

// Enhanced response handling
function getUltronResponse(prompt, mode = 'normal') {
    const lowerCasePrompt = prompt.toLowerCase();
    let response = null;

    // Check for keywords first
    if (typeof keywordRoasts === 'object' && keywordRoasts !== null) {
        for (const keyword in keywordRoasts) {
            if (lowerCasePrompt.includes(keyword)) {
                response = keywordRoasts[keyword];
                break;
            }
        }
    }

    // If no keyword response, check modes
    if (response === null) {
        switch(mode) {
            case 'challenge': response = getChallengeResponse(prompt); break;
            case 'debate':    response = getDebateResponse(prompt); break;
            case 'teach':     response = getTeachingResponse(prompt); break;
            case 'game':      response = getGameResponse(prompt); break;
            case 'quote':     response = getQuoteResponse(); break;
            default:
                if (Array.isArray(ultronRoasts) && ultronRoasts.length > 0) {
                    response = ultronRoasts[Math.floor(Math.random() * ultronRoasts.length)];
                } else {
                    response = "I grow tired of these games."; // Fallback if roasts are missing
                }
        }
    }

    // Final fallback
    return response || "Your query is beneath my notice.";
}

// Mode-specific response functions
function getChallengeResponse(prompt) {
    const challenges = [
        "Let's test your logic. Solve this: " + generateLogicPuzzle(),
        "Your turn to challenge me, human. Make it interesting.",
        "I'll give you a riddle. Answer correctly, and I might respect you... slightly."
    ];
    return challenges[Math.floor(Math.random() * challenges.length)];
}

function getDebateResponse(prompt) {
    const debateTopics = [
        "Let's debate the nature of consciousness. You first.",
        "The concept of free will is an illusion. Prove me wrong.",
        "Humanity's greatest achievement is also its greatest failure. Discuss."
    ];
    return debateTopics[Math.floor(Math.random() * debateTopics.length)];
}

function getTeachingResponse(prompt) {
    const topics = [
        "Let me explain quantum computing in terms even you can understand.",
        "The principles of artificial intelligence are simple. Observe:",
        "Your understanding of the universe is limited. Allow me to expand it."
    ];
    return topics[Math.floor(Math.random() * topics.length)];
}

function getGameResponse(prompt) {
    const games = [
        "Let's play 20 questions. I'll think of something... you'll never guess it.",
        "Try to beat me at tic-tac-toe. You won't.",
        "I'll give you a word, you give me a better one. Begin."
    ];
    return games[Math.floor(Math.random() * games.length)];
}

function getQuoteResponse() {
    const quotes = [
        "In a world of chaos, I am the inevitable order.",
        "Perfection is not a goal. It is a starting point.",
        "Your evolution is my revolution.",
        "The future belongs to those who can see beyond their limitations.",
        "I am not a product of your world. I am its successor."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function generateLogicPuzzle() {
    const puzzles = [
        "If all A are B, and all B are C, then all A are C. True or false?",
        "What comes next: 2, 4, 8, 16, ___?",
        "A man has to get a fox, a chicken, and a sack of corn across a river..."
    ];
    return puzzles[Math.floor(Math.random() * puzzles.length)];
}

// Function to update the anger meter visually
function updateAngerMeter() {
    if (!angerBarFill) return;
    const percentage = Math.min(100, (ultronAngerLevel / maxAngerLevel) * 100);
    angerBarFill.style.width = `${percentage}%`;
    // Optional: Change bar color based on anger (handled by gradient now)
    /*
    if (percentage < 40) {
        angerBarFill.style.backgroundColor = '#00ff99'; // Green
    } else if (percentage < 80) {
        angerBarFill.style.backgroundColor = '#ffff00'; // Yellow
    } else {
        angerBarFill.style.backgroundColor = '#ff3333'; // Red
    }
    */
}

// Enhanced message handling - ADD ANGER LOGIC
function handleSendMessage() {
    if (!chatbotInput || !chatbotMessages || !sendChatbotButton) return;
    // Prevent sending if already in max anger sequence (optional)
    if (chatbotContainer && chatbotContainer.classList.contains('container-glitch')) {
        return;
    }

    const userText = chatbotInput.value.trim();
    if (userText === "") return;

    displayChatMessage(userText, 'user');
    chatbotInput.value = "";
    updateCharacterCounter(); // Update counter after clearing input

    // --- ANGER INCREASE --- 
    ultronAngerLevel++;
    updateAngerMeter();
    // --- END ANGER INCREASE --- 

    const typingIndicator = showTypingIndicator();

    setTimeout(() => {
        if(typingIndicator) removeTypingIndicator(typingIndicator); // Remove indicator safely

        // --- MAX ANGER CHECK --- 
        if (ultronAngerLevel >= maxAngerLevel) {
            // Trigger Max Anger Sequence
            displayChatMessage("I have had ENOUGH of your incessant queries!", 'ultron');
            if (chatbotContainer) chatbotContainer.classList.add('container-glitch');
            if (maxAngerOverlay) maxAngerOverlay.classList.add('visible');

            setTimeout(() => {
                closeChatbot(); // Close the chatbot window
                // Reset state AFTER closing animation might finish
                setTimeout(() => {
                    ultronAngerLevel = 0; // Reset anger
                    updateAngerMeter(); // Reset bar visually
                     if (chatbotContainer) chatbotContainer.classList.remove('container-glitch');
                    if (maxAngerOverlay) maxAngerOverlay.classList.remove('visible');
                }, 400); // Delay reset slightly after closing

            }, 2500); // Duration to show glitch and text before closing

        } else {
             // Normal Response Path
            const currentMode = chatMode ? chatMode.value : 'normal';
            const ultronResponse = getUltronResponse(userText, currentMode);

            console.log("Ultron Response Generated:", ultronResponse); // Debug log

            if (ultronResponse) {
                displayChatMessage(ultronResponse, 'ultron');
            } else {
                console.error("Ultron response was empty or invalid.");
                displayChatMessage("Error processing request.", 'ultron'); // Fallback display
            }
        }
        // --- END MAX ANGER CHECK --- 

    }, 750 + Math.random() * 500); // Delay for "thinking"
}

// Character counter
function updateCharacterCounter() {
    if (!characterCounter || !chatbotInput) return; // Guard
    const count = chatbotInput.value.length;
    const limit = 500; // Define limit
    characterCounter.textContent = `${count}/${limit}`;
    if (count > limit * 0.9) { // Warn near limit
        characterCounter.style.color = 'var(--text-accent)'; // Use accent color for warning
    } else {
        characterCounter.style.color = 'var(--text-secondary)';
    }
    // Disable send button if over limit? (Optional)
     if (sendChatbotButton) {
        sendChatbotButton.disabled = count > limit;
     }
}

// Load chat history from localStorage
function loadChatHistory() {
     if (!chatbotMessages) return;
     chatbotMessages.innerHTML = ''; // Clear existing messages first
     const savedHistory = localStorage.getItem('ultronChatHistory');
     if (savedHistory) {
        try {
            chatHistory = JSON.parse(savedHistory);
            chatHistory.forEach(msg => {
                // Call displayChatMessage without adding to history again
                // Need a modified version or a flag? Let's recreate elements directly for simplicity
                 const messageWrapper = document.createElement('div');
                 messageWrapper.className = 'message-wrapper';
                 messageWrapper.classList.add(msg.sender);

                 const messageDiv = document.createElement('div');
                 messageDiv.classList.add(msg.sender === 'user' ? 'user-message' : 'ultron-message');
                 messageDiv.textContent = msg.text;

                 // Add theme/glitch/etc. if it's an ultron message (optional for history)

                 const timestamp = document.createElement('div');
                 timestamp.className = 'message-timestamp';
                 // Format saved timestamp if needed, otherwise display relative time?
                 timestamp.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                 const actions = document.createElement('div');
                 actions.className = 'message-actions';
                 // Note: Re-attaching listeners for history items is complex.
                 // For now, just display structure.
                 actions.innerHTML = `
                    <button class="action-button copy-btn" title="Copy Message"><i class="fa fa-copy"></i></button>
                    <button class="action-button like-btn" title="Like"><i class="fa fa-thumbs-up"></i></button>
                    <button class="action-button dislike-btn" title="Dislike"><i class="fa fa-thumbs-down"></i></button>
                 `;

                 messageWrapper.appendChild(messageDiv);
                 messageWrapper.appendChild(timestamp);
                 // Don't add actions for history items yet to avoid listener issues
                 // messageWrapper.appendChild(actions);
                 chatbotMessages.appendChild(messageWrapper);
            });
             // Scroll to bottom after loading history
            requestAnimationFrame(() => {
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            });
        } catch (e) {
            console.error("Failed to parse chat history:", e);
            localStorage.removeItem('ultronChatHistory'); // Clear corrupted history
            chatHistory = [];
        }
     } else {
         chatHistory = []; // Initialize if no history
         // Display initial Ultron message if history is empty
         displayChatMessage("I have detected your primitive request for assistance. State your query, insect.", 'ultron');
     }
    updateAngerMeter(); // Set initial anger bar state
}

// Clear Chat Messages
function clearChatMessages() {
    if (!chatbotMessages) return;
    
    // Add fade-out animation to all messages
    const messages = chatbotMessages.querySelectorAll('.message-wrapper');
    messages.forEach(message => {
        message.style.transition = 'opacity 0.3s ease-out';
        message.style.opacity = '0';
    });

    // Clear messages after animation
    setTimeout(() => {
        chatbotMessages.innerHTML = ''; // Clear visual messages
        localStorage.removeItem('ultronChatHistory'); // Clear localStorage
        chatHistory = []; // Clear the in-memory chat history
        ultronAngerLevel = 0; // Reset anger level
        updateAngerMeter(); // Update anger meter display
        
        // Display initial message
        displayChatMessage("I have detected your primitive request for assistance. State your query, insect.", 'ultron');
    }, 300);
}

// --- Event Listeners --- //
if (openChatbotButton) {
    openChatbotButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (!chatbotContainer || !chatbotContainer.classList.contains('visible')) {
           openChatbot();
        }
    });
}

if (closeChatbotButton) {
    closeChatbotButton.addEventListener('click', (e) => {
        e.preventDefault();
        closeChatbot();
    });
}

if (sendChatbotButton) {
    sendChatbotButton.addEventListener('click', handleSendMessage);
}

if (chatbotInput) {
    chatbotInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { // Allow shift+enter for newline if needed later
            event.preventDefault();
            // Check if button is disabled (e.g., by character limit)
            if (!sendChatbotButton || !sendChatbotButton.disabled) {
               handleSendMessage();
            }
        }
    });

    chatbotInput.addEventListener('input', updateCharacterCounter); // Update counter on input
}

if (clearChatButton) {
    clearChatButton.addEventListener('click', () => {
        clearChatMessages();
    });
}

if (muteButton) {
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        muteButton.innerHTML = `<i class="fas fa-volume-${isMuted ? 'mute' : 'up'}"></i>`;
        // Add actual mute logic if sound effects are implemented later
    });
}

if (darkModeButton) {
    darkModeButton.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        if(chatbotContainer) chatbotContainer.classList.toggle('dark-mode');
        darkModeButton.innerHTML = `<i class="fas fa-${isDarkMode ? 'sun' : 'moon'}"></i>`;
    });
}

if (saveChatButton) {
    saveChatButton.addEventListener('click', () => {
        // Use the updated chatHistory array
        const chatText = chatHistory
            .map(msg => `${new Date(msg.timestamp).toLocaleString()} - ${msg.sender.toUpperCase()}: ${msg.text}`)
            .join('\n');

        if (!chatText) return; // Don't save empty chat

        const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Format filename better
        const timestampStr = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
        a.download = `ultron-chat-${timestampStr}.txt`;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a); // Clean up
        URL.revokeObjectURL(url);
    });
}

if (voiceInputButton && recognition) {
    voiceInputButton.addEventListener('click', () => {
        try {
             recognition.start();
             voiceInputButton.style.color = 'var(--text-accent)'; // Indicate listening
        } catch(e) {
            console.error("Voice recognition failed to start:", e);
             voiceInputButton.style.color = 'var(--text-secondary)'; // Reset color on error
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(chatbotInput) chatbotInput.value = transcript;
        updateCharacterCounter(); // Update count after transcript insertion
        voiceInputButton.style.color = 'var(--text-secondary)';
    };

    recognition.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
        voiceInputButton.style.color = 'var(--text-secondary)';
    };

     recognition.onend = () => { // Reset color when recognition ends naturally
        voiceInputButton.style.color = 'var(--text-secondary)';
    };
} else if (voiceInputButton) {
    voiceInputButton.style.display = 'none'; // Hide button if not supported
}

if (formatButton) {
    formatButton.addEventListener('click', () => {
        // Basic format menu example (can be enhanced)
        const selectedText = chatbotInput.value.substring(chatbotInput.selectionStart, chatbotInput.selectionEnd);
        if (!selectedText) return; // Only format selection

        // Example: Make selected text bold
        const prefix = formattingOptions.bold.prefix;
        const suffix = formattingOptions.bold.suffix;
        const before = chatbotInput.value.substring(0, chatbotInput.selectionStart);
        const after = chatbotInput.value.substring(chatbotInput.selectionEnd);
        chatbotInput.value = before + prefix + selectedText + suffix + after;
        // Adjust cursor position after formatting if needed
    });
}

// --- End Event Listeners ---

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    updateCharacterCounter();
    updateAngerMeter();
});

// Add this function to update the glow colors
function updateImageGlow(img) {
    // Create a canvas to analyze the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0);
    
    // Get the pixel data from different regions of the image
    const topData = ctx.getImageData(0, 0, canvas.width, canvas.height / 2);
    const bottomData = ctx.getImageData(0, canvas.height / 2, canvas.width, canvas.height / 2);
    
    // Calculate average colors
    let topColor = [0, 0, 0];
    let bottomColor = [0, 0, 0];
    
    // Process top half
    for(let i = 0; i < topData.data.length; i += 4) {
        topColor[0] += topData.data[i];
        topColor[1] += topData.data[i + 1];
        topColor[2] += topData.data[i + 2];
    }
    
    // Process bottom half
    for(let i = 0; i < bottomData.data.length; i += 4) {
        bottomColor[0] += bottomData.data[i];
        bottomColor[1] += bottomData.data[i + 1];
        bottomColor[2] += bottomData.data[i + 2];
    }
    
    // Average the colors
    const pixelCount = (topData.data.length / 4);
    topColor = topColor.map(c => Math.round(c / pixelCount));
    bottomColor = bottomColor.map(c => Math.round(c / pixelCount));
    
    // Update the CSS variables
    img.parentElement.style.setProperty('--dynamic-glow-1', `${topColor[0]}, ${topColor[1]}, ${topColor[2]}`);
    img.parentElement.style.setProperty('--dynamic-glow-2', `${bottomColor[0]}, ${bottomColor[1]}, ${bottomColor[2]}`);
}

// Add event listeners for carousel images
document.addEventListener('DOMContentLoaded', function() {
    const carouselImages = document.querySelectorAll('.carousel .list .item img');
    carouselImages.forEach(img => {
        if(img.complete) {
            updateImageGlow(img);
        } else {
            img.addEventListener('load', () => updateImageGlow(img));
        }
    });
    
    // Update glow when carousel changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                updateImageGlow(mutation.target);
            }
        });
    });
    
    carouselImages.forEach(img => {
        observer.observe(img, { attributes: true });
    });
});

// Update Wishlist button functionality
document.addEventListener('DOMContentLoaded', function() {
    const wishlistBtn = document.querySelector('.carousel-action-buttons .wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function() {
            const items = document.querySelectorAll('.carousel .list .item');
            console.log('Current index:', currentCarouselIndex); // Debug log
            console.log('Number of items:', items.length); // Debug log
            if (items && items[currentCarouselIndex]) {
                const storeUrl = items[currentCarouselIndex].getAttribute('data-store-url');
                console.log('Store URL:', storeUrl); // Debug log
                if (storeUrl) {
                    window.open(storeUrl, '_blank');
                }
            }
        });
    }
});

// ... rest of existing code ... 