const params = new URLSearchParams(location.search);
const editions = {
  tideland: { label: 'Tideland', preview: 'tideland/', home: '/', editor: '/wp-admin/edit.php?post_type=page' },
  'form-earth': { label: 'Form / Earth', preview: 'form-earth/', home: '/', editor: '/wp-admin/edit.php?post_type=page' },
  'form-earth-woocommerce': { label: 'Form / Earth · WooCommerce', preview: 'form-earth/', home: '/shop/', editor: '/wp-admin/edit.php?post_type=product' }
};
const site = Object.hasOwn(editions, params.get('site')) ? params.get('site') : 'tideland';
const edition = editions[site];
const label = edition.label;
const status = document.querySelector('#status');
const start = document.querySelector('#start');
const iframe = document.querySelector('#wp');
document.querySelector('#title').textContent = label + ' / WordPress';
document.querySelector('#preview').href = edition.preview;
document.querySelector('#standalone').href = 'https://playground.wordpress.net/?blueprint-url=' + encodeURIComponent('https://raw.githubusercontent.com/tomlemur57-ux/DemoWebsites/main/dist/wordpress/' + site + '.json');
if (site === 'form-earth-woocommerce') {
  document.querySelector('#editor').textContent = 'Edit products';
  document.querySelector('#demo-details').textContent = 'Native WooCommerce products, variations, cart and fictional test orders. Use the supplied demo identity. No payment, email or fulfillment is connected; the isolated session is temporary.';
  document.querySelector('#intro').textContent = 'Choose a finish, add an object to the cart, then try a fictional checkout. Open the product editor to inspect the native catalog.';
}
let client;
let starting = false;
start.addEventListener('click', async () => {
  if (starting || client) return;
  starting = true;
  let launchTimer;
  start.disabled = true;
  status.textContent = 'Loading the WordPress runtime and preparing ' + label + '…';
  try {
    const [{ startPlaygroundWeb }, response] = await Promise.all([
      import('https://playground.wordpress.net/client/index.js'),
      fetch('wordpress/' + site + '.json')
    ]);
    if (!response.ok) throw new Error('The demo files could not be loaded.');
    const blueprint = await response.json();
    iframe.hidden = false;
    client = await Promise.race([
      (async () => {
        const instance = await startPlaygroundWeb({ iframe, remoteUrl: 'https://playground.wordpress.net/remote.html', blueprint });
        await instance.isReady();
        return instance;
      })(),
      new Promise((_, reject) => { launchTimer = setTimeout(() => reject(new Error('Playground startup timed out.')), 240000); })
    ]);
    status.textContent = label + ' is running. Explore the website or edit its pages; changes stay in this browser session.';
    document.querySelector('#website').disabled = false;
    document.querySelector('#editor').disabled = false;
    start.textContent = 'WordPress ready';
  } catch (error) {
    client = undefined;
    status.textContent = 'WordPress could not start here. Try opening it in Playground, or use the instant preview.';
    start.disabled = false;
    start.textContent = 'Try again';
    iframe.hidden = true;
    iframe.removeAttribute('src');
    console.error('WordPress demo launch failed:', error);
  } finally { clearTimeout(launchTimer); starting = false; }
});
document.querySelector('#website').addEventListener('click', () => client?.goTo(edition.home));
document.querySelector('#editor').addEventListener('click', () => client?.goTo(edition.editor));
