"use strict";

const http = require("http");
const Koa = require("koa");
const bodyParser = require("koa-body-parser");
const path = require("path");
const fsp = require("fs").promises;
const router = require(path.join(process.cwd(), "./src/routes"));

// frontend
const frontServer = http.createServer();

frontServer.on("request", async (request, response) => {
  if (request.method === "GET") {
    const routes = ["/", "/1.html", "/2.html"];
    if (!routes.includes(request.url)) {
      response.writeHead(404);
      response.end(
        `<h1>Page not found</h1><div><a href="/">Back to main page</a></div>`
      );
    }

    const view = await fsp.readFile(
      path.join(process.cwd(), "./index.html"),
      "utf-8"
    );
    response.end(view);
  }
});

frontServer.listen(8000);

// bakend
const back = new Koa();

back.use(bodyParser());
back.use(async (ctx) => {
  const { request } = ctx;
  const { url } = request;
  if (url === "/") {
    const script = await fsp.readFile(
      path.join(process.cwd(), "./static.js"),
      "utf-8"
    );
    ctx.body = script;
  } else {
    ctx.set("Access-Control-Allow-Origin", "http://localhost:8000");
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    ctx.set("Access-Control-Allow-Headers", "Content-Type, x-requested-with");
    ctx.set("Access-Control-Max-Age", 86400);

    if (["POST", "GET"].includes(ctx.request.method)) {
      const response = await router(request);
      if (response.status) {
        ctx.status = response.status;
      }
      ctx.body = { message: response.res };
    } else {
      ctx.body = "";
    }
  }
});

http.createServer(back.callback()).listen(8001);
