 🔗 Supabase config
const SUPABASE_URL = "https://xwzjlddgqwlrxgetahvp.supabase.co";
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3empsZGRncXdscnhnZXRhaHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MzY1NTQsImV4cCI6MjA4NTMxMjU1NH0.MsCgDKBz3jXrJ_dOcJ35koaLi-uBpNXoAoaFLAWDbkg";

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
  window.location.href = "home.html";
});
async function testPosts() {
    const { data, error } = await supabase.from("posts").select("*");

    // au lieu de console.log, on montre sur la page
    const testDiv = document.createElement('div');
    testDiv.style.background = "#ff0";
    testDiv.style.padding = "10px";
    testDiv.style.margin = "10px 0";
    testDiv.textContent = error ? `ERREUR : ${error.message}` : `POSTS : ${JSON.stringify(data)}`;
    document.body.prepend(testDiv);
}

testPosts();

