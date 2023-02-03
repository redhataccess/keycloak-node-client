import KeycloakClient from "../src/KeycloakClient";
import assert from "node:assert";

let client = new KeycloakClient({});
const jwt = client.getJWT();

assert.equal(jwt.token, "foo");
