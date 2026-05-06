(function () {
  "use strict";

  var WIDGET_SELECTOR = ".fbr-widget";
  var STYLE_ID = "fbrw-widget-styles";
  var currentScript =
    document.currentScript ||
    Array.prototype.slice.call(document.getElementsByTagName("script")).find(function (script) {
      return script.src && script.src.indexOf("/widget.js") !== -1;
    });
  var baseUrl = currentScript && currentScript.src ? new URL(currentScript.src).origin : "https://www.furniturebrandreviews.com";
  if (window.console && typeof window.console.debug === "function") {
    window.console.debug("FBR widget script loaded");
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      ".fbrw-root{box-sizing:border-box;width:100%;max-width:1200px;margin:0 auto;font-family:inherit;color:#171744}" +
      ".fbrw-root *{box-sizing:border-box}" +
      ".fbrw-shell{display:grid;grid-template-columns:300px minmax(0,1fr);gap:18px;border:1px solid #e3dff0;border-radius:20px;background:#fff;padding:18px;box-shadow:0 10px 30px rgba(23,23,68,.08)}" +
      ".fbrw-summary{border-radius:16px;background:#faf7ff;padding:22px;display:flex;flex-direction:column;justify-content:space-between;gap:18px}" +
      ".fbrw-logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;line-height:1.2}" +
      ".fbrw-logo-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#171744;color:#fff;font-weight:900}" +
      ".fbrw-brand{font-size:13px;color:#66657b;margin:0}" +
      ".fbrw-heading{margin:4px 0 0;font-size:22px;line-height:1.2;font-weight:850;color:#171744}" +
      ".fbrw-rating-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap}" +
      ".fbrw-score{font-size:28px;font-weight:900;color:#171744}" +
      ".fbrw-count{font-size:14px;color:#66657b;margin:0}" +
      ".fbrw-stars{display:inline-flex;align-items:center;gap:2px;flex-wrap:nowrap}" +
      ".fbrw-star-box{display:grid;place-items:center;width:22px;height:22px;border-radius:3px;background:#7c3aed;color:#fff}" +
      ".fbrw-star-box svg{width:14px;height:14px;fill:#fff;stroke:#fff}" +
      ".fbrw-star-box.fbrw-empty{background:#e5e7eb}" +
      ".fbrw-carousel{min-width:0;display:grid;gap:14px}" +
      ".fbrw-track{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}" +
      ".fbrw-card{min-width:0;border:1px solid #e3dff0;border-radius:16px;background:#fff;padding:18px;display:flex;flex-direction:column;gap:12px;min-height:230px}" +
      ".fbrw-card-top{display:flex;justify-content:space-between;align-items:center;gap:10px}" +
      ".fbrw-badge{display:inline-flex;align-items:center;gap:5px;border-radius:999px;background:#f3f4f6;color:#4b5563;padding:5px 9px;font-size:12px;font-weight:700}" +
      ".fbrw-title{font-size:16px;line-height:1.35;font-weight:850;color:#171744;margin:0}" +
      ".fbrw-body{font-size:14px;line-height:1.55;color:#66657b;margin:0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}" +
      ".fbrw-meta{margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:10px;color:#66657b;font-size:13px}" +
      ".fbrw-author{font-weight:800;color:#171744;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".fbrw-controls{display:flex;align-items:center;justify-content:space-between;gap:12px}" +
      ".fbrw-link{font-size:13px;font-weight:800;color:#5d3469;text-decoration:none}" +
      ".fbrw-buttons{display:flex;align-items:center;gap:8px}" +
      ".fbrw-button{display:grid;place-items:center;width:38px;height:38px;border-radius:999px;border:1px solid #e3dff0;background:#fff;color:#171744;cursor:pointer;font:inherit;transition:.15s ease}" +
      ".fbrw-button:hover{border-color:#8b5b91;background:#faf7ff;color:#5d3469}" +
      ".fbrw-empty{border:1px solid #e3dff0;border-radius:16px;background:#fff;padding:22px;color:#66657b}" +
      ".fbrw-error{border:1px solid #e3dff0;border-radius:16px;background:#faf7ff;padding:18px;color:#66657b;font-size:14px}" +
      "@media(max-width:760px){.fbrw-shell{grid-template-columns:1fr;padding:14px}.fbrw-track{grid-template-columns:1fr}.fbrw-summary{padding:18px}.fbrw-heading{font-size:20px}.fbrw-card{min-height:210px}}";

    document.head.appendChild(style);
  }

  function createStarSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 2.7l2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.3l6.3-.9L12 2.7z");
    svg.appendChild(path);
    return svg;
  }

  function stars(rating, size) {
    var wrapper = document.createElement("span");
    wrapper.className = "fbrw-stars";
    wrapper.setAttribute("aria-label", Number(rating || 0).toFixed(1) + " out of 5 stars");

    for (var index = 1; index <= 5; index += 1) {
      var box = document.createElement("span");
      box.className = "fbrw-star-box" + (index <= Math.round(rating || 0) ? "" : " fbrw-empty");
      if (size === "small") {
        box.style.width = "18px";
        box.style.height = "18px";
      }
      box.appendChild(createStarSvg());
      wrapper.appendChild(box);
    }

    return wrapper;
  }

  function textElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text || "";
    return element;
  }

  function relativeTime(value) {
    var date = value ? new Date(value) : new Date();
    var seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
    var units = [
      ["year", 31536000],
      ["month", 2592000],
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60]
    ];

    for (var index = 0; index < units.length; index += 1) {
      var unit = units[index][0];
      var amount = Math.floor(seconds / units[index][1]);
      if (amount >= 1) return amount + " " + unit + (amount === 1 ? "" : "s") + " ago";
    }

    return "just now";
  }

  function renderCard(review) {
    var card = document.createElement("article");
    card.className = "fbrw-card";

    var top = document.createElement("div");
    top.className = "fbrw-card-top";
    top.appendChild(stars(review.rating, "small"));

    var badge = textElement("span", "fbrw-badge", review.verified ? "Verified" : "Customer review");
    top.appendChild(badge);

    card.appendChild(top);
    card.appendChild(textElement("h3", "fbrw-title", review.title || "Customer review"));
    card.appendChild(textElement("p", "fbrw-body", review.body || ""));

    var meta = document.createElement("div");
    meta.className = "fbrw-meta";
    meta.appendChild(textElement("span", "fbrw-author", review.authorName || "Customer"));
    meta.appendChild(textElement("span", "", relativeTime(review.createdAt)));
    card.appendChild(meta);

    return card;
  }

  function getVisibleCount() {
    return window.matchMedia("(max-width: 760px)").matches ? 1 : 3;
  }

  function brandReviewUrl(brandSlug) {
    var slug = brandSlug || "";
    return (
      baseUrl +
      "/review/" +
      encodeURIComponent(slug) +
      "?utm_source=widget&utm_medium=embed&utm_campaign=" +
      encodeURIComponent(slug)
    );
  }

  function renderWidget(target, data) {
    var index = 0;
    var reviews = Array.isArray(data.reviews) ? data.reviews : [];
    if (reviews.length === 0 && window.console && typeof window.console.warn === "function") {
      window.console.warn("[Furniture Brand Reviews Widget] No reviews returned for brand:", data.brandSlug || "unknown");
    }
    if (reviews.length === 0) {
      renderError(target);
      return false;
    }
    var root = document.createElement("div");
    root.className = "fbrw-root";

    var shell = document.createElement("div");
    shell.className = "fbrw-shell";
    root.appendChild(shell);

    var summary = document.createElement("aside");
    summary.className = "fbrw-summary";

    var summaryTop = document.createElement("div");
    var logo = document.createElement("div");
    logo.className = "fbrw-logo";
    logo.appendChild(textElement("span", "fbrw-logo-mark", "F"));
    logo.appendChild(textElement("span", "", "Furniture Brand Reviews"));
    summaryTop.appendChild(logo);
    summaryTop.appendChild(textElement("p", "fbrw-brand", data.brandName || "Furniture brand"));
    summaryTop.appendChild(textElement("h2", "fbrw-heading", "Highly rated by customers"));

    var ratingLine = document.createElement("div");
    ratingLine.className = "fbrw-rating-line";
    ratingLine.appendChild(textElement("span", "fbrw-score", Number(data.rating || 0).toFixed(1)));
    ratingLine.appendChild(stars(data.rating || 0, "medium"));
    summaryTop.appendChild(ratingLine);
    summaryTop.appendChild(textElement("p", "fbrw-count", "Based on " + Number(data.reviewCount || 0).toLocaleString() + " reviews"));

    var summaryLink = document.createElement("a");
    summaryLink.className = "fbrw-link";
    summaryLink.href = brandReviewUrl(data.brandSlug || "");
    summaryLink.target = "_blank";
    summaryLink.rel = "noopener noreferrer";
    summaryLink.textContent = "Read more reviews";

    summary.appendChild(summaryTop);
    summary.appendChild(summaryLink);
    shell.appendChild(summary);

    var carousel = document.createElement("section");
    carousel.className = "fbrw-carousel";
    var track = document.createElement("div");
    track.className = "fbrw-track";
    var controls = document.createElement("div");
    controls.className = "fbrw-controls";
    var status = textElement("span", "fbrw-count", "");
    var buttons = document.createElement("div");
    buttons.className = "fbrw-buttons";
    var previous = textElement("button", "fbrw-button", "<");
    var next = textElement("button", "fbrw-button", ">");
    previous.type = "button";
    next.type = "button";
    buttons.appendChild(previous);
    buttons.appendChild(next);
    controls.appendChild(status);
    controls.appendChild(buttons);
    carousel.appendChild(track);
    carousel.appendChild(controls);
    shell.appendChild(carousel);

    function draw() {
      track.textContent = "";
      var visible = getVisibleCount();
      var shown = reviews.length ? [] : [];

      for (var offset = 0; offset < Math.min(visible, reviews.length); offset += 1) {
        shown.push(reviews[(index + offset) % reviews.length]);
      }

      if (shown.length === 0) {
        track.appendChild(textElement("div", "fbrw-empty", "No published reviews yet."));
      } else {
        shown.forEach(function (review) {
          track.appendChild(renderCard(review));
        });
      }

      status.textContent = reviews.length ? "Latest customer reviews" : "Reviews coming soon";
      previous.disabled = reviews.length <= visible;
      next.disabled = reviews.length <= visible;
    }

    previous.addEventListener("click", function () {
      if (!reviews.length) return;
      index = (index - 1 + reviews.length) % reviews.length;
      draw();
    });

    next.addEventListener("click", function () {
      if (!reviews.length) return;
      index = (index + 1) % reviews.length;
      draw();
    });

    window.addEventListener("resize", draw);
    draw();

    target.textContent = "";
    target.appendChild(root);
    return true;
  }

  function renderError(target) {
    target.textContent = "";
    var error = document.createElement("div");
    error.className = "fbrw-root";
    error.appendChild(textElement("div", "fbrw-error", "Reviews are currently unavailable."));
    target.appendChild(error);
  }

  function initWidget(target) {
    if (target.getAttribute("data-fbrw-ready") === "true") return;
    target.setAttribute("data-fbrw-ready", "true");

    var brand = (target.getAttribute("data-brand") || "").trim();
    if (!brand) {
      if (window.console && typeof window.console.warn === "function") {
        window.console.warn("[Furniture Brand Reviews Widget] Missing required data-brand attribute.");
      }
      renderError(target);
      return;
    }

    fetch(baseUrl + "/api/widget/" + encodeURIComponent(brand), { mode: "cors", credentials: "omit" })
      .then(function (response) {
        if (!response.ok) throw new Error("Widget request failed");
        return response.json();
      })
      .then(function (data) {
        var didRender = renderWidget(target, data);
        if (didRender && window.console && typeof window.console.debug === "function") {
          window.console.debug("FBR widget rendered for:", brand);
        }
      })
      .catch(function () {
        if (window.console && typeof window.console.warn === "function") {
          window.console.warn("[Furniture Brand Reviews Widget] API request failed for brand:", brand);
        }
        renderError(target);
      });
  }

  function init() {
    injectStyles();
    var widgets = Array.prototype.slice.call(document.querySelectorAll(WIDGET_SELECTOR));
    if (window.console && typeof window.console.debug === "function") {
      window.console.debug("FBR widgets found:", widgets.length);
    }
    widgets.forEach(initWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
