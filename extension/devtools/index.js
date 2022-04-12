chrome.devtools.panels.create(
    "Slicer",
    "svelte_logo.png",
    "devtools/panel.html",
    function (panel) {
        panel.onShown.addListener(() => {
            const url = chrome.runtime.getURL('devtools/injected.js');

            fetch(url)
            .then((response) => response.text())
            .then((string) => {
                chrome.devtools.inspectedWindow.reload(
                    {injectedScript: string}
                )
            })
        })
    }
)