import { db } from "./firebase-config.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const projectForm = document.getElementById("projectForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const imagesInput = document.getElementById("images");
const previewContainer = document.getElementById("previewContainer");
const saveBtn = document.getElementById("saveBtn");
const statusMessage = document.getElementById("statusMessage");

// cloudinary Info
const CLOUD_NAME = "dhoigmq1n";
const UPLOAD_PRESET = "portfolio_upload";

let selectedFiles = [];
let selectedCoverIndex = null;

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type === "success") {
    statusMessage.classList.add("status-success");
  } else if (type === "error") {
    statusMessage.classList.add("status-error");
  } else {
    statusMessage.classList.add("status-info");
  }
}

function renderImagePreviews() {
  previewContainer.innerHTML = "";

  if (!selectedFiles.length) {
    previewContainer.innerHTML = `<p class="preview-placeholder">Upload images first, then choose one as cover image.</p>`;
    return;
  }

  selectedFiles.forEach((file, index) => {
    const imageUrl = URL.createObjectURL(file);

    const card = document.createElement("div");
    card.className = "preview-card";
    if (selectedCoverIndex === index) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <img src="${imageUrl}" alt="Preview" class="preview-image">
      <p class="preview-label">${selectedCoverIndex === index ? "Cover Image" : "Click to set as cover"}</p>
    `;

    card.addEventListener("click", () => {
      selectedCoverIndex = index;
      renderImagePreviews();
    });

    previewContainer.appendChild(card);
  });
}

imagesInput.addEventListener("change", (e) => {
  selectedFiles = Array.from(e.target.files);
  selectedCoverIndex = selectedFiles.length ? 0 : null; // أول صورة تكون Cover افتراضيًا
  renderImagePreviews();
});

async function uploadSingleImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Image upload failed");
  }

  return data.secure_url;
}

async function uploadAllImages(files) {
  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    setStatus(`Uploading image ${i + 1} of ${files.length}...`, "info");

    const imageUrl = await uploadSingleImageToCloudinary(files[i]);
    uploadedUrls.push(imageUrl);
  }

  return uploadedUrls;
}

projectForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;

  if (!title || !description || !category) {
    setStatus("Please fill all required fields.", "error");
    return;
  }

  if (!selectedFiles.length) {
    setStatus("Please upload at least one image.", "error");
    return;
  }

  if (selectedCoverIndex === null) {
    setStatus("Please select a cover image.", "error");
    return;
  }

  saveBtn.disabled = true;

  try {
    setStatus("Uploading images...", "info");

    const uploadedImageUrls = await uploadAllImages(selectedFiles);
    const coverImage = uploadedImageUrls[selectedCoverIndex];

    const projectData = {
      title,
      description,
      category,
      coverImage,
      images: uploadedImageUrls,
      createdAt: Date.now()
    };

    await push(ref(db, "projects"), projectData);

    setStatus("Project saved successfully!", "success");

    // Reset form
    projectForm.reset();
    selectedFiles = [];
    selectedCoverIndex = null;
    renderImagePreviews();

  } catch (error) {
    console.error("Error saving project:", error);
    setStatus(error.message || "Something went wrong while saving the project.", "error");
  } finally {
    saveBtn.disabled = false;
  }
});

// أول تحميل
renderImagePreviews();