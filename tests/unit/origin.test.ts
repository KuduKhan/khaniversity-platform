import test from "node:test";
import assert from "node:assert/strict";
import { isSameOriginRequest } from "../../src/lib/security/origin";

test("accepts browser origin behind Next.js proxy-normalized request URL", () => {
  const request = new Request("http://localhost:3000/api/tutor", {
    method: "POST",
    headers: {
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
      "x-forwarded-proto": "http",
    },
  });
  assert.equal(isSameOriginRequest(request), true);
});

test("rejects forged, mismatched-port and omitted origins", () => {
  const target = "http://127.0.0.1:3000/api/auth";
  assert.equal(isSameOriginRequest(new Request(target, {
    headers: { host: "127.0.0.1:3000", origin: "https://attacker.example", "x-forwarded-proto": "http" },
  })), false);
  assert.equal(isSameOriginRequest(new Request(target, {
    headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3001", "x-forwarded-proto": "http" },
  })), false);
  assert.equal(isSameOriginRequest(new Request(target, {
    headers: { host: "127.0.0.1:3000", "x-forwarded-proto": "http" },
  })), false);
});

test("supports proxied HTTPS only when origin scheme matches the forwarded scheme", () => {
  const url = "http://internal:3000/api/auth";
  assert.equal(isSameOriginRequest(new Request(url, { headers: {
    host: "academy.example.com", origin: "https://academy.example.com", "x-forwarded-proto": "https",
  } })), true);
  assert.equal(isSameOriginRequest(new Request(url, { headers: {
    host: "academy.example.com", origin: "http://academy.example.com", "x-forwarded-proto": "https",
  } })), false);
});
