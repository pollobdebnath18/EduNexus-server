"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/registration",
      handler: "registration.register",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
