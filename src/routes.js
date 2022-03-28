"use strict";

const track = require("./controllers/track");
const validator = require("./validator");
const ValidationError = require("./exceptions/ValidationEroror");
const dbClient = require("./../mongoDb");

const routes = [{ track }];

module.exports = async ({ url, method, body, query }) => {
  const rt = url.substring(1);
  const route = routes.find((items) => items[rt]);

  if (!route) {
    return { status: 404, res: "Route not found" };
  }

  const meth = method.toLowerCase();
  const branch = route[rt];
  const controller = branch[meth];
  if (typeof controller === "undefined") {
    return { status: 405, res: "Method not allowed" };
  }
  let client;
  try {
    // check for validation
    if (branch.schemas && branch.schemas[meth]) {
      const schema = branch.schemas[meth];
      const data = body || query;
      validator(schema, data);
    }
    // execute
    await dbClient.connect();

    const res = await controller({ body, query, db: dbClient.db("mongodb") });
    if (typeof res === "undefined") {
      return { status: 204, res: "Response is empty" };
    }
    return { res };
  } catch (e) {
    if (e instanceof ValidationError) {
      return { status: 500, res: e.message };
    }

    return { status: 500, res: "Something went wrong" };
  } finally {
    // dbClient.close();
  }
};
