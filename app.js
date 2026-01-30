import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.32.1/dist/supabase.min.js";

// --- Configuration Supabase ---
const SUPABASE_URL = "https://xwzjlddgqwlrxgetahvp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7jMQPyW96hyIn1mRtIleYA_LhiZ_jRA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Sélection des éléments ---
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

    if(!email || !password || !displayName) return alert("Remplis tous les champs");

    // Upload photo
    let photo_url = "";
    if(file){
        const { data, error } = await supabase.storage.from('profiles').upload(`public/${file.name}`, file);
        if(error) console.log(error);
        else photo_url = `https://xwzjlddgqwlrxgetahvp.supabase.co/storage/v1/object/public/profiles/${file.name}`;
    }

    // Créer utilisateur
    const { user, error } = await supabase.auth.signUp({ email, password });
    if(error) authMsg.textContent = error.message;
    else{
        currentUser = user;
        await supabase.from('users').insert([{ id:user.id, email, display_name: displayName, profile_photo: photo_url }]);
        authSection.style.display = 'none';
        mainSection.style.display = 'block';
        loadProfile();
        loadPosts();
    }
});

// --- CONNEXION ---
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) authMsg.textContent = error.message;
    else{
        currentUser = data.user;
        authSection.style.display = 'none';
        mainSection.style.display = 'block';
        loadProfile();
        loadPosts();
    }
});

// --- LOGOUT ---
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    mainSection.style.display = 'none';
    authSection.style.display = 'block';
});

// --- LOAD PROFILE ---
async function loadProfile(){
    const { data } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
    profileName.textContent = data.display_name;
    profileImg.src = data.profile_photo || 'default.png';
}

// --- PUBLIER ---
publishBtn.addEventListener('click', async () => {
    const text = postText.value;
    const file = postImage.files[0];
    let image_url = "";

    if(file){
        const { data, error } = await supabase.storage.from('posts').upload(`public/${file.name}`, file);
        if(error) console.log(error);
        else image_url = `https://xwzjlddgqwlrxgetahvp.supabase.co/storage/v1/object/public/posts/${file.name}`;
    }

    if(!text && !image_url) return alert("Rien à publier");

    await supabase.from('posts').insert([{ user_id: currentUser.id, content: text, image_url, created_at: new Date() }]);
    postText.value = "";
    postImage.value = "";
    loadPosts();
});

// --- LOAD POSTS ---
async function loadPosts(){
    postsContainer.innerHTML = "";
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending:false });
    if(error) console.log(error);

    for(let post of data){
        const div = document.createElement('div');
        div.className = "post";
        div.innerHTML = `<strong>${post.user_id}</strong><p>${post.content}</p>`;
        if(post.image_url) div.innerHTML += `<img src="${post.image_url}" style="width:100%;border-radius:10px;margin-top:5px;">`;
        postsContainer.appendChild(div);
    }
}
