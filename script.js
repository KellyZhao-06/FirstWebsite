const desktop = document.getElementById("desktop");
const icons = document.querySelectorAll(".icon");
const windows = document.querySelectorAll(".window");

let highestZ = 20;

const GRID_X = 96;
const GRID_Y = 100;
const DESKTOP_PADDING = 8;
const TASKBAR_HEIGHT = 40;

function bringToFront(win) {
  highestZ++;
  win.style.zIndex = highestZ;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getPointerPosition(event) {
  if (event.touches && event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  if (event.changedTouches && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    };
  }
  return {
    x: event.clientX,
    y: event.clientY
  };
}

function openWindowById(windowId) {
  const win = document.getElementById(windowId);
  if (!win) return;
  win.classList.remove("hidden");
  bringToFront(win);
}

function snapIconToGrid(icon, proposedLeft, proposedTop) {
  const desktopRect = desktop.getBoundingClientRect();
  const maxLeft = desktopRect.width - icon.offsetWidth - DESKTOP_PADDING;
  const maxTop = desktopRect.height - TASKBAR_HEIGHT - icon.offsetHeight - DESKTOP_PADDING;

  let snappedLeft = Math.round((proposedLeft - DESKTOP_PADDING) / GRID_X) * GRID_X + DESKTOP_PADDING;
  let snappedTop = Math.round((proposedTop - DESKTOP_PADDING) / GRID_Y) * GRID_Y + DESKTOP_PADDING;

  snappedLeft = clamp(snappedLeft, DESKTOP_PADDING, Math.max(DESKTOP_PADDING, maxLeft));
  snappedTop = clamp(snappedTop, DESKTOP_PADDING, Math.max(DESKTOP_PADDING, maxTop));

  icon.style.left = `${snappedLeft}px`;
  icon.style.top = `${snappedTop}px`;
}

function makeWindowDraggable(win) {
  const titleBar = win.querySelector(".title-bar");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function startDrag(event) {
    const target = event.target;
    if (target.classList.contains("close-btn")) return;

    dragging = true;
    bringToFront(win);

    const pointer = getPointerPosition(event);
    offsetX = pointer.x - win.offsetLeft;
    offsetY = pointer.y - win.offsetTop;

    event.preventDefault();
  }

  function onMove(event) {
    if (!dragging) return;

    const pointer = getPointerPosition(event);
    const desktopRect = desktop.getBoundingClientRect();

    const maxLeft = desktopRect.width - win.offsetWidth;
    const maxTop = desktopRect.height - TASKBAR_HEIGHT - win.offsetHeight;

    const newLeft = clamp(pointer.x - offsetX, 0, Math.max(0, maxLeft));
    const newTop = clamp(pointer.y - offsetY, 0, Math.max(0, maxTop));

    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;

    event.preventDefault();
  }

  function stopDrag() {
    dragging = false;
  }

  titleBar.addEventListener("mousedown", startDrag);
  titleBar.addEventListener("touchstart", startDrag, { passive: false });

  document.addEventListener("mousemove", onMove);
  document.addEventListener("touchmove", onMove, { passive: false });

  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchend", stopDrag);
}

function makeIconDraggable(icon) {
  let dragging = false;
  let moved = false;
  let offsetX = 0;
  let offsetY = 0;

  function selectOnlyThisIcon() {
    icons.forEach(i => i.classList.remove("selected"));
    icon.classList.add("selected");
  }

  function startDrag(event) {
    const pointer = getPointerPosition(event);
    dragging = true;
    moved = false;

    selectOnlyThisIcon();

    offsetX = pointer.x - icon.offsetLeft;
    offsetY = pointer.y - icon.offsetTop;

    event.preventDefault();
  }

  function onMove(event) {
    if (!dragging) return;

    const pointer = getPointerPosition(event);
    const newLeft = pointer.x - offsetX;
    const newTop = pointer.y - offsetY;

    if (Math.abs(newLeft - icon.offsetLeft) > 3 || Math.abs(newTop - icon.offsetTop) > 3) {
      moved = true;
    }

    icon.style.left = `${newLeft}px`;
    icon.style.top = `${newTop}px`;

    event.preventDefault();
  }

  function stopDrag() {
    if (!dragging) return;
    dragging = false;

    snapIconToGrid(icon, icon.offsetLeft, icon.offsetTop);

    setTimeout(() => {
      moved = false;
    }, 0);
  }

  icon.addEventListener("mousedown", startDrag);
  icon.addEventListener("touchstart", startDrag, { passive: false });

  document.addEventListener("mousemove", onMove);
  document.addEventListener("touchmove", onMove, { passive: false });

  document.addEventListener("mouseup", stopDrag);
  document.addEventListener("touchend", stopDrag);

  icon.addEventListener("click", () => {
    selectOnlyThisIcon();
  });

  icon.addEventListener("dblclick", () => {
    if (moved) return;
    const windowId = icon.getAttribute("data-window");
    openWindowById(windowId);
  });
}

/* Close buttons */
document.querySelectorAll(".close-btn").forEach(button => {
  button.addEventListener("click", (e) => {
    const win = e.target.closest(".window");
    win.classList.add("hidden");
  });
});

/* Bring window to front when clicked */
windows.forEach(win => {
  win.addEventListener("mousedown", () => bringToFront(win));
  win.addEventListener("touchstart", () => bringToFront(win), { passive: true });
  makeWindowDraggable(win);
});

/* Make icons draggable + double click */
icons.forEach(icon => {
  makeIconDraggable(icon);
});

/* Click desktop to deselect icons */
desktop.addEventListener("click", (e) => {
  if (e.target === desktop) {
    icons.forEach(icon => icon.classList.remove("selected"));
  }
});
