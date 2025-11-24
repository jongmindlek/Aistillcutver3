// js/crew.js
const directorsList = document.getElementById("directorsList");
const staffList = document.getElementById("staffList");
const crewStatus = document.getElementById("crewStatus");
const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const kakaoApplyBtn = document.getElementById("kakaoApplyBtn");

let allDirectors = [];
let allStaff = [];

function escapeHtml(s=""){
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m]));
}

function renderPerson(p){
  const initials = (p.name||"?").slice(0,1);
  const skills = (p.skills||[]).map(x=>`<span class="badge">${escapeHtml(x)}</span>`).join("");
  const roles = (p.roles||[]).map(x=>`<span class="badge">${escapeHtml(x)}</span>`).join("");

  return `
    <div class="person">
      <div class="avatar">
        ${p.profileImage ? `<img src="${p.profileImage}" alt="${escapeHtml(p.name)}"/>` : initials}
      </div>
      <div class="meta">
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="badges">
          ${p.mainRole ? `<span class="badge">${escapeHtml(p.mainRole)}</span>` : ""}
          ${roles}
          ${skills}
        </div>
        ${p.bio ? `<div style="color:var(--muted);font-size:13px;margin-top:4px;">${escapeHtml(p.bio)}</div>` : ""}
        <div style="color:var(--muted);font-size:12px;margin-top:4px;">
          ${p.instagram ? `IG: <a href="${p.instagram}" target="_blank">${p.instagram}</a>` : ""}
          ${p.phone ? ` · ${p.phone}` : ""}
          ${p.email ? ` · ${p.email}` : ""}
        </div>
      </div>
    </div>
  `;
}

function applyFilter(){
  const q = (searchInput.value||"").toLowerCase().trim();
  const rf = roleFilter.value;

  const filterFn = (p) => {
    if (rf && (p.mainRole||"").toLowerCase() !== rf) return false;
    if (!q) return true;
    const hay = [
      p.name, p.mainRole, ...(p.roles||[]), ...(p.skills||[]), p.bio
    ].join(" ").toLowerCase();
    return hay.includes(q);
  };

  directorsList.innerHTML = allDirectors.filter(filterFn).map(renderPerson).join("") || 
    `<div class="notice">Director 없음</div>`;
  staffList.innerHTML = allStaff.filter(filterFn).map(renderPerson).join("") || 
    `<div class="notice">Staff 없음</div>`;
}

async function loadCrew(){
  crewStatus.textContent = "불러오는 중…";
  try{
    const res = await fetch("/.netlify/functions/notion-crew");
    if(!res.ok) throw new Error("network");
    const data = await res.json();

    allDirectors = data.directors || [];
    allStaff = data.staff || [];

    applyFilter();
    crewStatus.textContent = `Directors ${allDirectors.length}명 · Staff ${allStaff.length}명`;
  }catch(e){
    crewStatus.innerHTML = `<span class="error">crew 불러오기 실패</span>`;
    directorsList.innerHTML = `<div class="notice error">crew 불러오기 실패</div>`;
    staffList.innerHTML = `<div class="notice error">crew 불러오기 실패</div>`;
    console.error(e);
  }
}

searchInput.addEventListener("input", applyFilter);
roleFilter.addEventListener("change", applyFilter);

// 카톡 버튼: 개인 카톡(나에게)로 보내는 UX
kakaoApplyBtn.addEventListener("click", ()=>{
  // 카카오톡 설치된 환경이면 공유창으로 넘길 수 있는데,
  // 외부 SDK 없이 "복사 + 카톡 보내기"가 가장 안꼬이는 방식.
  const template =
`[Fiducia Crew 지원]
이름:
역할(감독/스태프):
스킬:
포트폴리오 링크:
연락처:
간단 소개:`;
  navigator.clipboard.writeText(template).then(()=>{
    alert("지원 템플릿을 복사했어요. 개인 카톡(나에게)에 붙여넣어 보내주세요!");
  }).catch(()=>{
    alert("복사 실패. 아래 텍스트를 수동으로 복사해 카톡(나에게)에 보내주세요:\n\n"+template);
  });
});

loadCrew();