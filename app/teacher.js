const welcomeScreen = document.querySelector("#welcome-screen");
const dashboard = document.querySelector("#teacher-dashboard");
const continueButton = document.querySelector("#welcome-continue");
const teacherMain = document.querySelector(".teacher-main");
const controlCenter = document.querySelector(".control-center");
const sectionsView = document.querySelector("#sections-view");
const sectionsTitle = document.querySelector("#sections-title");
const sectionDashboardView = document.querySelector("#section-dashboard-view");
const sectionDashboardGrade = document.querySelector("#section-dashboard-grade");
const sectionDashboardTitle = document.querySelector("#section-dashboard-title");
const sectionDashboardId = document.querySelector("#section-dashboard-id");
const sectionStudentCode = document.querySelector("#section-student-code");
const addSectionStudentForm = document.querySelector("#add-section-student-form");
const sectionEnrollmentList = document.querySelector("#section-enrollment-list");
const studentEnrollmentStatus = document.querySelector("#student-enrollment-status");
const classListFile = document.querySelector("#class-list-file");
const classListPreview = document.querySelector("#class-list-preview");
const gradebookSection = document.querySelector("#gradebook-section");
const gradebookSubject = document.querySelector("#gradebook-subject");
const gradebookHead = document.querySelector("#gradebook-head");
const gradebookBody = document.querySelector("#gradebook-body");
const gradebookConfigStatus = document.querySelector("#gradebook-config-status");
const activityCountInputs = {
  ww: document.querySelector("#activity-count-ww"),
  pt: document.querySelector("#activity-count-pt"),
  st: document.querySelector("#activity-count-st"),
  te: document.querySelector("#activity-count-te"),
};
const openSectionsButton = document.querySelector("#open-sections");
const openSectionEvidenceButton = document.querySelector("#open-section-evidence");
const evidenceView = document.querySelector("#evidence-view");
const headerSettingsButton = document.querySelector("#header-settings");
const settingsView = document.querySelector("#settings-view");
const settingsTitle = document.querySelector("#settings-title");
const backToSettingsDashboard = document.querySelector("#back-to-settings-dashboard");
const settingsForm = document.querySelector("#settings-form");
const settingsTeacherName = document.querySelector("#settings-teacher-name");
const settingsSchoolYear = document.querySelector("#settings-school-year");
const settingsCameraReminder = document.querySelector("#settings-camera-reminder");
const settingsCompactTable = document.querySelector("#settings-compact-table");
const settingsStatus = document.querySelector("#settings-status");
const logoutButton = document.querySelector("#logout-button");
const evidenceTitle = document.querySelector("#evidence-title");
const backToEvidenceDashboard = document.querySelector("#back-to-evidence-dashboard");
const evidencePhoto = document.querySelector("#evidence-photo");
const evidencePreview = document.querySelector("#evidence-preview");
const evidenceForm = document.querySelector("#evidence-form");
const evidenceSection = document.querySelector("#evidence-section");
const evidenceStudent = document.querySelector("#evidence-student");
const evidenceCategory = document.querySelector("#evidence-category");
const evidenceNumber = document.querySelector("#evidence-number");
const evidenceMaxScore = document.querySelector("#evidence-max-score");
const evidenceAwardedScore = document.querySelector("#evidence-awarded-score");
const evidenceStatus = document.querySelector("#evidence-status");
const evidenceRecordList = document.querySelector("#evidence-record-list");
const backButton = document.querySelector("#back-to-control-center");
const backToSectionsButton = document.querySelector("#back-to-sections");
const addSectionButton = document.querySelector("#add-section");
const sectionDialog = document.querySelector("#section-dialog");
const sectionForm = document.querySelector("#section-form");
const sectionGrade = document.querySelector("#section-grade");
const sectionName = document.querySelector("#section-name");
const sectionList = document.querySelector("#section-list");
const sectionsEmpty = document.querySelector("#sections-empty");
const sectionStatus = document.querySelector("#section-status");
const sectionsStorageKey = "eapihs-teacher-sections";
const activityCountsStorageKey = "eapihs-gradebook-activity-counts";
const enrollmentStorageKey = "eapihs-section-enrollments";
const importedRosterStorageKey = "eapihs-imported-rosters";
const currentStudentStorageKey = "eapihs-current-student";
const evidenceStorageKey = "eapihs-camera-evidence";
const settingsStorageKey = "eapihs-teacher-settings";
const defaultActivityCounts = { ww: 5, pt: 3, st: 2, te: 1 };

let sections = loadSections();
let activityCountsBySection = loadActivityCounts();
let enrollments = loadLocalJson(enrollmentStorageKey, {});
let importedRosters = loadLocalJson(importedRosterStorageKey, {});
let evidenceRecords = loadLocalJson(evidenceStorageKey, []);
let evidencePhotoData = "";
let teacherSettings = loadLocalJson(settingsStorageKey, {});
let activityCounts = { ...defaultActivityCounts };
let activeSection = null;
let activeSectionKey = "";

function showTeacherDashboard() {
  welcomeScreen.hidden = true;
  dashboard.hidden = false;
  teacherMain.classList.add("dashboard-open");
  dashboard.focus({ preventScroll: true });
}

continueButton.addEventListener("click", showTeacherDashboard);
continueButton.addEventListener("touchend", (event) => {
  event.preventDefault();
  showTeacherDashboard();
});

function loadSections() {
  try {
    const savedSections = JSON.parse(window.localStorage.getItem(sectionsStorageKey) ?? "[]");
    const normalized = Array.isArray(savedSections) ? savedSections : [];
    normalized.forEach((section) => ensureSectionId(section));
    return normalized;
  } catch {
    return [];
  }
}

function loadLocalJson(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function stringHash(value) {
  let hash = 0;
  for (const character of value) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return Math.abs(hash).toString(36).toUpperCase().slice(0, 6).padEnd(6, "0");
}

function ensureSectionId(section) {
  if (section.id) return section.id;
  const source = `${section.grade}-${section.name}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  const code = source.replace(/-/g, "").slice(0, 6).padEnd(6, "X");
  section.id = `SECTION-${code}-${stringHash(source)}`;
  return section.id;
}

function loadActivityCounts() {
  try {
    const savedCounts = JSON.parse(window.localStorage.getItem(activityCountsStorageKey) ?? "{}");
    return savedCounts && typeof savedCounts === "object" && !Array.isArray(savedCounts)
      ? savedCounts
      : {};
  } catch {
    return {};
  }
}

function getSectionKey(section) {
  return JSON.stringify([String(section.grade), section.name]);
}

function normalizeActivityCounts(savedCounts = {}) {
  return Object.fromEntries(Object.entries(defaultActivityCounts).map(([key, defaultCount]) => {
    const count = Number(savedCounts[key]);
    return [key, Number.isInteger(count) && count >= 1 && count <= 20 ? count : defaultCount];
  }));
}

function saveActivityCounts() {
  try {
    activityCountsBySection[activeSectionKey] = { ...activityCounts };
    window.localStorage.setItem(activityCountsStorageKey, JSON.stringify(activityCountsBySection));
    return true;
  } catch {
    gradebookConfigStatus.textContent = "Hindi na-save ang bilang ng activities sa browser.";
    gradebookConfigStatus.dataset.state = "error";
    return false;
  }
}

function saveSections() {
  try {
    window.localStorage.setItem(sectionsStorageKey, JSON.stringify(sections));
    return true;
  } catch {
    sectionStatus.textContent = "Hindi na-save ang section. Tingnan ang browser storage settings.";
    sectionStatus.dataset.state = "error";
    return false;
  }
}

function renderSections() {
  sectionList.replaceChildren();
  sectionsEmpty.hidden = sections.length > 0;

  for (const section of sections) {
    const item = document.createElement("li");
    const openButton = document.createElement("button");
    const name = document.createElement("strong");
    const grade = document.createElement("span");
    const removeButton = document.createElement("button");

    item.className = "section-list-item";
    openButton.className = "section-open";
    openButton.type = "button";
    openButton.setAttribute("aria-label", `Open Grade ${section.grade} ${section.name}`);
    name.className = "section-name";
    name.textContent = section.name;
    grade.className = "section-grade";
    grade.textContent = `Grade ${section.grade}`;
    openButton.append(name, grade);
    openButton.addEventListener("click", () => openSection(section));
    removeButton.className = "remove-section";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove Grade ${section.grade} ${section.name}`);
    removeButton.addEventListener("click", () => removeSection(section));
    item.append(openButton, removeButton);
    sectionList.append(item);
  }
}

function getSectionStudents() {
  const sectionStudents = (enrollments[activeSection?.id] ?? []).filter((student) =>
    student.status !== "kicked" && student.status !== "locked",
  );
  return [...sectionStudents].sort((first, second) =>
    getSurname(first.name).localeCompare(getSurname(second.name), "en", { sensitivity: "base" }),
  );
}

function normalizeName(name) {
  const value = String(name ?? "").replace(/\s+/g, " ").trim();
  if (!value) return "";
  if (value.includes(",")) {
    const [surname, given] = value.split(/,/, 2);
    return `${surname.trim().replace(/\b\w/g, (letter) => letter.toUpperCase())}, ${given.trim().replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
  }
  const parts = value.split(" ").filter(Boolean);
  if (parts.length < 2) return parts[0]?.replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "";
  const surname = parts.pop();
  const given = parts.join(" ");
  return `${surname.replace(/\b\w/g, (letter) => letter.toUpperCase())}, ${given.replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
}

function getSurname(name) {
  if (!name) return "";
  const value = String(name).trim();
  if (value.includes(",")) return value.split(",", 1)[0].trim();
  return value.split(/\s+/).at(-1) ?? value;
}

function normalizeGender(value) {
  const gender = String(value ?? "").trim().toUpperCase();
  if (["F", "FEMALE", "GIRL"].includes(gender)) return "FEMALE";
  return "MALE";
}

function normalizeHeader(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findColumn(headers, aliases) {
  return headers.findIndex((header) => aliases.includes(normalizeHeader(header)));
}

function parseClassRows(rows) {
  if (!rows.length) return [];
  const headers = Object.keys(rows[0]);
  const nameIndex = findColumn(headers, ["name", "learners name", "learner name", "student name", "fullname", "full name"]);
  const lrnIndex = findColumn(headers, ["lrn", "learner reference number"]);
  const sexIndex = findColumn(headers, ["sex", "gender", "sex gender"]);
  if (nameIndex < 0 || lrnIndex < 0) {
    throw new Error("Excel needs Name and LRN columns.");
  }

  return rows.map((row) => {
    const values = Object.values(row);
    const lrn = String(values[lrnIndex] ?? "").replace(/[^0-9]/g, "");
    const name = String(values[nameIndex] ?? "").trim();
    if (!name || lrn.length !== 12) return null;
    return { name: normalizeName(name), lrn, gender: sexIndex >= 0 ? normalizeGender(values[sexIndex]) : "MALE", source: "import" };
  }).filter(Boolean);
}

function cleanOcrName(value) {
  return String(value ?? "")
    .replace(/\d+/g, "")
    .replace(/\b(?:LRN|MALE|FEMALE|LEARNERS|NAMES)\b/gi, "")
    .replace(/[|:;]+/g, " ")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ.,'\-\s]/g, " ")
    .replace(/[-.]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(?:\s*[,.]+\s*)+/, "")
    .trim();
}

function parseCoordinateOcrRows(words) {
  const imageWidth = Math.max(...[...words].map((word) => word.bbox?.x1 ?? word.x1 ?? 0), 1);
  const center = imageWidth / 2;
  const wordRows = new Map();
  for (const word of words) {
    const x = word.bbox?.x0 ?? word.x0 ?? 0;
    const half = x < center ? "male" : "female";
    const y = Math.round((word.bbox?.y0 ?? word.baseline?.y0 ?? word.y0 ?? 0) / 12);
    const key = `${half}:${y}`;
    const rowWords = wordRows.get(key) ?? [];
    rowWords.push(word);
    wordRows.set(key, rowWords);
  }

  const students = [];
  const seen = new Set();
  for (const rowWords of wordRows.values()) {
    const wordsInRow = [...rowWords].sort((first, second) => (first.bbox?.x0 ?? first.x0 ?? 0) - (second.bbox?.x0 ?? second.x0 ?? 0));
    const rowText = wordsInRow.map((word) => word.text).join(" ");
    const lrnMatch = rowText.match(/(?<!\d)(\d(?:[\s.-]?\d){11})(?!\d)/);
    if (!lrnMatch) continue;
    const lrn = lrnMatch[1].replace(/\D/g, "");
    if (!/^\d{12}$/.test(lrn) || seen.has(lrn)) continue;
    const rowX = wordsInRow.find((word) => /\d/.test(word.text))?.bbox?.x0 ?? wordsInRow[0]?.x0 ?? 0;
    const cleanedName = cleanOcrName(rowText.replace(lrnMatch[0], ""));
    if (!cleanedName) continue;
    seen.add(lrn);
    students.push({ name: normalizeName(cleanedName), lrn, gender: rowX < center ? "MALE" : "FEMALE", source: "ocr" });
  }
  return students;
}

function parseOcrClassList(text, words = []) {
  const coordinateRows = parseCoordinateOcrRows(words);
  if (coordinateRows.length) return coordinateRows;
  const lines = String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const students = [];
  const seen = new Set();
  let currentGender = "MALE";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const upperLine = line.toUpperCase();
    if (/\bFEMALE\b/.test(upperLine)) currentGender = "FEMALE";
    if (/\bMALE\b/.test(upperLine) && !/\bFEMALE\b/.test(upperLine)) currentGender = "MALE";

    const lrnMatch = line.match(/(?<!\d)(\d(?:[\s.-]?\d){11})(?!\d)/);
    if (!lrnMatch) continue;
    let lrn = lrnMatch[0].replace(/\D/g, "");
    if (!/^\d{12}$/.test(lrn) || seen.has(lrn)) continue;

    let name = line
      .replace(lrnMatch[0], "")
      .replace(/\b(?:LRN|MALE|FEMALE|LEARNERS|NAMES)\b/gi, "")
      .replace(/[|:;]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^[-.\d\s]+/, "")
      .trim();

    if (!name && index > 0) {
      name = lines[index - 1]
        .replace(/\b(?:LRN|MALE|FEMALE|LEARNERS|NAMES)\b/gi, "")
        .replace(/\d{12}/g, "")
        .replace(/^[-.\s]+/, "")
        .trim();
    }
    if (!name && index + 1 < lines.length) {
      name = lines[index + 1]
        .replace(/\b(?:LRN|MALE|FEMALE|LEARNERS|NAMES)\b/gi, "")
        .replace(/^[-.\s]+/, "")
        .trim();
    }

    if (!name || /^(LRN|HIGHEST|SCHOOL|REGION|DIVISION|TEACHER)$/i.test(name)) continue;
    seen.add(lrn);
    students.push({ name: normalizeName(name), lrn, gender: currentGender, source: "ocr" });
  }

  return students;
}

function mergeImportedStudents(importedStudents) {
  const currentStudents = enrollments[activeSection.id] ?? [];
  const byLrn = new Map(currentStudents.map((student) => [student.lrn, student]));
  for (const student of importedStudents) {
    if (!byLrn.has(student.lrn)) {
      byLrn.set(student.lrn, { ...student, status: "not-added" });
    }
  }
  enrollments[activeSection.id] = [...byLrn.values()];
  importedRosters[activeSection.id] = [...byLrn.values()].map((student) => ({ ...student }));
  window.localStorage.setItem(enrollmentStorageKey, JSON.stringify(enrollments));
  window.localStorage.setItem(importedRosterStorageKey, JSON.stringify(importedRosters));
}

classListFile.addEventListener("change", async () => {
  const file = classListFile.files?.[0];
  if (!file || !activeSection) return;

  if (file.type.startsWith("image/")) {
    classListPreview.src = URL.createObjectURL(file);
    classListPreview.hidden = false;
    studentEnrollmentStatus.dataset.state = "success";
    studentEnrollmentStatus.textContent = "Reading class list image...";

    try {
      if (!window.Tesseract) throw new Error("OCR library did not load. Check your internet connection and refresh.");
      const result = await window.Tesseract.recognize(file, "eng", {
        rotateAuto: true,
        preserve_interword_spaces: true,
        tessedit_pageseg_mode: 6,
        logger: (message) => {
          if (message.status === "recognizing text" && message.progress) {
            studentEnrollmentStatus.textContent = `Reading names and LRNs... ${Math.round(message.progress * 100)}%`;
          }
        },
      });
      const importedStudents = parseOcrClassList(result.data.text, result.data.words ?? []);
      if (!importedStudents.length) throw new Error("No 12-digit LRNs with learner names were detected. Try a clearer, brighter, portrait-oriented photo.");
      mergeImportedStudents(importedStudents);
      renderSectionEnrollments();
      renderGradebook();
      studentEnrollmentStatus.dataset.state = "success";
      studentEnrollmentStatus.textContent = `OCR detected ${importedStudents.length} student${importedStudents.length === 1 ? "" : "s"}. Review them before adding.`;
    } catch (error) {
      studentEnrollmentStatus.dataset.state = "error";
      studentEnrollmentStatus.textContent = error.message || "Could not read the class list image.";
    }
    return;
  }

  try {
    if (!window.XLSX) throw new Error("Excel parser did not load. Check your internet connection and refresh.");
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const importedStudents = parseClassRows(rows);
    if (!importedStudents.length) throw new Error("No valid Name and 12-digit LRN rows were found.");
    mergeImportedStudents(importedStudents);
    classListPreview.hidden = true;
    renderSectionEnrollments();
    renderGradebook();
    studentEnrollmentStatus.dataset.state = "success";
    studentEnrollmentStatus.textContent = `Imported ${importedStudents.length} student${importedStudents.length === 1 ? "" : "s"}.`;
  } catch (error) {
    studentEnrollmentStatus.dataset.state = "error";
    studentEnrollmentStatus.textContent = error.message || "Could not import the class list.";
  }
});

function openSection(section) {
  ensureSectionId(section);
  activeSection = section;
  sectionsView.hidden = true;
  sectionDashboardView.hidden = false;
  sectionDashboardGrade.textContent = `GRADE ${section.grade}`;
  sectionDashboardTitle.textContent = section.name;
  sectionDashboardId.textContent = section.id;
  activeSectionKey = getSectionKey(section);
  activityCounts = normalizeActivityCounts(activityCountsBySection[activeSectionKey]);
  for (const [key, input] of Object.entries(activityCountInputs)) {
    input.value = activityCounts[key];
  }
  gradebookSection.value = `Grade ${section.grade} - ${section.name}`;
  gradebookSubject.value = "";
  gradebookConfigStatus.textContent = "";
  renderSectionEnrollments();
  renderGradebook();
  teacherMain.classList.add("section-dashboard-open");
  sectionDashboardTitle.focus();
}

function getGradebookGroups() {
  const numberedActivities = (key, prefix) => Array.from(
    { length: activityCounts[key] },
    (_, index) => ({ key, index, label: `${prefix}${index + 1}` }),
  );

  return [
    {
      key: "ww",
      label: "Written/Oral Works",
      weight: "20%",
      activities: numberedActivities("ww", "WW"),
    },
    {
      key: "pt",
      label: "Product/Performance Tasks",
      weight: "50%",
      activities: numberedActivities("pt", "PT"),
    },
    {
      key: "summative",
      label: "Summative Test/Term Exam",
      weight: "30%",
      activities: [
        ...numberedActivities("st", "ST"),
        ...Array.from({ length: activityCounts.te }, (_, index) => ({
          key: "te",
          index,
          label: activityCounts.te === 1 ? "TE" : `TE${index + 1}`,
        })),
      ],
    },
  ];
}

function createGradebookHeader(text, className, options = {}) {
  const cell = document.createElement("th");
  cell.textContent = text;
  cell.scope = options.scope ?? "col";
  if (className) cell.className = className;
  if (options.rowSpan) cell.rowSpan = options.rowSpan;
  if (options.colSpan) cell.colSpan = options.colSpan;
  return cell;
}

function renderGradebookHead(groups) {
  const columnCount = 3 + groups.reduce((total, group) => total + group.activities.length + 3, 0) + 2;
  const groupRow = document.createElement("tr");
  const activityRow = document.createElement("tr");
  groupRow.className = "gradebook-groups";
  activityRow.className = "gradebook-subheads";
  groupRow.append(createGradebookHeader("", "row-number-heading", { rowSpan: 2 }));
  groupRow.append(createGradebookHeader("LRN", "lrn-heading", { rowSpan: 2 }));
  groupRow.append(createGradebookHeader("LEARNERS' NAMES", "learner-heading", { rowSpan: 2 }));

  for (const group of groups) {
    groupRow.append(createGradebookHeader(`${group.label} (${group.weight})`, "", {
      colSpan: group.activities.length + 3,
      scope: "colgroup",
    }));
    for (const activity of group.activities) {
      activityRow.append(createGradebookHeader(activity.label));
    }
    for (const label of ["Total", "PS", "WS"]) {
      activityRow.append(createGradebookHeader(label));
    }
  }

  groupRow.append(createGradebookHeader("Initial Grade", "grade-heading", { rowSpan: 2 }));
  groupRow.append(createGradebookHeader("Term Grade", "grade-heading", { rowSpan: 2 }));
  gradebookHead.replaceChildren(groupRow, activityRow);
  return columnCount;
}

function captureGradebookValues() {
  const values = new Map();
  for (const input of gradebookBody.querySelectorAll("[data-gradebook-cell-key]")) {
    values.set(input.dataset.gradebookCellKey, input.value);
  }
  return values;
}

function createGradebookInput(label, cellKey, type = "number", previousValues = new Map()) {
  const cell = document.createElement("td");
  const input = document.createElement("input");

  cell.className = label.toUpperCase().includes("LRN")
    ? "gradebook-lrn-cell"
    : type === "text" ? "gradebook-name-cell" : "gradebook-input-cell";
  input.className = "gradebook-input";
  input.type = type;
  input.dataset.gradebookCellKey = cellKey;
  input.setAttribute("aria-label", label);
  input.value = previousValues.get(cellKey) ?? "";
  if (type === "number") {
    input.min = "0";
    input.step = "any";
    input.inputMode = "decimal";
  }
  cell.append(input);
  return cell;
}

function renderGradebook(previousValues = new Map()) {
  const groups = getGradebookGroups();
  const columnCount = renderGradebookHead(groups);
  gradebookBody.replaceChildren();

  const termRow = document.createElement("tr");
  termRow.className = "gradebook-term-row";
  const termNumberCell = document.createElement("td");
  const termCell = document.createElement("th");
  termCell.colSpan = columnCount - 1;
  termCell.scope = "row";
  termCell.textContent = "FIRST TERM";
  termRow.append(termNumberCell, termCell);
  gradebookBody.append(termRow);

  const possibleScoreRow = document.createElement("tr");
  possibleScoreRow.className = "highest-score-row";
  const scoreNumberCell = document.createElement("td");
  const scoreLabelCell = document.createElement("th");
  scoreLabelCell.scope = "row";
  scoreLabelCell.textContent = "HIGHEST POSSIBLE SCORE";
  possibleScoreRow.append(scoreNumberCell, scoreLabelCell);

  for (const group of groups) {
    for (const activity of group.activities) {
      possibleScoreRow.append(createGradebookInput(
        `${activity.label} highest possible score`,
        `highest:${activity.key}:${activity.index}`,
        "number",
        previousValues,
      ));
    }
    possibleScoreRow.append(createGradebookInput(
      `${group.label} total highest possible score`,
      `highest:${group.key}:total`,
      "number",
      previousValues,
    ));
    for (const [label, value] of [["PS", "100.00"], ["WS", group.weight]]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      cell.setAttribute("aria-label", `${group.label} ${label}: ${value}`);
      possibleScoreRow.append(cell);
    }
  }

  possibleScoreRow.append(createGradebookInput("Highest possible initial grade", "highest:initial"));
  possibleScoreRow.append(createGradebookInput("Highest possible term grade", "highest:term"));
  gradebookBody.append(possibleScoreRow);

  for (const gender of ["MALE", "FEMALE"]) {
    const genderRow = document.createElement("tr");
    genderRow.className = "gradebook-gender-row";
    const genderCell = document.createElement("th");
    genderCell.colSpan = columnCount;
    genderCell.scope = "rowgroup";
    genderCell.textContent = gender;
    genderRow.append(genderCell);
    gradebookBody.append(genderRow);

    const genderStudents = getSectionStudents().filter((student) => normalizeGender(student.gender) === gender);
    const visibleRows = Math.max(genderStudents.length, 1);
    for (let rowNumber = 1; rowNumber <= visibleRows; rowNumber += 1) {
      const student = genderStudents[rowNumber - 1];
      const row = document.createElement("tr");
      row.className = "gradebook-learner-row";
      const numberCell = document.createElement("td");
      numberCell.className = "gradebook-row-number";
      numberCell.textContent = rowNumber;
      row.append(numberCell);

      const nameInputCell = createGradebookInput(
        `${gender} learner ${rowNumber} name`,
        `learner:${gender}:${rowNumber}:name`,
        "text",
        previousValues,
      );
      const lrnInputCell = createGradebookInput(
        `${gender} learner ${rowNumber} LRN`,
        `learner:${gender}:${rowNumber}:lrn`,
        "text",
        previousValues,
      );
      nameInputCell.firstElementChild.value = student?.name ?? nameInputCell.firstElementChild.value;
      lrnInputCell.firstElementChild.value = student?.lrn ?? lrnInputCell.firstElementChild.value;
      row.append(lrnInputCell, nameInputCell);
      for (const group of groups) {
        for (const activity of group.activities) {
          row.append(createGradebookInput(
            `${gender} learner ${rowNumber}, ${activity.label}`,
            `learner:${gender}:${rowNumber}:${activity.key}:${activity.index}`,
            "number",
            previousValues,
          ));
        }
        row.append(createGradebookInput(
          `${gender} learner ${rowNumber}, ${group.label} total`,
          `learner:${gender}:${rowNumber}:${group.key}:total`,
          "number",
          previousValues,
        ));
        row.append(createGradebookInput(
          `${gender} learner ${rowNumber}, ${group.label} percentage score`,
          `learner:${gender}:${rowNumber}:${group.key}:ps`,
          "number",
          previousValues,
        ));
        row.append(createGradebookInput(
          `${gender} learner ${rowNumber}, ${group.label} weighted score`,
          `learner:${gender}:${rowNumber}:${group.key}:ws`,
          "number",
          previousValues,
        ));
      }
      const lrnColumnIndex = row.children.length;
      row.append(createGradebookInput(
        `${gender} learner ${rowNumber}, initial grade`,
        `learner:${gender}:${rowNumber}:initial`,
        "number",
        previousValues,
      ));
      row.append(createGradebookInput(
        `${gender} learner ${rowNumber}, term grade`,
        `learner:${gender}:${rowNumber}:term`,
        "number",
        previousValues,
      ));
      gradebookBody.append(row);
    }
  }
}

function updateActivityCount(key, input) {
  const nextCount = Number(input.value);
  if (!Number.isInteger(nextCount) || nextCount < 1 || nextCount > 20) {
    input.value = activityCounts[key];
    gradebookConfigStatus.textContent = "Pumili ng bilang mula 1 hanggang 20.";
    gradebookConfigStatus.dataset.state = "error";
    return;
  }

  const previousValues = captureGradebookValues();
  activityCounts[key] = nextCount;
  input.value = nextCount;
  if (saveActivityCounts()) {
    gradebookConfigStatus.textContent = `${key.toUpperCase()} activity count saved for this section.`;
    gradebookConfigStatus.dataset.state = "success";
  }
  renderGradebook(previousValues);
  input.focus();
}

for (const [key, input] of Object.entries(activityCountInputs)) {
  input.addEventListener("change", () => updateActivityCount(key, input));
}

function removeSection(sectionToRemove) {
  const confirmed = window.confirm(`Remove Grade ${sectionToRemove.grade} ${sectionToRemove.name}?`);
  if (!confirmed) return;

  const previousSections = sections;
  sections = sections.filter((section) =>
    section.grade !== sectionToRemove.grade || section.name !== sectionToRemove.name,
  );

  if (!saveSections()) {
    sections = previousSections;
    return;
  }

  sectionStatus.textContent = `Removed Grade ${sectionToRemove.grade} ${sectionToRemove.name}.`;
  sectionStatus.dataset.state = "success";
  renderSections();
}

function applyTeacherSettings() {
  settingsTeacherName.value = teacherSettings.teacherName ?? settingsTeacherName.value;
  settingsSchoolYear.value = teacherSettings.schoolYear ?? "";
  settingsCameraReminder.checked = teacherSettings.cameraReminder !== false;
  settingsCompactTable.checked = teacherSettings.compactTable === true;
  document.querySelector(".teacher-identity strong").textContent = settingsTeacherName.value;
  document.querySelector(".teacher-avatar").textContent = settingsTeacherName.value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  document.body.classList.toggle("compact-gradebook", settingsCompactTable.checked);
}

function openSettings() {
  controlCenter.hidden = true;
  settingsView.hidden = false;
  settingsTitle.focus();
}

applyTeacherSettings();
headerSettingsButton.addEventListener("click", openSettings);
backToSettingsDashboard.addEventListener("click", () => {
  settingsView.hidden = true;
  controlCenter.hidden = false;
  headerSettingsButton.focus();
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  teacherSettings = {
    teacherName: settingsTeacherName.value.trim() || "Ms. Reyes",
    schoolYear: settingsSchoolYear.value.trim(),
    cameraReminder: settingsCameraReminder.checked,
    compactTable: settingsCompactTable.checked,
  };
  window.localStorage.setItem(settingsStorageKey, JSON.stringify(teacherSettings));
  applyTeacherSettings();
  settingsStatus.textContent = "Settings saved.";
  settingsStatus.dataset.state = "success";
});

logoutButton.addEventListener("click", () => {
  window.localStorage.setItem("eapihs-local-session", "signed-out");
  window.location.href = "index.html";
});

function openSectionEvidence() {
  if (!activeSection) return;
  sectionDashboardView.hidden = true;
  evidenceView.hidden = false;
  evidenceTitle.focus();
  populateEvidenceSections(activeSection);
  populateEvidenceStudents();
  renderEvidenceRecords();
}

if (openSectionEvidenceButton) {
  openSectionEvidenceButton.addEventListener("click", openSectionEvidence);
}

backToEvidenceDashboard.addEventListener("click", () => {
  evidenceView.hidden = true;
  if (activeSection) {
    sectionDashboardView.hidden = false;
    sectionDashboardTitle.focus();
  } else {
    controlCenter.hidden = false;
  }
});

function populateEvidenceSections(selectedSection = null) {
  evidenceSection.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select section";
  evidenceSection.append(placeholder);

  for (const section of sections) {
    ensureSectionId(section);
    const option = document.createElement("option");
    option.value = section.id;
    option.textContent = `Grade ${section.grade} - ${section.name}`;
    evidenceSection.append(option);
  }
  evidenceSection.value = selectedSection?.id ?? (activeSection?.id ?? "");
  evidenceSection.disabled = Boolean(selectedSection);
}

function populateEvidenceStudents() {
  evidenceStudent.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select student";
  evidenceStudent.append(placeholder);
  evidenceStudent.disabled = !evidenceSection.value;

  for (const student of (enrollments[evidenceSection.value] ?? []).filter((entry) => entry.status === "added")) {
    const option = document.createElement("option");
    option.value = student.lrn;
    option.textContent = `${student.name} · ${student.lrn}`;
    evidenceStudent.append(option);
  }
}

evidenceSection.addEventListener("change", populateEvidenceStudents);

evidencePhoto.addEventListener("change", () => {
  const file = evidencePhoto.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    evidencePhotoData = String(reader.result ?? "");
    evidencePreview.src = evidencePhotoData;
    evidencePreview.hidden = false;
  });
  reader.readAsDataURL(file);
});

function renderEvidenceRecords() {
  evidenceRecordList.replaceChildren();
  for (const record of evidenceRecords.slice().reverse()) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    const details = document.createElement("span");
    title.textContent = `${record.category}${record.number} · ${record.score}/${record.maxScore}`;
    details.textContent = `${record.studentName} · ${record.studentLrn} · Grade ${record.grade} ${record.sectionName}`;
    item.append(title, details);
    if (record.photo) {
      const image = document.createElement("img");
      image.src = record.photo;
      image.alt = `${record.studentName} evidence`;
      item.append(image);
    }
    evidenceRecordList.append(item);
  }
}

evidenceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!evidenceForm.reportValidity()) return;
  if (!evidencePhotoData) {
    evidenceStatus.dataset.state = "error";
    evidenceStatus.textContent = "Take or choose a photo first.";
    return;
  }

  const maxScore = Number(evidenceMaxScore.value);
  const awardedScore = Number(evidenceAwardedScore.value);
  if (awardedScore > maxScore) {
    evidenceStatus.dataset.state = "error";
    evidenceStatus.textContent = "Teacher score cannot be higher than the highest score.";
    return;
  }

  const section = sections.find((entry) => entry.id === evidenceSection.value);
  const student = (enrollments[evidenceSection.value] ?? []).find((entry) => entry.lrn === evidenceStudent.value);
  evidenceRecords.push({
    sectionId: section.id,
    grade: section.grade,
    sectionName: section.name,
    studentLrn: student.lrn,
    studentName: student.name,
    category: evidenceCategory.value,
    number: evidenceNumber.value,
    maxScore,
    score: awardedScore,
    photo: evidencePhotoData,
    savedAt: new Date().toISOString(),
  });

  try {
    window.localStorage.setItem(evidenceStorageKey, JSON.stringify(evidenceRecords));
    evidenceStatus.dataset.state = "success";
    evidenceStatus.textContent = "Evidence photo and score saved.";
    evidenceForm.reset();
    evidenceNumber.value = "1";
    evidenceMaxScore.value = "10";
    evidencePhotoData = "";
    evidencePreview.hidden = true;
    renderEvidenceRecords();
    populateEvidenceStudents();
  } catch {
    evidenceRecords.pop();
    evidenceStatus.dataset.state = "error";
    evidenceStatus.textContent = "Photo storage is too large for this browser.";
  }
});

openSectionsButton.addEventListener("click", () => {
  controlCenter.hidden = true;
  sectionsView.hidden = false;
  teacherMain.classList.add("sections-open");
  sectionStatus.textContent = "";
  renderSections();
  sectionsTitle.focus();
});

backButton.addEventListener("click", () => {
  sectionsView.hidden = true;
  controlCenter.hidden = false;
  teacherMain.classList.remove("sections-open");
  openSectionsButton.focus();
});

backToSectionsButton.addEventListener("click", () => {
  sectionDashboardView.hidden = true;
  sectionsView.hidden = false;
  teacherMain.classList.remove("section-dashboard-open");
  sectionsTitle.focus();
});

addSectionButton.addEventListener("click", () => {
  sectionForm.reset();
  sectionDialog.showModal();
  sectionGrade.focus();
});

function renderSectionEnrollments() {
  sectionEnrollmentList.replaceChildren();
  if (!activeSection) return;
  const students = [...(enrollments[activeSection.id] ?? [])].sort((first, second) =>
    getSurname(first.name).localeCompare(getSurname(second.name), "en", { sensitivity: "base" }),
  );
  if (students.length === 0) {
    const item = document.createElement("li");
    item.className = "section-enrollment-empty";
    item.textContent = "No students imported in this section yet.";
    sectionEnrollmentList.append(item);
    return;
  }
  for (const student of students) {
    const status = student.status ?? "added";
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const lrn = document.createElement("span");
    const badge = document.createElement("span");
    const actions = document.createElement("div");
    name.textContent = student.name;
    lrn.textContent = student.lrn;
    badge.className = `student-status-badge student-status-${status}`;
    badge.textContent = status === "not-added" ? "Not Added" : status === "kicked" ? "Kicked Out" : status === "locked" ? "Locked" : "Added";
    actions.className = "student-roster-actions";

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = status === "added" ? "Added" : "Add";
    addButton.disabled = status === "added";
    addButton.addEventListener("click", () => updateStudentStatus(student.lrn, "added"));

    const kickButton = document.createElement("button");
    kickButton.type = "button";
    kickButton.textContent = "Kick Out";
    kickButton.addEventListener("click", () => updateStudentStatus(student.lrn, "kicked"));

    const lockButton = document.createElement("button");
    lockButton.type = "button";
    lockButton.textContent = status === "locked" ? "Locked" : "Lock";
    lockButton.addEventListener("click", () => updateStudentStatus(student.lrn, "locked"));

    actions.append(addButton, kickButton, lockButton);
    item.append(name, lrn, badge, actions);
    sectionEnrollmentList.append(item);
  }
}

function updateStudentStatus(lrn, status) {
  const student = (enrollments[activeSection.id] ?? []).find((entry) => entry.lrn === lrn);
  if (!student) return;
  student.status = status;
  window.localStorage.setItem(enrollmentStorageKey, JSON.stringify(enrollments));
  studentEnrollmentStatus.dataset.state = "success";
  studentEnrollmentStatus.textContent = `${student.name} is now ${status === "not-added" ? "Not Added" : status === "kicked" ? "Kicked Out" : status === "locked" ? "Locked" : "Added"}.`;
  renderSectionEnrollments();
  renderGradebook();
}

addSectionStudentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeSection) return;
  const code = sectionStudentCode.value.trim().toUpperCase();
  const lrn = code.startsWith("EAPIHS-LRN-") ? code.replace("EAPIHS-LRN-", "") : code;
  const currentStudent = loadLocalJson(currentStudentStorageKey, null);
  enrollments[activeSection.id] ??= [];
  let knownStudent = enrollments[activeSection.id].find((entry) => entry.lrn === lrn);
  if (!knownStudent && currentStudent && String(currentStudent.lrn).replace(/\D/g, "") === lrn) {
    knownStudent = { lrn, name: currentStudent.name, gender: "MALE", source: "teacher" };
    enrollments[activeSection.id].push(knownStudent);
  }
  if (!/^\d{12}$/.test(lrn) || !knownStudent) {
    studentEnrollmentStatus.dataset.state = "error";
    studentEnrollmentStatus.textContent = "Student LRN not found in the section class list.";
    return;
  }

  knownStudent.status = "added";
  window.localStorage.setItem(enrollmentStorageKey, JSON.stringify(enrollments));
  studentEnrollmentStatus.dataset.state = "success";
  studentEnrollmentStatus.textContent = `${knownStudent.name} was added to Grade ${activeSection.grade} ${activeSection.name}.`;
  renderSectionEnrollments();
  renderGradebook();
  sectionStudentCode.value = "";
  renderSectionEnrollments();
});

document.querySelector("#cancel-section").addEventListener("click", () => {
  sectionDialog.close();
  addSectionButton.focus();
});

sectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!sectionForm.reportValidity()) return;

  const name = sectionName.value.trim();
  const grade = sectionGrade.value;
  const alreadyExists = sections.some((section) =>
    section.grade === grade && section.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
  );

  if (alreadyExists) {
    sectionStatus.textContent = "May section na na may ganitong grade level at pangalan.";
    sectionStatus.dataset.state = "error";
    sectionDialog.close();
    sectionsTitle.focus();
    return;
  }

  const newSection = { grade, name };
  ensureSectionId(newSection);
  sections.unshift(newSection);
  if (!saveSections()) {
    sections.shift();
    return;
  }

  sectionStatus.textContent = "Naidagdag at na-save ang section.";
  sectionStatus.dataset.state = "success";
  renderSections();
  sectionDialog.close();
  sectionsTitle.focus();
});

renderSections();