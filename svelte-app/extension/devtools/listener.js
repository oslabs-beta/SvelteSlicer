function setup(root) {
  root.addEventListener('SvelteRegisterComponent', svelteRegisterComponent)
  root.addEventListener('SvelteRegisterBlock', svelteRegisterBlock)
  root.addEventListener('SvelteDOMInsert', svelteDOMInsert)
  root.addEventListener('SvelteDOMRemove', svelteDOMRemove)
  root.addEventListener('SvelteDOMSetData', svelteDOMSetData)
  root.addEventListener('SvelteDOMSetProperty', svelteDOMSetProperty)
  root.addEventListener('SvelteDOMSetAttribute', svelteDOMSetAttribute)
  root.addEventListener('SvelteDOMRemoveAttribute', svelteDOMRemoveAttribute)
}

function svelteRegisterComponent (e) {
  console.log('SRC Fired!!!');
  console.log(e);
}

function svelteRegisterBlock (e) {
  console.log('SRB Fired!!!');
  console.log(e);
}

function svelteDOMInsert(e) {
    console.log('SDI Fired!!!');
    console.log(e.detail);
}

function svelteDOMRemove(e) {
    console.log('SDR Fired!!!');
    console.log(e);
}

function svelteDOMSetData(e) {
    console.log('SDSD Fired!!!');
    console.log(e);
}

function svelteDOMSetProperty(e) {
    console.log('SDSP Fired!!!');
    console.log(e);
}

function svelteDOMSetAttribute(e) {
    console.log('SDSA Fired!!!');
    console.log(e);
}

function svelteDOMRemoveAttribute(e) {
    console.log('SDRA Fired!!!');
    console.log(e);
}

setup(window.document);

for (let i = 0; i < window.frames.length; i++) {
  const frame = window.frames[i]
  const root = frame.document
  setup(root)
}


