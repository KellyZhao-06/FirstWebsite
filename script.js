const icons = document.querySelectorAll(".icon");
const windows = document.querySelectorAll(".window");

let highestZ = 20;

// Open window when clicking icon
icons.forEach(icon => {
  icon.addEventListener("click", () => {
    const windowId = icon.getAttribute("data-window");
    const win = document.getElementById(windowId);

    win.classList.remove("hidden");
    highestZ++;
    win.style.zIndex = highestZ;
  });
});

// Close buttons
document.querySelectorAll(".close-btn").forEach(button => {
  button.addEventListener("click", (e) => {
    const win = e.target.closest(".window");
    win.classList.add("hidden");
  });
});

// Bring window to front when clicked
windows.forEach(win => {
  win.addEventListener("mousedown", () => {
    highestZ++;
    win.style.zIndex = highestZ;
  });
});

// Drag functionality
windows.forEach(win => {
  const titleBar = win.querySelector(".title-bar");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titleBar.addEventListener("mousedown", (e) => {
    isDragging = true;

    highestZ++;
    win.style.zIndex = highestZ;

    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
});
