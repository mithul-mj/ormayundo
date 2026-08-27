let floatingBtn = null;
let isPopupEnabled = true; // Default to true

// Initialize popup setting from storage
chrome.storage.local.get(['ormayundo_popup_enabled'], (result) => {
  if (result.ormayundo_popup_enabled !== undefined) {
    isPopupEnabled = result.ormayundo_popup_enabled;
  }
});

// Listen for toggles from the extension UI
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.ormayundo_popup_enabled) {
    isPopupEnabled = changes.ormayundo_popup_enabled.newValue;
    // If user disabled it while button is open, instantly remove it
    if (!isPopupEnabled && floatingBtn) {
      if (floatingBtn.parentNode) document.body.removeChild(floatingBtn);
      floatingBtn = null;
    }
  }
});

function getExtractedText(selection) {
  if (!selection || selection.rangeCount === 0) return "";

  const rawText = selection.toString().trim();

  // 1. Find ALL real tables on the actual webpage that intersect with the user's highlight
  const intersectedTables = new Set();

  // Check start and end of selection (handles cases where selection is entirely inside one cell)
  const anchorTable = selection.anchorNode?.nodeType === 1 ? selection.anchorNode.closest("table") : selection.anchorNode?.parentElement?.closest("table");
  if (anchorTable) intersectedTables.add(anchorTable);

  const focusTable = selection.focusNode?.nodeType === 1 ? selection.focusNode.closest("table") : selection.focusNode?.parentElement?.closest("table");
  if (focusTable) intersectedTables.add(focusTable);

  // Check all tables to see if the highlight passed through them
  document.querySelectorAll("table").forEach(table => {
    if (selection.containsNode(table, true)) {
      intersectedTables.add(table);
    }
  });

  // (We no longer return rawText early, so we can perfectly preserve code structure below)

  // 2. We found tables! Generate beautiful Markdown for the FULL tables (not just the highlighted half)
  let markdownTables = "";
  intersectedTables.forEach(table => {
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      const rowData = cells.map(cell => (cell.innerText || cell.textContent).replace(/(\r\n|\n|\r|\|)/gm, " ").trim());

      markdownTables += "| " + rowData.join(" | ") + " |\n";

      if (rowIndex === 0) {
        const separator = cells.map(() => "---");
        markdownTables += "| " + separator.join(" | ") + " |\n";
      }
    });
    markdownTables += "\n";
  });

  // 3. Did the user highlight paragraphs OUTSIDE the table (or normal code)?
  // We clone the highlight, forcefully delete all table fragments from the clone, and see what's left.
  const container = document.createElement("div");
  // CRITICAL FIX: Must be attached to the live DOM to accurately calculate line-breaks & spaces using innerText!
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.whiteSpace = 'pre-wrap';
  document.body.appendChild(container);

  container.appendChild(selection.getRangeAt(0).cloneContents());
  container.querySelectorAll("table").forEach(t => t.remove());

  const remainingText = (container.innerText || container.textContent).trim();
  document.body.removeChild(container);

  // If they highlighted outside text, include it alongside the full tables!
  if (remainingText.length > 0) {
    return markdownTables ? remainingText + "\n\n" + markdownTables.trim() : remainingText;
  }

  // If they ONLY highlighted half a table, discard the messy half and return the FULL perfect Markdown table!
  return markdownTables ? markdownTables.trim() : remainingText;
}

document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const selectedText = getExtractedText(selection);

  // If a button already exists, remove it
  if (floatingBtn) {
    // If the user clicked inside the button itself, do nothing
    if (floatingBtn.contains(e.target)) return;

    document.body.removeChild(floatingBtn);
    floatingBtn = null;
  }

  // If text is actually selected, long enough to be a flashcard, and popup is enabled by user
  if (isPopupEnabled && selectedText.length >= 20) {
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

    // Always place the button just below the selection
    // Clamp to window bounds so it doesn't fall off the bottom of the screen
    const finalTop = Math.min(rect.bottom + 15, window.innerHeight - 60);
    floatingBtn.style.top = `${finalTop}px`;

    // Horizontally center it exactly where the mouse is (prevents it flying way left/right on huge blocks)
    // Clamp to screen edges
    const finalLeft = Math.max(80, Math.min(e.clientX, window.innerWidth - 80));
    floatingBtn.style.left = `${finalLeft}px`;

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
}, true);

// --- RIGHT CLICK TABLE EXTRACTION ---
let lastRightClickedElement = null;

// Track what the user right-clicks on
document.addEventListener("contextmenu", (event) => {
  lastRightClickedElement = event.target;
}, true);

// Listen for the background script asking for the table
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_CLICKED_TABLE') {
    if (!lastRightClickedElement) {
      sendResponse({ error: "No element clicked." });
      return;
    }

    // Find the closest table to where the user clicked
    const table = lastRightClickedElement.closest("table");

    if (!table) {
      sendResponse({ error: "You didn't click inside a table!" });
      return;
    }

    // Convert the exact clicked table to Markdown!
    let markdownTables = "";
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      const rowData = cells.map(cell => (cell.innerText || cell.textContent).replace(/(\r\n|\n|\r|\|)/gm, " ").trim());

      markdownTables += "| " + rowData.join(" | ") + " |\n";

      if (rowIndex === 0) {
        const separator = cells.map(() => "---");
        markdownTables += "| " + separator.join(" | ") + " |\n";
      }
    });

    sendResponse({ text: markdownTables.trim() });
  }

  if (request.action === 'EXTRACT_SELECTION') {
    const selection = window.getSelection();
    sendResponse({ text: getExtractedText(selection) });
  }
});
