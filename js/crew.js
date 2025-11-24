const directorsList = document.getElementById("directorsList");
const staffList = document.getElementById("staffList");
const searchInput = document.getElementById("searchInput");
const skillFilter = document.getElementById("skillFilter");
const roleFilter = document.getElementById("roleFilter");
const kakaoApplyBtn = document.getElementById("kakaoApplyBtn");

// ✅ 너 개인 카톡 링크로 바꿔줘 (오픈채팅 or 1:1 링크)
const KAKAO_LINK = "https://open.kakao.com/o/xxxxxxxx"; 
kakaoApplyBtn.href = KAKAO_LINK;

let crew = [];

function uniq(arr){ return [...new Set(arr.filter(Boolean))]; }

function render(){
  const q = searchInput.value.trim().toLowerCase();
  const sf = skillFilter.value;
  const rf = roleFilter.value;

  const filtered = crew.filter(p=>{
    const hay = [
      p.name, p.mainRole, ...(p.roles||[]), ...(p.skills||[]), p.bio
    ].join(" ").toLowerCase();

    if(q && !hay.includes(q)) return false;
    if(sf && !(p.skills||[]).includes(sf)) return false;
    if(rf && !(p.roles||[]).includes(rf) && p.mainRole !== rf) return false;
    return true;
  });

  const directors = filtered.filter(p=>p.mainRole==="director");
  const staffs = filtered.filter(p=>p.mainRole!=="director");

  directorsList.innerHTML = directors.length ? directors.map(card).join("") : `<div class="help">Director 없음</div>`;
  staffList.innerHTML = staffs.length ? staffs.map(card).join("") : `<div class="help">Staff 없음</div>`;
}

function card(p){
  const tags = [...(p.roles||[]), ...(p.skills||[])].map(t=>`<span class="tag">${t}</span>`).join("");
  const insta = p.instagram ? `<a href="${p.instagram}" target="_blank" class="tag">Instagram</a>` : "";
  const phone = p.phone ? `<span class="tag">${p.phone}</span>` : "";
  const email = p.email ? `<span class="tag">${p.email}</span>` : "";

  return `
    <div class="card">
      <div class="name">${p.name}</div>
      ${p.bio? `<div class="help" style="margin-top:6px;">${p.bio}</div>`:""}
      <div class="tags" style="margin-top:8px;">
        ${tags}
        ${insta}
        ${phone}
        ${email}
      </div>
    </div>
  `;
}

async function loadCrew(){
  directorsList.innerHTML = staffList.innerHTML = "불러오는 중...";
  try{
    const res = await fetch("/.netlify/functions/notion-crew");
    const data = await res.json();
    if(!res.ok) throw new Error(data?.error || "Notion crew fetch error");

    crew = data.items || [];

    // 필터 옵션 채우기
    const allSkills = uniq(crew.flatMap(c=>c.skills||[]));
    const allRoles = uniq(crew.flatMap(c=>[c.mainRole, ...(c.roles||[])]));

    allSkills.forEach(s=>{
      const opt=document.createElement("option"); opt.value=s; opt.textContent=s; skillFilter.appendChild(opt);
    });
    allRoles.forEach(r=>{
      const opt=document.createElement("option"); opt.value=r; opt.textContent=r; roleFilter.appendChild(opt);
    });

    render();
  }catch(err){
    console.error(err);
    directorsList.innerHTML = staffList.innerHTML = `<div class="help">crew 불러오기 실패</div>`;
  }
}

searchInput.addEventListener("input", render);
skillFilter.addEventListener("change", render);
roleFilter.addEventListener("change", render);

loadCrew();