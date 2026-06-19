
(function() {
  var toolbar = document.querySelector("[data-catalog-toolbar]");
  var grid = document.querySelector("[data-catalog-grid]");

  if (!toolbar || !grid) {
    return;
  }

  var textInput = toolbar.querySelector("[data-filter-text]");
  var yearSelect = toolbar.querySelector("[data-filter-year]");
  var typeSelect = toolbar.querySelector("[data-filter-type]");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter() {
    var text = normalize(textInput && textInput.value);
    var year = normalize(yearSelect && yearSelect.value);
    var type = normalize(typeSelect && typeSelect.value);

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre")
      ].join(" "));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardType = normalize(card.getAttribute("data-type"));
      var matched = true;

      if (text && haystack.indexOf(text) === -1) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (type && cardType.indexOf(type) === -1) {
        matched = false;
      }

      card.classList.toggle("catalog-card-hidden", !matched);
    });
  }

  [textInput, yearSelect, typeSelect].forEach(function(control) {
    if (control) {
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    }
  });
})();
