import test from "node:test";
import assert from "node:assert/strict";
import { calculateBmi, normalizeText, patientIdentity, patientMatchesName, parseMetric, validatePatient } from "../js/logic.js";

test("converte decimais com vírgula e ponto", () => {
  assert.equal(parseMetric(" 1,72 "), 1.72);
  assert.equal(parseMetric("1.72"), 1.72);
  assert.ok(Number.isNaN(parseMetric("")));
});

test("calcula IMC com duas casas decimais e não divide por zero", () => {
  assert.equal(calculateBmi(100, 2), 25);
  assert.equal(calculateBmi("68,5", "1,70"), 23.7);
  assert.equal(calculateBmi(68, 0), null);
});

test("valida campos obrigatórios e limites de peso, altura e gordura", () => {
  const valid = validatePatient({ nome: " Ana ", peso: "68,5", altura: "1,70", gordura: "22,5" });
  assert.equal(valid.valid, true);
  assert.equal(valid.patient.nome, "Ana");
  assert.equal(valid.patient.imc, 23.7);

  const invalid = validatePatient({ nome: " ", peso: "0", altura: "3,1", gordura: "101" });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.length, 4);
});

test("busca ignora maiúsculas e acentos", () => {
  assert.equal(normalizeText("Érica"), "erica");
  assert.equal(patientMatchesName({ nome: "Érica Souza" }, "erica"), true);
  assert.equal(patientMatchesName({ nome: "João Silva" }, "maria"), false);
});

test("identidade do paciente só é criada para registro válido", () => {
  const ana = { nome: "Ana", peso: 60, altura: 1.65, gordura: 20 };
  assert.equal(patientIdentity(ana), patientIdentity({ ...ana, nome: " ANA " }));
  assert.equal(patientIdentity({ ...ana, altura: 0 }), null);
});

test("registro externo nulo é rejeitado como inválido sem lançar exceção", () => {
  const result = validatePatient(null);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 4);
  assert.equal(result.patient.imc, null);
});
