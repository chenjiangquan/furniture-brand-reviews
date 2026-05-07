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
      ".fbrw-root{box-sizing:border-box;width:100%;max-width:1600px;margin:0 auto;font-family:inherit;color:#171744}" +
      ".fbrw-root *{box-sizing:border-box}" +
      ".fbrw-shell{display:grid;grid-template-columns:340px minmax(0,1fr);gap:22px;border:1px solid #e3dff0;border-radius:20px;background:#fff;padding:20px;box-shadow:0 10px 30px rgba(23,23,68,.08)}" +
      ".fbrw-summary{border-radius:16px;background:#faf7ff;padding:30px;display:flex;flex-direction:column;justify-content:space-between;gap:24px}" +
      ".fbrw-logo{display:flex;flex-direction:column;align-items:flex-start;gap:12px;font-weight:850;font-size:18px;line-height:1.2;color:#171744;max-width:220px}" +
      ".fbrw-logo-img{display:block;width:100%;height:auto;max-width:200px;object-fit:contain}" +
      ".fbrw-logo-fallback{display:none;font-weight:900;letter-spacing:-.01em;color:#171744}" +
      ".fbrw-brand{font-size:13px;color:#66657b;margin:0}" +
      ".fbrw-heading{margin:10px 0 0;font-size:24px;line-height:1.16;font-weight:900;color:#171744}" +
      ".fbrw-rating-line{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px}" +
      ".fbrw-score{font-size:36px;line-height:1;font-weight:950;color:#171744;letter-spacing:-.03em}" +
      ".fbrw-count{font-size:14px;color:#66657b;margin:0}" +
      ".fbrw-summary .fbrw-count{text-decoration:underline}" +
      ".fbrw-stars{display:inline-flex;align-items:center;gap:2px;flex-wrap:nowrap}" +
      ".fbrw-star-box{position:relative;display:grid;place-items:center;flex:0 0 auto;width:22px;height:22px;min-width:22px;border:0;border-radius:3px;background:#E5E7EB;color:#fff;font-size:13px;line-height:1;font-family:Arial,Helvetica,sans-serif;font-weight:900;overflow:hidden}" +
      ".fbrw-star-box-small{width:18px;height:18px;min-width:18px;font-size:11px;border-radius:3px}" +
      ".fbrw-star-bg{position:absolute;inset:0;display:grid;place-items:center;color:#fff}" +
      ".fbrw-star-fill{position:absolute;inset:0 auto 0 0;display:block;overflow:hidden;color:#fff}" +
      ".fbrw-star-fill-inner{display:grid;place-items:center;width:22px;height:22px}" +
      ".fbrw-star-box-small .fbrw-star-fill-inner{width:18px;height:18px}" +
      ".fbrw-carousel{min-width:0;display:grid;gap:14px}" +
      ".fbrw-carousel-window{min-width:0;overflow:hidden}" +
      ".fbrw-track{display:flex;gap:16px;transition:transform 300ms ease;will-change:transform}" +
      ".fbrw-card{min-width:0;flex:0 0 calc((100% - 32px) / 3);border:1px solid #e3dff0;border-radius:16px;background:#fff;padding:20px;display:flex;flex-direction:column;gap:12px;min-height:230px}" +
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
      ".fbrw-button:disabled{cursor:not-allowed;opacity:.45}" +
      ".fbrw-button:hover{border-color:#8b5b91;background:#faf7ff;color:#5d3469}" +
      ".fbrw-micro{box-sizing:border-box;display:inline-flex;max-width:320px;align-items:center;justify-content:center;flex-direction:column;gap:12px;border:1px solid #eeeaf7;border-radius:14px;background:#fff;padding:18px 20px;color:#171744;text-decoration:none;font-family:inherit;box-shadow:0 6px 18px rgba(23,23,68,.05);cursor:pointer;transition:.15s ease}" +
      ".fbrw-micro *{box-sizing:border-box}" +
      ".fbrw-micro:hover{border-color:#8b5b91;background:#faf7ff}" +
      ".fbrw-micro-logo{display:flex;width:216px;max-width:100%;align-items:center;justify-content:center;min-width:0;font-size:14px;font-weight:900;color:#171744;text-align:center}" +
      ".fbrw-micro-logo-img{display:block;width:100%;height:36px;max-width:216px;object-fit:contain}" +
      ".fbrw-micro-logo-text{display:none}" +
      ".fbrw-micro-stars{display:flex;align-items:center;justify-content:center;gap:4px;line-height:1}" +
      ".fbrw-micro .fbrw-star-box-small{width:40px;height:40px;min-width:40px;border-radius:3px;font-size:22px}" +
      ".fbrw-micro .fbrw-star-box-small .fbrw-star-fill-inner{width:40px;height:40px}" +
      ".fbrw-micro-score{font-size:14px;font-weight:800;color:#171744;text-align:center;white-space:nowrap}" +
      ".fbrw-micro-score strong{font-weight:950}" +
      ".fbrw-empty{border:1px solid #e3dff0;border-radius:16px;background:#fff;padding:22px;color:#66657b}" +
      ".fbrw-error{border:1px solid #e3dff0;border-radius:16px;background:#faf7ff;padding:18px;color:#66657b;font-size:14px}" +
      "@media(max-width:760px){.fbrw-shell{grid-template-columns:1fr;padding:14px;gap:14px}.fbrw-summary{padding:18px}.fbrw-logo{max-width:150px}.fbrw-logo-img{max-width:140px}.fbrw-heading{font-size:20px}.fbrw-track{gap:14px}.fbrw-card{flex-basis:100%;min-height:210px}.fbrw-micro{max-width:100%;padding:16px}.fbrw-micro-logo{width:206px}.fbrw-micro-logo-img{height:32px;max-width:206px}.fbrw-micro .fbrw-star-box-small{width:38px;height:38px;min-width:38px;font-size:21px}.fbrw-micro .fbrw-star-box-small .fbrw-star-fill-inner{width:38px;height:38px}.fbrw-micro-score{white-space:normal}}";

    document.head.appendChild(style);
  }

  function ratingColour(rating) {
    var numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating <= 0) return "#E5E7EB";
    var ratingBand = numericRating >= 5 ? 5 : Math.max(1, Math.min(4, Math.floor(numericRating)));
    var colours = {
      5: "#7C3AED",
      4: "#AF66F2",
      3: "#FFCC00",
      2: "#FF8A00",
      1: "#FF3B30"
    };

    return colours[ratingBand] || colours[5];
  }

  function renderStars(rating, size) {
    var numericRating = Number(rating);
    if (!Number.isFinite(numericRating)) numericRating = 0;
    var safeRating = Math.max(0, Math.min(5, numericRating));
    var activeColour = ratingColour(safeRating);
    var wrapper = document.createElement("span");
    wrapper.className = "fbrw-stars";
    wrapper.setAttribute("aria-label", safeRating.toFixed(1) + " out of 5 stars");

    for (var index = 1; index <= 5; index += 1) {
      var box = document.createElement("span");
      var fillPercent = Math.max(0, Math.min(100, (safeRating - (index - 1)) * 100));
      var fill = document.createElement("span");
      var fillInner = document.createElement("span");
      var bg = document.createElement("span");

      box.className = "fbrw-star-box" + (size === "small" ? " fbrw-star-box-small" : "");
      bg.className = "fbrw-star-bg";
      bg.textContent = "★";
      fill.className = "fbrw-star-fill";
      fill.style.width = fillPercent + "%";
      fill.style.backgroundColor = activeColour;
      fillInner.className = "fbrw-star-fill-inner";
      fillInner.textContent = "★";

      fill.appendChild(fillInner);
      box.appendChild(bg);
      box.appendChild(fill);
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
    top.appendChild(renderStars(review.rating, "small"));

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
    var logoImage = document.createElement("img");
    logoImage.className = "fbrw-logo-img";
    logoImage.src = baseUrl + "/logo.png";
    logoImage.alt = "Furniture Brand Reviews";
    logoImage.loading = "lazy";
    var logoFallback = textElement("span", "fbrw-logo-fallback", "Furniture Brand Reviews");
    logoImage.onerror = function () {
      logoImage.style.display = "none";
      logoFallback.style.display = "block";
    };
    logo.appendChild(logoImage);
    logo.appendChild(logoFallback);
    summaryTop.appendChild(logo);
    summaryTop.appendChild(textElement("p", "fbrw-brand", data.brandName || "Furniture brand"));
    summaryTop.appendChild(textElement("h2", "fbrw-heading", "Highly rated by customers"));

    var ratingLine = document.createElement("div");
    ratingLine.className = "fbrw-rating-line";
    ratingLine.appendChild(textElement("span", "fbrw-score", Number(data.rating || 0).toFixed(1)));
    ratingLine.appendChild(renderStars(data.rating || 0, "medium"));
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
    var carouselWindow = document.createElement("div");
    carouselWindow.className = "fbrw-carousel-window";
    var track = document.createElement("div");
    track.className = "fbrw-track";
    var isAnimating = false;
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
    carouselWindow.appendChild(track);
    carousel.appendChild(carouselWindow);
    carousel.appendChild(controls);
    shell.appendChild(carousel);

    reviews.forEach(function (review) {
      track.appendChild(renderCard(review));
    });

    function getTrackGap() {
      var computedStyle = window.getComputedStyle(track);
      var gap = parseFloat(computedStyle.columnGap || computedStyle.gap || "0");
      return Number.isFinite(gap) ? gap : 0;
    }

    function getMaxIndex() {
      return Math.max(0, reviews.length - getVisibleCount());
    }

    function updateTrack() {
      var firstCard = track.children[0];
      var maxIndex = getMaxIndex();
      var slideSize = firstCard ? firstCard.getBoundingClientRect().width + getTrackGap() : 0;

      if (index > maxIndex) index = maxIndex;
      if (index < 0) index = 0;

      track.style.transform = "translateX(-" + index * slideSize + "px)";
      status.textContent = "Latest customer reviews";
      previous.disabled = index === 0 || isAnimating;
      next.disabled = index >= maxIndex || isAnimating;
    }

    function move(direction) {
      if (!reviews.length || isAnimating) return;
      var maxIndex = getMaxIndex();
      var nextIndex = direction === "next" ? Math.min(index + 1, maxIndex) : Math.max(index - 1, 0);

      if (nextIndex === index) return;

      isAnimating = true;
      index = nextIndex;
      previous.disabled = true;
      next.disabled = true;
      updateTrack();
      window.setTimeout(function () {
        isAnimating = false;
        updateTrack();
      }, 320);
    }

    previous.addEventListener("click", function () {
      move("prev");
    });

    next.addEventListener("click", function () {
      move("next");
    });

    window.addEventListener("resize", updateTrack);
    updateTrack();

    target.textContent = "";
    target.appendChild(root);
    return true;
  }

  function renderMicroWidget(target, data) {
    var brandSlug = data.brandSlug || "";
    var link = document.createElement("a");
    link.className = "fbrw-micro";
    link.href = brandReviewUrl(brandSlug);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Read " + (data.brandName || "brand") + " reviews on Furniture Brand Reviews");

    var logo = document.createElement("span");
    logo.className = "fbrw-micro-logo";
    var logoImage = document.createElement("img");
    logoImage.className = "fbrw-micro-logo-img";
    logoImage.src = baseUrl + "/logo.png";
    logoImage.alt = "Furniture Brand Reviews";
    logoImage.loading = "lazy";
    var logoText = textElement("span", "fbrw-micro-logo-text", "Furniture Brand Reviews");
    logoImage.onerror = function () {
      logoImage.style.display = "none";
      logoText.style.display = "inline";
    };
    logo.appendChild(logoImage);
    logo.appendChild(logoText);

    var stars = document.createElement("span");
    stars.className = "fbrw-micro-stars";
    stars.appendChild(renderStars(data.rating || 0, "small"));
    var score = document.createElement("span");
    score.className = "fbrw-micro-score";
    score.innerHTML =
      "TrustScore <strong>" +
      Number(data.rating || 0).toFixed(1) +
      "</strong> | " +
      Number(data.reviewCount || 0).toLocaleString() +
      " reviews";

    link.appendChild(logo);
    link.appendChild(stars);
    link.appendChild(score);

    target.textContent = "";
    target.appendChild(link);
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

    var layout = (target.getAttribute("data-layout") || "carousel").trim().toLowerCase();

    fetch(baseUrl + "/api/widget/" + encodeURIComponent(brand), { mode: "cors", credentials: "omit" })
      .then(function (response) {
        if (!response.ok) throw new Error("Widget request failed");
        return response.json();
      })
      .then(function (data) {
        var didRender = layout === "micro" ? renderMicroWidget(target, data) : renderWidget(target, data);
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
