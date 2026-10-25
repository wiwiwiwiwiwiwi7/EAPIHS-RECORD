const authForm = document.querySelector("#auth-form");
const nameField = document.querySelector("#name-field");
const fullNameInput = document.querySelector("#full-name");
const lrnField = document.querySelector("#lrn-field");
const lrnInput = document.querySelector("#lrn");
const roleField = document.querySelector("#role-field");
const passwordField = document.querySelector("#password");
const passwordLabel = document.querySelector("#password-label");
const submitLabel = document.querySelector("#submit-label");
const modePrompt = document.querySelector("#mode-prompt");
const modeToggle = document.querySelector("#mode-toggle");
const formStatus = document.querySelector("#form-status");

let currentMode = "login";

function showStatus(message, state = "success") {
  formStatus.textContent = message;
  formStatus.dataset.state = state;
}

function setMode(mode) {
  currentMode = mode;
  const isSignup = mode === "signup";

  const isStudentSignup = isSignup && document.querySelector("#role").value === "student";
  nameField.hidden = !isSignup;
  fullNameInput.required = isSignup;
  roleField.hidden = !isSignup;
  lrnField.hidden = !isStudentSignup;
  lrnInput.required = isStudentSignup;
  passwordField.autocomplete = isSignup ? "new-password" : "current-password";
  passwordField.placeholder = isSignup ? "Create a password" : "Enter your password";
  passwordLabel.textContent = isSignup ? "CREATE PASSWORD" : "SECURE PIN / PASSWORD";
  submitLabel.textContent = isSignup ? "Create Account" : "Secure Login";
  modePrompt.textContent = isSignup ? "Already have an account?" : "Don't have an account yet?";
  modeToggle.textContent = isSignup ? "Sign in" : "Sign up";
  document.querySelector("#portal-title").textContent = isSignup ? "Create account" : "EAPIHS Portal";
  showStatus("");
}

document.querySelector("#role").addEventListener("change", () => setMode(currentMode));

modeToggle.addEventListener("click", () => {
  setMode(currentMode === "login" ? "signup" : "login");
});

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    const role = button.dataset.demo;
    if (role === "teacher") {
      window.location.href = "teacher.html";
      return;
    }

    if (role === "student") {
      window.location.href = "student.html";
      return;
    }

    document.querySelector("#email").value = "teacher@eapihs.edu.ph";
    passwordField.value = "demo1234";
    showStatus("Teacher details filled. Sign-in is not connected yet.");
  });
});

authForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!authForm.reportValidity()) {
    showStatus("Please complete the required fields.", "error");
    return;
  }

  if (currentMode === "signup") {
    const selectedRole = document.querySelector("#role").value;
    if (selectedRole === "student") {
      const student = {
        lrn: lrnInput.value.trim(),
        name: fullNameInput.value.trim(),
        email: document.querySelector("#email").value.trim(),
        qrValue: `EAPIHS-LRN-${lrnInput.value.trim()}`,
      };
      window.localStorage.setItem("eapihs-current-student", JSON.stringify(student));
      window.location.href = "student.html";
      return;
    }
    showStatus("Details look good for the preview. Account creation needs a backend.");
    return;
  }

  showStatus("Sign-in preview only. Account verification is not connected yet.");
});