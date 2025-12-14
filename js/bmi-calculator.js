// BMI Calculator
const bmiForm = document.getElementById("bmiForm")
const bmiResults = document.getElementById("bmiResults")

if (bmiForm) {
  bmiForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const height = Number.parseFloat(document.getElementById("height").value)
    const weight = Number.parseFloat(document.getElementById("weight").value)
    const age = Number.parseFloat(document.getElementById("age").value)
    const gender = document.querySelector('input[name="gender"]:checked')?.value
    const goal = document.getElementById("goal").value

    if (!height || !weight || !age || !gender || !goal) {
      alert("Please fill in all fields")
      return
    }

    // Calculate BMI
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)

    // Determine category
    let category = ""
    let categoryColor = ""

    if (bmi < 18.5) {
      category = "Underweight"
      categoryColor = "#3498db"
    } else if (bmi < 25) {
      category = "Healthy Weight"
      categoryColor = "#28a745"
    } else if (bmi < 30) {
      category = "Overweight"
      categoryColor = "#ffc107"
    } else {
      category = "Obese"
      categoryColor = "#dc3545"
    }

    // Calculate daily calorie recommendation
    let bmr = 0

    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
    }

    let calories = 0
    if (goal === "loss") {
      calories = Math.round(bmr * 1.375 - 500) // Moderate activity, deficit
    } else if (goal === "gain") {
      calories = Math.round(bmr * 1.375 + 500) // Moderate activity, surplus
    } else {
      calories = Math.round(bmr * 1.375) // Moderate activity, maintenance
    }

    // Display results
    document.getElementById("bmiNumber").textContent = bmi.toFixed(1)
    document.getElementById("bmiCategory").innerHTML = `
      <div style="font-size: 1.3rem; color: ${categoryColor}; font-weight: 600; margin-bottom: 0.5rem;">
        ${category}
      </div>
      <div style="color: var(--text-secondary);">
        BMI Range: ${category === "Underweight" ? "Below 18.5" : category === "Healthy Weight" ? "18.5 - 24.9" : category === "Overweight" ? "25 - 29.9" : "30+"}
      </div>
    `

    const goalText = goal === "loss" ? "Fat Loss" : goal === "gain" ? "Muscle Gain" : "Maintain Weight"
    document.getElementById("calorieRecommendation").innerHTML = `
      <div style="margin-bottom: 1rem;">
        <strong>Goal:</strong> ${goalText}
      </div>
      <div style="font-size: 1.8rem; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem;">
        ${calories} kcal/day
      </div>
      <div style="color: var(--text-secondary); font-size: 0.9rem;">
        Based on moderate activity level (exercise 3-5 days/week)
      </div>
    `

    bmiResults.style.display = "block"
    bmiResults.scrollIntoView({ behavior: "smooth" })
  })
}
