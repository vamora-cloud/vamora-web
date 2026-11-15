# Contact form setup

The form is fully validated in the browser and is ready to submit JSON to a secure backend or email service. It intentionally does **not** show a success state until an endpoint has been configured.

## Configure a delivery endpoint

1. Create a server-side endpoint, serverless function, or form provider endpoint that accepts a `POST` request with JSON.
2. Have that service send enquiries to `vamora.tech@gmail.com` and store the optional `updates` consent separately from the enquiry.
3. In `index.html`, replace `data-endpoint=""` on `#contact-form` with the HTTPS endpoint URL.

Do not put an email password, API key, or other private credential in `script.js` or `index.html`.
