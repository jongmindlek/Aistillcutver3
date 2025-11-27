const form = document.querySelector("#reservation-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // ★ 새로고침 방지

  const data = {
    name: document.querySelector("#name").value,
    phone: document.querySelector("#phone").value,
    date: document.querySelector("#date").value,
    time: document.querySelector("#time").value,
    message: document.querySelector("#message").value,
  };

  try {
    const res = await fetch("/api/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (result.ok) {
      alert("예약이 정상적으로 등록되었습니다!");
      form.reset();
    } else {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  } catch (err) {
    console.error(err);
    alert("서버 연결 오류");
  }
});