let posts = JSON.parse(localStorage.getItem("posts")) || [];
let groups = JSON.parse(localStorage.getItem("groups")) || [];

const modal = document.getElementById("modal");
const postBtn = document.getElementById("postBtn");

postBtn.onclick = () => modal.classList.remove("hidden");

function publish() {
  const text = postText.value;
  if (!text) return;

  posts.unshift({ text });
  localStorage.setItem("posts", JSON.stringify(posts));
  modal.classList.add("hidden");
  postText.value = "";
  render();
}

function render() {
  postsDiv.innerHTML = "";
  posts.forEach(p => {
    postsDiv.innerHTML += `<div class="post">${p.text}</div>`;
  });
}

function show(id) {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function addGroup() {
  if (!groupInput.value) return;
  groups.push(groupInput.value);
  localStorage.setItem("groups", JSON.stringify(groups));
  renderGroups();
}

function renderGroups() {
  groupList.innerHTML = "";
  groups.forEach(g => groupList.innerHTML += `<li>${g}</li>`);
}

function saveName() {
  localStorage.setItem("name", nameInput.value);
  myName.textContent = "Bonjour " + nameInput.value;
}

render();
renderGroups();
const btnPublier = document.getElementById('btnPublier');
const feed = document.getElementById('feed');

btnPublier.addEventListener('click', () => {
  const texte = document.getElementById('textePublication').value;
  const fichier = document.getElementById('fichierPublication').files[0];

  if (texte === "" && !fichier) {
    alert("Écris quelque chose ou choisis un fichier !");
    return;
  }

  const post = document.createElement('div');
  post.classList.add('post');

  post.innerHTML = `<p>${texte}</p>` + 
    (fichier ? `<p>Fichier : ${fichier.name}</p>` : "");

  feed.prepend(post);

  // Réinitialiser
  document.getElementById('textePublication').value = "";
  document.getElementById('fichierPublication').value = "";
});
