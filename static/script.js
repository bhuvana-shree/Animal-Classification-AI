const form = document.getElementById("uploadForm");
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const fileText = document.getElementById("fileText");
const button = document.getElementById("classifyButton");
const statusBox = document.getElementById("status");
const resultsBox = document.getElementById("results");
const predictionList = document.getElementById("predictionList");

input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file) {
        fileText.textContent = "Choose an image";
        preview.style.display = "none";
        return;
    }

    fileText.textContent = file.name;
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    statusBox.textContent = "";
    resultsBox.classList.add("hidden");
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = input.files[0];
    if (!file) {
        statusBox.textContent = "Please select an image first.";
        return;
    }

    const data = new FormData();
    data.append("image", file);

    button.disabled = true;
    button.textContent = "Classifying...";
    statusBox.textContent = "AI is analyzing the image...";
    resultsBox.classList.add("hidden");

    try {
        const response = await fetch("/predict", {
            method: "POST",
            body: data
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Classification failed.");
        }

        predictionList.innerHTML = "";

        result.predictions.forEach((prediction) => {
            const item = document.createElement("div");
            item.className = "prediction";

            item.innerHTML = `
                <div class="prediction-top">
                    <span class="label">${prediction.label}</span>
                    <span class="confidence">${prediction.confidence}%</span>
                </div>
                <div class="bar">
                    <div class="fill" style="width: ${prediction.confidence}%"></div>
                </div>
            `;

            predictionList.appendChild(item);
        });

        resultsBox.classList.remove("hidden");
        statusBox.textContent = "Classification completed.";
    } catch (error) {
        statusBox.textContent = error.message;
    } finally {
        button.disabled = false;
        button.textContent = "Classify Image";
    }
});
