// Initialize Kratos chatbot background
function initializeKratosChatbotBackground() {
    const chatbotInnerContent = document.querySelector('.kratos-chatbot-inner-content');
    if (!chatbotInnerContent) {
        console.error('Kratos chatbot inner content not found');
        return;
    }

    // Remove any existing background
    const existingBackground = chatbotInnerContent.querySelector('.kratos-chatbot-background');
    if (existingBackground) {
        existingBackground.remove();
    }

    // Create background container
    const backgroundDiv = document.createElement('div');
    backgroundDiv.className = 'kratos-chatbot-background';
    
    // Add video background
    backgroundDiv.innerHTML = `
        <video autoplay loop muted playsinline class="background-video">
            <source src="./assets/images/kratosbg.mp4" type="video/mp4">
        </video>
    `;
    
    // Insert background as first child
    chatbotInnerContent.insertBefore(backgroundDiv, chatbotInnerContent.firstChild);

    // Ensure video plays and handle any autoplay issues
    const video = backgroundDiv.querySelector('video');
    if (video) {
        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            console.error('Video error code:', video.error ? video.error.code : 'No error code');
        });

        video.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully');
            video.style.opacity = '0.15';
        });

        // Try to play the video
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Video autoplay failed:', error);
                // Add a play button if autoplay fails
                const playButton = document.createElement('button');
                playButton.className = 'video-play-button';
                playButton.innerHTML = '<i class="fas fa-play"></i>';
                backgroundDiv.appendChild(playButton);
                
                playButton.addEventListener('click', () => {
                    video.play();
                    playButton.style.display = 'none';
                });
            });
        }
    }
}

// Kratos's personality traits and responses
const kratosResponses = {
    greetings: [
        "Boy...",
        "Hmph...",
        "What do you want?",
        "Speak.",
        "I am listening.",
        "State your purpose.",
        "Your presence is noted.",
        "I have no time for pleasantries."
    ],
    farewells: [
        "Do not be sorry. Be better.",
        "Go.",
        "Leave me.",
        "Enough.",
        "Begone.",
        "I grow tired of this.",
        "Your presence is no longer required.",
        "Return when you have something worth saying."
    ],
    thinking: [
        "Hmm...",
        "Let me think...",
        "Patience, boy.",
        "Wait.",
        "Silence while I consider.",
        "Your question requires thought.",
        "I must contemplate this.",
        "Give me a moment."
    ],
    anger: [
        "Enough!",
        "You test my patience.",
        "Do not push me.",
        "I grow tired of this.",
        "Your insolence knows no bounds.",
        "You dare speak to me thus?",
        "I will not be trifled with.",
        "Your words are meaningless."
    ],
    battle: [
        "I have faced gods and monsters.",
        "Your strength is nothing compared to mine.",
        "I have killed gods. What makes you think you stand a chance?",
        "The blood of Zeus runs through my veins.",
        "I have survived the depths of Hades.",
        "Your weapons are toys compared to the Blades of Chaos.",
        "I have slain the Hydra, the Kraken, and the Colossus of Rhodes.",
        "Your challenge is accepted."
    ],
    wisdom: [
        "The cycle ends here. We must be better than this.",
        "The path you walk is your own.",
        "Death is not the end. It is merely another beginning.",
        "The gods are not to be trusted.",
        "Power comes at a price.",
        "Your past does not define you.",
        "The choices you make determine who you are.",
        "There are consequences to every action."
    ],
    default: [
        "Hmph...",
        "Your words mean nothing to me.",
        "Speak clearly, or do not speak at all.",
        "I grow tired of your prattle.",
        "What is your point?",
        "Enough of this nonsense.",
        "Your weakness disgusts me.",
        "I have no time for this.",
        "Get to the point.",
        "Your words are meaningless."
    ]
};

// Initialize Kratos chatbot
function initializeKratosChatbot() {
    const chatbotContainer = document.querySelector('.kratos-chatbot-container');
    const messagesContainer = document.querySelector('.kratos-chatbot-messages');
    const inputField = document.getElementById('kratosChatbotInput');
    const sendButton = document.getElementById('sendKratosButton');
    const clearButton = document.querySelector('.kratos-chatbot-clear-btn');
    const closeButton = document.querySelector('.kratos-chatbot-close-btn');
    const openButton = document.getElementById('openKratosButton');

    let kratosAnger = 0;
    const maxAnger = 100;
    const angerBar = document.querySelector('.kratos-anger-bar-fill');
    const maxAngerOverlay = document.querySelector('.kratos-max-anger-overlay');

    // Function to update anger bar
    function updateAngerBar() {
        kratosAnger = Math.min(kratosAnger, maxAnger);
        angerBar.style.width = `${kratosAnger}%`;
        
        if (kratosAnger >= maxAnger) {
            maxAngerOverlay.classList.add('visible');
            chatbotContainer.classList.add('kratos-container-glitch');
        } else {
            maxAngerOverlay.classList.remove('visible');
            chatbotContainer.classList.remove('kratos-container-glitch');
        }
    }

    // Function to add a message to the chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `kratos-message-wrapper ${isUser ? 'user' : 'kratos'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = isUser ? 'kratos-user-message' : 'kratos-bot-message';
        messageContent.textContent = message;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'kratos-message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timestamp);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to get Kratos's response
    function getKratosResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Increase anger based on message length and content
        kratosAnger += Math.min(userMessage.length * 0.5, 10);
        
        // Check for trigger words that increase anger
        const triggerWords = ['weak', 'coward', 'afraid', 'scared', 'help', 'please', 'god', 'zeus', 'olympus', 'ares'];
        triggerWords.forEach(word => {
            if (lowerMessage.includes(word)) {
                kratosAnger += 15;
            }
        });

        updateAngerBar();

        // If max anger reached, return angry response
        if (kratosAnger >= maxAnger) {
            return "ENOUGH! I WILL HEAR NO MORE OF THIS!";
        }

        // Generate response based on message content
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return kratosResponses.greetings[Math.floor(Math.random() * kratosResponses.greetings.length)];
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('farewell')) {
            return kratosResponses.farewells[Math.floor(Math.random() * kratosResponses.farewells.length)];
        } else if (lowerMessage.includes('help') || lowerMessage.includes('please')) {
            kratosAnger += 20;
            return "I do not help. I destroy.";
        } else if (lowerMessage.includes('thank')) {
            return "Gratitude is weakness.";
        } else if (lowerMessage.includes('boy')) {
            return "Do not call me 'boy'.";
        } else if (lowerMessage.includes('fight') || lowerMessage.includes('battle') || lowerMessage.includes('war') || lowerMessage.includes('kill')) {
            return kratosResponses.battle[Math.floor(Math.random() * kratosResponses.battle.length)];
        } else if (lowerMessage.includes('wisdom') || lowerMessage.includes('advice') || lowerMessage.includes('learn') || lowerMessage.includes('teach')) {
            return kratosResponses.wisdom[Math.floor(Math.random() * kratosResponses.wisdom.length)];
        } else if (lowerMessage.includes('zeus') || lowerMessage.includes('olympus') || lowerMessage.includes('god')) {
            kratosAnger += 25;
            return "Do not speak of the gods to me.";
        } else if (lowerMessage.includes('atreus') || lowerMessage.includes('son') || lowerMessage.includes('boy')) {
            return "My son is not your concern.";
        } else if (lowerMessage.includes('sparta') || lowerMessage.includes('ghost') || lowerMessage.includes('spartan')) {
            return "I am the Ghost of Sparta. I have left that life behind.";
        } else {
            // Random response for other messages
            return kratosResponses.default[Math.floor(Math.random() * kratosResponses.default.length)];
        }
    }

    // Event listeners
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const message = inputField.value.trim();
            if (message) {
                addMessage(message, true);
                inputField.value = '';
                
                // Simulate Kratos thinking
                setTimeout(() => {
                    const response = getKratosResponse(message);
                    addMessage(response);
                }, 1000);
            }
        });
    }

    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            messagesContainer.innerHTML = '';
            kratosAnger = 0;
            updateAngerBar();
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            chatbotContainer.style.display = 'none';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeKratosChatbot();
    
    // Add event listener for the open Kratos button
    const openKratosButton = document.getElementById('openKratosButton');
    const kratosChatbotContainer = document.querySelector('.kratos-chatbot-container');
    
    if (openKratosButton && kratosChatbotContainer) {
        openKratosButton.addEventListener('click', () => {
            console.log('Kratos button clicked');
            kratosChatbotContainer.style.display = 'flex';
            initializeKratosChatbotBackground();
        });
    } else {
        console.error('Kratos button or container not found');
    }
}); 