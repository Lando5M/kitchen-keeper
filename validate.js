(function () {
  "use strict";

  var SUPABASE_URL = "https://gprlzbgcpsmqofpjyase.supabase.co";
  var SUPABASE_KEY = "sb_publishable__4rtFjMMNlRD8D5UY7LSGQ_njJd9G-x";
  var sb = null;
  var mode = "signin";

  var $ = function (id) { return document.getElementById(id); };

  function setMode(next) {
    mode = next;
    $("signInTab").classList.toggle("active", mode === "signin");
    $("signUpTab").classList.toggle("active", mode === "signup");
    $("authButton").textContent = mode === "signin" ? "Sign in" : "Create account";
    $("authMsg").textContent = "";
  }

  $("signInTab").addEventListener("click", function () { setMode("signin"); });
  $("signUpTab").addEventListener("click", function () { setMode("signup"); });

  function showMessage(text) {
    $("authMsg").textContent = text;
  }

  async function start() {
    if (!window.supabase) {
      showMessage("The authentication library did not load. Please refresh the page.");
      return;
    }
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    var result = await sb.auth.getSession();
    if (result.data && result.data.session) {
      showApp();
    }
  }

  $("authForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!sb) {
      showMessage("Connecting to authentication. Please wait a moment and try again.");
      await start();
      if (!sb) return;
    }

    var email = $("email").value.trim();
    var password = $("password").value;
    $("authButton").disabled = true;
    showMessage("Please wait...");

    var result;
    if (mode === "signup") {
      result = await sb.auth.signUp({ email: email, password: password });
    } else {
      result = await sb.auth.signInWithPassword({ email: email, password: password });
    }

    $("authButton").disabled = false;

    if (result.error) {
      showMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      showMessage("Account created. Check your email to confirm your account.");
      return;
    }

    showMessage("");
    showApp();
  });

  $("signOut").addEventListener("click", async function () {
    if (sb) await sb.auth.signOut();
    $("app").classList.add("hidden");
    $("auth").classList.remove("hidden");
  });

  async function showApp() {
    $("auth").classList.add("hidden");
    $("app").classList.remove("hidden");
    await checkHousehold();
  }

  async function checkHousehold() {
    if (!sb) return;
    var result = await sb.from("household_members").select("household_id").limit(1);
    if (result.error || !result.data || result.data.length === 0) {
      $("householdSetup").classList.remove("hidden");
      $("dashboard").classList.add("hidden");
      return;
    }
    $("householdSetup").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    loadFood(result.data[0].household_id);
  }

  $("createHouse").addEventListener("click", async function () {
    if (!sb) return;
    var name = $("houseName").value.trim() || "My Kitchen";
    var result = await sb.rpc("create_household", { hname: name });
    if (result.error) {
      $("houseMsg").textContent = result.error.message;
      return;
    }
    $("houseMsg").textContent = "Household created.";
    await checkHousehold();
  });

  $("joinHouse").addEventListener("click", async function () {
    if (!sb) return;
    var code = $("inviteCode").value.trim();
    var result = await sb.rpc("join_household", { invite: code });
    if (result.error) {
      $("houseMsg").textContent = result.error.message;
      return;
    }
    $("houseMsg").textContent = "Joined household.";
    await checkHousehold();
  });

  async function loadFood(householdId) {
    var result = await sb.from("food_items").select("*").eq("household_id", householdId).order("expiration", { ascending: true });
    if (result.error) return;
    var items = result.data || [];
    $("total").textContent = items.length;
    $("low").textContent = items.filter(function (x) { return Number(x.quantity) <= Number(x.low_at); }).length;
    var today = new Date();
    var soonDate = new Date();
    soonDate.setDate(today.getDate() + 7);
    $("expired").textContent = items.filter(function (x) { return x.expiration && new Date(x.expiration) < today; }).length;
    $("soon").textContent = items.filter(function (x) { var d = x.expiration ? new Date(x.expiration) : null; return d && d >= today && d <= soonDate; }).length;
    $("inventory").innerHTML = items.map(function (x) {
      return '<div class="food"><b>' + escapeHtml(x.name) + '</b> — ' + escapeHtml(x.quantity) + ' ' + escapeHtml(x.unit || "") + '<br><small>' + escapeHtml(x.location || "") + ' · expires ' + escapeHtml(x.expiration || "none") + '</small></div>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  $("addFood").addEventListener("click", function () {
    alert("Food entry form will be added after authentication is confirmed working.");
  });

  start().catch(function (error) {
    showMessage(error.message || "Unable to start authentication.");
  });
}());