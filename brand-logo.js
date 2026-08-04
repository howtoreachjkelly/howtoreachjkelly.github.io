document.querySelectorAll(".brand").forEach(function (brand) {
  var text = brand.querySelector("span");
  var logo = brand.querySelector(".brand-logo");
  if (text && logo) {
    logo.style.width = (text.offsetWidth * 2) + "px";
  }
});
