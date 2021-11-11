const body = document.body;

const config = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
    attributeOldValue: true,
    characterDataOldValue: true
}

let observer = new MutationObserver(mutationRecord => {
    console.log(mutationRecord)
});

observer.observe(body, config);