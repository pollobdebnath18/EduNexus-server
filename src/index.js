'use strict';

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
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
    }
  },
};
