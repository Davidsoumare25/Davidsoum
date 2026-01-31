// --- ELEMENTS SUPPLÉMENTAIRES ---
const profileName = document.createElement('h3');
const profileImg = document.createElement('span');
profileImg.textContent = "🧑";
profileImg.style.fontSize = "50px";
profileImg.style.display = "block";
profileImg.style.marginBottom = "10px";

const createPostDiv = document.createElement('div');
createPostDiv.innerHTML = `
  <textarea id="post-text" placeholder="Écris quelque chose..." style="width:100%;height:50px;"></textarea>
  <input type="file" id="post-image">
  <button id="publish-btn">Publier</button>
  <p id="post-msg"></p>
`;

const feedDiv = document.createElement('div');
feedDiv.innerHTML = `<h2>Fil d'actualité</h2><div id="posts-container"></div>`;

// on ajoute au mainSection
mainSection.prepend(profileImg, profileName);
mainSection.appendChild(createPostDiv);
mainSection.appendChild(feedDiv);

// --- ELEMENTS POST ---
const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');
const publishBtn = document.getElementById('publish-btn');
const postMsg = document.getElementById('post-msg');
const postsContainer = document.getElementById('posts-container');

// --- CHARGER PROFIL ---
async function loadProfile() {
    const { data, error } = await supabase.from('users').select('*').eq('id', supabase.auth.getUser().data.user.id).single();
    if(error){ console.log(error.message); return; }
    profileName.textContent = data.display_name || "Utilisateur";
    if(data.profile_photo){
        profileImg.textContent = "";
        profileImg.style.backgroundImage = `url(${data.profile_photo})`;
        profileImg.style.backgroundSize = "cover";
        profileImg.style.width = "50px";
        profileImg.style.height = "50px";
        profileImg.style.borderRadius = "50%";
        profileImg.style.display = "block";
    }
}

// --- PUBLIER POST ---
publishBtn.addEventListener('click', async () => {
    const text = postText.value;
    const file = postImage.files[0];
    let image_url = "";

    if(file){
        const filename = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('posts').upload(filename, file);
        if(error){ postMsg.textContent = error.message; return; }
        image_url = `https://xwzjlddgqwlrxgetahvp.supabase.co/storage/v1/object/public/posts/${filename}`;
    }

    if(!text && !image_url){ postMsg.textContent = "Rien à publier"; return; }

    const { data, error } = await supabase.from('posts').insert([{
        user_id: supabase.auth.getUser().data.user.id,
        content: text,
        image_url: image_url,
        created_at: new Date()
    }]);
    if(error){ postMsg.textContent = error.message; return; }

    postMsg.textContent = "Publié !";
    postText.value = "";
    postImage.value = "";

    loadPosts();
});

// --- CHARGER POSTS ---
async function loadPosts() {
    postsContainer.innerHTML = "";
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending:false });
    if(error){ postsContainer.innerHTML = `Erreur : ${error.message}`; return; }

    for(let post of data){
        const div = document.createElement('div');
        div.style.border = "1px solid #ccc";
        div.style.margin = "5px 0";
        div.style.padding = "5px";
        div.innerHTML = `<strong>${post.user_id}</strong><p>${post.content}</p>`;
        if(post.image_url) div.innerHTML += `<img src="${post.image_url}" style="max-width:100%;">`;
        postsContainer.appendChild(div);
    }
}

// --- APPEL CHARGEMENT PROFIL ET POSTS APRÈS CONNEXION ---
document.addEventListener("DOMContentLoaded", async () => {
    const session = await supabase.auth.getSession();
    if(session.data.session){
        loadProfile();
        loadPosts();
    }
});
