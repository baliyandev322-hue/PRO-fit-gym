/**
 * ============================================================================
 * PROFIT TRAINING CLUB | CORE WEB APPLICATION JAVASCRIPT
 * High-Performance Commercial Fitness Experience
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. APPLICATION DATA DICTIONARIES
     ========================================================================== */

  // Training Programs Syllabus & Specifications
  const PROGRAMS_DATA = {
    strength: {
      category: 'DISCIPLINE // 01',
      title: 'MAXIMUM STRENGTH & POWER',
      duration: '12-Week Periodized Cycle',
      cadence: '4 Days / Week (Upper / Lower Split)',
      target: 'Lifters looking to build calibrated raw power in the Squat, Bench Press, and Deadlift.',
      prerequisites: 'Minimum 6 months of barbell training experience recommended.',
      specs: [
        { label: 'Primary Focus', val: 'Neural Drive & Peak Force' },
        { label: 'Rep Ranges', val: '1 – 5 Heavy Repetitions' },
        { label: 'Weekly Volume', val: '14 – 18 Working Sets / Lift' }
      ],
      curriculum: [
        'Phase 1 (Weeks 1–4): Volume accumulation, mechanical tension, and intra-abdominal bracing refinement.',
        'Phase 2 (Weeks 5–8): Rate of force development (RFD) and velocity-based overload at 82–90% 1RM.',
        'Phase 3 (Weeks 9–11): Calibrated peaking, competition pauses, and heavy singles under competition standards.',
        'Week 12: Deload testing and mock meet performance on Eleiko calibrated steel.',
        'Includes weekly video bar-path breakdown and velocity transducer feedback.'
      ]
    },
    hypertrophy: {
      category: 'DISCIPLINE // 02',
      title: 'HYPERTROPHY & MECHANICS',
      duration: '8-Week Hypertrophic Block',
      cadence: '5 Days / Week (Push / Pull / Legs / Upper / Lower)',
      target: 'Athletes focused on muscle cross-sectional area, structural balance, and joint longevity.',
      prerequisites: 'Open to all intermediate and advanced lifters.',
      specs: [
        { label: 'Primary Focus', val: 'Mechanical Tension & Stretch' },
        { label: 'Rep Ranges', val: '6 – 15 Controlled Reps' },
        { label: 'Tempo Standard', val: '3-1-1-0 Standardized Cadence' }
      ],
      curriculum: [
        'Anatomically matched exercise variations prioritizing lengthened-position overload.',
        'Systematic progressive overload tracking utilizing standardized repetition execution (no bouncing).',
        'Controlled eccentric tempos (3 seconds) to maximize muscular tension while reducing joint wear.',
        'Full access to precision urethane dumbbells up to 150 lbs and specialty cable attachments.',
        'Integrated contrast recovery sessions (Infrared Sauna & 4°C Cold Plunge) to support high training volume.'
      ]
    },
    conditioning: {
      category: 'DISCIPLINE // 03',
      title: 'ENGINE & WORK CAPACITY',
      duration: 'Ongoing Bi-Monthly Blocks',
      cadence: '3 to 4 Days / Week (Hybrid Modality)',
      target: 'Individuals seeking high anaerobic threshold, aerobic efficiency, and unbreakable stamina.',
      prerequisites: 'Cardiovascular clearance; scalability provided for all work capacities.',
      specs: [
        { label: 'Primary Focus', val: 'Aerobic Base & Anaerobic Glycolysis' },
        { label: 'Heart Rate Target', val: 'Zone 2 & Zone 4 Intervals' },
        { label: 'Turf Capacity', val: '50-Yard Sled & Carry Lanes' }
      ],
      curriculum: [
        'Low-impact Zone 2 aerobic development using Concept2 Rowers, SkiErgs, and Echo Bikes.',
        'High-density turf intervals with heavy Rogue dog sleds, yolk walks, and sandbag carries.',
        'Lactate threshold buffering: interval sprints designed to delay fatigue onset.',
        'Diaphragmatic breathing and intra-set heart-rate telemetry monitoring.',
        'Grip endurance, postural core prehab, and joint resilience drills.'
      ]
    },
    coaching: {
      category: 'DISCIPLINE // 04',
      title: 'PRIVATE ATHLETIC COACHING',
      duration: 'Bespoke Retainer (3, 6, or 12 Months)',
      cadence: '2 to 4 Coached Private Sessions / Week',
      target: 'Executives, competitive athletes, and lifters demanding individualized programming and undivided floor oversight.',
      prerequisites: 'Comprehensive initial movement screen required.',
      specs: [
        { label: 'Coaching Ratio', val: '1-on-1 Dedicated Coach' },
        { label: 'Platform Status', val: 'Reserved Private Rack' },
        { label: 'Support Window', val: 'Direct Concierge & SMS Access' }
      ],
      curriculum: [
        'Comprehensive 90-minute orthopedic movement screen, bar-path audit, and mobility assessment.',
        'Fully bespoke periodized programming updated weekly based on recovery and fatigue metrics.',
        'Zero waiting for platforms: your rack, calibrated plates, and bars are prepared before you step in.',
        'Nutritional guidance and macronutrient calibration tailored to your metabolic expenditure.',
        'Bi-weekly DEXA body composition scanning and recovery suite priority scheduling.'
      ]
    }
  };

  // Coaching Staff Profiles & Philosophy
  const TRAINERS_DATA = {
    marcus: {
      name: 'MARCUS VANCE',
      specialty: 'HEAD OF STRENGTH & BIOMECHANICS',
      photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=800&auto=format&fit=crop',
      credentials: [
        'CSCS (Certified Strength & Conditioning Specialist)',
        'USAW Level 2 Senior National Coach',
        'Competitive Powerlifter — 700 lb (318 kg) Raw Deadlift',
        '12+ Years Coaching Floor Tenure'
      ],
      philosophy: 'Strength is not an emotional state; it is an adaptation to consistent, intelligent mechanical stress. If your hips shoot up early on a heavy pull, we do not throw more plates on the bar — we rebuild your starting position. Precision builds longevity; ego builds physical therapy appointments.',
      bio: 'Marcus has spent over a decade preparing competitive powerlifters, collegiate athletes, and everyday lifters for maximal force production. He treats barbell training like architectural engineering: mastering intra-abdominal pressure, wedge mechanics, and bar trajectory on calibrated steel.'
    },
    elena: {
      name: 'ELENA ROSTOVA',
      specialty: 'OLYMPIC WEIGHTLIFTING & VELOCITY',
      photo: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      credentials: [
        'IWF International Weightlifting Coach',
        'MSc Exercise Physiology (Columbia University)',
        'Former National Weightlifting Competitor',
        'Functional Range Conditioning (FRCms) Specialist'
      ],
      philosophy: 'Velocity without precision is dangerous chaos. A successful snatch requires total internal stillness of mind combined with violent, explosive hip extension. We train our lifters to be calm, razor-sharp, and mathematically sound under heavy loads.',
      bio: 'Elena spent eight years in national weightlifting competition before dedicating herself to coaching. She directs our Olympic Lifting Labs, focusing on thoracic extension, ankle dorsiflexion, first-pull discipline, and rapid elbow turnover.'
    },
    devon: {
      name: 'DEVON CARTER',
      specialty: 'ENGINE & WORK CAPACITY DIRECTOR',
      photo: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=800&auto=format&fit=crop',
      credentials: [
        'EXOS Performance Specialist',
        'Precision Nutrition Certified (Pn2)',
        'Functional Movement Screen (FMS Certified)',
        'Tactical Conditioning Consultant'
      ],
      philosophy: 'You are not truly strong if you are completely incapacitated after three flight of stairs. Genuine athletic resilience requires an aerobic engine that rapidly recovers between maximal efforts. Heavy turf sleds and honest work forge human beings who perform when everyone else is looking for a chair.',
      bio: 'Devon has coached collegiate athletes and tactical personnel, specializing in anaerobic energy systems, joint resilience, and recovery science. He oversees our conditioning curriculum and coordinates our cold plunge recovery protocols.'
    }
  };

  // Facility Lightbox Gallery Archive
  const GALLERY_DATA = [
    {
      src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
      caption: 'Olympic Lifting Platforms & Eleiko Calibrated Iron',
      alt: 'Olympic Lifting Platforms with Eleiko bars and calibrated plates'
    },
    {
      src: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop',
      caption: 'Precision Urethane Dumbbell Arsenal (10lb to 150lb)',
      alt: 'Urethane dumbbell racks from 10 to 150 lbs'
    },
    {
      src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      caption: '12 Custom Heavy-Gauge Power Lifting Racks',
      alt: 'Row of commercial heavy gauge power lifting racks'
    },
    {
      src: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=800&auto=format&fit=crop',
      caption: '50-Yard High-Density Sprint Turf & Rogue Dog Sleds',
      alt: 'Sprint turf and heavy sled lanes'
    },
    {
      src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop',
      caption: 'Commercial 4°C Cold Plunge & Infrared Recovery Suites',
      alt: 'Cold water plunge baths and infrared recovery suite'
    },
    {
      src: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
      caption: 'Private Executive Lockers & Rain Showers',
      alt: 'Executive locker room and showers'
    }
  ];

  /* ==========================================================================
     2. NAVIGATION & HEADER SCROLL DYNAMICS
     ========================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Subtle Header Scroll State
  const onScrollHeader = () => {
    if (window.scrollY > 25) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // Mobile Navigation Drawer Toggle
  if (mobileToggle && mainNav) {
    const toggleMobileMenu = () => {
      const isOpen = mainNav.classList.contains('open');
      mobileToggle.classList.toggle('active', !isOpen);
      mainNav.classList.toggle('open', !isOpen);
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
      document.body.classList.toggle('menu-open', !isOpen);
    };

    const closeMobileMenu = () => {
      mobileToggle.classList.remove('active');
      mainNav.classList.remove('open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    mobileToggle.addEventListener('click', toggleMobileMenu);

    navLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // Active Section Highlighting in Navigation
  if (window.IntersectionObserver && sections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href === `#${currentId}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => navObserver.observe(sec));
  }

  /* ==========================================================================
     3. HERO VIDEO CROSSFADE DYNAMICS & RESTRAINED PARALLAX
     Professional two-layer crossfading workout background video coordinator
     ========================================================================== */
  const heroImage = document.getElementById('heroImage');
  const heroBackdrop = document.getElementById('heroBackdrop');
  const video1 = document.getElementById('heroVideo1');
  const video2 = document.getElementById('heroVideo2');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Crossfade controller
  const initHeroVideoCrossfade = () => {
    if (!video1 || !video2) return;

    const CROSSFADE_SECONDS = 1.8; // Duration of CSS crossfade
    const SLOW_MOTION_RATE = 0.8;  // Elegant athletic slow-motion playback

    let currentVideo = video1;
    let nextVideo = video2;
    let isTransitioning = false;
    let video1Failed = false;
    let video2Failed = false;

    // Configure muted autoplay policies and slow-motion playback
    const setupVideo = (vid) => {
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
      vid.setAttribute('muted', '');
      vid.setAttribute('playsinline', '');

      const applyPlaybackRate = () => {
        try {
          vid.playbackRate = SLOW_MOTION_RATE;
        } catch (err) {}
      };

      vid.addEventListener('loadedmetadata', applyPlaybackRate);
      vid.addEventListener('play', applyPlaybackRate);
      vid.addEventListener('canplay', applyPlaybackRate);
    };

    setupVideo(video1);
    setupVideo(video2);

    // Error resilience: prevent black flashes, flickering, or empty backgrounds
    video1.addEventListener('error', () => {
      video1Failed = true;
      if (!video2Failed) {
        video2.loop = true;
        video2.classList.add('is-active');
        video2.play().catch(() => {});
      }
    });

    video2.addEventListener('error', () => {
      video2Failed = true;
      if (!video1Failed) {
        video1.loop = true;
        video1.classList.add('is-active');
        video1.play().catch(() => {});
      }
    });

    // Seamless crossfade transition executor
    const performCrossfade = () => {
      if (isTransitioning) return;
      if (video1Failed || video2Failed) return;

      isTransitioning = true;

      // Rewind and prepare the next video
      nextVideo.currentTime = 0;
      try {
        nextVideo.playbackRate = SLOW_MOTION_RATE;
      } catch (err) {}

      const startNextVideo = () => {
        // Trigger CSS opacity transition: fade next in, fade current out
        nextVideo.classList.add('is-active');
        currentVideo.classList.remove('is-active');

        // Once the crossfade opacity transition completes, pause previous video and swap
        setTimeout(() => {
          try {
            currentVideo.pause();
            currentVideo.currentTime = 0;
          } catch (err) {}

          // Swap active video references
          const previous = currentVideo;
          currentVideo = nextVideo;
          nextVideo = previous;
          isTransitioning = false;
        }, CROSSFADE_SECONDS * 1000);
      };

      const playPromise = nextVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(startNextVideo).catch(() => {
          // If play fails unexpectedly, abort transition to prevent blank screen
          isTransitioning = false;
        });
      } else {
        startNextVideo();
      }
    };

    // Monitor playback progress to initiate crossfade near the end
    const onTimeUpdate = (vid) => {
      if (vid !== currentVideo || isTransitioning) return;

      if (vid.duration && !isNaN(vid.duration)) {
        const remaining = vid.duration - vid.currentTime;
        if (remaining <= CROSSFADE_SECONDS + 0.3) {
          performCrossfade();
        }
      }
    };

    video1.addEventListener('timeupdate', () => onTimeUpdate(video1));
    video2.addEventListener('timeupdate', () => onTimeUpdate(video2));

    // Fallback if timeupdate skips exact threshold (e.g. low-power mode)
    video1.addEventListener('ended', () => {
      if (currentVideo === video1 && !isTransitioning) performCrossfade();
    });
    video2.addEventListener('ended', () => {
      if (currentVideo === video2 && !isTransitioning) performCrossfade();
    });

    // Handle tab visibility to save resources
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        currentVideo.pause();
      } else {
        currentVideo.play().catch(() => {});
      }
    });

    // Initiate first video playback
    video1.classList.add('is-active');
    const firstPlayPromise = video1.play();
    if (firstPlayPromise !== undefined) {
      firstPlayPromise.catch(() => {
        // If autoplay blocked by strict browser policy, start on first interaction
        const unlockPlayback = () => {
          video1.play().catch(() => {});
          window.removeEventListener('click', unlockPlayback);
          window.removeEventListener('touchstart', unlockPlayback);
          window.removeEventListener('scroll', unlockPlayback);
        };
        window.addEventListener('click', unlockPlayback, { once: true, passive: true });
        window.addEventListener('touchstart', unlockPlayback, { once: true, passive: true });
        window.addEventListener('scroll', unlockPlayback, { once: true, passive: true });
      });
    }

    // Preload video 2 in background
    video2.load();
  };

  initHeroVideoCrossfade();

  // Subtle Hero Parallax (Desktop Only) across hero image and video layers
  if (!prefersReducedMotion) {
    const parallaxElements = [heroImage, video1, video2].filter(Boolean);
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.innerWidth > 1024) {
            const scrollPos = window.scrollY;
            const heroHeight = heroBackdrop ? heroBackdrop.offsetHeight : 800;
            if (scrollPos <= heroHeight) {
              const translateY = Math.round(scrollPos * 0.22);
              parallaxElements.forEach((el) => {
                el.style.transform = `translateY(${translateY}px)`;
              });
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==========================================================================
     4. SCROLL REVEAL OBSERVER
     ========================================================================== */
  const revealElements = document.querySelectorAll('.section-reveal');

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('reveal-in'));
  } else if (window.IntersectionObserver) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -75px 0px',
        threshold: 0.08
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('reveal-in'));
  }

  /* ==========================================================================
     5. UNIVERSAL ACCESSIBLE MODAL SYSTEM
     ========================================================================== */
  let activeModal = null;
  let lastActiveElement = null;

  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    lastActiveElement = document.activeElement;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    // Focus close button or first input
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 50);
    }
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    activeModal = null;

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  };

  // Close triggers (data-close-modal or clicking backdrop)
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop, .lightbox-backdrop');
      closeModal(modal);
    });
  });

  // Close on clicking backdrop outside modal-box
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Global escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) {
      closeModal(activeModal);
    }
  });

  // Generic data-modal triggers (e.g. Start Trial)
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modalId = btn.getAttribute('data-modal');
      if (modalId) {
        // Close currently active modal if opening another
        if (activeModal && activeModal.id !== modalId) {
          activeModal.classList.add('hidden');
        }
        openModal(modalId);
      }
    });
  });

  /* ==========================================================================
     6. PROGRAM DETAILS MODAL INTERACTION
     ========================================================================== */
  const programButtons = document.querySelectorAll('.program-link[data-program]');
  const programModal = document.getElementById('programModal');
  const programModalCategory = document.getElementById('programModalCategory');
  const programModalTitle = document.getElementById('programModalTitle');
  const programModalBody = document.getElementById('programModalBody');

  programButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const progKey = btn.getAttribute('data-program');
      const data = PROGRAMS_DATA[progKey];
      if (!data || !programModal) return;

      if (programModalCategory) programModalCategory.textContent = data.category;
      if (programModalTitle) programModalTitle.textContent = data.title;

      if (programModalBody) {
        let specsHtml = '<div class="program-spec-grid">';
        data.specs.forEach((spec) => {
          specsHtml += `
            <div class="program-spec-box">
              <span class="spec-box-label">${spec.label}</span>
              <span class="spec-box-val">${spec.val}</span>
            </div>
          `;
        });
        specsHtml += '</div>';

        let curriculumHtml = `
          <div style="margin-bottom: 1.5rem;">
            <p style="font-size: 0.95rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
              <strong>Athlete Profile:</strong> ${data.target}
            </p>
            <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 1.25rem;">
              <strong>Prerequisites & Cadence:</strong> ${data.cadence} // ${data.duration}.
            </p>
          </div>
          <h4 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 800; letter-spacing: 0.08em; color: var(--color-lime); margin-bottom: 0.85rem; text-transform: uppercase;">
            CURRICULUM SPECIFICATIONS & PROGRESSION
          </h4>
          <div class="program-curriculum-list">
        `;

        data.curriculum.forEach((item) => {
          curriculumHtml += `
            <div class="curriculum-item">
              <span class="curriculum-bullet">■</span>
              <span>${item}</span>
            </div>
          `;
        });
        curriculumHtml += '</div>';

        programModalBody.innerHTML = specsHtml + curriculumHtml;
      }

      openModal('programModal');
    });
  });

  /* ==========================================================================
     7. MEMBERSHIP PLANS & ENQUIRY MODAL
     ========================================================================== */
  const selectPlanButtons = document.querySelectorAll('.select-plan-btn');
  const membershipModal = document.getElementById('membershipModal');
  const modalSelectedPlanText = document.getElementById('modalSelectedPlanText');
  const modalPlanInput = document.getElementById('modalPlanInput');
  const membershipEnquiryForm = document.getElementById('membershipEnquiryForm');
  const memFeedback = document.getElementById('memFeedback');

  selectPlanButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.getAttribute('data-plan') || 'Performance';
      const price = btn.getAttribute('data-price') || '$285 / Month';

      if (modalSelectedPlanText) {
        modalSelectedPlanText.textContent = `${plan.toUpperCase()} (${price.toUpperCase()})`;
      }
      if (modalPlanInput) {
        modalPlanInput.value = plan;
      }

      if (memFeedback) {
        memFeedback.className = 'modal-feedback hidden';
        memFeedback.textContent = '';
      }

      openModal('membershipModal');
    });
  });

  // Membership Comparison Drawer Toggle
  const toggleCompareBtn = document.getElementById('toggleCompareBtn');
  const membershipCompareTable = document.getElementById('membershipCompareTable');

  if (toggleCompareBtn && membershipCompareTable) {
    toggleCompareBtn.addEventListener('click', () => {
      const isExpanded = toggleCompareBtn.getAttribute('aria-expanded') === 'true';
      toggleCompareBtn.setAttribute('aria-expanded', String(!isExpanded));
      membershipCompareTable.classList.toggle('hidden', isExpanded);

      const spanText = toggleCompareBtn.querySelector('span:first-child');
      if (spanText) {
        spanText.textContent = isExpanded
          ? 'View Full Feature Comparison Matrix'
          : 'Hide Feature Comparison Matrix';
      }
    });
  }

  // Membership Reservation Form Submission
  if (membershipEnquiryForm) {
    membershipEnquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('memName');
      const email = document.getElementById('memEmail');
      const phone = document.getElementById('memPhone');
      const nameError = document.getElementById('memNameError');
      const emailError = document.getElementById('memEmailError');
      const phoneError = document.getElementById('memPhoneError');
      const planName = modalPlanInput ? modalPlanInput.value : 'Performance';
      const contactPref = document.getElementById('memContactPref') ? document.getElementById('memContactPref').value : 'WhatsApp';

      let isValid = true;

      // Validation
      if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add('invalid');
        if (nameError) {
          nameError.textContent = 'Please enter your full name.';
          nameError.classList.add('active');
        }
        isValid = false;
      } else {
        name.classList.remove('invalid');
        if (nameError) nameError.classList.remove('active');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.classList.add('invalid');
        if (emailError) {
          emailError.textContent = 'Please provide a valid email address.';
          emailError.classList.add('active');
        }
        isValid = false;
      } else {
        email.classList.remove('invalid');
        if (emailError) emailError.classList.remove('active');
      }

      if (!phone.value.trim() || phone.value.trim().replace(/\D/g, '').length < 7) {
        phone.classList.add('invalid');
        if (phoneError) {
          phoneError.textContent = 'Please provide a valid telephone number.';
          phoneError.classList.add('active');
        }
        isValid = false;
      } else {
        phone.classList.remove('invalid');
        if (phoneError) phoneError.classList.remove('active');
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('memSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Verifying Floor Capacity...</span>';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Submit Admission Reservation</span><span class="btn-arrow" aria-hidden="true">→</span>';
        }

        if (memFeedback) {
          memFeedback.className = 'modal-feedback success';
          memFeedback.innerHTML = `
            <strong>ADMISSION RESERVATION RECORDED:</strong><br>
            A provisional spot on our 300-member floor roster has been reserved for <strong>${name.value.trim()}</strong> under the <strong>${planName} Tier</strong>.<br><br>
            Our concierge desk will dispatch confirmation via <strong>${contactPref}</strong> within 4 business hours to finalize keycard issuance. No automated credit card charges occurred.
          `;
        }

        membershipEnquiryForm.reset();
      }, 700);
    });
  }

  /* ==========================================================================
     8. TRAINER PROFILE & CONSULTATION MODAL
     ========================================================================== */
  const trainerButtons = document.querySelectorAll('.trainer-profile-btn[data-trainer]');
  const trainerModal = document.getElementById('trainerModal');
  const trainerModalTitle = document.getElementById('trainerModalTitle');
  const trainerModalSpecialty = document.getElementById('trainerModalSpecialty');
  const trainerModalImg = document.getElementById('trainerModalImg');
  const trainerModalCredsList = document.getElementById('trainerModalCredsList');
  const trainerModalPhilosophy = document.getElementById('trainerModalPhilosophy');
  const trainerModalBio = document.getElementById('trainerModalBio');
  const trainerBookBtn = document.getElementById('trainerBookBtn');

  let currentSelectedTrainer = '';

  trainerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const coachKey = btn.getAttribute('data-trainer');
      const data = TRAINERS_DATA[coachKey];
      if (!data || !trainerModal) return;

      currentSelectedTrainer = data.name;

      if (trainerModalTitle) trainerModalTitle.textContent = data.name;
      if (trainerModalSpecialty) trainerModalSpecialty.textContent = data.specialty;
      if (trainerModalImg) {
        trainerModalImg.src = data.photo;
        trainerModalImg.alt = `${data.name} Coaching Portrait`;
      }
      if (trainerModalPhilosophy) trainerModalPhilosophy.textContent = `“${data.philosophy}”`;
      if (trainerModalBio) trainerModalBio.textContent = data.bio;

      if (trainerModalCredsList) {
        trainerModalCredsList.innerHTML = '';
        data.credentials.forEach((cred) => {
          const li = document.createElement('li');
          li.textContent = `• ${cred}`;
          trainerModalCredsList.appendChild(li);
        });
      }

      openModal('trainerModal');
    });
  });

  // Cross-link from Trainer Modal to Booking Form
  if (trainerBookBtn) {
    trainerBookBtn.addEventListener('click', () => {
      closeModal(trainerModal);

      // Pre-select trainer in PT Booking form
      const bookingTrainerSelect = document.getElementById('bookingTrainer');
      if (bookingTrainerSelect) {
        for (let i = 0; i < bookingTrainerSelect.options.length; i++) {
          if (bookingTrainerSelect.options[i].text.includes(currentSelectedTrainer)) {
            bookingTrainerSelect.selectedIndex = i;
            break;
          }
        }
      }

      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ==========================================================================
     9. PERSONAL TRAINING BOOKING FORM
     ========================================================================== */
  const ptBookingForm = document.getElementById('ptBookingForm');
  const bookingFeedback = document.getElementById('bookingFeedback');

  // Set min date for booking to tomorrow
  const bookingDateInput = document.getElementById('bookingDate');
  if (bookingDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    bookingDateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  if (ptBookingForm) {
    ptBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const program = document.getElementById('bookingProgram');
      const trainer = document.getElementById('bookingTrainer');
      const date = document.getElementById('bookingDate');
      const time = document.getElementById('bookingTime');
      const name = document.getElementById('bookingName');
      const email = document.getElementById('bookingEmail');
      const phone = document.getElementById('bookingPhone');
      const notes = document.getElementById('bookingNotes');

      const programError = document.getElementById('bookingProgramError');
      const trainerError = document.getElementById('bookingTrainerError');
      const dateError = document.getElementById('bookingDateError');
      const timeError = document.getElementById('bookingTimeError');
      const nameError = document.getElementById('bookingNameError');
      const emailError = document.getElementById('bookingEmailError');
      const phoneError = document.getElementById('bookingPhoneError');

      let isValid = true;

      if (!program.value) {
        program.classList.add('invalid');
        if (programError) {
          programError.textContent = 'Please select a training discipline.';
          programError.classList.add('active');
        }
        isValid = false;
      } else {
        program.classList.remove('invalid');
        if (programError) programError.classList.remove('active');
      }

      if (!date.value) {
        date.classList.add('invalid');
        if (dateError) {
          dateError.textContent = 'Please choose a future date.';
          dateError.classList.add('active');
        }
        isValid = false;
      } else {
        date.classList.remove('invalid');
        if (dateError) dateError.classList.remove('active');
      }

      if (!time.value) {
        time.classList.add('invalid');
        if (timeError) {
          timeError.textContent = 'Please choose a preferred time slot.';
          timeError.classList.add('active');
        }
        isValid = false;
      } else {
        time.classList.remove('invalid');
        if (timeError) timeError.classList.remove('active');
      }

      if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add('invalid');
        if (nameError) {
          nameError.textContent = 'Please enter your full name.';
          nameError.classList.add('active');
        }
        isValid = false;
      } else {
        name.classList.remove('invalid');
        if (nameError) nameError.classList.remove('active');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.classList.add('invalid');
        if (emailError) {
          emailError.textContent = 'Please provide a valid email address.';
          emailError.classList.add('active');
        }
        isValid = false;
      } else {
        email.classList.remove('invalid');
        if (emailError) emailError.classList.remove('active');
      }

      if (!phone.value.trim() || phone.value.trim().replace(/\D/g, '').length < 7) {
        phone.classList.add('invalid');
        if (phoneError) {
          phoneError.textContent = 'Please provide a valid phone number.';
          phoneError.classList.add('active');
        }
        isValid = false;
      } else {
        phone.classList.remove('invalid');
        if (phoneError) phoneError.classList.remove('active');
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('bookingSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Confirming Roster Availability...</span>';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Confirm Coaching Request</span><span class="btn-arrow" aria-hidden="true">→</span>';
        }

        if (bookingFeedback) {
          bookingFeedback.className = 'booking-feedback success';
          bookingFeedback.innerHTML = `
            <strong>COACHING RESERVATION DISPATCHED:</strong><br>
            Your session request has been forwarded directly to the Master Coaching Floor Desk.<br>
            <div class="booking-summary-box">
              <div class="summary-row"><span>Athlete:</span> <strong>${name.value.trim()}</strong></div>
              <div class="summary-row"><span>Discipline:</span> <strong>${program.value}</strong></div>
              <div class="summary-row"><span>Assigned Coach:</span> <strong>${trainer.value}</strong></div>
              <div class="summary-row"><span>Date & Time:</span> <strong>${date.value} // ${time.value}</strong></div>
              <div class="summary-row"><span>Status:</span> <strong style="color: var(--color-lime);">Provisional Hold (Platform Reserved)</strong></div>
            </div>
            <p style="margin-top: 0.85rem; font-size: 0.82rem; color: var(--color-text-secondary);">
              Our Floor Manager will contact you at <strong>${phone.value.trim()}</strong> to verify movement pre-screening. No fees are charged prior to your initial walkthrough.
            </p>
          `;
          bookingFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        ptBookingForm.reset();
      }, 700);
    });
  }

  /* ==========================================================================
     10. FACILITY GALLERY & LIGHTBOX
     ========================================================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  let currentGalleryIndex = 0;

  const showLightboxImage = (index) => {
    if (index < 0) index = GALLERY_DATA.length - 1;
    if (index >= GALLERY_DATA.length) index = 0;
    currentGalleryIndex = index;

    const data = GALLERY_DATA[index];
    if (!data) return;

    if (lightboxImg) {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
    }
    if (lightboxCaption) lightboxCaption.textContent = data.caption;
    if (lightboxCounter) lightboxCounter.textContent = `${index + 1} OF ${GALLERY_DATA.length}`;
  };

  const openLightbox = (index) => {
    showLightboxImage(index);
    if (lightboxModal) {
      lightboxModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      activeModal = lightboxModal;
      if (lightboxCloseBtn) lightboxCloseBtn.focus();
    }
  };

  galleryItems.forEach((item) => {
    const index = parseInt(item.getAttribute('data-index') || '0', 10);
    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => showLightboxImage(currentGalleryIndex - 1));
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => showLightboxImage(currentGalleryIndex + 1));
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', () => closeModal(lightboxModal));
  }

  // Keyboard navigation inside lightbox
  document.addEventListener('keydown', (e) => {
    if (activeModal === lightboxModal) {
      if (e.key === 'ArrowLeft') showLightboxImage(currentGalleryIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(currentGalleryIndex + 1);
    }
  });

  /* ==========================================================================
     11. PERFORMANCE TOOL A: DYNAMIC BMI CALCULATOR
     ========================================================================== */
  const bmiForm = document.getElementById('bmiForm');
  const bmiHeight = document.getElementById('bmiHeight');
  const bmiWeight = document.getElementById('bmiWeight');
  const bmiResetBtn = document.getElementById('bmiResetBtn');
  const bmiResultPanel = document.getElementById('bmiResultPanel');
  const bmiScore = document.getElementById('bmiScore');
  const bmiCategory = document.getElementById('bmiCategory');
  const gaugeNeedle = document.getElementById('gaugeNeedle');

  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const h = parseFloat(bmiHeight.value);
      const w = parseFloat(bmiWeight.value);

      if (isNaN(h) || h < 100 || h > 250 || isNaN(w) || w < 30 || w > 300) {
        alert('Please enter a realistic height (100–250 cm) and weight (30–300 kg).');
        return;
      }

      // Metric BMI formula: weight (kg) / (height (m) ^ 2)
      const heightInMeters = h / 100;
      const bmiVal = w / (heightInMeters * heightInMeters);
      const roundedBMI = bmiVal.toFixed(1);

      let catText = 'Normal Weight';
      let needlePct = 50; // default middle

      if (bmiVal < 18.5) {
        catText = 'Underweight (< 18.5)';
        needlePct = Math.max(5, (bmiVal / 18.5) * 25);
      } else if (bmiVal < 25.0) {
        catText = 'Normal Weight (18.5 – 24.9)';
        needlePct = 25 + ((bmiVal - 18.5) / 6.4) * 25;
      } else if (bmiVal < 30.0) {
        catText = 'Overweight / High Density (25.0 – 29.9)';
        needlePct = 50 + ((bmiVal - 25.0) / 4.9) * 25;
      } else {
        catText = 'Obese Classification (30.0+)';
        needlePct = Math.min(95, 75 + ((bmiVal - 30.0) / 10.0) * 20);
      }

      if (bmiScore) bmiScore.textContent = roundedBMI;
      if (bmiCategory) bmiCategory.textContent = catText;
      if (gaugeNeedle) gaugeNeedle.style.left = `${needlePct}%`;

      if (bmiResultPanel) {
        bmiResultPanel.classList.remove('hidden');
      }
    });

    if (bmiResetBtn) {
      bmiResetBtn.addEventListener('click', () => {
        bmiForm.reset();
        if (bmiResultPanel) bmiResultPanel.classList.add('hidden');
      });
    }
  }

  /* ==========================================================================
     12. PERFORMANCE TOOL B: LOCAL DEVICE WORKOUT PROGRESS LOGGER
     ========================================================================== */
  const trackerForm = document.getElementById('trackerForm');
  const trackExercise = document.getElementById('trackExercise');
  const trackDate = document.getElementById('trackDate');
  const trackWeight = document.getElementById('trackWeight');
  const trackReps = document.getElementById('trackReps');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const recordSquat = document.getElementById('recordSquat');
  const recordDeadlift = document.getElementById('recordDeadlift');
  const recordBench = document.getElementById('recordBench');

  const STORAGE_KEY = 'profit_club_workout_logs_v1';

  // Seed default entries if storage is empty
  const SEED_DATA = [
    {
      id: 1711200000001,
      exercise: 'Barbell Back Squat',
      date: '2026-03-24',
      weight: 165,
      reps: 5,
      estimated1RM: 193
    },
    {
      id: 1711200000002,
      exercise: 'Conventional Deadlift',
      date: '2026-03-26',
      weight: 220,
      reps: 3,
      estimated1RM: 242
    },
    {
      id: 1711200000003,
      exercise: 'Barbell Bench Press',
      date: '2026-03-28',
      weight: 130,
      reps: 6,
      estimated1RM: 156
    }
  ];

  // Set default tracker date to today
  if (trackDate) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    trackDate.value = `${yyyy}-${mm}-${dd}`;
  }

  const loadLogs = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
      }
      return JSON.parse(stored) || [];
    } catch (e) {
      return SEED_DATA;
    }
  };

  const saveLogs = (logs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('LocalStorage unavailable');
    }
  };

  // Epley formula for estimated 1-Rep Max
  const calculate1RM = (weight, reps) => {
    if (reps === 1) return Math.round(weight);
    return Math.round(weight * (1 + reps / 30));
  };

  const updateRecords = (logs) => {
    let maxSquat = 0;
    let maxDeadlift = 0;
    let maxBench = 0;

    logs.forEach((item) => {
      if (item.exercise.toLowerCase().includes('squat')) {
        if (item.estimated1RM > maxSquat) maxSquat = item.estimated1RM;
      } else if (item.exercise.toLowerCase().includes('deadlift')) {
        if (item.estimated1RM > maxDeadlift) maxDeadlift = item.estimated1RM;
      } else if (item.exercise.toLowerCase().includes('bench')) {
        if (item.estimated1RM > maxBench) maxBench = item.estimated1RM;
      }
    });

    if (recordSquat) recordSquat.textContent = maxSquat > 0 ? `${maxSquat} kg` : '—';
    if (recordDeadlift) recordDeadlift.textContent = maxDeadlift > 0 ? `${maxDeadlift} kg` : '—';
    if (recordBench) recordBench.textContent = maxBench > 0 ? `${maxBench} kg` : '—';
  };

  const renderHistory = (logs) => {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (logs.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No workouts logged on this device yet. Add your first set above.</div>';
      updateRecords([]);
      return;
    }

    logs.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="item-meta">
          <span class="item-exercise">${item.exercise}</span>
          <span class="item-date">${item.date}</span>
        </div>
        <div class="item-stats">
          <span class="item-weight-reps">${item.weight}kg × ${item.reps}</span>
          <span class="item-1rm">e1RM: ${item.estimated1RM}kg</span>
          <button type="button" class="btn-delete-item" data-id="${item.id}" aria-label="Delete set">✕</button>
        </div>
      `;
      historyList.appendChild(div);
    });

    updateRecords(logs);

    // Attach delete listeners
    historyList.querySelectorAll('.btn-delete-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idToDelete = Number(btn.getAttribute('data-id'));
        let currentLogs = loadLogs();
        currentLogs = currentLogs.filter((item) => item.id !== idToDelete);
        saveLogs(currentLogs);
        renderHistory(currentLogs);
      });
    });
  };

  // Initialize Tracker
  let currentLogs = loadLogs();
  renderHistory(currentLogs);

  if (trackerForm) {
    trackerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const exercise = trackExercise.value;
      const date = trackDate.value;
      const weight = parseFloat(trackWeight.value);
      const reps = parseInt(trackReps.value, 10);

      if (!exercise || !date || isNaN(weight) || weight <= 0 || isNaN(reps) || reps <= 0) {
        alert('Please provide valid weight and repetition values.');
        return;
      }

      const estimated1RM = calculate1RM(weight, reps);
      const newEntry = {
        id: Date.now(),
        exercise,
        date,
        weight,
        reps,
        estimated1RM
      };

      currentLogs = loadLogs();
      currentLogs.unshift(newEntry); // Add to beginning
      saveLogs(currentLogs);
      renderHistory(currentLogs);

      trackWeight.value = '';
      trackReps.value = '';
      trackWeight.focus();
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all logged workouts from this browser?')) {
        saveLogs([]);
        renderHistory([]);
      }
    });
  }

  /* ==========================================================================
     13. FAQ ACCORDION
     ========================================================================== */
  const faqTriggers = document.querySelectorAll('.faq-trigger');

  faqTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const targetId = trigger.getAttribute('aria-controls');
      const answer = document.getElementById(targetId);
      const parentItem = trigger.closest('.faq-item');

      // Toggle current item
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      if (answer) {
        answer.hidden = isExpanded;
      }
      if (parentItem) {
        parentItem.classList.toggle('active', !isExpanded);
      }
    });
  });

  /* ==========================================================================
     14. QUICK 7-DAY TRIAL MODAL
     ========================================================================== */
  const trialForm = document.getElementById('trialForm');
  const trialFeedback = document.getElementById('trialFeedback');
  const trialStartDate = document.getElementById('trialStartDate');

  // Set min date for trial
  if (trialStartDate) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    trialStartDate.min = `${yyyy}-${mm}-${dd}`;
    trialStartDate.value = `${yyyy}-${mm}-${dd}`;
  }

  if (trialForm) {
    trialForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('trialName');
      const email = document.getElementById('trialEmail');
      const phone = document.getElementById('trialPhone');
      const date = document.getElementById('trialStartDate');

      const nameError = document.getElementById('trialNameError');
      const emailError = document.getElementById('trialEmailError');
      const phoneError = document.getElementById('trialPhoneError');
      const dateError = document.getElementById('trialDateError');

      let isValid = true;

      if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add('invalid');
        if (nameError) {
          nameError.textContent = 'Please enter your full name.';
          nameError.classList.add('active');
        }
        isValid = false;
      } else {
        name.classList.remove('invalid');
        if (nameError) nameError.classList.remove('active');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.classList.add('invalid');
        if (emailError) {
          emailError.textContent = 'Please provide a valid email.';
          emailError.classList.add('active');
        }
        isValid = false;
      } else {
        email.classList.remove('invalid');
        if (emailError) emailError.classList.remove('active');
      }

      if (!phone.value.trim() || phone.value.trim().replace(/\D/g, '').length < 7) {
        phone.classList.add('invalid');
        if (phoneError) {
          phoneError.textContent = 'Please provide a contact phone.';
          phoneError.classList.add('active');
        }
        isValid = false;
      } else {
        phone.classList.remove('invalid');
        if (phoneError) phoneError.classList.remove('active');
      }

      if (!date.value) {
        date.classList.add('invalid');
        if (dateError) {
          dateError.textContent = 'Please specify your trial start date.';
          dateError.classList.add('active');
        }
        isValid = false;
      } else {
        date.classList.remove('invalid');
        if (dateError) dateError.classList.remove('active');
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('trialSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Issuing Provisional Pass...</span>';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Issue 7-Day Trial Pass</span><span class="btn-arrow" aria-hidden="true">→</span>';
        }

        if (trialFeedback) {
          trialFeedback.className = 'modal-feedback success';
          trialFeedback.innerHTML = `
            <strong>PROVISIONAL TRIAL PASS ISSUED:</strong><br>
            A 7-day facility keycard pass has been generated for <strong>${name.value.trim()}</strong> commencing on <strong>${date.value}</strong>.<br><br>
            Please present a government-issued photo ID at our Concierge Desk (740 Broadway, NoHo) for your 15-minute facility safety walkthrough and pass activation.
          `;
        }

        trialForm.reset();
      }, 700);
    });
  }

  /* ==========================================================================
     15. CONTACT & FACILITY INQUIRIES FORM
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const contactStatusMsg = document.getElementById('contactStatusMsg');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('fullName');
      const email = document.getElementById('emailAddr');
      const phone = document.getElementById('phoneNum');
      const objective = document.getElementById('interestSelect');

      const nameError = document.getElementById('fullNameError');
      const emailError = document.getElementById('emailAddrError');
      const phoneError = document.getElementById('phoneNumError');

      let isValid = true;

      if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add('invalid');
        if (nameError) {
          nameError.textContent = 'Please enter your full name.';
          nameError.classList.add('active');
        }
        isValid = false;
      } else {
        name.classList.remove('invalid');
        if (nameError) nameError.classList.remove('active');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
        email.classList.add('invalid');
        if (emailError) {
          emailError.textContent = 'Please provide a valid email address.';
          emailError.classList.add('active');
        }
        isValid = false;
      } else {
        email.classList.remove('invalid');
        if (emailError) emailError.classList.remove('active');
      }

      if (!phone.value.trim() || phone.value.trim().replace(/\D/g, '').length < 7) {
        phone.classList.add('invalid');
        if (phoneError) {
          phoneError.textContent = 'Please provide a valid phone number.';
          phoneError.classList.add('active');
        }
        isValid = false;
      } else {
        phone.classList.remove('invalid');
        if (phoneError) phoneError.classList.remove('active');
      }

      if (!isValid) return;

      const submitBtn = document.getElementById('contactSubmitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Transmitting Dispatch...</span>';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Submit Inquiry & Reserve Slot</span>';
        }

        if (contactStatusMsg) {
          contactStatusMsg.className = 'form-status-msg success';
          contactStatusMsg.innerHTML = `
            <strong>DISPATCH TRANSMITTED TO CONCIERGE:</strong><br>
            Thank you, <strong>${name.value.trim()}</strong>. Your inquiry regarding <em>${objective.value}</em> has been logged in our NoHo facility register.<br>
            Our floor supervisor will contact you at <strong>${phone.value.trim()}</strong> or <strong>${email.value.trim()}</strong> within 4 business hours.
          `;
          contactStatusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        contactForm.reset();
      }, 600);
    });
  }

});
