const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('nav button');
const postsDiv = document.getElementById('posts');

function showPage(id) {
  pages.forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');

  navButtons.forEach(b => b.classList.remove('active'));
}

function publish() {
  const text = document.getElementById('postText').value;
  if (text === '') return;

  const post = document.createElement('div');
  post.className = 'post';
  post.innerHTML = `<strong>Moi</strong><p>${text}</p>`;

  postsDiv.prepend(post);
  document.getElementById('postText').value = '';
}
