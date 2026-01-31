const supabase = supabase.createClient(
  "TON_URL_SUPABASE",
  "TON_ANON_KEY"
);

// 🔁 vérifier si un utilisateur est déjà connecté
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    // utilisateur connecté
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("main-section").style.display = "block";

    console.log("Utilisateur connecté :", data.session.user.email);
  } else {
    // utilisateur non connecté
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("main-section").style.display = "none";
  }
});// --- SUPABASE CONFIG ---
const SUPABASE_URL = "https://xwzjlddgqwlrxgetahvp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3empsZGRncXdscnhnZXRhaHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzY1NTQsImV4cCI6MjA4NTMxMjU1NH0.MsCgDKBz3jXrJ_dOcJ35koaLi-uBpNXoAoaFLAWDbkg";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// --- ELEMENTS ---
const authSection = document.getElementById("auth-section");
const mainSection = document.getElementById("main-section");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const displayNameInput = document.getElementById("displayName");
const profilePhotoInput = document.getElementById("profilePhoto");

const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const authMsg = document.getElementById("auth-msg");

const logoutBtn = document.getElementById("logout-btn");
const profileName = document.getElementById("profile-name");
const profileImg = document.getElementById("profile-img");

const postText = document.getElementById("post-text");
const postImage = document.getElementById("post-image");
const publishBtn = document.getElementById("publish-btn");
const postsContainer = document.getElementById("posts-container");

const groupNameInput = document.getElementById("group-name");
const createGroupBtn = document.getElementById("create-group");
const groupsList = document.getElementById("groups-list");

let currentUser = null;

// --- INSCRIPTION ---
signupBtn.onclick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const displayName = displayNameInput.value;

  if (!email || !password || !displayName) {
    authMsg.textContent = "Remplis tous les champs";
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    authMsg.textContent = error.message;
    return;
  }

  currentUser = data.user;

  await supabase.from("users").insert([
    {
      id: currentUser.id,
      email,
      display_name: displayName
    }
  ]);

  authSection.style.display = "none";
  mainSection.style.display = "block";
  loadProfile();
  loadPosts();
  loadGroups();
};

// --- CONNEXION ---
loginBtn.onclick = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });

  if (error) {
    authMsg.textContent = error.message;
    return;
  }

  currentUser = data.user;
  authSection.style.display = "none";
  mainSection.style.display = "block";
  loadProfile();
  loadPosts();
  loadGroups();
};

// --- LOGOUT ---
logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  authSection.style.display = "block";
  mainSection.style.display = "none";
};

// --- PROFIL ---
async function loadProfile() {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", currentUser.id)
    .single();

  profileName.textContent = data.display_name;
  profileImg.textContent = "📝";
}

// --- PUBLIER ---
publishBtn.onclick = async () => {
  if (!postText.value) return alert("Écris quelque chose");

  await supabase.from("posts").insert([
    {
      user_id: currentUser.id,
      content: postText.value
    }
  ]);

  postText.value = "";
  loadPosts();
};

// --- POSTS ---
async function loadPosts() {
  postsContainer.innerHTML = "";

  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  data.forEach(post => {
    const div = document.createElement("div");
    div.innerHTML = `<p>${post.content}</p>`;
    postsContainer.appendChild(div);
  });
}

// --- GROUPES ---
createGroupBtn.onclick = async () => {
  if (!groupNameInput.value) return;

  await supabase.from("groups").insert([
    {
      name: groupNameInput.value,
      creator_id: currentUser.id
    }
  ]);

  groupNameInput.value = "";
  loadGroups();
};

async function loadGroups() {
  groupsList.innerHTML = "";
  const { data } = await supabase.from("groups").select("*");

  data.forEach(g => {
    const div = document.createElement("div");
    div.textContent = g.name;
    groupsList.appendChild(div);
  });
}
const test = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*");

  console.log(data, error);
};

test();
