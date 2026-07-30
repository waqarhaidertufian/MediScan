/**
 * MediScan Theme Handler (Day/Night Mode)
 * Executes immediately in the <head> to prevent light-theme flashing on load.
 * Uses event delegation and MutationObserver to handle dynamically injected navigation.
 */
(function () {
  'use strict';

  // 1. Immediately apply the theme from localStorage or system settings
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }

  // 2. Setup theme interactions on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Event delegation: handle theme toggles even if injected asynchronously
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('#theme-toggle');
      if (toggleBtn) {
        const currentIsDark = document.documentElement.classList.contains('dark-mode');
        const nextIsDark = !currentIsDark;

        if (nextIsDark) {
          document.documentElement.classList.add('dark-mode');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark-mode');
          localStorage.setItem('theme', 'light');
        }

        // Sync icons across all toggle buttons
        updateAllToggleIcons(nextIsDark);

        // Optional: Dispatch event to notify canvas cursor particles to adapt
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { isDark: nextIsDark } }));
      }
    });

    // MutationObserver: automatically style the toggle button as soon as the header finishes loading
    const observer = new MutationObserver(() => {
      const toggleBtn = document.getElementById('theme-toggle');
      if (toggleBtn) {
        const isDarkNow = document.documentElement.classList.contains('dark-mode');
        updateSingleIcon(toggleBtn, isDarkNow);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check
    const initialToggle = document.getElementById('theme-toggle');
    if (initialToggle) {
      updateSingleIcon(initialToggle, isDark);
    }
  });

  // Helper to update a button's icon class
  function updateSingleIcon(btn, isDark) {
    const icon = btn.querySelector('i');
    if (icon) {
      if (isDark) {
        icon.className = 'fas fa-sun';
        btn.style.color = '#FFD700'; // Gold/Yellow sun color
      } else {
        icon.className = 'fas fa-moon';
        btn.style.color = 'var(--text)'; // Default theme color
      }
    }
  }

  // Helper to sync all button icons
  function updateAllToggleIcons(isDark) {
    const toggleBtns = document.querySelectorAll('#theme-toggle');
    toggleBtns.forEach(btn => updateSingleIcon(btn, isDark));
  }
})();
