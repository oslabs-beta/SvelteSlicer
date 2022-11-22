chrome.devtools.panels.create(
  "Svelte Slicer",
  "svelte_logo.png",
  "devtools/panel.html",
  function (panel) {
    panel.onShown.addListener(() => {
      // reload page and inject script from injected.js
      const url = chrome.runtime.getURL("devtools/build/injected.js");
      fetch(url)
        .then((response) => response.text())
        .then((string) => {
          console.log(string);
          chrome.devtools.inspectedWindow.reload({
            injectedScript: string,
          });
        });
    });
  }
);
