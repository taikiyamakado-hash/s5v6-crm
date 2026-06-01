/* ============================================================
   株式会社 森田製箱所 - メインスクリプト
   ============================================================ */

(function () {
  'use strict';

  const HEADER_H = 68; // header height (px) — スムーススクロールのオフセット用

  // ---- ハンバーガーメニュー ------------------------------------
  const hamburger = document.getElementById('hamburger');
  const globalNav = document.getElementById('global-nav');

  function closeMenu() {
    globalNav.classList.remove('is-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
  }

  if (hamburger && globalNav) {
    hamburger.addEventListener('click', function () {
      const willOpen = !globalNav.classList.contains('is-open');
      if (willOpen) {
        globalNav.classList.add('is-open');
        hamburger.classList.add('is-open');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'メニューを閉じる');
      } else {
        closeMenu();
      }
    });

    // ナビリンクをタップしたらメニューを閉じる
    globalNav.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // メニュー外タップで閉じる
    document.addEventListener('click', function (e) {
      if (
        globalNav.classList.contains('is-open') &&
        !hamburger.contains(e.target) &&
        !globalNav.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Esc キーで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && globalNav.classList.contains('is-open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  }


  // ---- スクロール時のヘッダースタイル -------------------------
  const header = document.getElementById('site-header');

  if (header) {
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  // ---- スムーススクロール（ヘッダー高さ分オフセット） ---------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_H;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });


  // ---- フォーム送信（デモ：実送信なし） -----------------------
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // 簡易バリデーション
      const name    = form.querySelector('#field-name').value.trim();
      const email   = form.querySelector('#field-email').value.trim();
      const message = form.querySelector('#field-message').value.trim();

      if (!name || !email || !message) {
        alert('「お名前」「メールアドレス」「相談内容」は必須項目です。');
        return;
      }

      // デモ用フィードバック
      const btn = form.querySelector('[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = '送信しました ✓';
      btn.disabled = true;
      btn.style.background = '#2D5B2E';

      setTimeout(function () {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

})();
