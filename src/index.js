'use strict';

const CUSTOM_ROLES = [
  { name: 'Student',         type: 'student',         description: 'A student user' },
  { name: 'Instructor',      type: 'instructor',      description: 'An instructor user' },
  { name: 'Content Manager', type: 'content_manager', description: 'A content manager user' },
];

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    // ── 1. Seed custom roles if they don't exist ──────────────────────────
    for (const roleDef of CUSTOM_ROLES) {
      const exists = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: roleDef.type },
      });

      if (!exists) {
        await strapi.db.query('plugin::users-permissions.role').create({
          data: roleDef,
        });
        strapi.log.info(`[bootstrap] Created role: ${roleDef.name}`);
      }
    }

    // ── 2. Grant public access to the registration endpoint ───────────────
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (!publicRole) return;

    const existing = await strapi.db.query('plugin::users-permissions.permission').findOne({
      where: {
        action: 'api::registration.registration.register',
        role: publicRole.id,
      },
    });

    if (!existing) {
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: {
          action: 'api::registration.registration.register',
          role: publicRole.id,
        },
      });
      strapi.log.info('[bootstrap] Granted public access to registration endpoint');
    }
  },
};
