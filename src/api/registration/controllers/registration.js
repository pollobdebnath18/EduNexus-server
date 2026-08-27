"use strict";

const ALLOWED_ROLES = ["student", "instructor", "content_manager"];

module.exports = {
  async register(ctx) {
    const { username, email, password, role } = ctx.request.body;

    if (!username || !email || !password) {
      return ctx.badRequest("Username, email, and password are required");
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return ctx.badRequest("Invalid role. Allowed roles: student, instructor, content_manager");
    }

    const roleRecord = await strapi.db.query("plugin::users-permissions.role").findOne({
      where: { type: role },
    });

    if (!roleRecord) {
      return ctx.badRequest("Role not found in the system.");
    }

    const existingUser = await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return ctx.badRequest("A user with this email already exists");
    }

    const existingUsername = await strapi.db.query("plugin::users-permissions.user").findOne({
      where: { username },
    });

    if (existingUsername) {
      return ctx.badRequest("A user with this username already exists");
    }

    try {
      const user = await strapi.documents("plugin::users-permissions.user").create({
        data: {
          username,
          email: email.toLowerCase(),
          password,
          confirmed: true,
          provider: "local",
          role: roleRecord.id,
        },
        populate: ["role"],
      });

      const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
        id: user.id,
      });

      return ctx.send({
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: {
            id: roleRecord.id,
            name: roleRecord.name,
            type: roleRecord.type,
          },
        },
      });
    } catch (err) {
      strapi.log.error("Registration error:", err);
      return ctx.internalServerError("Registration failed. Please try again.");
    }
  },
};
