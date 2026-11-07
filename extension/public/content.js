// Guard: prevent double-injection (manifest + scripting.executeScript both run this file)
if (window.__ormayundoLoaded || window.location.hostname.includes('ormayundo-app.vercel.app') || window.location.hostname.includes('localhost')) {
  // Already running or on Ormayundo Web App Dashboard — do nothing
} else {
  window.__ormayundoLoaded = true;

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

        // Clear the text selection immediately
        window.getSelection()?.removeAllRanges();

        // Remove button after a short "Saved!" confirmation, then fade out
        setTimeout(() => {
          if (floatingBtn && floatingBtn.parentNode) {
            floatingBtn.style.opacity = '0';
            floatingBtn.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
              if (floatingBtn && floatingBtn.parentNode) document.body.removeChild(floatingBtn);
              floatingBtn = null;
            }, 200);
          }
        }, 800);
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
      const extracted = getExtractedText(selection);
      if (!extracted || extracted.trim().length === 0) {
        sendResponse({ error: 'No text selected or extraction failed' });
      } else {
        sendResponse({ text: extracted });
      }
    }

    if (request.action === 'HIGHLIGHT_PAGE') {
      // When a page loads, ChatGPT/Gemini inject content dynamically.
      // We try to highlight up to three times, one second apart, to catch late DOM updates.
      const rawItems = request.texts || request.highlights || [];
      const texts = rawItems.map(item => typeof item === 'string' ? item : item.text);
      const maxAttempts = 3;
      const attemptDelay = 1000; // ms
      const attemptHighlight = (attempt = 1) => {
        highlightTextsOnPage(texts);
        if (attempt < maxAttempts) {
          setTimeout(() => attemptHighlight(attempt + 1), attemptDelay);
        }
      };
      // Start immediate attempt (no extra delay needed – the retry will cover late loads)
      attemptHighlight();
    }
  });


  // --- HIGHLIGHT SAVED RECALL TEXT ON PAGE ---
  // Works even when text is split across multiple <span> / <strong> elements (ChatGPT / Gemini style).

  let _pendingHighlightTexts = [];   // full list of texts to highlight
  let _doneHighlights = new Set();   // needles already successfully highlighted — never re-checked
  let _observer = null;

  function highlightTextsOnPage(texts) {
    if (!texts || texts.length === 0) return;
    _pendingHighlightTexts = texts;
    _doneHighlights = new Set(); // reset on fresh HIGHLIGHT_PAGE message

    // --- Inject CSS once ---
    if (!document.getElementById('ormayundo-highlight-style')) {
      const style = document.createElement('style');
      style.id = 'ormayundo-highlight-style';
      style.textContent = `
      mark.ormayundo-highlight {
        background-color: #FF9532 !important;
        color: #000000 !important;
        border-radius: 2px;
        padding: 1px 3px;
        box-shadow: none !important;
        transition: background-color 0.2s ease;
        display: inline;
      }
      mark.ormayundo-highlight * {
        color: #000000 !important;
        background-color: transparent !important;
      }
      mark.ormayundo-highlight:hover {
        background-color: #FF8300 !important;
      }
    `;
      document.head.appendChild(style);
    }

    _applyHighlights();

    // Start watching for new content (ChatGPT streaming) only if there are still pending items
    _startObserver();
  }

  function _startObserver() {
    if (_observer) return; // already running

    let _debounceTimer = null;
    const _startTime = Date.now();
    const MAX_OBSERVE_MS = 30_000;

    _observer = new MutationObserver(() => {
      // Auto-disconnect after 30s
      if (Date.now() - _startTime > MAX_OBSERVE_MS) {
        _observer.disconnect();
        _observer = null;
        return;
      }
      // Also stop if everything is already highlighted
      if (_doneHighlights.size >= _pendingHighlightTexts.length) {
        _observer.disconnect();
        _observer = null;
        return;
      }
      // Debounce: run 600ms after mutations settle
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(_applyHighlights, 600);
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * 1-to-1 character length preserving normalization.
   * Replaces control chars / quotes / dashes without altering string length or character offsets.
   */
  function _normalizePreserveLength(str) {
    if (!str) return '';
    return str
      .replace(/[\r\n\t\f\v]/g, ' ')     // control whitespace to space
      .replace(/[\u2018\u2019]/g, "'")   // curly single quotes -> '
      .replace(/[\u201C\u201D]/g, '"')   // curly double quotes -> "
      .replace(/[\u2013\u2014]/g, '-')   // en/em dashes -> -
      .replace(/[\u00A0\u200B]/g, ' ');  // non-breaking / zero-width space -> space
  }

  function _isMarkdownTableLine(line) {
    const t = line.trim();
    // 1. Table separator lines: | --- | --- | or |---|---| or :---|---:
    if (/^\|?\s*:?-{2,}:?\s*\|/.test(t) || t.includes('| --- |') || t.includes('|---')) {
      return true;
    }
    // 2. Standard markdown table rows: starts with | (e.g. | Cell 1 | Cell 2 |)
    if (t.startsWith('|')) {
      return true;
    }
    return false;
  }

  function _cleanNeedles(raw) {
    if (!raw) return [];

    // Split multi-line text and exclude markdown table lines while preserving normal text with pipes (e.g. string | number)
    const nonTableLines = raw
      .split(/\n+/)
      .map(l => l.trim())
      .filter(l => l.length > 5 && !_isMarkdownTableLine(l));

    if (nonTableLines.length === 0) return [];

    const cleanedSet = new Set();
    for (const item of nonTableLines) {
      let cleaned = _normalizePreserveLength(item);
      // Strip leading list symbols/bullets: •, *, -, 1., 2), a., etc.
      cleaned = cleaned.replace(/^[•\*\-\u2022\u25b6\u2013\u2014\s]+/, '');
      cleaned = cleaned.replace(/^(\d+[\.\)]\s*)+/, '');
      cleaned = cleaned.replace(/^[a-zA-Z][\.\)]\s*/, '');
      cleaned = cleaned.trim();

      if (cleaned.length >= 5) {
        cleanedSet.add(cleaned);
      }
    }
    return Array.from(cleanedSet);
  }

  function _applyHighlights() {
    const remaining = _pendingHighlightTexts.filter(raw => !_doneHighlights.has(raw));
    if (remaining.length === 0) {
      if (_observer) { _observer.disconnect(); _observer = null; }
      return;
    }

    const root = document.querySelector(
      'main, [class*="conversation"], [class*="chat"], [class*="response"], [class*="markdown"], [class*="prose"]'
    ) || document.body;

    const nodes = _collectTextNodes(root);
    if (nodes.length === 0) return;

    let combined = '';
    const offsets = [];
    for (const n of nodes) {
      offsets.push(combined.length);
      combined += n.textContent;
    }
    const combinedNorm = _normalizePreserveLength(combined);

    for (const raw of remaining) {
      const needles = _cleanNeedles(raw);
      let matchedAny = false;

      for (const needleStr of needles) {
        // Try full needle first
        let found = _highlightNeedleRegex(nodes, offsets, combinedNorm, needleStr);

        // If full needle didn't match, try first 120 chars
        if (!found && needleStr.length > 120) {
          found = _highlightNeedleRegex(nodes, offsets, combinedNorm, needleStr.slice(0, 120));
        }
        // If 120 chars didn't match, try first 60 chars
        if (!found && needleStr.length > 60) {
          found = _highlightNeedleRegex(nodes, offsets, combinedNorm, needleStr.slice(0, 60));
        }

        if (found) matchedAny = true;
      }

      if (matchedAny) {
        _doneHighlights.add(raw);
      }
    }

    if (_doneHighlights.size >= _pendingHighlightTexts.length) {
      if (_observer) { _observer.disconnect(); _observer = null; }
    }
  }

  /**
   * Regex search with exact length-preserving character mapping.
   */
  function _highlightNeedleRegex(nodes, offsets, combinedNorm, needleStr) {
    const cleanedNeedle = needleStr.trim();
    if (cleanedNeedle.length < 5) return false;

    // Escape regex chars and allow flexible whitespace (\s+)
    const escaped = cleanedNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped.replace(/\s+/g, '\\s+');

    let match;
    try {
      const regex = new RegExp(pattern, 'gi');
      match = regex.exec(combinedNorm);
    } catch (e) {
      return false;
    }

    if (!match) return false;

    const idx = match.index;
    const end = idx + match[0].length;

    let startNodeIdx = -1, startOffset = 0;
    let endNodeIdx = -1, endOffset = 0;

    for (let i = 0; i < nodes.length; i++) {
      const nodeStart = offsets[i];
      const nodeEnd = nodeStart + nodes[i].textContent.length;

      if (startNodeIdx === -1 && nodeEnd > idx) {
        startNodeIdx = i;
        startOffset = idx - nodeStart;
      }
      if (startNodeIdx !== -1 && nodeEnd >= end) {
        endNodeIdx = i;
        endOffset = end - offsets[i];
        break;
      }
    }

    if (startNodeIdx === -1 || endNodeIdx === -1) return false;

    // Single node match
    if (startNodeIdx === endNodeIdx) {
      try {
        const range = document.createRange();
        range.setStart(nodes[startNodeIdx], startOffset);
        range.setEnd(nodes[endNodeIdx], endOffset);
        if (!range.collapsed) {
          const mark = document.createElement('mark');
          mark.className = 'ormayundo-highlight';
          mark.title = 'Saved to Ormayundo';
          range.surroundContents(mark);
          return true;
        }
      } catch (e) { }
      return false;
    }

    // Multi-node (cross element, strong/em/span) match
    let highlighted = false;
    for (let i = startNodeIdx; i <= endNodeIdx; i++) {
      const node = nodes[i];
      if (!node || !node.parentNode) continue;

      const segStart = (i === startNodeIdx) ? startOffset : 0;
      const segEnd = (i === endNodeIdx) ? endOffset : node.textContent.length;
      if (segStart >= segEnd) continue;

      try {
        const range = document.createRange();
        range.setStart(node, segStart);
        range.setEnd(node, segEnd);
        if (range.collapsed) continue;
        const mark = document.createElement('mark');
        mark.className = 'ormayundo-highlight';
        mark.title = 'Saved to Ormayundo';
        range.surroundContents(mark);
        highlighted = true;
      } catch (e) { }
    }
    return highlighted;
  }


  function _simpleSingleNodeHighlight(nodes, needleLower, needle) {
    for (const textNode of nodes) {
      const nodeText = textNode.textContent;
      const idx = nodeText.toLocaleLowerCase().indexOf(needleLower);
      if (idx === -1) continue;
      try {
        const range = document.createRange();
        range.setStart(textNode, idx);
        range.setEnd(textNode, idx + needle.length);
        const mark = document.createElement('mark');
        mark.className = 'ormayundo-highlight';
        mark.title = 'Saved to Ormayundo';
        range.surroundContents(mark);
      } catch (e) { }
      break;
    }
  }

  function _collectTextNodes(root) {
    const nodes = [];
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const tag = node.parentElement?.tagName?.toLowerCase();
          if (['script', 'style', 'noscript', 'textarea', 'input', 'table', 'tbody', 'thead', 'tr', 'td', 'th'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.parentElement?.closest('table') || node.parentElement?.closest('mark.ormayundo-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }
          if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let n;
      while ((n = walker.nextNode())) nodes.push(n);

      // Also recurse into shadow DOMs (limited depth to avoid infinite loops)
      root.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) nodes.push(..._collectTextNodes(el.shadowRoot));
      });
    } catch (e) { }
    return nodes;
  }


} // end double-injection guard
