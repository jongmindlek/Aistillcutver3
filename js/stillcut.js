// js/stillcut.js
const form = document.getElementById("stillcutForm");
const submitStatus = document.getElementById("submitStatus");
const fileInput = form.elements["images"];
const fileListEl = document.getElementById("fileList");

function showStatus(msg, type=""){
  submitStatus.style.display = "block";
  submitStatus.className = "notice " + type;
  submitStatus.textContent = msg;
}

function readFilesMeta(files){
  const arr = [];
  for(const f of files){
    arr.push({
      name: f.name,
      size: f.size,
      type: f.type
    });
  }
  return arr.slice(0,5);
}

fileInput.addEventListener("change", ()=>{
  const files = readFilesMeta(fileInput.files || []);
  if(!files.length){
    fileListEl.style.display="none";
    return;
  }
  fileListEl.style.display="block";
  fileListEl.innerHTML = files.map(f=>{
    const kb = Math.round(f.size/1024);
    return `• ${f.name} (${kb}KB)`;
  }).join("<br/>");
});

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  showStatus("전송 중…");

  const fd = new FormData(form);

  const payload = {
    projectTitle: fd.get("projectTitle"),
    phone: fd.get("phone"),
    email: fd.get("email"),
    videoType: fd.get("videoType"),
    runtime: Number(fd.get("runtime")),
    budget: fd.get("budget"),
    shootDate: fd.get("shootDate"),
    location: fd.get("location"),
    referenceLink: fd.get("referenceLink") || "",
    message: fd.get("message"),
    imagesMeta: readFilesMeta(fileInput.files || [])
  };

  try{
    const res = await fetch("/.netlify/functions/notion-stillcut",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(()=> ({}));

    if(!res.ok){
      throw new Error(data.details || data.message || "Notion stillcut error");
    }

    showStatus("예약 완료! 곧 연락드릴게요 🙌", "success");
    form.reset();
    fileListEl.style.display="none";
  }catch(err){
    console.error(err);
    showStatus("예약 실패: Notion stillcut error", "error");
  }
});