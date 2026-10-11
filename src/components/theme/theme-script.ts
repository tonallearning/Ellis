export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("ellis-theme");
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
`;
