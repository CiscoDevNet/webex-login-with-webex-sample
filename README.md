# webex-login-with-webex-sample

Sample demonstrating a simple Node.js/Express web app using Login with Webex via OpenId Connect.

[Login with Webex](https://developer.webex.com/docs/login-with-webex)

## Requirements

* An HTTP reverse proxy configured to forward HTTPS to this applications' web server on port 8080 (default.)

  [Caddy](https://caddyserver.com/) provides a simple reverse proxy suitable for development.  `caddy.sh` is included if it's installed.

* Node.js (tested with v16.14.2)

* (Optional) The project was developed using [Visual Studio Code](https://code.visualstudio.com/) (a `launch.json` is included).

## Getting Started

* Clone this repo:

  ```bash
  git clone https://github.com/CiscoDevNet/webex-login-with-webex-sample.git
  cd webex-login-with-webex-sample.git
  ```

* Install dependencies:

  ```bash
  npm install
  ```

* Currently there is an issue with the `openid-connect` package (v5.3.2) and OpenID Connect issuers (like Webex) that provide multiple JWT validation keys.  A one line patch (in `patches/client.js.patch`) is provided as a workaround.

  An patch to add additional error output when OAuth/JWT authentication errors occur has also been provided in `patches/passport_strategy.js.patch`).

  To install both patches:

  ```bash
  ./apply_patches.sh
  ```

* Create a [Webex Integration](https://developer.webex.com/docs/integrations):

    * The Redirect URI should point to the URL of the HTTPS reverse proxy, with `/callback` appended.
    
      E.g. if running on your local PC via Caddy:

      ```
      https://localhost/callback
      ```

    * The only scope needed is: `spark:people_read`

* Rename `.env.example` to `.env` and configure:

  * Webex integration credentials (Client ID and Client Secret)

  * Webex integration redirect URL

  * Webex user email/Id of the user to be granted access to the web app

  * Web server listening port (default is 8080)

* Start your reverse proxy, e.g. forwarding port 443 -> 8080.

  If you have Caddy installed, run:

  ```bash
  ./caddh.sh
  ```

* Launch the application.

  **Via terminal**

  ```bash
  node app.js
  ```

  **Via VS Code**

  * Select the **Run and Debug** tab

  * Click the green **Start Debugging** button, or press `**F5**`

* Open a browser (incognito mode recommended to ensure no previous Webex login cookies are present) and navigate to the reverse proxy URL.

  E.g. if running on your local PC via Caddy:

  ```
  https://localhost
  ```
