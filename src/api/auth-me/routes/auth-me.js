"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/auth-me",
      handler: "auth-me.me",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
