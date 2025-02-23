/*********************************
 * Code written by Chirrenthen
 * Visit my Github page for more details (github.com/chirrenthen)
 * This is an Open-source Project
 *********************************/

/*********************************
 * Utility Functions
 *********************************/
alert("Code Crafted with 🩵 by Chirrenthen\nFor more details visit my Github page\nDon't forget to leave a star\nSign-Up and enjoy the system!\nIf needed resize the screen to 67%");
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateQRCode(imgId) {
  const code = generateRandomCode();
  const img = document.getElementById(imgId);
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${code}`;
  return code;
}

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

function updateUser(updatedUser) {
  let users = getUsers();
  users = users.map(u => (u.accountNumber === updatedUser.accountNumber ? updatedUser : u));
  saveUsers(users);
}

function removeUser(accountNumber) {
  let users = getUsers();
  users = users.filter(u => u.accountNumber !== accountNumber);
  saveUsers(users);
}

/*********************************
 * Initialize Admin if Missing
 *********************************/
(function initAdmin() {
  let users = getUsers();
  if (!users.find(u => u.isAdmin)) {
    users.push({
      accountNumber: "admin",
      userId: "admin",
      password: "admin",
      balance: 0,
      transactions: [],
      isAdmin: true
    });
    saveUsers(users);
  }
})();

/*********************************
 * Captcha Functions
 *********************************/
function generateCaptchaFor(elementId) {
  const captchaDisplay = document.querySelector(`#${elementId} .captcha`);
  captchaDisplay.innerText = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captchaText = "";
  for (let i = 0; i < 6; i++) {
    captchaText += characters.charAt(Math.floor(Math.random() * characters.length)) + " ";
  }
  captchaText = captchaText.trim();
  captchaDisplay.innerText = captchaText;
  return captchaText;
}

let depositCaptcha = "";
let withdrawCaptcha = "";
let transferCaptcha = "";

/*********************************
 * Global Variables
 *********************************/
let currentUser = null;
let loginQRCode = "";
let signupQRCode = "";
let adminManageTarget = null;

/*********************************
 * DOM Elements
 *********************************/
const loginPage = document.getElementById("login-page");
const signupPage = document.getElementById("signup-page");
const forgotPasswordModal = document.getElementById("forgot-password-modal");
const dashboardSection = document.getElementById("dashboard-section");
const balanceDisplay = document.getElementById("balance-display");
const lastDepositDisplay = document.getElementById("last-deposit");
const lastWithdrawDisplay = document.getElementById("last-withdraw");

/*********************************
 * Initialization on Load
 *********************************/
window.addEventListener("load", () => {
  showAuthPage("login");
  loginQRCode = generateQRCode("login-qr");
  signupQRCode = generateQRCode("signup-qr");
  document.getElementById("signup-account").value = generateAccountNumber();
  // Initialize captchas for operations
  depositCaptcha = generateCaptchaFor("deposit-captcha-display");
  withdrawCaptcha = generateCaptchaFor("withdraw-captcha-display");
  transferCaptcha = generateCaptchaFor("transfer-captcha-display");
});

/*********************************
 * Auth Navigation
 *********************************/
document.getElementById("go-to-signup").addEventListener("click", (e) => {
  e.preventDefault();
  showAuthPage("signup");
  signupQRCode = generateQRCode("signup-qr");
  document.getElementById("signup-account").value = generateAccountNumber();
});

document.getElementById("go-to-login").addEventListener("click", (e) => {
  e.preventDefault();
  showAuthPage("login");
  loginQRCode = generateQRCode("login-qr");
});

function showAuthPage(page) {
  loginPage.style.display = "none";
  signupPage.style.display = "none";
  dashboardSection.style.display = "none";
  if (page === "login") {
    loginPage.style.display = "flex";
  } else if (page === "signup") {
    signupPage.style.display = "flex";
  } else if (page === "dashboard") {
    dashboardSection.style.display = "block";
  }
}

/*********************************
 * Login Functionality
 *********************************/
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const account = document.getElementById("login-account").value.trim();
  const userId = document.getElementById("login-userid").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const scannedCode = document.getElementById("login-qr-input").value.trim();
  
  if (scannedCode !== loginQRCode) {
    alert("QR verification failed. Please scan again.");
    loginQRCode = generateQRCode("login-qr");
    return;
  }
  
  const users = getUsers();
  const user = users.find(u => u.accountNumber === account && u.userId === userId && u.password === password);
  if (user) {
    currentUser = user;
    loadDashboard(user);
  } else {
    alert("Invalid credentials. Please try again.");
    loginQRCode = generateQRCode("login-qr");
  }
});

/*********************************
 * Signup Functionality
 *********************************/
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const account = document.getElementById("signup-account").value.trim();
  const userId = document.getElementById("signup-userid").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const scannedCode = document.getElementById("signup-qr-input").value.trim();
  
  if (scannedCode !== signupQRCode) {
    alert("QR verification failed. Please scan again.");
    signupQRCode = generateQRCode("signup-qr");
    return;
  }
  
  const users = getUsers();
  if (users.find(u => u.accountNumber === account)) {
    alert("Account already exists. Try logging in.");
    return;
  }
  
  const newUser = {
    accountNumber: account,
    userId,
    password,
    balance: 0,
    transactions: [],
    isAdmin: false
  };
  addUser(newUser);
  alert("Signup successful! Please login with your credentials.");
  showAuthPage("login");
  loginQRCode = generateQRCode("login-qr");
});

/*********************************
 * Forgot Password Functionality
 *********************************/
document.getElementById("forgot-password-link").addEventListener("click", (e) => {
  e.preventDefault();
  forgotPasswordModal.classList.remove("hidden");
});

document.getElementById("forgot-password-submit").addEventListener("click", () => {
  const account = document.getElementById("forgot-account").value.trim();
  const userId = document.getElementById("forgot-userid").value.trim();
  const users = getUsers();
  const user = users.find(u => u.accountNumber === account && u.userId === userId);
  if (!user) {
    alert("No matching user found.");
    return;
  }
  const newPass = "NP" + Math.floor(1000 + Math.random() * 9000).toString();
  user.password = newPass;
  updateUser(user);
  const content = `Your password has been reset.\n\nAccount: ${user.accountNumber}\nUser: ${user.userId}\nNew Password: ${newPass}`;
  triggerDownload("new_password.txt", content);
  alert("Password reset successful. Check the downloaded file.");
  forgotPasswordModal.classList.add("hidden");
});

/*********************************
 * Dashboard Navigation & Sections
 *********************************/
function showInlineSection(section) {
  const sectionId = section + "-section";
  const allSections = document.querySelectorAll(".operation-section");
  allSections.forEach(sec => sec.style.display = "none");
  document.getElementById(sectionId).style.display = "block";
}

document.querySelectorAll("#user-nav a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = link.getAttribute("data-section");
    showInlineSection(section);
  });
});

/*********************************
 * Load Dashboard
 *********************************/
function loadDashboard(user) {
  showAuthPage("dashboard");
  dashboardSection.style.display = "block";
  if (user.isAdmin) {
    document.getElementById("admin-view").style.display = "block";
    document.querySelector(".logo_name").textContent = "Admin";
  } else {
    document.getElementById("admin-view").style.display = "none";
    document.querySelector(".logo_name").textContent = "NeoBank";
  }
  renderDashboard();
  showInlineSection("overview");
}

/*********************************
 * Render Dashboard Data
 *********************************/
function renderDashboard() {
  balanceDisplay.textContent = `$${currentUser.balance.toFixed(2)}`;
  let lastDeposit = 0, lastWithdraw = 0;
  for (let i = currentUser.transactions.length - 1; i >= 0; i--) {
    if (!lastDeposit && currentUser.transactions[i].type === "Deposit") {
      lastDeposit = currentUser.transactions[i].amount;
    }
    if (!lastWithdraw && currentUser.transactions[i].type === "Withdraw") {
      lastWithdraw = currentUser.transactions[i].amount;
    }
    if (lastDeposit && lastWithdraw) break;
  }
  lastDepositDisplay.textContent = `$${lastDeposit.toFixed(2)}`;
  lastWithdrawDisplay.textContent = `$${lastWithdraw.toFixed(2)}`;
  // Update banking card details
  document.getElementById("card-number").textContent = currentUser.accountNumber;
  document.getElementById("card-holder").textContent = currentUser.userId;
  renderTransactionsChart();
  renderActivityData();
  renderTransactionTable();
}

/*********************************
 * Transactions Chart
 *********************************/
function renderTransactionsChart() {
  const recentTx = currentUser.transactions.slice(-10);
  const labels = recentTx.map((tx, idx) => `Tx ${currentUser.transactions.length - recentTx.length + idx + 1}`);
  const amounts = recentTx.map(tx => tx.amount);
  const ctx = document.getElementById("transactions-chart").getContext("2d");
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Transaction Amounts',
        data: amounts,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

/*********************************
 * Recent Activity Rendering
 *********************************/
function renderActivityData() {
  const container = document.getElementById("activity-data");
  container.innerHTML = "";
  if (currentUser.transactions.length === 0) {
    container.textContent = "No recent activity.";
    return;
  }
  currentUser.transactions.slice(-5).forEach(tx => {
    const div = document.createElement("div");
    div.classList.add("data");
    div.innerHTML = `<span class="data-title">${tx.type}</span>
                     <span class="data-list">$${tx.amount.toFixed(2)}</span>
                     <span class="data-list">${tx.date}</span>`;
    container.appendChild(div);
  });
}

/*********************************
 * Render Transaction Table & Search Filter
 *********************************/
function renderTransactionTable() {
  const tbody = document.querySelector("#transaction-table tbody");
  tbody.innerHTML = "";
  if (currentUser.transactions.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">No transactions yet.</td>`;
    tbody.appendChild(row);
    return;
  }
  currentUser.transactions.forEach(tx => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${tx.date}</td><td>${tx.type}</td><td>$${tx.amount.toFixed(2)}</td><td>${tx.details}</td>`;
    tbody.appendChild(row);
  });
}

document.getElementById("transaction-search").addEventListener("input", (e) => {
  const filterText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#transaction-table tbody tr");
  rows.forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(filterText) ? "" : "none";
  });
});

/*********************************
 * Banking Operations with Captcha
 *********************************/
// Deposit
document.getElementById("deposit-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("deposit-amount").value);
  const captchaInput = document.getElementById("deposit-captcha-input").value.trim();
  if (captchaInput !== depositCaptcha.split(" ").join("")) {
    alert("Captcha incorrect for deposit. Please try again.");
    depositCaptcha = generateCaptchaFor("deposit-captcha-display");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid deposit amount.");
    return;
  }
  currentUser.balance += amount;
  currentUser.transactions.push({
    type: "Deposit",
    amount,
    date: new Date().toLocaleString(),
    details: ""
  });
  updateUser(currentUser);
  alert(`Deposited $${amount.toFixed(2)} successfully.`);
  renderDashboard();
  depositCaptcha = generateCaptchaFor("deposit-captcha-display");
  document.getElementById("deposit-form").reset();
});
  
// Withdraw
document.getElementById("withdraw-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("withdraw-amount").value);
  const captchaInput = document.getElementById("withdraw-captcha-input").value.trim();
  if (captchaInput !== withdrawCaptcha.split(" ").join("")) {
    alert("Captcha incorrect for withdrawal. Please try again.");
    withdrawCaptcha = generateCaptchaFor("withdraw-captcha-display");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid withdrawal amount.");
    return;
  }
  if (amount > currentUser.balance) {
    alert("Insufficient funds!");
    return;
  }
  currentUser.balance -= amount;
  currentUser.transactions.push({
    type: "Withdraw",
    amount,
    date: new Date().toLocaleString(),
    details: ""
  });
  updateUser(currentUser);
  alert(`Withdrew $${amount.toFixed(2)} successfully.`);
  renderDashboard();
  withdrawCaptcha = generateCaptchaFor("withdraw-captcha-display");
  document.getElementById("withdraw-form").reset();
});
  
// Transfer
document.getElementById("transfer-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const recipientAcc = document.getElementById("transfer-recipient").value.trim();
  const amount = parseFloat(document.getElementById("transfer-amount").value);
  const password = document.getElementById("transfer-password").value.trim();
  const captchaInput = document.getElementById("transfer-captcha-input").value.trim();
  
  if (password !== currentUser.password) {
    alert("Password incorrect for transfer.");
    return;
  }
  if (captchaInput !== transferCaptcha.split(" ").join("")) {
    alert("Captcha incorrect for transfer. Please try again.");
    transferCaptcha = generateCaptchaFor("transfer-captcha-display");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid transfer amount.");
    return;
  }
  if (amount > currentUser.balance) {
    alert("Insufficient funds for transfer.");
    return;
  }
  const users = getUsers();
  const recipient = users.find(u => u.accountNumber === recipientAcc);
  if (!recipient) {
    alert("Recipient account not found.");
    return;
  }
  currentUser.balance -= amount;
  recipient.balance += amount;
  const transferDate = new Date().toLocaleString();
  currentUser.transactions.push({
    type: "Transfer Sent",
    amount,
    date: transferDate,
    details: `To: ${recipientAcc}`
  });
  recipient.transactions.push({
    type: "Transfer Received",
    amount,
    date: transferDate,
    details: `From: ${currentUser.accountNumber}`
  });
  updateUser(currentUser);
  updateUser(recipient);
  alert(`Transferred $${amount.toFixed(2)} to account ${recipientAcc} successfully.`);
  renderDashboard();
  transferCaptcha = generateCaptchaFor("transfer-captcha-display");
  document.getElementById("transfer-form").reset();
});
  
/*********************************
 * Transaction History CSV Download
 *********************************/
document.getElementById("download-history").addEventListener("click", () => {
  if (currentUser.transactions.length === 0) {
    alert("No transactions to download.");
    return;
  }
  let csv = "";
  csv += "NeoBank Transaction History\n\n";
  csv += `User Details:,Account Number: ${currentUser.accountNumber},User ID: ${currentUser.userId}\n\n`;
  csv += "Date,Type,Amount,Details\n";
  currentUser.transactions.forEach(tx => {
    csv += `${tx.date},${tx.type},${tx.amount.toFixed(2)},${tx.details}\n`;
  });
  csv += "\nThank you for banking with NeoBank.\n";
  triggerDownload("transaction_history.csv", csv);
});
  
/*********************************
 * Manage Account
 *********************************/
document.getElementById("change-username-btn").addEventListener("click", () => {
  const oldPwd = document.getElementById("old-username-pwd").value.trim();
  const newUsername = document.getElementById("new-username").value.trim();
  if (oldPwd !== currentUser.password) {
    alert("Incorrect password for username change.");
    return;
  }
  if (!newUsername) {
    alert("Please enter a new username.");
    return;
  }
  currentUser.userId = newUsername;
  updateUser(currentUser);
  triggerDownload("new_username.txt", `Your username has been changed.\nNew Username: ${newUsername}`);
  alert("Username changed successfully.");
  document.getElementById("new-username").value = "";
  renderDashboard();
});
  
document.getElementById("change-password-btn").addEventListener("click", () => {
  const oldPwd = document.getElementById("old-password").value.trim();
  const newPwd = document.getElementById("new-password").value.trim();
  if (oldPwd !== currentUser.password) {
    alert("Incorrect current password.");
    return;
  }
  if (!newPwd) {
    alert("Please enter a new password.");
    return;
  }
  currentUser.password = newPwd;
  updateUser(currentUser);
  triggerDownload("new_password.txt", `Your password has been changed.\nNew Password: ${newPwd}`);
  alert("Password changed successfully.");
  document.getElementById("new-password").value = "";
});
  
document.getElementById("delete-account-btn").addEventListener("click", () => {
  const delPwd = document.getElementById("delete-pwd").value.trim();
  const reason = document.getElementById("delete-reason").value.trim();
  if (delPwd !== currentUser.password) {
    alert("Incorrect password for account deletion.");
    return;
  }
  const content = `Account Deletion Details:\nAccount: ${currentUser.accountNumber}\nUser: ${currentUser.userId}\nReason: ${reason}\nDate: ${new Date().toLocaleString()}`;
  triggerDownload("deletion_details.txt", content);
  removeUser(currentUser.accountNumber);
  alert("Account deleted successfully.");
  currentUser = null;
  showAuthPage("login");
  loginQRCode = generateQRCode("login-qr");
});
  
/*********************************
 * Admin Panel Functions
 *********************************/
document.getElementById("admin-change-username-btn").addEventListener("click", () => {
  if (!adminManageTarget) return;
  const newUser = document.getElementById("admin-new-username").value.trim();
  if (!newUser) {
    alert("Enter a new username.");
    return;
  }
  adminManageTarget.userId = newUser;
  updateUser(adminManageTarget);
  triggerDownload("admin_changed_username.txt", `Admin changed username.\nAccount: ${adminManageTarget.accountNumber}\nNew Username: ${newUser}`);
  alert("Username changed successfully by Admin.");
  document.getElementById("admin-new-username").value = "";
  if (currentUser.accountNumber === adminManageTarget.accountNumber) {
    currentUser = adminManageTarget;
    document.querySelector(".logo_name").textContent = currentUser.userId;
  }
});
  
document.getElementById("admin-change-password-btn").addEventListener("click", () => {
  if (!adminManageTarget) return;
  const newPass = document.getElementById("admin-new-password").value.trim();
  if (!newPass) {
    alert("Enter a new password.");
    return;
  }
  adminManageTarget.password = newPass;
  updateUser(adminManageTarget);
  triggerDownload("admin_changed_password.txt", `Admin changed password.\nAccount: ${adminManageTarget.accountNumber}\nNew Password: ${newPass}`);
  alert("Password changed successfully by Admin.");
  document.getElementById("admin-new-password").value = "";
  if (currentUser.accountNumber === adminManageTarget.accountNumber) {
    currentUser = adminManageTarget;
  }
});
  
document.getElementById("admin-delete-account-btn").addEventListener("click", () => {
  if (!adminManageTarget) return;
  const reason = document.getElementById("admin-delete-reason").value.trim();
  const content = `User Deletion by Admin:\nAccount: ${adminManageTarget.accountNumber}\nUser: ${adminManageTarget.userId}\nReason: ${reason}\nDate: ${new Date().toLocaleString()}`;
  triggerDownload("admin_user_deletion.txt", content);
  removeUser(adminManageTarget.accountNumber);
  alert(`User ${adminManageTarget.userId} deleted successfully.`);
  showUsersList();
});
  
/*********************************
 * Admin View Users
 *********************************/
document.getElementById("admin-view").addEventListener("click", showUsersList);
  
function showUsersList() {
  const list = document.getElementById("users-list");
  list.innerHTML = "";
  const users = getUsers().filter(u => !u.isAdmin);
  if (users.length === 0) {
    list.innerHTML = "<li>No users found.</li>";
  } else {
    users.forEach(u => {
      const li = document.createElement("li");
      li.style.margin = "8px 0";
      li.textContent = `Acc: ${u.accountNumber} | User: ${u.userId} | Balance: $${u.balance.toFixed(2)}`;
      const manageBtn = document.createElement("button");
      manageBtn.textContent = "Select";
      manageBtn.classList.add("red-highlight");
      manageBtn.style.marginLeft = "10px";
      manageBtn.addEventListener("click", () => {
        adminManageTarget = u;
        alert(`Selected user ${u.userId} for management.`);
      });
      li.appendChild(manageBtn);
      list.appendChild(li);
    });
  }
  showInlineSection("admin");
}
  
/*********************************
 * File Download Helper
 *********************************/
function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
  
/*********************************
 * Sidebar, Dark Mode & Responsive UI
 *********************************/
const body = document.querySelector("body");
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.querySelector(".sidebar-toggle");
  
let getMode = localStorage.getItem("mode");
if(getMode && getMode === "dark"){
  body.classList.add("dark");
}
  
let getStatus = localStorage.getItem("status");
if(getStatus && getStatus === "close"){
  sidebar.classList.add("close");
}
  
document.getElementById("dark-mode-toggle").addEventListener("click", (e) => {
  e.preventDefault();
  body.classList.toggle("dark");
  if(body.classList.contains("dark")){
    localStorage.setItem("mode", "dark");
  } else {
    localStorage.setItem("mode", "light");
  }
});
  
sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("close");
  if(sidebar.classList.contains("close")){
    localStorage.setItem("status", "close");
  } else {
    localStorage.setItem("status", "open");
  }
});
  
document.getElementById("nav-logout").addEventListener("click", () => {
  currentUser = null;
  showAuthPage("login");
  loginQRCode = generateQRCode("login-qr");
});
