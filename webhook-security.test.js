const test = require("node:test");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { verifyMetaSignature } = require("./webhook-security");

const secret = "test-app-secret";
const body = Buffer.from(JSON.stringify({ object: "page", entry: [{ id: "123" }] }));

function signatureFor(value) {
  return "sha256=" + createHmac("sha256", secret).update(value).digest("hex");
}

test("accepts a valid Meta SHA-256 signature", () => {
  assert.equal(verifyMetaSignature(body, signatureFor(body), secret), true);
});

test("rejects a modified body", () => {
  assert.equal(verifyMetaSignature(Buffer.from(body.toString() + " "), signatureFor(body), secret), false);
});

test("rejects an incorrect signature", () => {
  assert.equal(verifyMetaSignature(body, "sha256=" + "0".repeat(64), secret), false);
});

test("fails closed when configuration or raw body is missing", () => {
  assert.equal(verifyMetaSignature(body, signatureFor(body), ""), false);
  assert.equal(verifyMetaSignature(null, signatureFor(body), secret), false);
  assert.equal(verifyMetaSignature(body, undefined, secret), false);
});
