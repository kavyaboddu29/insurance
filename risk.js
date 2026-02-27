let hospitalRiskDatabase = {
    "City Care Hospital": 20,
    "LifeLine Medical Center": 40,
    "Metro Health Hospital": 75,
    "Prime Surgical Center": 90
};

let uploadedImageHash = null;
let imageValid = false;

function calculateFraud() {

    let policy = parseInt(document.getElementById("policy").value) || 0;
    let amount = parseInt(document.getElementById("amount").value) || 0;
    let previous = parseInt(document.getElementById("previous").value) || 0;
    let hospitalName = document.getElementById("hospital").value;
    let admission = new Date(document.getElementById("admission").value);
    let discharge = new Date(document.getElementById("discharge").value);

    if (!hospitalName) {
        alert("Select hospital");
        return;
    }

    let hospitalRisk = hospitalRiskDatabase[hospitalName];
    let score = 0;
    let reasons = [];

    // Policy risk
    if (policy < 60) {
        score += 25;
        reasons.push("Short policy duration");
    }

    // High amount
    if (amount > 200000) {
        score += 25;
        reasons.push("High claim amount");
    }

    // Frequent claims
    if (previous > 3) {
        score += 20;
        reasons.push("Multiple previous claims");
    }

    // Hospital risk
    if (hospitalRisk > 80) {
        score += 30;
        reasons.push("High-risk hospital");
    }

    // Admission vs Discharge validation
    if (discharge <= admission) {
        score += 20;
        reasons.push("Invalid hospital stay dates");
    }

    // Pattern combination
    if (policy < 60 && amount > 200000 && previous > 2) {
        score += 15;
        reasons.push("Abnormal surrounding pattern detected");
    }

    // Image validation
    if (!imageValid) {
        score += 30;
        reasons.push("Invalid or edited hospital receipt");
    }

    let decision = "";
    let color = "";

    if (score === 0) {
        decision = "APPROVED ✅";
        color = "green";
    } else {
        decision = "REJECTED 🚫";
        color = "red";
    }

    document.getElementById("result").innerHTML =
        `<span style="color:${color}">
        Fraud Score: ${score}% <br>
        ${decision}
        </span><br><br>
        Reasons: ${reasons.join(", ")}`;
}

// ==============================
// IMAGE VERIFICATION
// ==============================

document.getElementById("imageUpload").addEventListener("change", function(event) {

    let file = event.target.files[0];
    let reader = new FileReader();

    reader.onload = function(e) {

        let imageData = e.target.result;

        // Basic receipt name validation
        if (!file.name.toLowerCase().includes("receipt")) {
            document.getElementById("imageResult").innerHTML =
                "<span style='color:red'>Upload hospital receipt only!</span>";
            imageValid = false;
            return;
        }

        // Simple tamper detection using hash
        let currentHash = btoa(imageData).substring(0,100);

        if (uploadedImageHash && uploadedImageHash !== currentHash) {
            document.getElementById("imageResult").innerHTML =
                "<span style='color:red'>Image appears edited or replaced!</span>";
            imageValid = false;
        } else {
            uploadedImageHash = currentHash;
            document.getElementById("imageResult").innerHTML =
                "<span style='color:green'>Hospital receipt verified</span>";
            imageValid = true;
        }
    };

    reader.readAsDataURL(file);
});