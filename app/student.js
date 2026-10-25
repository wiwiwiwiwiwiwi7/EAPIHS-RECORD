const student = loadStudent();
const sectionStorageKey = "eapihs-teacher-sections";
const enrollmentStorageKey = "eapihs-section-enrollments";
const sections = loadJson(sectionStorageKey, []);
const enrollments = loadJson(enrollmentStorageKey, {});

function loadStudent() {
  try {
    return JSON.parse(localStorage.getItem("eapihs-current-student") ?? "null") ?? {
      name: "Demo Student",
      lrn: "123456789012",
      qrValue: "EAPIHS-LRN-123456789012",
    };
  } catch {
    return { name: "Demo Student", lrn: "123456789012", qrValue: "EAPIHS-LRN-123456789012" };
  }
}

function loadJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSectionId(section) {
  if (section.id) return section.id;
  const source = `${section.grade}-${section.name}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  const code = source.replace(/-/g, "").slice(0, 6).padEnd(6, "X");
  return `SECTION-${code}-${stringHash(source)}`;
}

function stringHash(value) {
  let hash = 0;
  for (const character of value) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 6).padEnd(6, "0");
}

function ensureSectionIds() {
  let changed = false;
  for (const section of sections) {
    if (!section.id) {
      section.id = getSectionId(section);
      changed = true;
    }
  }
  if (changed) saveJson(sectionStorageKey, sections);
}

ensureSectionIds();
document.querySelector("#student-name").textContent = student.name;
document.querySelector("#student-lrn").textContent = student.lrn;
document.querySelector("#student-qr-value").textContent = student.qrValue;

const qrFrame = document.querySelector(".qr-frame");
qrFrame.replaceChildren();
const qrHost = document.createElement("div");
qrFrame.append(qrHost);
new QRCode(qrHost, {
  text: student.qrValue,
  width: 280,
  height: 280,
  correctLevel: QRCode.CorrectLevel.H,
});

document.querySelector("#download-qr").addEventListener("click", () => {
  const qrImage = qrHost.querySelector("img") ?? qrHost.querySelector("canvas");
  if (!qrImage) return;
  const link = document.createElement("a");
  link.download = `EAPIHS-LRN-${student.lrn}.png`;
  link.href = qrImage.tagName === "CANVAS" ? qrImage.toDataURL("image/png") : qrImage.src;
  link.click();
});

function renderJoinedSections() {
  const list = document.querySelector("#student-section-list");
  list.replaceChildren();
  const joinedIds = Object.keys(enrollments).filter((id) =>
    enrollments[id].some((entry) => entry.lrn === student.lrn),
  );

  for (const id of joinedIds) {
    const section = sections.find((entry) => getSectionId(entry) === id);
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const details = document.createElement("span");
    name.textContent = section ? `${section.name} Section` : id;
    details.textContent = section ? `Grade ${section.grade} · ${id}` : id;
    item.append(name, details);
    list.append(item);
  }
}

renderJoinedSections();

document.querySelector("#join-section-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const sectionId = document.querySelector("#section-id").value.trim().toUpperCase();
  const status = document.querySelector("#join-status");
  const section = sections.find((entry) => getSectionId(entry) === sectionId);

  if (!section) {
    status.dataset.state = "error";
    status.textContent = "Section ID not found on this device.";
    return;
  }

  enrollments[sectionId] ??= [];
  if (!enrollments[sectionId].some((entry) => entry.lrn === student.lrn)) {
    enrollments[sectionId].push({ lrn: student.lrn, name: student.name, source: "student-id" });
    saveJson(enrollmentStorageKey, enrollments);
  }

  status.dataset.state = "success";
  status.textContent = `You joined Grade ${section.grade} ${section.name}.`;
  document.querySelector("#section-id").value = "";
  renderJoinedSections();
});
