// script.js
let bmiChart; // Variable to store the Chart instance

// Event listener for the calculate button
document.getElementById('calculate-btn').addEventListener('click', calculateBMI);

function calculateBMI() {
    // Retrieve input values
    const heightCm = parseFloat(document.getElementById('height').value);
    const weightKg = parseFloat(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityLevel = parseFloat(document.getElementById('activity-level').value);

    // Validate inputs
    if (isNaN(heightCm) || isNaN(weightKg) || isNaN(age)) {
        alert('Please enter valid numbers for height, weight, and age.');
        return;
    }

    // Convert height from cm to meters for BMI calculation
    const heightM = heightCm / 100;

    // formula BMI
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);

    // Determine BMI category
    let bmiCategory = '';
    if (bmi < 18.5) {
        bmiCategory = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
        bmiCategory = 'Normal';
    } else if (bmi >= 25 && bmi < 30) {
        bmiCategory = 'Overweight';
    } else {
        bmiCategory = 'Obese';
    }

    // Calculate BMR using the Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }

    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityLevel;

    // Display the results
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <p>Your BMI is <strong>${bmiRounded}</strong> (${bmiCategory}).</p>
        <p>Your BMR (Basal Metabolic Rate) is <strong>${Math.round(bmr)} calories/day</strong>.</p>
        <p>Your TDEE (Total Daily Energy Expenditure) is <strong>${Math.round(tdee)} calories/day</strong>.</p>
    `;

    // Call the function to render the BMI chart
    renderBMIChart(bmiRounded);
    generateRecommendations(bmiRounded, bmiCategory, age, gender, activityLevel);
}

function renderBMIChart(userBMI) {
    const ctx = document.getElementById('bmiChart').getContext('2d');

// BMI Categories
const bmiCategories = [
    { label: "Underweight", max: 18.5, color: "#FF6666" },
    { label: "Normal", max: 25, color: "#66FF66" },
    { label: "Overweight", max: 30, color: "#FFFF66" },
    { label: "Obesity", max: 40, color: "#FF3333" },
];

// Calculate segment values
const segmentValues = [];
let lastMax = 0;
bmiCategories.forEach((category) => {
    segmentValues.push(category.max - lastMax);
    lastMax = category.max;
});

// Data for the doughnut chart
const data = {
    labels: bmiCategories.map((cat) => cat.label),
    datasets: [
        {
            data: segmentValues,
            backgroundColor: bmiCategories.map((cat) => cat.color),
            borderWidth: 0,
        },
    ],
};

// Function to draw the needle
function drawNeedle(chart) {
    const { chartArea } = chart;
    const ctx = chart.chart.ctx; // Access the context correctly
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = chartArea.bottom;
    const needleLength = (chartArea.right - chartArea.left) / 2 - 100;

    // Calculate needle angle based on BMI
    const totalRange = bmiCategories[bmiCategories.length - 1].max;
    const needleAngle = (-Math.PI + (userBMI / totalRange) * Math.PI);

    // Draw needle
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + needleLength * Math.cos(needleAngle),
        centerY + needleLength * Math.sin(needleAngle)
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.restore();

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.restore();
}

// Configuration for the chart
const config = {
    type: "doughnut",
    data: data,
    options: {
        rotation: -Math.PI, // Start angle (top center)
        circumference: Math.PI, // Semi-circle
        cutoutPercentage: 70, // Inner radius
        legend: {
            display: true,
            position: "top",
        },
        tooltips: {
            enabled: false, // Disable tooltips
        },
        animation: {
            animateRotate: true,
            onComplete: function () {
                drawNeedle(this.chart); // Pass the chart instance explicitly
            },
        },
    },
};

// Create the chart
new Chart(ctx, config);

}

function generateRecommendations(bmi, category, age, gender, activityLevel) {
    const recommendationsDiv = document.getElementById('recommendations');
    let exercise, diet, links;

    switch (category) {
        case 'Underweight':
            exercise = 'Focus on strength training to build muscle mass. Include resistance exercises like weightlifting.';
            diet = 'Increase your calorie intake with high-protein meals, whole grains, and healthy fats.';
            links = `<a href="https://www.healthline.com/nutrition/weight-gain-meal-plan">Weight Gain Meal Plan</a>`;
            break;

        case 'Normal':
            exercise = 'Maintain your fitness with a mix of cardio (like jogging or cycling) and strength training.';
            diet = 'Maintain a balanced diet with fruits, vegetables, lean protein, and whole grains.';
            links = `<a href="https://www.choosemyplate.gov/">Balanced Diet Tips</a>`;
            break;

        case 'Overweight':
            exercise = 'Engage in regular cardio workouts (e.g., walking, running, swimming) to burn calories.';
            diet = 'Follow a calorie-deficit diet with high-fiber and low-fat meals.';
            links = `<a href="https://www.eatingwell.com/">Healthy Recipes</a>`;
            break;

        case 'Obese':
            exercise = 'Start with low-impact exercises like walking, swimming, or stationary cycling.';
            diet = 'Adopt a low-calorie, nutrient-dense diet. Focus on vegetables, lean protein, and avoid sugary foods.';
            links = `<a href="https://www.nhs.uk/live-well/healthy-weight/">Weight Loss Advice</a>`;
            break;

        default:
            exercise = 'No specific recommendation.';
            diet = 'No specific recommendation.';
            links = '';
    }

    recommendationsDiv.innerHTML = `
        <h2>Personalized Recommendations</h2>
        <h3>Exercise Routine:</h3>
        <p>${exercise}</p>
        <h3>Diet Suggestions:</h3>
        <p>${diet}</p>
        <h3>Helpful Links:</h3>
        <p>${links}</p>
    `;
}

