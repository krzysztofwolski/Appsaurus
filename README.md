# Appsaurus

Lil helper tool for Saleor App dev

## Requirements

- Deno
- ngrok

> **Warning**<br/>
> [create ngrok API token and add it to the ngrok cli](https://dashboard.ngrok.com/api).
> Without it you won't be able to use the tunnel

## Usage

Available options:

```
deno run --allow-run --allow-net ./main.ts tunnel --help
```

Start stunnel for app created from App Template (make sure your app dev server
is running)

```
deno run --allow-run --allow-net ./main.ts tunnel --instance-url https://XXXX.eu.saleor.cloud/
```

## Notes

- The first time you visit app url, you'll need to accept ngrok notification
  about tunneled
