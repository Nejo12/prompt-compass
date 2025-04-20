(function () {
  "use strict";

  // === Create index popup panel ===
  const indexPopup = document.createElement("div");
  Object.assign(indexPopup.style, {
    position: "fixed",
    top: "50px",
    right: "20px",
    background: "rgba(32, 33, 35, 0.95)",
    color: "white",
    padding: "15px",
    borderRadius: "8px",
    zIndex: "9999",
    maxHeight: "70vh",
    overflowY: "auto",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    border: "1px solid #555",
    display: "none",
    width: "300px",
  });
  document.body.appendChild(indexPopup);

  function getCurrentThreadId() {
    const navTitle = document.querySelector(
      'nav a[aria-current="page"] div[title]'
    );
    return (
      navTitle?.getAttribute("title")?.trim() ||
      " | Add topics then click to jump"
    );
  }

  function baseButtonStyle() {
    return "cursor:pointer; background:#222; color:#fff; border:1px solid #555; border-radius:4px; padding:2px 6px; font-size:12px";
  }

  function addControlsToMessages() {
    const messages = document.querySelectorAll("[data-message-author-role]");
    messages.forEach((msg, index) => {
      if (msg.classList.contains("toggle-processed")) return;
      const content = msg.querySelector(
        ".markdown, .whitespace-pre-wrap, .text-message"
      );
      if (!content) return;

      const controlRow = document.createElement("div");
      controlRow.className = "chatgpt-control-row";
      Object.assign(controlRow.style, {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "6px",
      });

      const labelKey = `chatgpt-msg-label-${index}`;

      function createButton(symbol, title, onClick) {
        const btn = document.createElement("button");
        btn.textContent = symbol;
        btn.title = title;
        btn.style.cssText = baseButtonStyle();
        btn.onclick = onClick;
        return btn;
      }

      const toggleBtn = createButton("▼", "Collapse this message", () => {
        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "" : "none";
        toggleBtn.textContent = isHidden ? "▼" : "▶";
      });

      const menuBtn = createButton("☰", "Show message index", () => {
        indexPopup.style.display =
          indexPopup.style.display === "none" ? "block" : "none";
        if (indexPopup.style.display === "block") updateIndexOverview();
      });

      const topBtn = createButton("🡅", "Scroll to top", () => {
        msg.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      const prevBtn = createButton("🡄", "Previous message", () => {
        const controls = Array.from(
          document.querySelectorAll(".chatgpt-control-row")
        );
        const current = prevBtn.parentElement;
        const idx = controls.indexOf(current);
        if (idx > 0)
          controls[idx - 1].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      });

      const nextBtn = createButton("🡆", "Next message", () => {
        const controls = Array.from(
          document.querySelectorAll(".chatgpt-control-row")
        );
        const current = nextBtn.parentElement;
        const idx = controls.indexOf(current);
        if (idx < controls.length - 1)
          controls[idx + 1].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      });

      const topicInput = document.createElement("input");
      topicInput.placeholder = "Add topicSSSS...";
      Object.assign(topicInput.style, {
        flexGrow: "1",
        fontSize: "12px",
        padding: "2px 4px",
        border: "1px solid #555",
        borderRadius: "4px",
        color: "#fff",
        background: "rgba(32, 33, 35, 0.5)",
      });
      topicInput.value = localStorage.getItem(labelKey) || "";
      topicInput.oninput = () => {
        if (topicInput.value.trim()) {
          localStorage.setItem(labelKey, topicInput.value);
        } else {
          localStorage.removeItem(labelKey);
        }
        updateIndexOverview();
      };

      controlRow.append(
        toggleBtn,
        menuBtn,
        topBtn,
        prevBtn,
        nextBtn,
        topicInput
      );
      msg.appendChild(controlRow);
      msg.classList.add("toggle-processed");
    });
  }

  function updateIndexOverview() {
    indexPopup.textContent = ""; // Clears previous DOM safely

    const threadId = getCurrentThreadId();
    const title = document.createElement("h3");
    title.textContent = "🧭 Prompt Compass 🎴";
    title.style.marginTop = "0";
    indexPopup.appendChild(title);

    const btnRow = document.createElement("div");
    btnRow.style.display = "flex";
    btnRow.style.justifyContent = "space-between";
    btnRow.style.marginBottom = "8px";

    const expandBtn = document.createElement("button");
    expandBtn.textContent = "Expand All";
    expandBtn.style.fontSize = "12px";
    expandBtn.onclick = () => {
      document.querySelectorAll("[data-message-author-role]").forEach((msg) => {
        const content = msg.querySelector(
          ".markdown, .whitespace-pre-wrap, .text-message"
        );
        if (content) content.style.display = "";
      });
    };

    const collapseBtn = document.createElement("button");
    collapseBtn.textContent = "Collapse All";
    collapseBtn.style.fontSize = "12px";
    collapseBtn.onclick = () => {
      document.querySelectorAll("[data-message-author-role]").forEach((msg) => {
        const content = msg.querySelector(
          ".markdown, .whitespace-pre-wrap, .text-message"
        );
        if (content) content.style.display = "none";
      });
    };

    btnRow.appendChild(expandBtn);
    btnRow.appendChild(collapseBtn);
    indexPopup.appendChild(btnRow);

    const folderTitle = document.createElement("h4");
    folderTitle.textContent = `🗂️ ${threadId}`;
    Object.assign(folderTitle.style, {
      margin: "8px 0",
      fontWeight: "bold",
      fontSize: "14px",
    });

    const folder = document.createElement("div");
    folder.appendChild(folderTitle);

    const list = document.createElement("div");
    list.style.borderTop = "1px solid #444";

    const labels = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("chatgpt-msg-label-")) {
        labels.push({
          index: parseInt(key.replace("chatgpt-msg-label-", "")),
          text: localStorage.getItem(key),
          key: key,
        });
      }
    }
    labels.sort((a, b) => a.index - b.index);

    if (labels.length === 0) {
      const noLabel = document.createElement("p");
      noLabel.textContent = "No labels added yet";
      noLabel.style.color = "#999";
      noLabel.style.fontStyle = "italic";
      list.appendChild(noLabel);
    } else {
      labels.forEach((label) => {
        const item = document.createElement("div");
        Object.assign(item.style, {
          padding: "5px",
          margin: "4px 0",
          borderBottom: "1px solid #444",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        });

        const labelText = document.createElement("span");
        labelText.textContent = label.text || `Message ${label.index + 1}`;
        labelText.style.cursor = "pointer";
        labelText.onclick = () => {
          const messages = document.querySelectorAll(
            "[data-message-author-role]"
          );
          if (messages[label.index]) {
            messages[label.index].scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        };

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "×";
        removeBtn.title = "Remove this label";
        removeBtn.style.cssText =
          "cursor:pointer; background:transparent; border:none; color:#aaa; font-size:16px; padding:0 5px;";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          localStorage.removeItem(label.key);
          const messages = document.querySelectorAll(
            "[data-message-author-role]"
          );
          if (messages[label.index]) {
            const input = messages[label.index].querySelector("input");
            if (input) input.value = "";
          }
          updateIndexOverview();
        };

        item.appendChild(labelText);
        item.appendChild(removeBtn);
        list.appendChild(item);
      });
    }

    folder.appendChild(list);
    indexPopup.appendChild(folder);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.cssText =
      baseButtonStyle() + "; margin-top: 10px; width: 100%;";
    closeBtn.onclick = () => {
      indexPopup.style.display = "none";
    };
    indexPopup.appendChild(closeBtn);
  }

  const observer = new MutationObserver(() => addControlsToMessages());
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("load", addControlsToMessages);
})();
