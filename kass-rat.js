(() => {
  const RAT_IMAGE = 'Asset 51@4x.png';
  const HOST_SELECTOR = '#castleWrap';
  const INSTANCE_COUNT = 1;

  const style = document.createElement('style');
  style.textContent = `
    .kt-rat-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 6;
      overflow: visible;
    }

    .kt-rat {
      position: absolute;
      width: clamp(90px, 11vw, 180px);
      transform-origin: center center;
      opacity: 0;
      will-change: transform, opacity, left, top;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,.22));
    }
  `;
  document.head.appendChild(style);

  function waitForHost() {
    return new Promise((resolve) => {
      const existing = document.querySelector(HOST_SELECTOR);
      if (existing) return resolve(existing);

      const obs = new MutationObserver(() => {
        const found = document.querySelector(HOST_SELECTOR);
        if (found) {
          obs.disconnect();
          resolve(found);
        }
      });

      obs.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickSpot(hostRect, ratW, ratH) {
    const zones = [
      { x1: 0.02, x2: 0.18, y1: 0.36, y2: 0.80 },
      { x1: 0.16, x2: 0.34, y1: 0.12, y2: 0.48 },
      { x1: 0.34, x2: 0.48, y1: 0.00, y2: 0.26 },
      { x1: 0.56, x2: 0.70, y1: 0.02, y2: 0.30 },
      { x1: 0.70, x2: 0.92, y1: 0.34, y2: 0.80 },
      { x1: 0.30, x2: 0.54, y1: 0.74, y2: 0.96 }
    ];

    const z = zones[Math.floor(Math.random() * zones.length)];
    const x = rand(z.x1, z.x2) * hostRect.width - ratW * rand(0.15, 0.55);
    const y = rand(z.y1, z.y2) * hostRect.height - ratH * rand(0.15, 0.55);

    return {
      x: Math.max(-ratW * 0.25, Math.min(hostRect.width - ratW * 0.25, x)),
      y: Math.max(-ratH * 0.2, Math.min(hostRect.height - ratH * 0.2, y))
    };
  }

  function animateRat(rat, host) {
    const hostRect = host.getBoundingClientRect();
    const baseW = Math.min(Math.max(hostRect.width * 0.15, 95), 185);
    rat.style.width = baseW + 'px';

    const ratRect = rat.getBoundingClientRect();
    const spot = pickSpot(hostRect, ratRect.width || baseW, ratRect.height || baseW * 0.68);
    const flip = Math.random() > 0.5 ? -1 : 1;
    const tilt = rand(-8, 8);

    rat.animate(
      [
        {
          opacity: 0,
          transform: `translate(${spot.x}px, ${spot.y + 8}px) scale(${0.72 * flip}, 0.72) rotate(${tilt}deg)`
        },
        {
          opacity: 0.96,
          transform: `translate(${spot.x}px, ${spot.y}px) scale(${1.0 * flip}, 1.0) rotate(${tilt}deg)`,
          offset: 0.34
        },
        {
          opacity: 0.96,
          transform: `translate(${spot.x + rand(-6, 6)}px, ${spot.y + rand(-4, 4)}px) scale(${1.06 * flip}, 1.06) rotate(${tilt + rand(-2, 2)}deg)`,
          offset: 0.72
        },
        {
          opacity: 0,
          transform: `translate(${spot.x + rand(-10, 10)}px, ${spot.y - 6}px) scale(${0.82 * flip}, 0.82) rotate(${tilt + rand(-3, 3)}deg)`
        }
      ],
      {
        duration: rand(3400, 5200),
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      }
    );
  }

  function scheduleRat(rat, host, delay = rand(900, 2200)) {
    window.setTimeout(() => {
      animateRat(rat, host);
      scheduleRat(rat, host, rand(1800, 4200));
    }, delay);
  }

  waitForHost().then((host) => {
    const layer = document.createElement('div');
    layer.className = 'kt-rat-layer';
    host.appendChild(layer);

    for (let i = 0; i < INSTANCE_COUNT; i++) {
      const rat = document.createElement('img');
      rat.className = 'kt-rat';
      rat.src = RAT_IMAGE;
      rat.alt = '';
      rat.setAttribute('aria-hidden', 'true');
      layer.appendChild(rat);

      if (rat.complete) {
        scheduleRat(rat, host, rand(700, 1800));
      } else {
        rat.addEventListener('load', () => scheduleRat(rat, host, rand(700, 1800)), { once: true });
      }
    }

    window.addEventListener('resize', () => {
      const rats = layer.querySelectorAll('.kt-rat');
      rats.forEach((rat) => {
        const hostRect = host.getBoundingClientRect();
        rat.style.width = Math.min(Math.max(hostRect.width * 0.15, 95), 185) + 'px';
      });
    });
  });
})();
