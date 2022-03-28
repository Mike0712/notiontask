"use strict";

const sendToApi = (data) => {
  let status;
  return fetch("http://localhost:8001/track", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  })
    .then((resp) => {
      status = resp.status;
      return resp.json();
    })
    .then((resp) => {
      resp.status = status;
      return resp;
    });
};

class Tracker {
  #buffer;
  #lastAttemtingTime;

  constructor(spa = false) {
    this.#buffer = [];
    // disable a tag behavior
    if (spa) {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          for (const tag of document.body.getElementsByTagName("a")) {
            tag.addEventListener("click", (e) => {
              e.preventDefault();
              window.history.pushState("data", document.title, e.target.href);
            });
          }
        },
        { once: true }
      );
    }
    // on window closing

    window.addEventListener("beforeunload", (e) => {
      sendToApi(this.#buffer);
      // e.returnValue = ''
    });
  }

  track(event, ...tags) {
    // fill buffer
    if (event !== "test") {
      const url = window.location.href;
      const title = document.title;
      const date = new Date();
      const ts = date.toISOString();
      this.#buffer.push({
        event,
        tags,
        url,
        title,
        ts,
      });
    }

    // send from buffer
    if (
      this.#buffer.length >= 3 ||
      (this.#lastAttemtingTime && Date.now() - this.#lastAttemtingTime > 1000)
    ) {
      sendToApi(this.#buffer)
        .then((resp) => {
          if (resp.status === 200) {
            this.#buffer = [];
            this.#lastAttemtingTime = Date.now();
          } else if (resp.status === 500) {
            //
          }
        })
        .catch((error) => {
          // resend if network problem
          setTimeout(sendToApi(this.#buffer), 1000);
        });
    }
  }
}

const tracker = new Tracker(true);
