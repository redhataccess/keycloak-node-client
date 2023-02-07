import fetch from "node-fetch";

class KeycloakClient {
  constructor({
    url,
    realm,
    grantType = "client_credentials",
    clientId,
    clientSecret,
    scopes = ["openid"],
    expiryGrace = 30,
  }) {
    this._jwt = {};
    this.config = {
      url,
      realm,
      grantType,
      clientId,
      clientSecret,
      scopes,
      expiryGrace,
    };

    if (!this.config.url.endsWith("/")) {
      this.config.url += "/";
    }
  }

  async freshToken() {
    // Get the JWT auth token based on the config
    const tokenEndpointUrl =
      this.config.url + "realms/" + this.config.realm + "/protocol/openid-connect/token";

    const formData = new URLSearchParams();
    formData.append("grant_type", this.config.grantType);
    formData.append("client_id", this.config.clientId);
    formData.append("client_secret", this.config.clientSecret);
    formData.append("scope", this.config.scopes.join(" "));

    const response = await fetch(tokenEndpointUrl, {
      method: "POST",
      body: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.status !== 200) {
      const reponseText = await response.text();
      throw Error("Cannot get SSO Access Token. Server response=" + reponseText);
    }

    this._jwt = await response.json();
    this._jwt.created = Date.now();

    return this._jwt.access_token;
  }

  async refreshToken() {
    if (!this._jwt || !this._jwt.access_token || this.isJWTExpiringSoon()) {
      // Get a new token
      await this.freshToken();
    }

    return this._jwt.access_token;
  }

  isJWTExpiringSoon() {
    const elapsedSeconds = (Date.now() - this._jwt.created) / 1000;

    if (elapsedSeconds + this.config.expiryGrace >= this._jwt.expires_in) {
      // This token is expiring soon
      return true;
    }

    return false;
  }
}

export default KeycloakClient;
