const params = new URLSearchParams(location.search);
const site = params.get('site') === 'form-earth' ? 'form-earth' : 'tideland';
const label = site === 'tideland' ? 'Tideland' : 'Form / Earth';
const status = document.querySelector('#status');
const start = document.querySelector('#start');
const iframe = document.querySelector('#wp');
document.querySelector('#title').textContent = label + ' / WordPress';
document.querySelector('#preview').href = site + '/';
let client;
let starting = false;
start.addEventListener('click', async () => {
  if (starting || client) return;
  starting = true;
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
    client = await startPlaygroundWeb({ iframe, remoteUrl: 'https://playground.wordpress.net/remote.html', blueprint });
    await client.isReady();
    status.textContent = label + ' is running. Explore the website or edit its pages; changes stay in this browser session.';
    document.querySelector('#website').disabled = false;
    document.querySelector('#editor').disabled = false;
    start.textContent = 'WordPress ready';
  } catch (error) {
    client = undefined;
    status.textContent = 'WordPress could not start. Check your connection and try again, or use the instant preview.';
    start.disabled = false;
    start.textContent = 'Try again';
    iframe.hidden = true;
    console.error('WordPress demo launch failed:', error);
  } finally { starting = false; }
});
document.querySelector('#website').addEventListener('click', () => client?.goTo('/'));
document.querySelector('#editor').addEventListener('click', () => client?.goTo('/wp-admin/edit.php?post_type=page'));
