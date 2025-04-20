document.getElementById("expandAllBtn")?.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        document
          .querySelectorAll("[data-message-author-role]")
          .forEach((msg) => {
            const content = msg.querySelector(
              ".markdown, .whitespace-pre-wrap, .text-message"
            );
            if (content) content.style.display = "";
          });
      },
    });
  });
});

document
  .getElementById("collapseAllBtn")
  ?.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          document
            .querySelectorAll("[data-message-author-role]")
            .forEach((msg) => {
              const content = msg.querySelector(
                ".markdown, .whitespace-pre-wrap, .text-message"
              );
              if (content) content.style.display = "none";
            });
        },
      });
    });
  });

document.getElementById("closeBtn")?.addEventListener("click", function () {
  window.close();
});
