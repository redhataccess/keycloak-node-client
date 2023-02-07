import SSOClient from "../src/SSOClient.js";
import assert from "node:assert";
import test from "node:test";

function createClient() {
  return new SSOClient({
    url: process.env.URL,
    realm: process.env.REALM,
    scopes: [process.env.SCOPE],
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
}

test("Test getting fresh token", async () => {
  let client = createClient();

  const token = await client.freshToken();

  assert(token.length > 0);
});

test("Test refreshing unexpired token", async () => {
  let client = createClient();

  const token = await client.freshToken();

  assert(token.length > 0);

  setTimeout(async () => {
    const newToken = await client.refreshToken();

    // only 5 seconds has past so the token should not have expired yet
    assert.strictEqual(token, newToken);
  }, 5000);
});

test("Test refreshing expiring token", async () => {
  let client = createClient();

  const token = await client.freshToken();

  assert(token.length > 0);

  // Hack the expires_in property to make is really short
  client._oidcResponse.expires_in = 30;

  setTimeout(async () => {
    const newToken = await client.refreshToken();

    // Token expires soon so it should be refreshed with new token
    assert.notStrictEqual(token, newToken);
  }, 5000);
});
