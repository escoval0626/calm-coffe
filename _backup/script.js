/* ============================================================
   common. — Visual Layer Editor + Site Logic
   Features:
     1. All text/images are editable layers
     2. Image replacement via local file upload
     3. Text editing with font-size & margin controls
     4. Drag-to-move layers (with auto-layout aware offsets)
     5. Save button persists edits to localStorage as master data
   ============================================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'common_design_master';

  /* ——————————————————————————————————————
     SECTION 1: SITE LOGIC (non-editor)
     —————————————————————————————————————— */

  // Loader
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    loadMasterData();
    setTimeout(() => {
      loader.classList.add('hidden');
      triggerHeroReveal();
    }, 1000);
  });

  function triggerHeroReveal() {
    document.querySelectorAll('.hero .reveal').forEach(el => {
      const d = parseFloat(el.dataset.delay || 0) * 1000;
      setTimeout(() => el.classList.add('in'), d);
    });
  }

  // Mobile menu
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileOverlay = document.getElementById('mobileOverlay');
  if (menuBtn && mobileOverlay) {
    menuBtn.addEventListener('click', () => {
      const open = mobileOverlay.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
    });
    document.querySelectorAll('.mobile-nav a').forEach(a => {
      a.addEventListener('click', () => {
        mobileOverlay.classList.remove('open');
        menuBtn.classList.remove('open');
      });
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      if (document.body.classList.contains('edit-mode')) return;
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // Navbar scroll + scroll progress
  const topnav = document.getElementById('topnav');
  const scrollProgress = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    topnav.classList.toggle('scrolled', window.scrollY > 60);
    // scroll progress bar
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress && docH > 0) {
      scrollProgress.style.transform = `scaleX(${window.scrollY / docH})`;
    }
  }, { passive: true });

  // Multi-type scroll reveals
  const revealSelectors = '.reveal:not(.hero .reveal), .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .img-reveal, .svg-draw';
  const revealEls = document.querySelectorAll(revealSelectors);
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const d = parseFloat(entry.target.dataset.delay || 0) * 1000;
        setTimeout(() => entry.target.classList.add('in'), d);
        revealObs.unobserve(entry.target);

        // Trigger counter animation for stat numbers
        if (entry.target.classList.contains('reveal') && entry.target.closest('.stat-item')) {
          const numEl = entry.target.querySelector('.stat-num[data-count]');
          if (numEl) animateCounter(numEl);
        }
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  // Counter animation
  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(target * ease);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  // ============================================================
  // THREE.JS — Faithful translation of AbstractScene.tsx
  // Source: Google AI Studio "Minimal Abstract 3D / FLOW"
  // 5× TorusGeometry + MeshWobbleMaterial (drei) equivalent
  // ============================================================
  function initHero3D() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xfcfcfc, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfcfc);

    // PerspectiveCamera — position={[0, 0, 10]}
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    // Lighting — ambientLight intensity={0.8} + pointLight position={[10,10,10]} intensity={1}
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Environment "studio" approximation — hemisphere + multiple direction lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdddddd, 0.6);
    scene.add(hemiLight);
    const studioLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
    studioLight1.position.set(-5, 8, 5);
    scene.add(studioLight1);
    const studioLight2 = new THREE.DirectionalLight(0xf0f0f0, 0.3);
    studioLight2.position.set(5, -3, 8);
    scene.add(studioLight2);
    const studioLight3 = new THREE.DirectionalLight(0xffffff, 0.2);
    studioLight3.position.set(0, 5, -10);
    scene.add(studioLight3);

    // ——— MeshWobbleMaterial equivalent shader ———
    // drei's MeshWobbleMaterial applies a gentle rotation-based wobble,
    // NOT large vertex displacement. The key formula:
    //   theta = sin(time * speed) / 2.0 * factor
    //   then rotates position by theta
    const wobbleVertexShader = `
      uniform float uTime;
      uniform float uSpeed;
      uniform float uFactor;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);

        // drei MeshWobbleMaterial wobble — rotation-based
        float theta = sin(uTime * uSpeed) / 2.0 * uFactor;
        float c = cos(theta);
        float s = sin(theta);
        mat3 wobbleMatrix = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);

        vec3 pos = wobbleMatrix * position;

        // Additional subtle per-vertex ripple for organic feel
        float ripple = sin(position.x * 8.0 + uTime * uSpeed * 0.5) *
                       cos(position.z * 6.0 + uTime * uSpeed * 0.3);
        pos += normal * ripple * 0.003;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;

        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    // Fragment: MeshStandardMaterial approximation
    // color="#868e96" emissive="#adb5bd" emissiveIntensity=0.2 roughness=0.1
    const wobbleFragmentShader = `
      uniform vec3 uColor;
      uniform vec3 uEmissive;
      uniform float uEmissiveIntensity;
      uniform float uRoughness;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel for glossy metallic-like reflection (roughness=0.1)
        float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);

        // Multi-light diffuse (studio environment approximation)
        vec3 lightDir1 = normalize(vec3(10.0, 10.0, 10.0));  // pointLight
        vec3 lightDir2 = normalize(vec3(-5.0, 8.0, 5.0));    // studio fill
        vec3 lightDir3 = normalize(vec3(5.0, -3.0, 8.0));    // studio rim

        float diff1 = max(dot(normal, lightDir1), 0.0);
        float diff2 = max(dot(normal, lightDir2), 0.0) * 0.4;
        float diff3 = max(dot(normal, lightDir3), 0.0) * 0.3;
        float diffuse = diff1 + diff2 + diff3;
        diffuse = diffuse * 0.4 + 0.6; // ambient contribution

        // Specular (glossy — roughness 0.1)
        vec3 halfDir = normalize(lightDir1 + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 90.0) * 0.8;

        // Combine
        vec3 color = uColor * diffuse;
        color += spec * vec3(1.0);
        color += uEmissive * uEmissiveIntensity;
        color += fresnel * vec3(0.9) * 0.15; // environment reflection

        gl_FragColor = vec4(color, 1.0); // Fully opaque — no transparency
      }
    `;

    // ——— Create 5 FlowRibbons ———
    const RIBBON_COUNT = 5;
    const ribbons = [];
    const ribbonData = [];

    for (let i = 0; i < RIBBON_COUNT; i++) {
      const uniforms = {
        uTime: { value: 0 },
        uSpeed: { value: 1.0 },
        uFactor: { value: 2.0 },
        uColor: { value: new THREE.Color(0x868e96) },
        uEmissive: { value: new THREE.Color(0xadb5bd) },
        uEmissiveIntensity: { value: 0.2 },
        uRoughness: { value: 0.1 },
      };

      const material = new THREE.ShaderMaterial({
        vertexShader: wobbleVertexShader,
        fragmentShader: wobbleFragmentShader,
        uniforms,
        side: THREE.DoubleSide,
      });

      // torusGeometry args={[4, 0.008, 16, 100]}
      const geometry = new THREE.TorusGeometry(4, 0.008, 16, 100);
      const mesh = new THREE.Mesh(geometry, material);

      // position={[0, (index - 2) * 2, -2]}
      mesh.position.set(0, (i - 2) * 2, -2);
      // rotation={[Math.PI / 2.5, 0, 0]}
      mesh.rotation.x = Math.PI / 2.5;

      ribbons.push(mesh);
      ribbonData.push({ mesh, uniforms, index: i });
    }

    // Pivot group for OrbitControls autoRotate
    const pivot = new THREE.Group();
    ribbons.forEach(r => pivot.add(r));
    scene.add(pivot);

    // ——— Resize ———
    function onResize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // ——— Animation loop ———
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Update each ribbon — matches useFrame from R3F source
      for (let i = 0; i < RIBBON_COUNT; i++) {
        ribbonData[i].uniforms.uTime.value = t;

        // mesh.current.rotation.z = Math.sin(time * 0.5 + index) * 0.1;
        ribbons[i].rotation.z = Math.sin(t * 0.5 + i) * 0.1;
        // mesh.current.position.y = Math.cos(time * 0.3 + index) * 0.5;
        ribbons[i].position.y = (i - 2) * 2 + Math.cos(t * 0.3 + i) * 0.5;
      }

      // OrbitControls autoRotate autoRotateSpeed={0.2}
      // Three.js OrbitControls autoRotate: 2*PI / 60 * speed radians per second
      pivot.rotation.y = t * (2 * Math.PI / 60) * 0.2;

      renderer.render(scene, camera);
    }
    animate();
  }

  // Init
  if (typeof THREE !== 'undefined') {
    initHero3D();
  } else {
    window.addEventListener('load', () => setTimeout(initHero3D, 100));
  }

  // Hero content parallax on scroll
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight * 1.5) {
        const ratio = window.scrollY / window.innerHeight;
        heroContent.style.opacity = 1 - ratio * 1.4;
        heroContent.style.transform = `translateY(${window.scrollY * 0.1}px)`;
      }
    }, { passive: true });
  }

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = document.getElementById('submitBtn');
      btn.textContent = 'SENDING...'; btn.disabled = true; btn.style.opacity = '0.5';
      setTimeout(() => {
        btn.textContent = 'SENT ✓'; btn.style.opacity = '1';
        form.reset();
        setTimeout(() => { btn.textContent = 'SEND INQUIRY'; btn.style.background = ''; btn.disabled = false; }, 3000);
      }, 1200);
    });
  }

  /* ——————————————————————————————————————
     SECTION 2: VISUAL EDITOR ENGINE
     —————————————————————————————————————— */

  const toolbar = document.getElementById('editorToolbar');
  const toggleBtn = document.getElementById('tbToggleEdit');
  const addTextBtn = document.getElementById('tbAddText');
  const addImageBtn = document.getElementById('tbAddImage');
  const saveBtn = document.getElementById('tbSave');
  const propPanel = document.getElementById('propPanel');
  const propBody = document.getElementById('propBody');
  const propTitle = document.getElementById('propTitle');
  const propClose = document.getElementById('propClose');
  const imageUpload = document.getElementById('imageUpload');

  let editMode = false;
  let selectedLayer = null;
  let isDragging = false;
  let dragStartX, dragStartY, dragElStartX, dragElStartY;
  let uploadTargetId = null;

  // Show toolbar on triple-click or Ctrl+E
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      toolbar.classList.toggle('visible');
      if (!toolbar.classList.contains('visible')) {
        exitEditMode();
      }
    }
  });

  // Also show on triple click on body
  let clickCount = 0;
  let clickTimer = null;
  document.addEventListener('click', e => {
    if (editMode) return;
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 500);
    if (clickCount >= 3) {
      clickCount = 0;
      toolbar.classList.add('visible');
    }
  });

  // Auto-show toolbar
  setTimeout(() => { toolbar.classList.add('visible'); }, 2000);

  // Toggle edit mode
  toggleBtn.addEventListener('click', () => {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    toggleBtn.classList.toggle('active', editMode);
    if (!editMode) {
      exitEditMode();
    }
  });

  function exitEditMode() {
    editMode = false;
    document.body.classList.remove('edit-mode');
    toggleBtn.classList.remove('active');
    deselectAll();
    propPanel.classList.remove('open');
  }

  // Layer click
  document.addEventListener('click', e => {
    if (!editMode) return;
    const layer = e.target.closest('[data-layer]');
    if (layer) {
      e.preventDefault();
      e.stopPropagation();
      selectLayer(layer);
    } else if (!e.target.closest('.prop-panel') && !e.target.closest('.editor-toolbar')) {
      deselectAll();
      propPanel.classList.remove('open');
    }
  });

  function deselectAll() {
    document.querySelectorAll('.layer-selected').forEach(el => el.classList.remove('layer-selected'));
    selectedLayer = null;
  }

  function selectLayer(el) {
    deselectAll();
    el.classList.add('layer-selected');
    selectedLayer = el;
    showProperties(el);
  }

  /* ——— Properties Panel ——— */
  function showProperties(el) {
    const type = el.dataset.layer;
    const id = el.dataset.id;
    propTitle.textContent = id || 'Layer';
    propBody.innerHTML = '';
    propPanel.classList.add('open');

    if (type === 'text') {
      showTextProperties(el);
    } else if (type === 'image') {
      showImageProperties(el);
    }
  }

  function showTextProperties(el) {
    const currentText = el.innerHTML.replace(/<em>(.*?)<\/em>/g, '$1').replace(/<br\s*\/?>/g, '\n');
    const computedStyle = window.getComputedStyle(el);
    const fontSize = parseInt(computedStyle.fontSize);
    const marginTop = parseInt(computedStyle.marginTop) || 0;
    const marginBottom = parseInt(computedStyle.marginBottom) || 0;

    propBody.innerHTML = `
      <div class="prop-group">
        <label class="prop-label">Content</label>
        <textarea class="prop-textarea" id="propTextContent">${currentText.trim()}</textarea>
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label class="prop-label">Font Size (px)</label>
          <input type="number" class="prop-input" id="propFontSize" value="${fontSize}" min="8" max="200" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Font Weight</label>
          <select class="prop-input" id="propFontWeight">
            <option value="200" ${computedStyle.fontWeight <= 200 ? 'selected' : ''}>200 - Thin</option>
            <option value="300" ${computedStyle.fontWeight > 200 && computedStyle.fontWeight <= 300 ? 'selected' : ''}>300 - Light</option>
            <option value="400" ${computedStyle.fontWeight > 300 && computedStyle.fontWeight <= 400 ? 'selected' : ''}>400 - Regular</option>
            <option value="500" ${computedStyle.fontWeight > 400 ? 'selected' : ''}>500 - Medium</option>
          </select>
        </div>
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label class="prop-label">Margin Top (px)</label>
          <input type="number" class="prop-input" id="propMarginTop" value="${marginTop}" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Margin Bottom (px)</label>
          <input type="number" class="prop-input" id="propMarginBot" value="${marginBottom}" />
        </div>
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label class="prop-label">Offset X (px)</label>
          <input type="number" class="prop-input" id="propOffsetX" value="${parseInt(el.style.marginLeft) || 0}" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Offset Y (px)</label>
          <input type="number" class="prop-input" id="propOffsetY" value="${parseInt(el.style.marginTop) || marginTop}" />
        </div>
      </div>
      <div class="prop-group">
        <label class="prop-label">Letter Spacing (px)</label>
        <input type="number" class="prop-input" id="propLetterSpacing" value="${parseFloat(computedStyle.letterSpacing) || 0}" step="0.1" />
      </div>
      <div class="prop-group" style="margin-top:8px;">
        <button class="prop-btn prop-btn--danger" id="propResetLayer">RESET LAYER</button>
      </div>
    `;

    // Bind events
    const textContent = document.getElementById('propTextContent');
    const fontSizeInput = document.getElementById('propFontSize');
    const fontWeightInput = document.getElementById('propFontWeight');
    const marginTopInput = document.getElementById('propMarginTop');
    const marginBotInput = document.getElementById('propMarginBot');
    const offsetXInput = document.getElementById('propOffsetX');
    const offsetYInput = document.getElementById('propOffsetY');
    const letterSpacingInput = document.getElementById('propLetterSpacing');
    const resetBtn = document.getElementById('propResetLayer');

    textContent.addEventListener('input', () => {
      const text = textContent.value.replace(/\n/g, '<br/>');
      // Preserve <em> wrapping for serif titles
      if (el.querySelector('em') || el.classList.contains('sc-title') || el.classList.contains('section-title') ||
          el.classList.contains('work-title') || el.classList.contains('contact-title') || el.classList.contains('intro-heading')) {
        el.innerHTML = '<em>' + text + '</em>';
      } else {
        el.innerHTML = text;
      }
    });

    fontSizeInput.addEventListener('input', () => {
      el.style.fontSize = fontSizeInput.value + 'px';
    });

    fontWeightInput.addEventListener('change', () => {
      el.style.fontWeight = fontWeightInput.value;
    });

    marginTopInput.addEventListener('input', () => {
      el.style.marginTop = marginTopInput.value + 'px';
    });

    marginBotInput.addEventListener('input', () => {
      el.style.marginBottom = marginBotInput.value + 'px';
    });

    offsetXInput.addEventListener('input', () => {
      el.style.marginLeft = offsetXInput.value + 'px';
    });

    offsetYInput.addEventListener('input', () => {
      el.style.marginTop = offsetYInput.value + 'px';
    });

    letterSpacingInput.addEventListener('input', () => {
      el.style.letterSpacing = letterSpacingInput.value + 'px';
    });

    resetBtn.addEventListener('click', () => {
      el.style.cssText = '';
      // Re-open props to refresh values
      showProperties(el);
    });
  }

  function showImageProperties(el) {
    const id = el.dataset.id;
    propBody.innerHTML = `
      <div class="prop-group">
        <label class="prop-label">Current Source</label>
        <input type="text" class="prop-input" id="propImgSrc" value="${el.src ? el.src.split('/').pop() : ''}" readonly />
      </div>
      <div class="prop-group">
        <button class="prop-btn" id="propUploadImg">UPLOAD FROM LOCAL</button>
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label class="prop-label">Object Fit</label>
          <select class="prop-input" id="propObjFit">
            <option value="cover" ${el.style.objectFit === 'contain' ? '' : 'selected'}>Cover</option>
            <option value="contain" ${el.style.objectFit === 'contain' ? 'selected' : ''}>Contain</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">Filter</label>
          <select class="prop-input" id="propFilter">
            <option value="none">None</option>
            <option value="grayscale(1)">Grayscale</option>
            <option value="grayscale(0.5)">Semi Gray</option>
            <option value="brightness(1.1)">Bright</option>
            <option value="contrast(1.2)">High Contrast</option>
          </select>
        </div>
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label class="prop-label">Offset X (px)</label>
          <input type="number" class="prop-input" id="propImgOffX" value="${parseInt(el.style.marginLeft) || 0}" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Offset Y (px)</label>
          <input type="number" class="prop-input" id="propImgOffY" value="${parseInt(el.style.marginTop) || 0}" />
        </div>
      </div>
      <div class="prop-group" style="margin-top:8px;">
        <button class="prop-btn prop-btn--danger" id="propResetImg">RESET LAYER</button>
      </div>
    `;

    document.getElementById('propUploadImg').addEventListener('click', () => {
      uploadTargetId = id;
      imageUpload.click();
    });

    document.getElementById('propObjFit').addEventListener('change', function() {
      el.style.objectFit = this.value;
    });

    document.getElementById('propFilter').addEventListener('change', function() {
      el.style.filter = this.value === 'none' ? '' : this.value;
    });

    document.getElementById('propImgOffX').addEventListener('input', function() {
      el.style.marginLeft = this.value + 'px';
    });

    document.getElementById('propImgOffY').addEventListener('input', function() {
      el.style.marginTop = this.value + 'px';
    });

    document.getElementById('propResetImg').addEventListener('click', () => {
      el.style.cssText = '';
      showProperties(el);
    });
  }

  // Close panel
  propClose.addEventListener('click', () => {
    propPanel.classList.remove('open');
    deselectAll();
  });

  /* ——— Image Upload ——— */
  imageUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file || !uploadTargetId) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const target = document.querySelector(`[data-id="${uploadTargetId}"]`);
      if (target && target.tagName === 'IMG') {
        target.src = ev.target.result;
        // Update prop display
        const srcInput = document.getElementById('propImgSrc');
        if (srcInput) srcInput.value = file.name;
      }
      uploadTargetId = null;
    };
    reader.readAsDataURL(file);
    imageUpload.value = '';
  });

  /* ——— Add Text Layer ——— */
  addTextBtn.addEventListener('click', () => {
    if (!editMode) return;
    const newText = document.createElement('p');
    newText.textContent = 'New Text Layer';
    newText.dataset.layer = 'text';
    newText.dataset.id = 'custom-text-' + Date.now();
    newText.style.cssText = 'font-size:16px; font-weight:300; color:#111; position:relative;';

    // Insert at hero section
    const hero = document.querySelector('.hero-content');
    if (hero) hero.appendChild(newText);
    selectLayer(newText);
  });

  /* ——— Add Image Layer ——— */
  addImageBtn.addEventListener('click', () => {
    if (!editMode) return;
    uploadTargetId = 'new-image-' + Date.now();
    const newImg = document.createElement('img');
    newImg.dataset.layer = 'image';
    newImg.dataset.id = uploadTargetId;
    newImg.style.cssText = 'width:200px; height:200px; object-fit:cover; position:relative;';
    newImg.alt = 'New Image';
    newImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f2f2f2" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ccc" font-size="12">Upload Image</text></svg>';

    const hero = document.querySelector('.hero-content');
    if (hero) hero.appendChild(newImg);
    selectLayer(newImg);
    imageUpload.click();
  });

  /* ——— Drag to Move ——— */
  document.addEventListener('mousedown', e => {
    if (!editMode || !selectedLayer) return;
    if (e.target.closest('.prop-panel') || e.target.closest('.editor-toolbar')) return;

    const layer = e.target.closest('[data-layer].layer-selected');
    if (!layer) return;

    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragElStartX = parseInt(layer.style.marginLeft) || 0;
    dragElStartY = parseInt(layer.style.marginTop) || 0;
    layer.style.transition = 'none';
    layer.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging || !selectedLayer) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    selectedLayer.style.marginLeft = (dragElStartX + dx) + 'px';
    selectedLayer.style.marginTop = (dragElStartY + dy) + 'px';

    // Update panel inputs if open
    const offX = document.getElementById('propOffsetX') || document.getElementById('propImgOffX');
    const offY = document.getElementById('propOffsetY') || document.getElementById('propImgOffY');
    if (offX) offX.value = dragElStartX + dx;
    if (offY) offY.value = dragElStartY + dy;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging && selectedLayer) {
      selectedLayer.style.transition = '';
      selectedLayer.style.cursor = '';
    }
    isDragging = false;
  });

  /* ——— Save Master Data ——— */
  saveBtn.addEventListener('click', saveMasterData);

  function saveMasterData() {
    const data = {};
    document.querySelectorAll('[data-layer]').forEach(el => {
      const id = el.dataset.id;
      if (!id) return;
      const type = el.dataset.layer;

      if (type === 'text') {
        data[id] = {
          type: 'text',
          html: el.innerHTML,
          style: {
            fontSize: el.style.fontSize || '',
            fontWeight: el.style.fontWeight || '',
            marginTop: el.style.marginTop || '',
            marginBottom: el.style.marginBottom || '',
            marginLeft: el.style.marginLeft || '',
            letterSpacing: el.style.letterSpacing || '',
            color: el.style.color || '',
          }
        };
      } else if (type === 'image') {
        data[id] = {
          type: 'image',
          src: el.src,
          style: {
            objectFit: el.style.objectFit || '',
            filter: el.style.filter || '',
            marginLeft: el.style.marginLeft || '',
            marginTop: el.style.marginTop || '',
            width: el.style.width || '',
            height: el.style.height || '',
          }
        };
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    showToast('MASTER DATA SAVED');
  }

  function loadMasterData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      Object.entries(data).forEach(([id, info]) => {
        const el = document.querySelector(`[data-id="${id}"]`);
        if (!el) return;

        if (info.type === 'text') {
          el.innerHTML = info.html;
          Object.entries(info.style).forEach(([k, v]) => {
            if (v) el.style[k] = v;
          });
        } else if (info.type === 'image') {
          if (info.src) el.src = info.src;
          Object.entries(info.style).forEach(([k, v]) => {
            if (v) el.style[k] = v;
          });
        }
      });
    } catch (e) {
      console.warn('Failed to load master data:', e);
    }
  }

  /* ——— Toast ——— */
  function showToast(msg) {
    let toast = document.querySelector('.save-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'save-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  /* ——— Custom Cursor (non-edit mode only) ——— */
  if (!('ontouchstart' in window) && window.innerWidth > 768) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed;width:5px;height:5px;border-radius:50%;
      background:rgba(0,0,0,0.35);pointer-events:none;z-index:99999;
      transform:translate(-50%,-50%);mix-blend-mode:difference;
    `;
    document.body.appendChild(dot);

    const ring = document.createElement('div');
    ring.style.cssText = `
      position:fixed;width:28px;height:28px;border-radius:50%;
      border:1px solid rgba(0,0,0,0.1);pointer-events:none;z-index:99998;
      transform:translate(-50%,-50%);mix-blend-mode:difference;
      transition:width 0.3s ease,height 0.3s ease;
    `;
    document.body.appendChild(ring);

    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button, .work-card').forEach(el => {
      el.addEventListener('mouseenter', () => { ring.style.width = '48px'; ring.style.height = '48px'; });
      el.addEventListener('mouseleave', () => { ring.style.width = '28px'; ring.style.height = '28px'; });
    });
  }

})();
