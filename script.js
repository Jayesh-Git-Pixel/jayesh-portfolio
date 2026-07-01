/* ============================================================
   JAYESH PATIL — PORTFOLIO (refined) · script.js
   Lenis + GSAP ScrollTrigger · Custom cursor · Avatar physics
   Animated progress bars · Easter eggs · Blur reveals
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     1. LENIS SMOOTH SCROLL + GSAP SYNC
     ---------------------------------------------------------- */
  let lenis = null;
  if (!prefersReduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // anchor links → lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
          else el.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });

  /* ----------------------------------------------------------
     1b. INIT MASK-REVEAL ELEMENTS (GSAP-controlled)
         CSS uses translateY(110%) which GSAP reads as px y;
         we override with y:0 + yPercent:110 so the cache is correct.
     ---------------------------------------------------------- */
  const maskEls = gsap.utils.toArray(
    ".hero__title .line__inner, .hero__lead .reveal-line, .hero__sub .reveal-line, .contact__title .line__inner"
  );
  if (!prefersReduced) {
    gsap.set(maskEls, { y: 0, yPercent: 110 });
  }

  /* ----------------------------------------------------------
     2. LOADER
     ---------------------------------------------------------- */
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loaderCount");
  const loaderBar = document.getElementById("loaderBar");
  let loaderStarted = false;

  function runLoader(done) {
    if (loaderStarted) return; loaderStarted = true;
    if (prefersReduced) { loader && loader.remove(); startHero(); done && done(); return; }
    const obj = { n: 0 };
    const tl = gsap.timeline({ onComplete: done });
    tl.to(obj, {
      n: 100, duration: 2, ease: "power2.inOut",
      onUpdate: () => { loaderCount.textContent = String(Math.round(obj.n)).padStart(3, "0"); },
    }, 0)
    .to(loaderBar, { width: "100%", duration: 2, ease: "power2.inOut" }, 0)
    .to(".loader__count", { y: -40, opacity: 0, duration: 0.6, ease: "power3.in" }, "+=0.15")
    .to(".loader__meta", { opacity: 0, duration: 0.4 }, "<")
    .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.1")
    .set(loader, { display: "none" })
    .add(() => startHero());
  }

  window.addEventListener("load", () => setTimeout(() => runLoader(() => {}), 200));
  if (document.readyState === "complete") {
    setTimeout(() => runLoader(() => {}), 200);
  }

  /* ----------------------------------------------------------
     3. CUSTOM CURSOR (smoother interpolation + magnetic)
     ---------------------------------------------------------- */
  const cursor = document.querySelector(".cursor");
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const cText = document.getElementById("cursorText");

  if (!prefersReduced && finePointer) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my, dx = mx, dy = my;

    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });

    let cursorActive = true;
    document.addEventListener("visibilitychange", () => {
      cursorActive = !document.hidden;
    });

    function render() {
      if (cursorActive) {
        // dot — fast follow
        dx += (mx - dx) * 0.6;
        dy += (my - dy) * 0.6;
        dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
        // ring — trails with easing
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // hover state with text
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cText.textContent = el.getAttribute("data-cursor") || "";
        cursor.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        cText.textContent = "";
      });
    });

    window.addEventListener("mousedown", () => cursor.classList.add("is-down"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { cursor.style.opacity = "1"; });
  } else {
    cursor && (cursor.style.display = "none");
    document.body.style.cursor = "auto";
  }

  /* ----------------------------------------------------------
     4. MAGNETIC BUTTONS + RIPPLE
     ---------------------------------------------------------- */
  if (!prefersReduced && finePointer) {
    document.querySelectorAll(".btn, .contact__link, .nav__cta, .contact__email, .nav__brand").forEach((el) => {
      const strength = el.classList.contains("contact__link") ? 0.45 : 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * strength, y: y * strength, duration: 0.6, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
      });
    });

    // ripple on click for .btn
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const r = btn.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        const size = Math.max(r.width, r.height);
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = (e.clientX - r.left) + "px";
        ripple.style.top = (e.clientY - r.top) + "px";
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 750);
      });
    });
  }

  /* ----------------------------------------------------------
     5. HERO — cinematic reveal + avatar unlock
     ---------------------------------------------------------- */
  let heroStarted = false;
  function startHero() {
    if (heroStarted) return; heroStarted = true;

    // title lines
    gsap.to(".hero__title .line__inner", {
      yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.05,
    });
    gsap.from(".hero__eyebrow", { y: 20, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
    // reveal lines (lead + sub)
    gsap.to(".hero__lead .reveal-line, .hero__sub .reveal-line", {
      yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.45,
    });
    gsap.from(".hero__actions", { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.9 });
    gsap.from(".hero__scroll", { opacity: 0, duration: 1, delay: 1.4 });

    // AVATAR unlock — clip-path reveal synced with image scale
    const avTl = gsap.timeline({ delay: 0.5 });
    avTl
      .from(".avatar__frame", { opacity: 0, scale: 0.95, duration: 1, ease: "power3.out" })
      .from(".avatar__border", { opacity: 0, duration: 0.8 }, "-=0.6")
      .fromTo(".avatar__image",
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "power2.inOut" }, "-=0.4")
      .to(".avatar__image img", { scale: 1.04, duration: 1.6, ease: "power2.out" }, "<")
      .from(".avatar__glow", { opacity: 0, scale: 0.8, duration: 1.2, ease: "power2.out" }, "-=1")
      .from(".avatar__caption", { opacity: 0, y: 10, duration: 0.6 }, "-=0.4");
  }
  window.startHero = startHero;

  /* ----------------------------------------------------------
     6. AVATAR — floating + mouse parallax + 3D tilt
     ---------------------------------------------------------- */
  const avatar = document.getElementById("avatar");
  const avatarFrame = document.getElementById("avatarFrame");
  const avatarImg = document.getElementById("avatarImg");

  if (!prefersReduced && avatar && finePointer) {
    // continuous gentle float (independent of GSAP scroll)
    gsap.to(avatar, {
      y: -12, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1,
    });

    // mouse parallax + 3D tilt
    let raf = null;
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;

    function avRender() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      curRX += (targetRX - curRX) * 0.08;
      curRY += (targetRY - curRY) * 0.08;
      if (avatarFrame) {
        avatarFrame.style.transform = `translate(${curX}px, ${curY}px) rotateX(${curRX}deg) rotateY(${curRY}deg)`;
      }
      if (avatarImg) {
        // image moves slightly opposite for depth
        avatarImg.style.transform = `scale(1.04) translate(${-curX * 0.3}px, ${-curY * 0.3}px)`;
      }
      raf = requestAnimationFrame(avRender);
    }

    window.addEventListener("mousemove", (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      targetX = cx * 22;
      targetY = cy * 18;
      targetRY = cx * 6;
      targetRX = -cy * 5;
    });

    avRender();

    // pause tilt loop when hero off-screen
    const heroSec = document.getElementById("hero");
    if (heroSec) {
      const heroIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(avRender);
          } else {
            if (raf) { cancelAnimationFrame(raf); raf = null; }
          }
        });
      }, { threshold: 0.05 });
      heroIO.observe(heroSec);
    }
  }

  /* ----------------------------------------------------------
     7. PROGRESS BAR + NAV VISIBILITY
     ---------------------------------------------------------- */
  const progress = document.querySelector("#progress span");
  const nav = document.getElementById("nav");
  let lastY = 0;
  function onScrollProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
    if (progress) progress.style.width = (p * 100) + "%";
    const y = h.scrollTop || window.scrollY;
    if (y > 80) {
      if (y > lastY + 6) nav.style.transform = "translateY(-110%)";
      else if (y < lastY - 6) nav.style.transform = "translateY(0)";
    } else { nav.style.transform = "translateY(0)"; }
    lastY = y;
  }
  window.addEventListener("scroll", onScrollProgress, { passive: true });

  /* ----------------------------------------------------------
     8. HERO PARALLAX (glows + content)
     ---------------------------------------------------------- */
  if (!prefersReduced && finePointer) {
    const glowC = document.querySelector(".hero__glow--cyan");
    const glowV = document.querySelector(".hero__glow--violet");
    window.addEventListener("mousemove", (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5);
      const cy = (e.clientY / window.innerHeight - 0.5);
      gsap.to(glowC, { x: cx * 60, y: cy * 50, duration: 1.4, ease: "power2.out" });
      gsap.to(glowV, { x: -cx * 50, y: -cy * 40, duration: 1.4, ease: "power2.out" });
    });
  }
  if (!prefersReduced) {
    gsap.to(".hero__content", {
      yPercent: 12, opacity: 0.55, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ----------------------------------------------------------
     9. ABOUT — editorial word stagger + blur reveal paragraphs
     ---------------------------------------------------------- */
  if (!prefersReduced) {
    gsap.to(".about__headline .word", {
      opacity: 1, y: 0, rotation: 0,
      duration: 0.9, ease: "power3.out", stagger: 0.04,
      scrollTrigger: { trigger: ".about__headline", start: "top 75%" },
    });
    // blur-to-clear reveal for paragraphs
    gsap.fromTo(".about__p",
      { filter: "blur(14px)", opacity: 0, y: 24 },
      {
        filter: "blur(0px)", opacity: 1, y: 0,
        duration: 1.1, ease: "power3.out", stagger: 0.15,
        scrollTrigger: { trigger: ".about__body", start: "top 75%" },
      });
    gsap.from(".about__stats", {
      y: 30, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".about__stats", start: "top 85%" },
    });
  } else {
    document.querySelectorAll(".about__headline .word").forEach(w => { w.style.opacity = 1; w.style.transform = "none"; });
  }

  // stat counters
  document.querySelectorAll(".about__stat-num").forEach((el) => {
    const target = el.getAttribute("data-count");
    const isText = el.getAttribute("data-text") === "true";
    if (isText) {
      ScrollTrigger.create({
        trigger: el, start: "top 85%", once: true,
        onEnter: () => { el.textContent = target; },
      });
      return;
    }
    const num = parseInt(target, 10);
    if (isNaN(num)) { el.textContent = target; return; }
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: num, duration: 1.4, ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(obj.v); },
        });
      },
    });
  });

  /* ----------------------------------------------------------
     10. FOCUS (BENTO) — staggered blur reveal + spotlight hover
     ---------------------------------------------------------- */
  if (!prefersReduced) {
    gsap.from(".focus__title", {
      y: 40, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".focus__title", start: "top 80%" },
    });
    gsap.fromTo(".bento__card",
      { y: 50, opacity: 0, scale: 0.96, filter: "blur(10px)" },
      {
        y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
        duration: 0.9, ease: "power3.out",
        stagger: { each: 0.08, from: "start" },
        scrollTrigger: { trigger: ".bento", start: "top 78%" },
      });
    gsap.fromTo(".bento__icon",
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)", duration: 0.8, ease: "power2.out", stagger: 0.08,
        scrollTrigger: { trigger: ".bento", start: "top 78%" },
      });
  }

  // spotlight hover — track mouse per card (CSS var --mx/--my)
  if (finePointer) {
    document.querySelectorAll(".bento__card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  /* ----------------------------------------------------------
     11. SKILLS — category reveal + progress bar fill
     ---------------------------------------------------------- */
  document.querySelectorAll("[data-cat]").forEach((cat) => {
    if (prefersReduced) { cat.classList.add("is-in"); fillBars(cat); return; }
    ScrollTrigger.create({
      trigger: cat, start: "top 82%", once: true,
      onEnter: () => {
        cat.classList.add("is-in");
        fillBars(cat);
      },
    });
    gsap.from(cat, {
      y: 30, opacity: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: cat, start: "top 85%" },
    });
  });

  function fillBars(cat) {
    const bars = cat.querySelectorAll(".bar");
    bars.forEach((bar, i) => {
      const level = parseInt(bar.getAttribute("data-level") || "0", 10);
      const fill = bar.querySelector(".bar__fill");
      const val = bar.querySelector(".bar__val");
      if (!fill) return;
      if (prefersReduced) {
        fill.style.width = level + "%";
        return;
      }
      // animate fill width + count value
      gsap.to(fill, {
        width: level + "%",
        duration: 1.3,
        ease: "power3.out",
        delay: 0.15 + i * 0.1,
      });
      if (val) {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: level, duration: 1.3, ease: "power3.out", delay: 0.15 + i * 0.1,
          onUpdate: () => { val.textContent = Math.round(obj.v); },
        });
      }
      // mark is-in so the moving highlight sweep starts
      setTimeout(() => bar.classList.add("is-in"), 200 + i * 100);
    });
  }

  if (!prefersReduced) {
    gsap.from(".skills__title", {
      y: 40, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".skills__title", start: "top 80%" },
    });
  }

  /* ----------------------------------------------------------
     12. PROJECTS — horizontal pinned storytelling (desktop only)
        Mobile: vertical stack, simple reveal, no pin/transform.
     ---------------------------------------------------------- */
  const track = document.getElementById("projectsTrack");
  const progressSpan = document.querySelector("#projectsProgress span");

  if (!prefersReduced && isDesktop && track) {
    // Desktop: horizontal pin + scrub.
    // pinSpacing must be true (default) so the section occupies vertical
    // space equal to the horizontal scroll distance — this prevents the
    // next section (contact) from overlapping and the previous (skills)
    // from leaking. start "top top" pins when projects reaches viewport top.
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 40);
    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".projects",
        start: "top top",
        end: () => "+=" + getDistance(),
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (progressSpan) progressSpan.style.width = (self.progress * 100) + "%";
        },
      },
    });
  } else if (track) {
    // Mobile / tablet: vertical stack — simple reveal per card.
    // Use fromTo (not from) so the element never gets stuck in its
    // initial hidden state if the ScrollTrigger start is miscalculated.
    // immediateRender:false prevents the from-state from being applied
    // before the trigger fires.
    gsap.utils.toArray(".project").forEach((proj) => {
      gsap.fromTo(proj,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          immediateRender: false,
          scrollTrigger: { trigger: proj, start: "top 85%", once: true },
        }
      );
    });
  }

  if (!prefersReduced) {
    gsap.from(".projects__title", {
      y: 40, opacity: 0, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: ".projects__intro", start: "top 80%" },
    });
  }

  /* Project placeholder reveal — blur→clear, opacity 0→1, scale 1.03→1
     Triggers when each .shot__frame enters the viewport.
     Uses IntersectionObserver for both desktop (horizontal-pinned, transforms
     affect rendered position so IO fires correctly) and mobile (stacked). */
  const shotFrames = document.querySelectorAll(".shot__frame");
  if (!prefersReduced && shotFrames.length) {
    const shotIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          shotIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    shotFrames.forEach((f) => shotIO.observe(f));
  } else if (prefersReduced) {
    // reduced motion: show immediately
    shotFrames.forEach((f) => f.classList.add("is-revealed"));
  }

  /* ----------------------------------------------------------
     13. CONTACT — calm line-mask reveal + footer
     ---------------------------------------------------------- */
  if (!prefersReduced) {
    gsap.to(".contact__title .line__inner", {
      yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.1,
      scrollTrigger: { trigger: ".contact__title", start: "top 75%" },
    });
    gsap.from(".contact__email", {
      y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3,
      scrollTrigger: { trigger: ".contact__email", start: "top 85%" },
    });
    gsap.from(".contact__link", {
      y: 24, opacity: 0, scale: 0.9, duration: 0.8, ease: "back.out(1.7)", stagger: 0.12,
      scrollTrigger: { trigger: ".contact__links", start: "top 88%" },
    });
    gsap.from(".footer > *", {
      y: 20, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12,
      scrollTrigger: { trigger: ".footer", start: "top 92%" },
    });
  } else {
    document.querySelectorAll(".contact__title .line__inner").forEach(l => l.style.transform = "translateY(0)");
  }

  /* ----------------------------------------------------------
     14. SECTION TITLE REVEAL LINES (generic mask reveal)
     ---------------------------------------------------------- */
  if (!prefersReduced) {
    document.querySelectorAll(".focus__title, .skills__title, .projects__title").forEach((el) => {
      ScrollTrigger.create({
        trigger: el, start: "top 80%", once: true,
        onEnter: () => el.classList.add("is-revealed"),
      });
    });
  } else {
    document.querySelectorAll(".reveal-line").forEach(l => l.style.transform = "translateY(0)");
    document.querySelectorAll(".focus__title, .skills__title, .projects__title").forEach(el => el.classList.add("is-revealed"));
  }

  /* ----------------------------------------------------------
     15. LIVING BACKGROUND PARTICLES
     ---------------------------------------------------------- */
  const particlesEl = document.getElementById("bgParticles");
  if (particlesEl && !prefersReduced) {
    const COUNT = window.innerWidth < 720 ? 12 : 24;
    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement("span");
      p.style.left = Math.random() * 100 + "%";
      p.style.top = "100%";
      const dur = 14 + Math.random() * 16;
      const delay = Math.random() * dur;
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = "-" + delay + "s";
      const size = 1 + Math.random() * 2;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.opacity = (0.3 + Math.random() * 0.4).toFixed(2);
      particlesEl.appendChild(p);
    }
    // pause particles when tab hidden
    document.addEventListener("visibilitychange", () => {
      particlesEl.style.animationPlayState = document.hidden ? "paused" : "running";
      particlesEl.querySelectorAll("span").forEach((s) => {
        s.style.animationPlayState = document.hidden ? "paused" : "running";
      });
    });
  }

  /* ----------------------------------------------------------
     16. EASTER EGGS
     ---------------------------------------------------------- */

  // (a) Double-click avatar → profile card
  const profileCard = document.getElementById("profileCard");
  const profileClose = document.getElementById("profileCardClose");
  if (avatar && profileCard) {
    avatar.addEventListener("dblclick", () => openProfileCard());
    // also support two quick taps on touch
    let lastTap = 0;
    avatar.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTap < 350) { e.preventDefault(); openProfileCard(); }
      lastTap = now;
    });
  }
  function openProfileCard() {
    if (!profileCard) return;
    profileCard.classList.add("is-open");
    profileCard.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
  }
  function closeProfileCard() {
    if (!profileCard) return;
    profileCard.classList.remove("is-open");
    profileCard.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  }
  if (profileClose) profileClose.addEventListener("click", closeProfileCard);
  if (profileCard) {
    profileCard.addEventListener("click", (e) => {
      if (e.target === profileCard) closeProfileCard();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && profileCard && profileCard.classList.contains("is-open")) closeProfileCard();
  });

  // (b) Dev Mode — press "D"
  const devmode = document.getElementById("devmode");
  let devOn = false;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && devOn) { toggleDevMode(false); return; }
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (e.key.toLowerCase() === "d" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      toggleDevMode(!devOn);
    }
  });
  function toggleDevMode(on) {
    devOn = on;
    if (!devmode) return;
    if (on) {
      devmode.classList.add("is-on");
      document.documentElement.classList.add("is-dev");
      // reveal grid + outlines in dev mode
      document.body.style.setProperty("--dev-grid", "1");
    } else {
      devmode.classList.remove("is-on");
      document.documentElement.classList.remove("is-dev");
      document.body.style.removeProperty("--dev-grid");
    }
  }

  // (c) Konami-style: typing "jp" anywhere triggers avatar pulse
  let typedBuffer = "";
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    typedBuffer = (typedBuffer + e.key.toLowerCase()).slice(-2);
    if (typedBuffer === "jp" && avatar) {
      gsap.fromTo(avatar,
        { scale: 1 },
        { scale: 1.04, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 1 });
      typedBuffer = "";
    }
  });

  /* ----------------------------------------------------------
     17. PERFORMANCE — ScrollTrigger config + off-screen optimizations
     ---------------------------------------------------------- */
  // On mobile, reduce the normalizer resolution to save CPU
  if (!isDesktop) {
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  // Use content-visibility:auto on heavy sections so the browser skips
  // rendering off-screen content (huge win on mobile).
  // NOTE: intentionally EXCLUDES .projects — content-visibility breaks
  // ScrollTrigger pin calculations (section height is unknown until
  // rendered, causing the pin spacer to be miscalculated and the section
  // to appear at the wrong scroll position).
  if ("CSS" in window && CSS.supports && CSS.supports("content-visibility", "auto")) {
    document.querySelectorAll(".focus, .skills").forEach((sec) => {
      sec.style.contentVisibility = "auto";
      sec.style.containIntrinsicSize = "auto 600px";
    });
  }

  /* ----------------------------------------------------------
     18. REFRESH ON RESIZE
     ---------------------------------------------------------- */
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

})();
