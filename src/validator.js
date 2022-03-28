const ajvcl = require("ajv");
const addFormats = require("ajv-formats");
const ValidationError = require("./exceptions/ValidationEroror");

module.exports = (schema, data) => {
  const ajv = new ajvcl({ allErrors: true });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  let errors = [];
  if (!valid) errors = validate.errors;
  if (errors.length > 0) {
    throw new ValidationError(
      JSON.stringify({ errorType: "Validation error", errors })
    );
  }
};
