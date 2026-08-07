// Reusable Custom Medium/Notion style Rich Text Editor Component
import { storageService } from '../firebase/config.js';
import { showToast } from './ui.js';

export function createRichEditor(containerSelector, initialContent = "") {
  const container = document.querySelector(containerSelector);
  if (!container) return null;

  // Render Editor Shell
  container.className = "editor-container";
  container.innerHTML = `
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <button type="button" class="editor-btn" data-cmd="undo" title="Undo">↩️</button>
      <button type="button" class="editor-btn" data-cmd="redo" title="Redo">↪️</button>
      
      <div class="editor-separator"></div>
      
      <button type="button" class="editor-btn" data-cmd="formatBlock" data-val="H2" title="Heading 2">H2</button>
      <button type="button" class="editor-btn" data-cmd="formatBlock" data-val="H3" title="Heading 3">H3</button>
      <button type="button" class="editor-btn" data-cmd="formatBlock" data-val="P" title="Paragraph">P</button>
      <button type="button" class="editor-btn" data-cmd="formatBlock" data-val="BLOCKQUOTE" title="Quote">Quote</button>
      
      <div class="editor-separator"></div>
      
      <button type="button" class="editor-btn" data-cmd="bold" title="Bold"><b>B</b></button>
      <button type="button" class="editor-btn" data-cmd="italic" title="Italic"><i>I</i></button>
      <button type="button" class="editor-btn" data-cmd="underline" title="Underline"><u>U</u></button>
      
      <div class="editor-separator"></div>

      <!-- Color Pickers -->
      <span class="editor-select-container" title="Text Color">
        🎨 <input type="color" class="editor-color-picker" id="editor-txt-color" value="#1a202c">
      </span>
      <span class="editor-select-container" title="Background Highlight">
        🖍️ <input type="color" class="editor-color-picker" id="editor-bg-color" value="#ffffff">
      </span>

      <div class="editor-separator"></div>
      
      <button type="button" class="editor-btn" data-cmd="insertUnorderedList" title="Bulleted List">• List</button>
      <button type="button" class="editor-btn" data-cmd="insertOrderedList" title="Numbered List">1. List</button>
      <button type="button" class="editor-btn" id="editor-cmd-table" title="Insert Table">📊 Table</button>
      
      <div class="editor-separator"></div>
      
      <button type="button" class="editor-btn" id="editor-cmd-link" title="Insert Link">🔗 Link</button>
      <button type="button" class="editor-btn" id="editor-cmd-image" title="Upload Image">📷 Image</button>
      <button type="button" class="editor-btn" id="editor-cmd-youtube" title="Embed YouTube Video">🎥 YouTube</button>
      <button type="button" class="editor-btn" data-cmd="insertHorizontalRule" title="Horizontal Line">&mdash;</button>
      
      <div class="editor-separator"></div>
      
      <button type="button" class="editor-btn" data-cmd="formatBlock" data-val="PRE" title="Code Block">Code</button>
      <button type="button" class="editor-btn" id="editor-cmd-fullscreen" style="margin-left: auto;" title="Fullscreen Panel">🖥️</button>
    </div>

    <!-- Edit Area -->
    <div class="editor-editable" contenteditable="true" data-placeholder="Tell your story, research or thesis here..."></div>

    <!-- Link Dialog Popover (Hidden by default) -->
    <div id="editor-link-popover" class="modal-overlay" style="z-index: 100002;">
      <div class="modal-box" style="max-width:380px;">
        <h4 style="margin-bottom:1rem;">Add Hyperlink</h4>
        <input type="url" id="link-popover-url" class="form-control" placeholder="https://example.com" style="margin-bottom:1rem;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" id="link-popover-cancel">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" id="link-popover-confirm">Insert</button>
        </div>
      </div>
    </div>

    <!-- YouTube Embed Dialog (Hidden by default) -->
    <div id="editor-youtube-popover" class="modal-overlay" style="z-index: 100002;">
      <div class="modal-box" style="max-width:380px;">
        <h4 style="margin-bottom:1rem;">Embed YouTube Video</h4>
        <input type="text" id="youtube-popover-url" class="form-control" placeholder="YouTube Video URL or ID" style="margin-bottom:1rem;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" id="youtube-popover-cancel">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" id="youtube-popover-confirm">Embed</button>
        </div>
      </div>
    </div>

    <!-- Tiny floating alignment/resize utility overlay for images -->
    <div id="editor-image-resizer" style="position: absolute; display: none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.25rem 0.5rem; gap: 0.25rem; box-shadow: var(--shadow-md); z-index: 101;">
      <button type="button" class="btn btn-secondary btn-sm image-size-btn" data-size="25%">25%</button>
      <button type="button" class="btn btn-secondary btn-sm image-size-btn" data-size="50%">50%</button>
      <button type="button" class="btn btn-secondary btn-sm image-size-btn" data-size="100%">100%</button>
      <div style="width: 1px; background: var(--border-color); height: 16px; align-self: center; margin: 0 4px;"></div>
      <button type="button" class="btn btn-secondary btn-sm image-align-btn" data-align="left">◀ Left</button>
      <button type="button" class="btn btn-secondary btn-sm image-align-btn" data-align="center">■ Centered</button>
      <button type="button" class="btn btn-secondary btn-sm image-align-btn" data-align="right">Right ▶</button>
      <div style="width: 1px; background: var(--border-color); height: 16px; align-self: center; margin: 0 4px;"></div>
      <button type="button" class="btn btn-danger btn-sm image-delete-btn" style="padding: 0.25rem 0.5rem;">🗑️</button>
    </div>
  `;

  const editArea = container.querySelector(".editor-editable");
  const toolbar = container.querySelector(".editor-toolbar");
  const linkPopover = container.querySelector("#editor-link-popover");
  const youtubePopover = container.querySelector("#editor-youtube-popover");
  const imageResizer = container.querySelector("#editor-image-resizer");

  let activeSelectedImg = null;

  // Set initial content rendering
  editArea.innerHTML = initialContent;

  // Execute native rich document formats
  function executeCmd(command, val = null) {
    document.execCommand(command, false, val);
    editArea.focus();
  }

  // Bind Standard Toolbar clicks
  toolbar.querySelectorAll(".editor-btn[data-cmd]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const cmd = btn.getAttribute("data-cmd");
      const val = btn.getAttribute("data-val");
      
      if (cmd === "formatBlock") {
        executeCmd(cmd, `<${val}>`);
      } else {
        executeCmd(cmd, val);
      }
    });
  });

  // Bind Color Inputs
  container.querySelector("#editor-txt-color").addEventListener("change", (e) => {
    executeCmd("foreColor", e.target.value);
  });
  container.querySelector("#editor-bg-color").addEventListener("change", (e) => {
    executeCmd("hiliteColor", e.target.value);
  });

  // Bind Link Popover
  container.querySelector("#editor-cmd-link").addEventListener("click", () => {
    linkPopover.classList.add("show");
  });
  container.querySelector("#link-popover-cancel").addEventListener("click", () => {
    linkPopover.classList.remove("show");
  });
  container.querySelector("#link-popover-confirm").addEventListener("click", () => {
    const url = container.querySelector("#link-popover-url").value.trim();
    linkPopover.classList.remove("show");
    
    if (url) {
      // Create element anchor to wrap selected text
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        executeCmd("createLink", url);
        // Make links open in new tab
        const link = sel.anchorNode.parentElement;
        if (link && link.tagName === "A") {
          link.setAttribute("target", "_blank");
          link.style.color = "var(--accent)";
        }
      }
    }
  });

  // Bind YouTube Dialog Popovers
  container.querySelector("#editor-cmd-youtube").addEventListener("click", () => {
    youtubePopover.classList.add("show");
  });
  container.querySelector("#youtube-popover-cancel").addEventListener("click", () => {
    youtubePopover.classList.remove("show");
  });
  container.querySelector("#youtube-popover-confirm").addEventListener("click", () => {
    const val = container.querySelector("#youtube-popover-url").value.trim();
    youtubePopover.classList.remove("show");

    if (val) {
      let videoId = val;
      // Extract ID from full watch link if present
      if (val.includes("youtube.com/watch")) {
        const urlObj = new URL(val);
        videoId = urlObj.searchParams.get("v");
      } else if (val.includes("youtu.be/")) {
        videoId = val.split("youtu.be/")[1].split("?")[0];
      }

      const iframeHTML = `<br><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe><br>`;
      editArea.focus();
      writeHTMLNode(iframeHTML);
    }
  });

  // Custom Table Builder
  container.querySelector("#editor-cmd-table").addEventListener("click", () => {
    const cols = parseInt(prompt("Enter number of columns:", "3") || "0");
    const rows = parseInt(prompt("Enter number of rows:", "3") || "0");
    
    if (rows > 0 && cols > 0) {
      let table = `<table style="width:100%; border-collapse:collapse; margin:1.5rem 0;"><thead><tr>`;
      for (let c = 0; c < cols; c++) {
        table += `<th style="border:1px solid var(--border-color); padding:0.5rem; background-color:var(--bg-secondary);">Header</th>`;
      }
      table += `</tr></thead><tbody>`;
      for (let r = 0; r < rows; r++) {
        table += `<tr>`;
        for (let c = 0; c < cols; c++) {
          table += `<td style="border:1px solid var(--border-color); padding:0.5rem;">Cell block</td>`;
        }
        table += `</tr>`;
      }
      table += `</tbody></table><br>`;
      writeHTMLNode(table);
    }
  });

  // Fullscreen Toggler
  container.querySelector("#editor-cmd-fullscreen").addEventListener("click", () => {
    container.classList.toggle("fullscreen");
  });

  // Custom Writing Helper
  function writeHTMLNode(html) {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node, lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      
      // Move cursor after the inserted element
      if (lastNode) {
        const nextRange = range.cloneRange();
        nextRange.setStartAfter(lastNode);
        nextRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nextRange);
      }
    }
  }

  // Bind Image Upload file dialog triggers
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  container.querySelector("#editor-cmd-image").addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showToast("Uploading editor image...");
        const url = await storageService.uploadFile(file, "images");
        
        // Insert Image tag inside ContentEditable area
        const imageHTML = `<img src="${url}" alt="${file.name}" style="width: 50%; max-width: 100%; display: block; margin: 1.5rem auto; border-radius: var(--radius-sm);" class="editor-content-img" />`;
        editArea.focus();
        writeHTMLNode(imageHTML);
      } catch (err) {
        showToast("Image upload failed.", "error");
      }
    }
  });

  // Image clicks listeners: show align/resize overlay resizer box
  editArea.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      activeSelectedImg = e.target;
      positionImageResizer(e.target);
    } else {
      hideImageResizer();
    }
  });

  function positionImageResizer(img) {
    const rect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Adjust position relative to container absolute coordinates coordinates
    imageResizer.style.display = "flex";
    imageResizer.style.top = `${rect.top - containerRect.top + editArea.scrollTop - 44}px`;
    imageResizer.style.left = `${Math.max(10, rect.left - containerRect.left)}px`;
  }

  function hideImageResizer() {
    imageResizer.style.display = "none";
    activeSelectedImg = null;
  }

  // Resizer Overlay button click binders
  imageResizer.querySelectorAll(".image-size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeSelectedImg) {
        const size = btn.getAttribute("data-size");
        activeSelectedImg.style.width = size;
        positionImageResizer(activeSelectedImg);
      }
    });
  });

  imageResizer.querySelectorAll(".image-align-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeSelectedImg) {
        const align = btn.getAttribute("data-align");
        if (align === "left") {
          activeSelectedImg.style.margin = "1.5rem auto 1.5rem 0";
        } else if (align === "right") {
          activeSelectedImg.style.margin = "1.5rem 0 1.5rem auto";
        } else {
          activeSelectedImg.style.margin = "1.5rem auto";
        }
        positionImageResizer(activeSelectedImg);
      }
    });
  });

  imageResizer.querySelector(".image-delete-btn").addEventListener("click", () => {
    if (activeSelectedImg) {
      activeSelectedImg.remove();
      hideImageResizer();
    }
  });

  // Hides resizer on edit area scrolling
  editArea.addEventListener("scroll", () => {
    if (activeSelectedImg) hideImageResizer();
  });

  // Export content function
  return {
    getContent: () => editArea.innerHTML.trim(),
    setContent: (html) => { editArea.innerHTML = html; }
  };
}
