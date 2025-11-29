// js/stillcut.js

async function handleStillcutSubmit(event) {
  event.preventDefault();

  const statusEl = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitButton");

  statusEl.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "전송 중...";

  // 폼 값 읽기
  const projectTitle = document.getElementById("projectTitle").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const videoType = document.getElementById("videoType").value;
  const runtime = document.getElementById("runtime").value;
  const budget = document.getElementById("budget").value;
  const shootDate = document.getElementById("shootDate").value;
  const location = document.getElementById("location").value.trim();
  const referenceLink = document.getElementById("referenceLink").value.trim();
  const message = document.getElementById("message").value.trim();

  const imageInput = document.getElementById("imageFiles");
  const imagesMeta = Array.from(imageInput.files || []).slice(0, 5).map((file) => {
    const sizeKB = Math.round(file.size / 1024);
    return `${file.name} (${sizeKB}KB)`;
  });

  // 간단 검증
  if (!projectTitle || !email || !phone || !videoType || !runtime || !budget || !shootDate || !location || !message) {
    statusEl.textContent = "필수 항목을 모두 입력해 주세요.";
    statusEl.classList.add("fc-status-message--error");
    submitBtn.disabled = false;
    submitBtn.textContent = "예약 제출";
    return;
  }

  try {
    const res = await fetch("/.netlify/functions/notion-stillcut", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectTitle,
        email,
        phone,
        videoType,
        runtime,
        budget,
        shootDate,
        location,
        referenceLink,
        images: imagesMeta,
        message,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.ok === false) {
      const msg =
        data && data.message
          ? data.message
          : "서버 오류: 예약 저장 중 문제가 발생했습니다.";
      alert(msg);
      statusEl.textContent = "예약 저장에 실패했습니다. 다시 시도해 주세요.";
      statusEl.classList.add("fc-status-message--error");
    } else {
      statusEl.textContent = "예약이 정상적으로 접수되었습니다.";
      statusEl.classList.remove("fc-status-message--error");
      statusEl.classList.add("fc-status-message--success");
      (document.getElementById("stillcutForm") || {}).reset?.();
    }
  } catch (error) {
    console.error("Notion stillcut error", error);
    alert("네트워크 또는 서버 오류가 발생했습니다.");
    statusEl.textContent = "예약 저장에 실패했습니다. 다시 시도해 주세요.";
    statusEl.classList.add("fc-status-message--error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "예약 제출";
  }
}

// 이미지 선택하면 리스트로 보여주기
function setupImagePreview() {
  const input = document.getElementById("imageFiles");
  const preview = document.getElementById("imagePreview");
  if (!input || !preview) return;

  input.addEventListener("change", () => {
    preview.innerHTML = "";
    const files = Array.from(input.files || []).slice(0, 5);
    files.forEach((file) => {
      const li = document.createElement("li");
      const sizeKB = Math.round(file.size / 1024);
      li.textContent = `${file.name} (${sizeKB}KB)`;
      preview.appendChild(li);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("stillcutForm");
  if (form) {
    form.addEventListener("submit", handleStillcutSubmit);
  }
  setupImagePreview();
});