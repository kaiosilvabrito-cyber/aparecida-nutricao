export const PATIENT_LIMITS = Object.freeze({
  minWeight: 0,
  maxWeight: 1000,
  minHeight: 0.3,
  maxHeight: 3,
  minBodyFat: 0,
  maxBodyFat: 100,
});

export function parseMetric(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN;

  const normalized = String(value ?? "").trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return Number.NaN;
  return Number(normalized);
}

export function calculateBmi(weight, height) {
  const parsedWeight = parseMetric(weight);
  const parsedHeight = parseMetric(height);
  if (!Number.isFinite(parsedWeight) || !Number.isFinite(parsedHeight) || parsedWeight <= 0 || parsedHeight <= 0) {
    return null;
  }
  return Number((parsedWeight / (parsedHeight * parsedHeight)).toFixed(2));
}

export function validatePatient(data = {}) {
  const record = data !== null && typeof data === "object" ? data : {};
  const name = String(record.nome ?? record.name ?? "").trim();
  const weight = parseMetric(record.peso ?? record.weight);
  const height = parseMetric(record.altura ?? record.height);
  const bodyFat = parseMetric(record.gordura ?? record.bodyFat ?? record.percentualGordura);
  const errors = [];

  if (!name) errors.push("O nome não pode ficar em branco.");
  if (!Number.isFinite(weight) || weight <= PATIENT_LIMITS.minWeight || weight > PATIENT_LIMITS.maxWeight) {
    errors.push("Informe um peso maior que 0 e de até 1000 kg.");
  }
  if (!Number.isFinite(height) || height < PATIENT_LIMITS.minHeight || height > PATIENT_LIMITS.maxHeight) {
    errors.push("Informe uma altura entre 0,30 m e 3,00 m.");
  }
  if (!Number.isFinite(bodyFat) || bodyFat < PATIENT_LIMITS.minBodyFat || bodyFat > PATIENT_LIMITS.maxBodyFat) {
    errors.push("Informe a gordura corporal entre 0% e 100%.");
  }

  const patient = {
    nome: name,
    peso: weight,
    altura: height,
    gordura: bodyFat,
    imc: errors.length === 0 ? calculateBmi(weight, height) : null,
  };

  return { patient, errors, valid: errors.length === 0 };
}

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function patientMatchesName(patient, query) {
  return normalizeText(patient?.nome).includes(normalizeText(query));
}

export function patientIdentity(patient) {
  const result = validatePatient(patient);
  if (!result.valid) return null;

  const { nome, peso, altura, gordura } = result.patient;
  return [normalizeText(nome), peso, altura, gordura].join("|");
}
