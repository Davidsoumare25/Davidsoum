// 🔗 Supabase config
const SUPABASE_URL = "https://xwzjlddgqwlrxgetahvp.supabase.co";
const SUPABASE_ANON_KEY = "TA_CLE_ANON_ICI";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// éléments HTML
const authSection = document.getElementById("auth-section");
const mainSection = document.getElementById("main-section");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");

const authMsg = document.getElementById("auth-msg");

// 🔁 vérifier la session AU CHARGEMENT
document.addEventListener("DOMContentLoaded", async () => {
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    authSection.style.display = "none";
    mainSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    mainSection.style.display = "none";
  }
});

// 🔐 INSCRIPTION
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    authMsg.textContent = error.message;
  } else {
    authMsg.textContent = "Compte créé ! Connecte-toi.";
  }
});

// 🔓 CONNEXION
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    authMsg.textContent = error.message;
  } else {
    location.reload(); // 🔥 TRÈS IMPORTANT
  }
});

// 🚪 DÉCONNEXION
logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});
