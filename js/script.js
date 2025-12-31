// Mobile Menu Toggle
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("navMenu")

if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active")
    navMenu.classList.toggle("active")
  })
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  })
})

// Set Active Nav Link
window.addEventListener("scroll", () => {
  const navLinks = document.querySelectorAll(".nav-link")
  navLinks.forEach((link) => {
    link.classList.remove("active")
  })

  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active")
    }
  })
})

// Page Load Setup
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active")
    }
  })

  const navAuth = document.querySelector(".nav-auth")
  if (navAuth) {
    getMe().then((user) => {
      if (user) {
        navAuth.innerHTML = `<a href="#" id="logoutBtn" class="btn btn-login">Logout</a>`
        const logoutBtn = document.getElementById("logoutBtn")
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault()
            try {
              await apiRequest("/api/auth/logout", { method: "POST" })
            } finally {
              window.location.href = "index.html"
            }
          })
        }

        if (currentPage === "login.html" || currentPage === "signup.html") {
          window.location.href = "index.html"
        }
      } else {
        if (currentPage === "login.html" && getQueryParam("registered") === "1") {
          const messageDiv = document.getElementById("loginMessage")
          setMessage(messageDiv, "Account created. Please log in.", "success")
        }

        if (
          document.body?.dataset?.requireAuth === "true" &&
          currentPage !== "login.html" &&
          currentPage !== "signup.html"
        ) {
          window.location.href = `login.html?next=${encodeURIComponent(currentPage)}`
        }
      }
    })
  }
})

// Form Validation Utility
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validateForm(formId) {
  const form = document.getElementById(formId)
  if (!form) return true

  const inputs = form.querySelectorAll("input, textarea")
  let isValid = true

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false
      input.classList.add("error")
    } else {
      input.classList.remove("error")
    }
  })

  const emailInput = form.querySelector('input[type="email"]')
  if (emailInput && emailInput.value && !validateEmail(emailInput.value)) {
    isValid = false
    emailInput.classList.add("error")
  }

  return isValid
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search)
  return params.get(name)
}

async function apiRequest(url, options) {
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  })

  const contentType = res.headers.get("content-type") || ""
  const body = contentType.includes("application/json") ? await res.json() : null

  if (!res.ok) {
    const error = body?.error || "REQUEST_FAILED"
    const message = body?.message || ""
    const err = new Error(message || error)
    err.code = error
    throw err
  }

  return body
}

async function getMe() {
  try {
    const data = await apiRequest("/api/auth/me", { method: "GET" })
    return data?.user || null
  } catch (_e) {
    return null
  }
}

function setMessage(messageDiv, message, kind) {
  if (!messageDiv) return
  messageDiv.textContent = message
  messageDiv.classList.remove("success")
  messageDiv.classList.remove("error")
  if (kind) messageDiv.classList.add(kind)
}

// Form Submission Handlers
async function handleLogin(e) {
  e.preventDefault()
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value
  const messageDiv = document.getElementById("loginMessage")

  if (!email || !password) {
    setMessage(messageDiv, "Please fill in all fields", "error")
    return
  }

  try {
    setMessage(messageDiv, "Logging in...", "success")
    await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const next = getQueryParam("next")
    window.location.href = next ? next : "index.html"
  } catch (err) {
    const code = err?.code
    if (code === "INVALID_CREDENTIALS") setMessage(messageDiv, "Invalid email or password", "error")
    else setMessage(messageDiv, "Login failed. Please try again.", "error")
  }
}

async function handleSignup(e) {
  e.preventDefault()
  const name = document.getElementById("signup-name").value
  const email = document.getElementById("signup-email").value
  const password = document.getElementById("signup-password").value
  const confirm = document.getElementById("signup-confirm").value
  const messageDiv = document.getElementById("signupMessage")

  if (!name || !email || !password || !confirm) {
    messageDiv.textContent = "Please fill in all fields"
    messageDiv.classList.add("error")
    return
  }

  if (!validateEmail(email)) {
    messageDiv.textContent = "Please enter a valid email"
    messageDiv.classList.add("error")
    return
  }

  if (password !== confirm) {
    messageDiv.textContent = "Passwords do not match"
    messageDiv.classList.add("error")
    return
  }

  if (password.length < 6) {
    messageDiv.textContent = "Password must be at least 6 characters"
    messageDiv.classList.add("error")
    return
  }

  try {
    setMessage(messageDiv, "Creating account...", "success")
    await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
    window.location.href = "login.html?registered=1"
  } catch (err) {
    const code = err?.code
    if (code === "EMAIL_IN_USE") setMessage(messageDiv, "Email is already registered", "error")
    else if (code === "WEAK_PASSWORD") setMessage(messageDiv, "Password must be at least 6 characters", "error")
    else if (code === "INVALID_EMAIL") setMessage(messageDiv, "Please enter a valid email", "error")
    else setMessage(messageDiv, "Sign up failed. Please try again.", "error")
  }
}

function handleContactSubmit(e) {
  e.preventDefault()
  if (validateForm("contactForm")) {
    const messageDiv = document.getElementById("formMessage")
    messageDiv.textContent = "Thank you! We will get back to you soon."
    messageDiv.classList.add("success")
    document.getElementById("contactForm").reset()
    setTimeout(() => {
      messageDiv.classList.remove("success")
      messageDiv.textContent = ""
    }, 3000)
  }
}
