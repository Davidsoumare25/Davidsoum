import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.32.1/dist/supabase.min.js";

// --- Supabase config ---
const SUPABASE_URL = "https://xwzjlddgqwlrxgetahvp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3empsZGRncXdscnhnZXRhaHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzY1NTQsImV4cCI6MjA4NTMxMjU1NH0.MsCgDKBz3jXrJ_dOcJ35koaLi-uBpNXoAoaFLAWDbkg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- HTML elements ---
const authSection = document.getElementById('auth-section');
const mainSection = document.getElementById('main-section');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const displayNameInput = document.getElementById('displayName');
const profilePhotoInput = document.getElementById('profilePhoto');

const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const authMsg = document.getElementById('auth-msg');

const logoutBtn = document.getElementById('logout-btn');
const profileName = document.getElementById('profile-name');
const profileImg = document.getElementById('profile-img');

const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');
const publishBtn = document.getElementById('publish-btn');
const postsContainer = document.getElementById('posts-container');

const groupNameInput = document.getElementById('group-name');
const createGroupBtn = document.getElementById('create-group');
const groupsList = document.getElementById('groups-list');

let currentUser = null;

// --- INSCRIPTION ---
signupBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const displayName = displayNameInput.value;
    const file = profilePhotoInput.files[0];

    if(!email || !password || !displayName){
        alert("Remplis tous les champs");
        return;
    }

    const { data:user, error } = await supabase.auth.signUp({ email, password });
    if(error){ authMsg.textContent = error.message; return; }

    currentUser = user;

    let photo_url = "";
    if(file){
        const filename = `${currentUser.id}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('profiles').upload(filename, file);
        if(!error) photo_url = `https://xwzjlddgqwlrxgetahvp.supabase.co/storage/v1/object/public/profiles/${filename}`;
    }

    await supabase.from('users').insert([{ id:user.id, email, display_name: displayName, profile_photo: photo_url }]);

    authSection.style.display = 'none';
    mainSection.style.display = 'block';
    loadProfile();
    loadPosts();
    loadGroups();
});

// --- CONNEXION ---
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){ authMsg.textContent = error.message; return; }

    currentUser = data.user;
    authSection.style.display = 'none';
    mainSection.style.display = 'block';
    loadProfile();
    loadPosts();
    loadGroups();
});

// --- LOGOUT ---
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    mainSection.style.display = 'none';
    authSection.style.display = 'block';
});

// --- PROFILE ---
async function loadProfile(){
    const { data } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
    profileName.textContent = data.display_name;
    profileImg.textContent = data.profile_photo ? "" : "🧑";
    if(data.profile_photo) profileImg.style.backgroundImage = `url(${data.profile_photo})`;
    profileImg.style.backgroundSize = "cover";
    profileImg.style.backgroundPosition = "center";
}

// --- PUBLIER ---
publishBtn.addEventListener('click', async () => {
    const text = postText.value;
    const file = postImage.files[0];
    let image_url = "";

    if(file){
        const filename = `${currentUser.id}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('posts').upload(filename, file);
        if(!error) image_url = `https://xwzjlddgqwlrxgetahvp.supabase.co/storage/v1/object/public/posts/${filename}`;
    }

    if(!text && !image_url){ alert("Rien à publier"); return; }

    await supabase.from('posts').insert([{ user_id: currentUser.id, content: text, image_url, created_at: new Date() }]);

    postText.value = "";
    postImage.value = "";

    loadPosts();
});

// --- LOAD POSTS + Likes + Commentaires ---
async function loadPosts(){
    postsContainer.innerHTML = "";
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending:false });
    if(error) console.log(error);

    for(let post of data){
        const div = document.createElement('div');
        div.className = "post";
        div.innerHTML = `<strong>${post.user_id}</strong><p>${post.content}</p>`;
        if(post.image_url) div.innerHTML += `<img src="${post.image_url}">`;

        div.innerHTML += `
            <button class="like-btn" data-id="${post.id}">❤️ J'aime</button>
            <span id="likes-${post.id}">0</span>
            <div>
                <input type="text" placeholder="Commentaire..." class="comment-input" data-id="${post.id}">
                <button class="comment-btn" data-id="${post.id}">💬</button>
                <div id="comments-${post.id}"></div>
            </div>
        `;

        postsContainer.appendChild(div);
    }

    // Likes
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const post_id = btn.dataset.id;
            await supabase.from('likes').insert([{ post_id, user_id: currentUser.id }]);
            loadPosts();
        });
    });

    // Commentaires
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const post_id = btn.dataset.id;
            const input = document.querySelector(`.comment-input[data-id="${post_id}"]`);
            if(!input.value) return;
            await supabase.from('comments').insert([{ post_id, user_id: currentUser.id, content: input.value }]);
            input.value = "";
            loadPosts();
        });
    });

    // Charger le nombre de likes et commentaires
    for(let post of data){
        const { data: likesData } = await supabase.from('likes').select('*').eq('post_id', post.id);
        document.getElementById(`likes-${post.id}`).textContent = likesData.length;

        const { data: commentsData } = await supabase.from('comments').select('*').eq('post_id', post.id);
        const commentsDiv = document.getElementById(`comments-${post.id}`);
        commentsDiv.innerHTML = "";
        for(let c of commentsData){
            const p = document.createElement('p');
            p.textContent = c.content;
            commentsDiv.appendChild(p);
        }
    }
}

// --- GROUPES ---
createGroupBtn.addEventListener('click', async () => {
    const name = groupNameInput.value;
    if(!name) return alert("Donne un nom au groupe");
    await supabase.from('groups').insert([{ name, creator_id: currentUser.id }]);
    groupNameInput.value = "";
    loadGroups();
});

async function loadGroups(){
    groupsList.innerHTML = "";
    const { data, error } = await supabase.from('groups').select('*');
    if(error) console.log(error);
    for(let group of data){
        const div = document.createElement('div');
        div.className = "group";
        div.textContent = group.name;
        groupsList.appendChild(div);
    }
}
