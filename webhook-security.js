const { createHmac, timingSafeEqual } = require("node:crypto");

function verifyMetaSignature(rawBody, signature, appSecret) {
  if (!Buffer.isBuffer(rawBody) || !appSecret || typeof signature !== "string") {
    return false;
  }

  const expected = Buffer.from(
    "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex"),
    "utf8"
  );
  const supplied = Buffer.from(signature, "utf8");

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

module.exports = { verifyMetaSignature };
