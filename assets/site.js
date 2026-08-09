/* PARACUDA-NG documentation site behaviour:
   colour scheme toggle, mobile drawer, tabbed blocks, code highlighting with
   copy buttons, heading anchors, section search and an active "On this page"
   marker. No build step and no external dependencies. */
(function () {
  "use strict";

  var doc = document;
  var body = doc.body;

  /* ---------------------------------------------------------------- theme */

  var STORAGE_KEY = "paracuda-color-scheme";

  function applyScheme(scheme) {
    body.setAttribute("data-md-color-scheme", scheme);
    var light = doc.querySelector("[data-scheme-to='slate']");
    var dark = doc.querySelector("[data-scheme-to='default']");
    if (light && dark) {
      light.hidden = scheme === "slate";
      dark.hidden = scheme !== "slate";
    }
  }

  var stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    stored = null;
  }
  var prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyScheme(stored || (prefersDark ? "slate" : "default"));

  Array.prototype.forEach.call(
    doc.querySelectorAll("[data-scheme-to]"),
    function (btn) {
      btn.addEventListener("click", function () {
        var next = btn.getAttribute("data-scheme-to");
        applyScheme(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {
          /* storage disabled, the choice simply does not persist */
        }
      });
    }
  );

  /* --------------------------------------------------------------- drawer */

  function setDrawer(open) {
    body.setAttribute("data-drawer", open ? "open" : "closed");
  }

  var drawerBtn = doc.querySelector(".md-header__button--drawer");
  var overlay = doc.querySelector(".md-overlay");
  if (drawerBtn) {
    drawerBtn.addEventListener("click", function () {
      setDrawer(body.getAttribute("data-drawer") !== "open");
    });
  }
  if (overlay) {
    overlay.addEventListener("click", function () {
      setDrawer(false);
    });
  }

  /* ----------------------------------------------------------------- tabs */

  Array.prototype.forEach.call(doc.querySelectorAll(".tabbed"), function (block) {
    var labels = block.querySelectorAll(".tabbed__label");
    var panels = block.querySelectorAll(".tabbed__panel");
    Array.prototype.forEach.call(labels, function (label, index) {
      label.addEventListener("click", function () {
        Array.prototype.forEach.call(labels, function (other, i) {
          other.setAttribute("aria-selected", i === index ? "true" : "false");
        });
        Array.prototype.forEach.call(panels, function (panel, i) {
          panel.hidden = i !== index;
        });
      });
    });
  });

  /* ------------------------------------------------------ code formatting */

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var PY = new RegExp(
    [
      "(#[^\\n]*)",
      "(\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*')",
      "\\b(False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|not|or|pass|raise|return|try|while|with|yield)\\b",
      "\\b(print|len|list|dict|open|range|float|int|str|enumerate|zip|sorted|sum|min|max|abs)\\b",
      "\\b(\\d+\\.?\\d*)\\b"
    ].join("|"),
    "g"
  );

  var SH = new RegExp(
    [
      "(#[^\\n]*)",
      "(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*')",
      "\\b(pip|python|conda|git|cd|cp|mkdir|export|set|qgis)\\b",
      "(--?[A-Za-z][\\w-]*)",
      "\\b(\\d+\\.?\\d*)\\b"
    ].join("|"),
    "g"
  );

  var CLASSES = ["tok-c", "tok-s", "tok-k", "tok-b", "tok-n"];

  function highlight(code, language) {
    var pattern = language === "bash" ? SH : PY;
    if (language !== "python" && language !== "bash") {
      return escapeHtml(code);
    }
    var out = "";
    var last = 0;
    var match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(code)) !== null) {
      out += escapeHtml(code.slice(last, match.index));
      var cls = "";
      for (var g = 1; g <= 5; g++) {
        if (match[g] !== undefined) {
          cls = CLASSES[g - 1];
          break;
        }
      }
      out += '<span class="' + cls + '">' + escapeHtml(match[0]) + "</span>";
      last = match.index + match[0].length;
    }
    return out + escapeHtml(code.slice(last));
  }

  Array.prototype.forEach.call(doc.querySelectorAll("pre > code"), function (code) {
    var raw = code.textContent.replace(/^\n+|\s+$/g, "");
    var language = (code.className.match(/language-([\w-]+)/) || [])[1] || "";
    code.innerHTML = highlight(raw, language);

    var pre = code.parentNode;
    var wrap = doc.createElement("div");
    wrap.className = "codeblock";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    var button = doc.createElement("button");
    button.type = "button";
    button.className = "codeblock__copy";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.addEventListener("click", function () {
      var done = function () {
        button.textContent = "Copied";
        setTimeout(function () {
          button.textContent = "Copy";
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(raw).then(done, function () {
          button.textContent = "Press Ctrl+C";
        });
      } else {
        var area = doc.createElement("textarea");
        area.value = raw;
        doc.body.appendChild(area);
        area.select();
        try {
          doc.execCommand("copy");
          done();
        } catch (e) {
          button.textContent = "Press Ctrl+C";
        }
        doc.body.removeChild(area);
      }
    });
    wrap.appendChild(button);
  });

  /* ------------------------------------------------------ heading anchors */

  Array.prototype.forEach.call(
    doc.querySelectorAll(".md-typeset h2[id], .md-typeset h3[id], .md-typeset h4[id]"),
    function (heading) {
      var link = doc.createElement("a");
      link.className = "headerlink";
      link.href = "#" + heading.id;
      link.title = "Permanent link";
      link.textContent = "¶";
      heading.appendChild(link);
    }
  );

  /* ----------------------------------------------------------- scrollspy */

  var tocLinks = Array.prototype.slice.call(
    doc.querySelectorAll(".md-nav--secondary .md-nav__link")
  );
  var navLinks = Array.prototype.slice.call(
    doc.querySelectorAll(".md-nav--primary .md-nav__link")
  );
  var watched = tocLinks
    .concat(navLinks)
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? doc.getElementById(id.slice(1)) : null;
    })
    .filter(Boolean);

  function markActive() {
    var line = window.scrollY + 100;
    var currentId = null;
    for (var i = 0; i < watched.length; i++) {
      if (watched[i].offsetTop <= line) {
        currentId = watched[i].id;
      }
    }
    if (window.innerHeight + window.scrollY >= doc.body.scrollHeight - 4) {
      currentId = watched.length ? watched[watched.length - 1].id : currentId;
    }
    tocLinks.concat(navLinks).forEach(function (link) {
      var active = link.getAttribute("href") === "#" + currentId;
      link.classList.toggle("md-nav__link--active", active);
    });
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(function () {
          markActive();
          ticking = false;
        });
      }
    },
    { passive: true }
  );
  markActive();

  /* -------------------------------------------------------------- search */

  var input = doc.querySelector(".md-search__input");
  var results = doc.querySelector(".md-search__results");
  var searchBox = doc.querySelector(".md-search");

  /* Body text belonging to a heading: everything up to the next heading of the
     same or a higher level, so an h3 does not inherit its whole section. */
  function ownText(heading) {
    var stop = { H2: 2, H3: 3, H4: 4 };
    var level = stop[heading.tagName];
    var text = "";
    var node = heading.nextElementSibling;
    while (node && !(stop[node.tagName] && stop[node.tagName] <= level)) {
      text += " " + node.textContent;
      node = node.nextElementSibling;
    }
    return text;
  }

  var index = Array.prototype.map.call(
    doc.querySelectorAll(".md-typeset h2[id], .md-typeset h3[id], .md-typeset h4[id]"),
    function (heading) {
      return {
        id: heading.id,
        title: heading.textContent.replace("¶", "").trim(),
        parent: heading.tagName === "H2" ? "" : sectionTitle(heading),
        text: ownText(heading).slice(0, 2000).toLowerCase()
      };
    }
  );

  function sectionTitle(heading) {
    var node = heading.previousElementSibling;
    while (node) {
      if (node.tagName === "H2") {
        return node.textContent.replace("¶", "").trim();
      }
      node = node.previousElementSibling;
    }
    return "";
  }

  function renderResults(query) {
    if (!results) return;
    if (!query) {
      results.setAttribute("data-open", "false");
      results.innerHTML = "";
      return;
    }
    var needle = query.toLowerCase();
    var hits = index
      .map(function (entry) {
        var score = 0;
        if (entry.title.toLowerCase().indexOf(needle) !== -1) score += 10;
        if (entry.text.indexOf(needle) !== -1) score += 1;
        return { entry: entry, score: score };
      })
      .filter(function (hit) {
        return hit.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 12);

    if (!hits.length) {
      results.innerHTML =
        '<p class="md-search__empty">No section matches that search.</p>';
    } else {
      results.innerHTML = hits
        .map(function (hit) {
          var e = hit.entry;
          return (
            '<a class="md-search__result" href="#' +
            e.id +
            '">' +
            e.title +
            (e.parent ? "<span>" + e.parent + "</span>" : "") +
            "</a>"
          );
        })
        .join("");
    }
    results.setAttribute("data-open", "true");
  }

  if (input) {
    input.addEventListener("input", function () {
      renderResults(input.value.trim());
    });
    input.addEventListener("focus", function () {
      if (searchBox) searchBox.classList.add("md-search--open");
      renderResults(input.value.trim());
    });
    doc.addEventListener("click", function (event) {
      if (searchBox && !searchBox.contains(event.target)) {
        renderResults("");
        searchBox.classList.remove("md-search--open");
      }
    });
    doc.addEventListener("keydown", function (event) {
      if (event.key === "/" && doc.activeElement !== input) {
        event.preventDefault();
        if (searchBox) searchBox.classList.add("md-search--open");
        input.focus();
      }
      if (event.key === "Escape") {
        renderResults("");
        input.blur();
        if (searchBox) searchBox.classList.remove("md-search--open");
        setDrawer(false);
      }
    });
  }

  /* Close the mobile drawer after picking a destination. */
  Array.prototype.forEach.call(
    doc.querySelectorAll(".md-nav--primary a, .md-search__results"),
    function (element) {
      element.addEventListener("click", function () {
        setDrawer(false);
      });
    }
  );

  /* Current year in the footer. */
  var year = doc.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
