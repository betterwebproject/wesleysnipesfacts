// --- 1. Get saved theme or default to light
let currentTheme = sessionStorage.getItem("theme") || "light";

// --- 2. Apply theme on page load
const htmlEl = document.documentElement;
htmlEl.setAttribute("data-theme", currentTheme);

// --- 3. Update button text
const themeButton = document.querySelector("[data-theme-o-matic]");
function updateButtonText(theme) {
    themeButton.innerText = theme === "dark" ? "Lights On" : "Lights Off";
}
updateButtonText(currentTheme);

// --- 4. Handle toggle
themeButton.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    htmlEl.setAttribute("data-theme", currentTheme);
    sessionStorage.setItem("theme", currentTheme);
    updateButtonText(currentTheme);
});