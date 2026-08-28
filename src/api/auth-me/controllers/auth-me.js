"use strict";

module.exports = {
  async me(ctx) {
    // ctx.state.user is set by Strapi's auth middleware when a valid JWT is provided
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("No valid token provided");
    }

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({
        where: { id: userId },
        populate: ["role"],
      });

    if (!user) {
      return ctx.notFound("User not found");
    }

    // Strip sensitive fields
    const { password, resetPasswordToken, confirmationToken, ...safeUser } = user;

    return ctx.send(safeUser);
  },
};
