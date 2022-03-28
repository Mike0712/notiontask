module.exports = {
  async post({ body, db }) {

    const collection = db.collection('tracks');
    collection.insertMany(body)
        .then((insertResult) => console.log('Inserted documents =>', insertResult));

    // don't wait insert
    return body;
  },
  schemas: {
    post: {
      type: "array",
      items: {
        type: "object",
        properties: {
          event: { type: "string" },
          tags: { type: "array" },
          url: { type: "string" },
          title: { type: "string" },
          ts: { type: "string", format: "date-time" },
        },
        required: ["event"],
        additionalProperties: false,
      },
    },
  },
};
