import { calculateBmi, normalizeText, patientIdentity, patientMatchesName, parseMetric, validatePatient } from "./logic.js";

const STORAGE_KEY = "aparecida-nutricao-pacientes-v1";
const EXTERNAL_PATIENTS_URL = "https://api-pacientes.herokuapp.com/pacientes";
const REMOTE_TIMEOUT_MS = 8_000;

const elements = {
  table: document.querySelector("#tabela-pacientes"),
  form: document.querySelector("#form-adiciona"),
  filter: document.querySelector("#filtrar-tabela"),
  count: document.querySelector("#contador-pacientes"),
  errors: document.querySelector("#mensagens-erro"),
  status: document.querySelector("#mensagem-status"),
  remoteError: document.querySelector("#erro-ajax"),
  addButton: document.querySelector("#adicionar-paciente"),
  searchButton: document.querySelector("#buscar-pacientes"),
};

const starterPatients = [
  { nome: "Paulo", peso: 100, altura: 2, gordura: 10 },
  { nome: "João", peso: 80, altura: 1.72, gordura: 40 },
  { nome: "Érica", peso: 54, altura: 1.64, gordura: 14 },
  { nome: "Douglas", peso: 85, altura: 1.73, gordura: 24 },
  { nome: "Tatiana", peso: 46, altura: 1.55, gordura: 19 },
];

let storageWarningShown = false;
let patients = loadPatients();

function loadPatients() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return starterPatients.map((patient) => validatePatient(patient).patient);
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : starterPatients.map((patient) => validatePatient(patient).patient);
  } catch {
    showStatus("O armazenamento local não está disponível. As alterações podem não permanecer após fechar a página.", "error");
    storageWarningShown = true;
    return starterPatients.map((patient) => validatePatient(patient).patient);
  }
}

function savePatients() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    return true;
  } catch {
    if (!storageWarningShown) {
      showStatus("Não foi possível salvar neste navegador. Suas alterações podem não permanecer após fechar a página.", "error");
      storageWarningShown = true;
    }
    return false;
  }
}

function formatMetric(value, maximumFractionDigits = 2) {
  const parsed = parseMetric(value);
  if (!Number.isFinite(parsed)) return "—";
  return parsed.toLocaleString("pt-BR", { maximumFractionDigits });
}

function showStatus(message, kind = "success") {
  elements.status.textContent = message;
  elements.status.className = `status-message${kind === "error" ? " status-message--error" : ""}`;
  elements.status.setAttribute("role", kind === "error" ? "alert" : "status");
}

function clearErrors() {
  elements.errors.replaceChildren();
}

function showValidationErrors(errors) {
  clearErrors();
  for (const message of errors) {
    const item = document.createElement("li");
    item.textContent = message;
    elements.errors.append(item);
  }
}

function createCell(value, className = "") {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  cell.textContent = value;
  return cell;
}

function createPatientRow(patient, index) {
  const { valid, errors, patient: normalized } = validatePatient(patient);
  const row = document.createElement("tr");
  row.className = "paciente";
  if (!valid) {
    row.classList.add("paciente-invalido");
    row.title = errors.join(" ");
  }

  row.append(
    createCell(String(patient?.nome ?? patient?.name ?? "—"), "patient-name"),
    createCell(formatMetric(patient?.peso ?? patient?.weight)),
    createCell(formatMetric(patient?.altura ?? patient?.height)),
    createCell(formatMetric(patient?.gordura ?? patient?.bodyFat)),
  );

  const bmi = valid ? calculateBmi(normalized.peso, normalized.altura) : null;
  row.append(createCell(bmi === null ? "Dados inválidos" : bmi.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bmi === null ? "invalid-data" : ""));

  const actions = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-button";
  removeButton.dataset.removeIndex = String(index);
  removeButton.setAttribute("aria-label", `Remover ${String(patient?.nome ?? patient?.name ?? "paciente")}`);
  removeButton.textContent = "Remover";
  actions.append(removeButton);
  row.append(actions);
  return row;
}

function renderPatients() {
  const query = elements.filter.value;
  const visible = patients
    .map((patient, index) => ({ patient, index }))
    .filter(({ patient }) => patientMatchesName(patient, query));

  elements.table.replaceChildren();
  elements.count.textContent = `${patients.length} ${patients.length === 1 ? "paciente" : "pacientes"}`;

  if (patients.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.append(createCell("Nenhum paciente cadastrado. Adicione um paciente pelo formulário abaixo.", ""));
    row.firstElementChild.colSpan = 6;
    elements.table.append(row);
    return;
  }

  if (visible.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    const cell = createCell("Nenhum paciente encontrado com esse nome.");
    cell.colSpan = 6;
    row.append(cell);
    elements.table.append(row);
    return;
  }

  for (const { patient, index } of visible) {
    elements.table.append(createPatientRow(patient, index));
  }
}

function handleAddPatient(event) {
  event.preventDefault();
  elements.remoteError.hidden = true;
  elements.status.textContent = "";

  const formData = new FormData(elements.form);
  const result = validatePatient({
    nome: formData.get("nome"),
    peso: formData.get("peso"),
    altura: formData.get("altura"),
    gordura: formData.get("gordura"),
  });

  if (!result.valid) {
    showValidationErrors(result.errors);
    const firstInvalidField = elements.form.querySelector("input:invalid") || elements.form.querySelector("input");
    firstInvalidField?.focus();
    return;
  }

  clearErrors();
  patients.push(result.patient);
  const saved = savePatients();
  elements.form.reset();
  renderPatients();
  document.querySelector("#nome").focus();
  showStatus(
    saved ? `${result.patient.nome} foi adicionado à lista.` : `${result.patient.nome} foi adicionado, mas não foi salvo neste navegador.`,
    saved ? "success" : "error",
  );
}

function handleRemovePatient(event) {
  const button = event.target.closest("[data-remove-index]");
  if (!button) return;

  const index = Number(button.dataset.removeIndex);
  const patient = patients[index];
  if (!patient) return;

  const name = String(patient.nome ?? patient.name ?? "este paciente");
  if (!window.confirm(`Deseja remover ${name} da lista?`)) return;

  patients.splice(index, 1);
  const saved = savePatients();
  renderPatients();
  showStatus(
    saved ? `${name} foi removido da lista.` : `${name} foi removido, mas a alteração não foi salva neste navegador.`,
    saved ? "success" : "error",
  );
}

function showExternalError(message) {
  elements.remoteError.textContent = message;
  elements.remoteError.hidden = false;
}

async function loadPatientList(url, signal) {
  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) throw new Error(`O serviço respondeu com o código ${response.status}.`);
  const records = await response.json();
  if (!Array.isArray(records)) throw new TypeError("A resposta não contém uma lista de pacientes.");
  return records;
}

async function handleExternalSearch() {
  elements.remoteError.hidden = true;
  elements.status.textContent = "";
  elements.searchButton.disabled = true;
  elements.searchButton.textContent = "Buscando…";

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);

  try {
    let result;
    let usingDemoData = false;
    try {
      result = await loadPatientList(EXTERNAL_PATIENTS_URL, controller.signal);
    } catch {
      usingDemoData = true;
      result = await loadPatientList("./data/pacientes-exemplo.json");
    }

    if (result.length === 0) {
      showStatus(usingDemoData
        ? "A API externa está indisponível e a base de demonstração não tem novos pacientes."
        : "A busca externa não encontrou pacientes para adicionar.");
      return;
    }

    const identities = new Set(patients.map(patientIdentity).filter(Boolean));
    const accepted = [];
    let invalidCount = 0;
    let duplicateCount = 0;

    for (const candidate of result) {
      const normalized = validatePatient(candidate);
      if (!normalized.valid) {
        invalidCount += 1;
        continue;
      }
      const identity = patientIdentity(normalized.patient);
      if (identities.has(identity)) {
        duplicateCount += 1;
        continue;
      }
      identities.add(identity);
      accepted.push(normalized.patient);
    }

    if (accepted.length > 0) {
      patients.push(...accepted);
      const saved = savePatients();
      renderPatients();
      if (!saved) {
        showStatus("Os pacientes foram incluídos nesta sessão, mas não foi possível salvá-los neste navegador.", "error");
        return;
      }
    }

    if (accepted.length === 0) {
      const reason = duplicateCount > 0 && invalidCount === 0
        ? "Todos os pacientes encontrados já estão na lista."
        : "Nenhum paciente externo continha dados válidos para inclusão.";
      showStatus(usingDemoData ? `A API externa está indisponível. ${reason}` : reason);
      return;
    }

    const details = [];
    if (duplicateCount) details.push(`${duplicateCount} duplicado(s) ignorado(s)`);
    if (invalidCount) details.push(`${invalidCount} registro(s) inválido(s) ignorado(s)`);
    const suffix = details.length ? ` (${details.join("; ")}).` : ".";
    const sourceNotice = usingDemoData ? "A API externa está indisponível; dados fictícios da base local foram usados. " : "";
    showStatus(`${sourceNotice}${accepted.length} ${accepted.length === 1 ? "paciente foi adicionado" : "pacientes foram adicionados"}${suffix}`);
  } catch (error) {
    const message = "Não foi possível acessar a API externa nem a base de demonstração incluída no projeto. Tente novamente mais tarde.";
    showExternalError(message);
  } finally {
    window.clearTimeout(timeout);
    elements.searchButton.disabled = false;
    elements.searchButton.textContent = "Buscar pacientes externos";
  }
}

function start() {
  elements.form.addEventListener("submit", handleAddPatient);
  elements.filter.addEventListener("input", renderPatients);
  elements.table.addEventListener("click", handleRemovePatient);
  elements.searchButton.addEventListener("click", handleExternalSearch);
  renderPatients();
}

start();
