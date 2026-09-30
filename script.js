const PHOTOS = [
  "TNA09286.jpg",
  "TNA00346.jpg",
  "TNA09645.jpg",
  "TNA00122.jpg",
  "TNA09453.jpg",
  "TNA00542.jpg",
  "TNA09573.jpg",
  "TNA00264.jpg",
  "TNA09397.jpg",
  "TNA00149.jpg",
  "TNA09905.jpg",
  "TNA00602.jpg",
  "TNA09488.jpg",
  "TNA00205.jpg",
  "TNA09696.jpg",
  "TNA00462.jpg",
  "TNA09579.jpg",
  "TNA00137.jpg",
  "TNA09291.jpg",
  "TNA00525.jpg",
  "TNA09887.jpg",
  "TNA00219.jpg",
  "TNA09605.jpg",
  "TNA00312.jpg",
  "TNA09524.jpg",
];

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector(".lightbox__img");
const lightboxCount = lightbox.querySelector(".lightbox__count");
const btnClose = lightbox.querySelector(".lightbox__close");
const btnPrev = lightbox.querySelector(".lightbox__nav--prev");
const btnNext = lightbox.querySelector(".lightbox__nav--next");

let currentIndex = 0;
let lockScrollY = 0;
let hintHidden = false;

const LANDSCAPE = new Set([
  "TNA00149.jpg",
  "TNA09524.jpg",
  "TNA09573.jpg",
  "TNA09579.jpg",
]);

function buildGallery() {
  const frag = document.createDocumentFragment();
  let slot = 0;
  let pairCount = 0;
  let lastPairItem = null;

  function promoteOrphan() {
    if (pairCount % 2 === 1 && lastPairItem) {
      lastPairItem.classList.add("gallery__item--solo");
      lastPairItem.classList.remove("gallery__item--lift");
    }
    pairCount = 0;
    lastPairItem = null;
  }

  PHOTOS.forEach((name, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery__item";
    const isFinale = index === PHOTOS.length - 1;
    const isLandscape = LANDSCAPE.has(name);

    if (isFinale) {
      promoteOrphan();
      btn.classList.add("gallery__item--finale");
    } else if (isLandscape) {
      promoteOrphan();
      btn.classList.add("gallery__item--wide");
      slot = 0;
    } else {
      const role = slot % 6;
      if (role === 0) {
        promoteOrphan();
        btn.classList.add("gallery__item--lead");
      } else {
        pairCount += 1;
        lastPairItem = btn;
        if (role === 2 || role === 5) btn.classList.add("gallery__item--lift");
        if (role === 4) btn.classList.add("gallery__item--inset");
      }
      slot += 1;
    }

    btn.setAttribute("aria-label", `Xem ảnh ${index + 1}`);

    const img = document.createElement("img");
    img.src = isFinale ? `web/full/${name}` : `web/thumb/${name}`;
    if (isFinale) {
      img.srcset = `web/thumb/${name} 720w, web/full/${name} 1600w`;
      img.sizes = "100vw";
    }
    img.width = isLandscape ? 720 : 480;
    img.height = isLandscape ? 480 : 720;
    img.alt = `Ảnh cưới ${index + 1}`;
    img.loading = index < 8 ? "eager" : "lazy";
    img.decoding = "async";

    btn.appendChild(img);
    btn.addEventListener("click", () => openLightbox(index));
    frag.appendChild(btn);
  });

  promoteOrphan();
  gallery.appendChild(frag);

  const finale = gallery.querySelector(".gallery__item--finale");
  if (finale) {
    const wrap = document.createElement("div");
    wrap.className = "gallery-finale";
    wrap.appendChild(finale);
    gallery.after(wrap);
  }
}

function lockBody() {
  lockScrollY = window.scrollY || window.pageYOffset;
  document.body.classList.add("is-locked");
  document.body.style.top = `-${lockScrollY}px`;
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
}

function unlockBody() {
  document.body.classList.remove("is-locked");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, lockScrollY);
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
  lockBody();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  unlockBody();
  setTimeout(() => {
    if (!lightbox.classList.contains("is-open")) {
      lightbox.hidden = true;
      lightboxImg.style.transform = "";
      lightboxImg.style.opacity = "";
    }
  }, 280);
}

function updateLightbox() {
  const name = PHOTOS[currentIndex];
  lightboxImg.src = `web/full/${name}`;
  lightboxImg.alt = `Ảnh cưới ${currentIndex + 1}`;
  lightboxCount.textContent = `${currentIndex + 1} / ${PHOTOS.length}`;
  lightboxImg.style.transform = "";
  lightboxImg.style.opacity = "";
}

function showPrev() {
  currentIndex = (currentIndex - 1 + PHOTOS.length) % PHOTOS.length;
  updateLightbox();
  hideHint();
}

function showNext() {
  currentIndex = (currentIndex + 1) % PHOTOS.length;
  updateLightbox();
  hideHint();
}

function hideHint() {
  if (hintHidden) return;
  hintHidden = true;
  lightbox.classList.add("is-hint-hidden");
}

btnClose.addEventListener("click", closeLightbox);
btnPrev.addEventListener("click", showPrev);
btnNext.addEventListener("click", showNext);

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox || e.target === lightbox.querySelector(".lightbox__figure")) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showPrev();
  if (e.key === "ArrowRight") showNext();
});

/* Touch swipe for lightbox */
let touchStartX = 0;
let touchStartY = 0;
let touching = false;

lightbox.addEventListener(
  "touchstart",
  (e) => {
    if (lightbox.hidden || e.touches.length !== 1) return;
    touching = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    lightboxImg.classList.add("is-swiping");
  },
  { passive: true }
);

lightbox.addEventListener(
  "touchmove",
  (e) => {
    if (!touching) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) < Math.abs(dy)) return;
    lightboxImg.style.transform = `translateX(${dx * 0.92}px)`;
    lightboxImg.style.opacity = String(Math.max(0.35, 1 - Math.abs(dx) / 280));
  },
  { passive: true }
);

lightbox.addEventListener(
  "touchend",
  (e) => {
    if (!touching) return;
    touching = false;
    lightboxImg.classList.remove("is-swiping");

    const dx = (e.changedTouches[0]?.clientX || 0) - touchStartX;
    const dy = (e.changedTouches[0]?.clientY || 0) - touchStartY;

    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      if (dx < 0) showNext();
      else showPrev();
      return;
    }

    if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      closeLightbox();
      return;
    }

    lightboxImg.style.transform = "";
    lightboxImg.style.opacity = "";
  },
  { passive: true }
);

function observeReveals() {
  const items = [...document.querySelectorAll(".reveal")];

  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "40px 0px", threshold: 0.04 }
  );

  items.forEach((el) => io.observe(el));
}

buildGallery();
observeReveals();

/* —— Background music: start on screen interaction, then loop —— */
const audio = document.getElementById("bgMusic");
audio.loop = true;
audio.volume = 0.55;
audio.removeAttribute("autoplay");

let musicStarted = false;

function startMusic() {
  if (musicStarted || !audio.paused) return;
  audio
    .play()
    .then(() => {
      musicStarted = true;
    })
    .catch(() => {});
}

["pointerdown", "touchstart", "click"].forEach((evt) => {
  document.addEventListener(evt, startMusic, { passive: true });
});
