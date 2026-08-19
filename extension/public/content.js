let floatingBtn = null;

document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // If a button already exists, remove it
  if (floatingBtn) {
    // If the user clicked inside the button itself, do nothing
    if (floatingBtn.contains(e.target)) return;
    
    document.body.removeChild(floatingBtn);
    floatingBtn = null;
  }

  // If text is actually selected
  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Create the button
    floatingBtn = document.createElement('button');
    floatingBtn.id = 'ormayundo-floating-btn';
    floatingBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
      Save to Ormayundo
    `;

    // Position it slightly above the middle of the selected text
    floatingBtn.style.top = `${rect.top + window.scrollY - 45}px`;
    floatingBtn.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;

    // Prevent the selection from disappearing when clicking the button
    floatingBtn.addEventListener('mousedown', (e) => {
      e.preventDefault(); 
    });

    // Handle the click
    floatingBtn.addEventListener('click', () => {
      // INSTANT Visual Feedback
      floatingBtn.innerHTML = 'Saved! ✓';
      floatingBtn.style.backgroundColor = '#00C853';
      floatingBtn.style.transform = 'translateX(-50%) scale(1.05)';
      floatingBtn.style.pointerEvents = 'none'; // Prevent double clicking
      
      // Send message to background script to make the API call silently
      chrome.runtime.sendMessage({
        action: 'SAVE_FLASHCARD',
        text: selectedText,
        url: window.location.href
      });
      
      // Remove button instantly after 1 second so user can keep reading
      setTimeout(() => {
        if (floatingBtn && floatingBtn.parentNode) {
          floatingBtn.style.opacity = '0';
          setTimeout(() => {
            if (floatingBtn && floatingBtn.parentNode) document.body.removeChild(floatingBtn);
            floatingBtn = null;
          }, 200);
        }
      }, 1000);
    });

    document.body.appendChild(floatingBtn);
  }
});
