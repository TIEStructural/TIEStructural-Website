/* ---------- Rotating word ---------- */

const words = ["Engineering", "Communication", "Creativity", "Quality"];
const el = document.getElementById("rotator");

const STAGGER = 80;       // milliseconds between each letter
const HOLD = 900;         // how long a finished word stays before the next one starts
const FADE = 400;         // should match the 0.4s in the CSS
const INTRO_DELAY = 900;  // milliseconds "That's Impressive" shows alone first

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Build every word up front, each made of individual letter spans
el.innerHTML = "";
const wordLetters = words.map((word) => {
    const wrap = document.createElement("span");
    wrap.className = "word";
    const letters = [...word].map((ch) => {
        const s = document.createElement("span");
        s.textContent = ch;
        wrap.appendChild(s);
        return s;
    });
    el.appendChild(wrap);
    return letters;
});

const fadeIn = (letters) =>
    letters.forEach((s, n) => setTimeout(() => s.classList.add("show"), n * STAGGER));

const fadeOut = (letters) =>
    letters.forEach((s, n) => setTimeout(() => s.classList.remove("show"), n * STAGGER));

async function run() {
    // If the visitor has animations turned off, just show the first word
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        wordLetters[0].forEach((s) => s.classList.add("show"));
        return;
    }

    await sleep(INTRO_DELAY);

    let i = 0;
    fadeIn(wordLetters[0]);
    await sleep(wordLetters[0].length * STAGGER + FADE + HOLD);

    while (true) {
        const next = (i + 1) % words.length;
        fadeOut(wordLetters[i]);
        fadeIn(wordLetters[next]);
        i = next;
        await sleep(wordLetters[i].length * STAGGER + FADE + HOLD);
    }
}

run();


/* ---------- Shrinking header with gliding logo ---------- */

const header = document.getElementById("site-header");
const title = document.getElementById("title");
const logo = document.getElementById("logo");
const spacer = document.getElementById("header-spacer");

const PAD_TOP = 30;     // matches the header's top padding in the CSS
const PAD_BOTTOM = 10;  // extra space under the title when fully expanded
const GAP = 24;         // space between the logo and the title when expanded
const BAR_PAD = 8;      // space above and below the logo in the collapsed bar

let fullH, barH, startX, logoH;

function measure() {
    logoH = logo.offsetHeight;
    const logoW = logo.offsetWidth;

    fullH = title.offsetHeight + PAD_TOP + PAD_BOTTOM;
    barH = Math.min(logoH + BAR_PAD * 2, fullH);

    // Expanded logo position: just left of the title block
    const titleLeft = title.getBoundingClientRect().left;
    startX = Math.max(10, titleLeft - GAP - logoW);

    spacer.style.height = fullH + "px";
    update();
}

function update() {
    const y = Math.max(0, window.scrollY);
    const range = Math.max(1, fullH - barH);
    const p = Math.min(y / range, 1);  // 0 = top of page, 1 = fully collapsed

    // Header shrinks as you scroll, down to the bar height
    header.style.height = Math.max(fullH - y, barH) + "px";

    // Title scrolls up with the page (the header clips it)
    title.style.transform = "translateY(" + -y + "px)";

    // Logo stays at the same left position, and only glides vertically into the bar
    const startTop = (fullH - logoH) / 2;
    logo.style.top = startTop + (BAR_PAD - startTop) * p + "px";
    logo.style.left = startX + "px";
}

let ticking = false;
window.addEventListener("scroll", () => {
    if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
            update();
            ticking = false;
        });
    }
});

window.addEventListener("resize", measure);
window.addEventListener("load", measure);
logo.addEventListener("load", measure);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
measure();

/* ---------- Click-to-reveal contact image ---------- */

const emailBtn = document.getElementById("email-btn");
const emailBox = document.getElementById("email-box");

emailBtn.addEventListener("click", () => {
    const showing = !emailBox.hidden;

    if (showing) {
        emailBox.hidden = true;
        emailBtn.textContent = "Show contact email address";
        emailBtn.setAttribute("aria-expanded", "false");
        return;
    }

    // The image is only added when the button is clicked, and the file name
    // is split in two so it doesn't appear as one piece in the page code.
    if (!emailBox.firstChild) {
        const img = document.createElement("img");
        img.src = "cran" + "berry.png";
        img.alt = "Company email address (shown as an image)";
        emailBox.appendChild(img);
    }

    emailBox.hidden = false;
    emailBtn.textContent = "Hide contact email address";
    emailBtn.setAttribute("aria-expanded", "true");
});