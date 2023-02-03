class KeycloakClient {
    constructor(config) {
        this.config = config;
        this.jwt = {};
    }

    getJWT() {
        // Get the JWT based on the config


        this.jwt = {
            token: "foo",
            expires_in: 1000,
            scope: String,
        }

        return this.jwt;
    }
}

export default KeycloakClient;