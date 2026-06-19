
(function() {
  var input = document.querySelector("[data-search-input]");
  var title = document.querySelector("[data-search-title]");
  var results = document.querySelector("[data-search-results]");
  var params = new URLSearchParams(window.location.search);
  var query = String(params.get("q") || "").trim();
  var list = Array.isArray(window.siteSearchIndex) ? window.siteSearchIndex : [];

  if (!results) {
    return;
  }

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function(char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function card(item) {
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(item.url) + '">',
      '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <a class="movie-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(item.type) + '</span>',
      '      <span>' + escapeHtml(item.genre) + '</span>',
      '    </div>',
      '    <p>' + escapeHtml(item.oneLine) + '</p>',
      '  </div>',
      '</article>'
    ].join("");
  }

  var filtered = list.slice();
  if (query) {
    var q = normalize(query);
    filtered = list.filter(function(item) {
      var haystack = normalize([
        item.title,
        item.year,
        item.type,
        item.region,
        item.genre,
        item.category,
        (item.tags || []).join(" "),
        item.oneLine
      ].join(" "));
      return haystack.indexOf(q) !== -1;
    });
  } else {
    filtered.sort(function(a, b) {
      return Number(b.score || 0) - Number(a.score || 0);
    });
  }

  filtered = filtered.slice(0, 120);

  if (title) {
    title.textContent = query ? "搜索结果：" + query : "热门片库";
  }

  if (!filtered.length) {
    results.innerHTML = '<div class="empty-result">没有匹配内容，可更换关键词继续搜索。</div>';
    return;
  }

  results.innerHTML = filtered.map(card).join("");
})();
