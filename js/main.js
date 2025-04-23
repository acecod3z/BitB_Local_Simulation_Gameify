const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const dragBar = document.getElementById("dragBar");
const loginButton = document.getElementById("loginButton");

let offsetX = 0, offsetY = 0, isDragging = false;

// Show popup when login button is clicked
loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    popup.style.display = "block";
    overlay.style.display = "block";
});

// Hide popup when clicking overlay
overlay.addEventListener("click", () => {
    popup.style.display = "none";
    overlay.style.display = "none";
});

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