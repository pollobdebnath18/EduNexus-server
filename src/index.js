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

    // ── 2. Grant essential permissions to each custom role ─────────────────
    const essentialActions = [
      'plugin::users-permissions.user.me',
      'plugin::users-permissions.auth.callback',
      'api::auth-me.auth-me.me',
    ];

    // Grant to custom roles + the default "authenticated" role
    const allRoleTypes = [...CUSTOM_ROLES.map(r => r.type), 'authenticated'];

    for (const roleType of allRoleTypes) {
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: roleType },
      });
      if (!role) continue;

      for (const action of essentialActions) {
        const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: { action, role: role.id },
        });
        if (!exists) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action, role: role.id },
          });
          strapi.log.info(`[bootstrap] Granted "${action}" to role "${roleType}"`);
        }
      }
    }

    // ── 3. Grant public access to the registration endpoint ───────────────
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
