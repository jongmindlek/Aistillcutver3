const form = document.getElementById("stillcutForm");
const statusEl = document.getElementById("stillcutStatus");

function filesToMeta(files){
  if(!files || files.length === 0) return [];
  return Array.from(files).slice(0,5).map(f => ({
    name: f.name,
    size: f.size,
    type: f.type
  }));
}

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  statusEl.textContent = "전송 중...";

  const fd = new FormData(form);

  const payload = {
    projectTitle: fd.get("projectTitle"),
    email: fd.get("email"),
    phone: fd.get("phone"),
    videoType: fd.get("videoType"),
    runtime: fd.get("runtime"),
    budget: fd.get("budget"),
    shootDate: fd.get("shootDate"),
    location: fd.get("location"),
    referenceLink: fd.get("referenceLink"),
    message: fd.get("message"),
    imagesMeta: filesToMeta(fd.getAll("images"))
  };

  try{
    const res = await fetch("/.netlify/functions/notion-stillcut", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if(!res.ok) throw new Error(data?.error || "Notion stillcut error");

    statusEl.textContent = "예약 완료! 확인 후 연락드릴게요.";
    form.reset();
  }catch(err){
    console.error(err);
    statusEl.textContent = "예약 실패: " + err.message;
  }
});