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

// Form Submission Handlers
function handleLogin(e) {
  e.preventDefault()
  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value
  const messageDiv = document.getElementById("loginMessage")

  if (email && password) {
    messageDiv.textContent = "Login successful! Redirecting..."
    messageDiv.classList.add("success")
    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  } else {
    messageDiv.textContent = "Please fill in all fields"
    messageDiv.classList.add("error")
  }
}

function handleSignup(e) {
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

  messageDiv.textContent = "Account created successfully! Redirecting to login..."
  messageDiv.classList.add("success")
  setTimeout(() => {
    window.location.href = "login.html"
  }, 1500)
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
