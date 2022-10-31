# Appsaurus

Lil helper tool for Saleor App dev

## Requirements

- Deno
- ngrok
- [create ngrok API token and add it to the ngrok cli](https://dashboard.ngrok.com/api)

## Usage

Available options:
```
deno run --allow-run --allow-net ./main.ts tunnel --help
```

Start stunnel for app created from App Template (make sure your app dev server is running)
```
deno run --allow-run --allow-net ./main.ts tunnel --instance-url https://XXXX.eu.saleor.cloud/
```
