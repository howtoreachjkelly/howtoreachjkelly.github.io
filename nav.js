// Mobile nav toggle. Loaded in <head> so the "nav-js" class is set before first paint:
// without JS the links simply stay visible (stacked) on small screens.
document.documentElement.classList.add("nav-js");

document.addEventListener("DOMContentLoaded", function () {
  var nav = document.querySelector("nav.site-nav");
  var button = nav && nav.querySelector(".nav-toggle");
  if (!button) return;

  function setOpen(open) {
    nav.classList.toggle("open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  button.addEventListener("click", function () {
    setOpen(!nav.classList.contains("open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      button.focus();
    }
  });

  // Close if the window grows past the mobile breakpoint (e.g. rotating a tablet)
  window.matchMedia("(min-width: 701px)").addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
});
