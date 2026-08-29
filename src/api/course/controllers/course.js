'use strict';

/**
 * course controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a course');
    }

    // Automatically set the instructor to the logged-in user
    if (ctx.request.body.data) {
      ctx.request.body.data.instructor = user.documentId || user.id;
    } else {
      ctx.request.body.data = { instructor: user.documentId || user.id };
    }

    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // Fetch the existing course with its instructor
    const course = await strapi.db.query('api::course.course').findOne({
      where: isNaN(id) ? { documentId: id } : { id },
      populate: ['instructor'],
    });

    if (!course) {
      return ctx.notFound('Course not found');
    }

    // Role check: if the user is an instructor, they must own the course
    const roleType = user.role?.type || user.role?.name;
    if (roleType === 'instructor') {
      const instructorId = course.instructor?.id;
      const instructorDocId = course.instructor?.documentId;
      if (instructorId !== user.id && instructorDocId !== user.documentId) {
        return ctx.forbidden('You do not have permission to update this course');
      }
    }

    // Prevent re-assigning the instructor
    if (ctx.request.body.data && ctx.request.body.data.instructor) {
      delete ctx.request.body.data.instructor;
    }

    const response = await super.update(ctx);
    return response;
  },

  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const course = await strapi.db.query('api::course.course').findOne({
      where: isNaN(id) ? { documentId: id } : { id },
      populate: ['instructor'],
    });

    if (!course) {
      return ctx.notFound('Course not found');
    }

    const roleType = user.role?.type || user.role?.name;
    if (roleType === 'instructor') {
      const instructorId = course.instructor?.id;
      const instructorDocId = course.instructor?.documentId;
      if (instructorId !== user.id && instructorDocId !== user.documentId) {
        return ctx.forbidden('You do not have permission to delete this course');
      }
    }

    const response = await super.delete(ctx);
    return response;
  },
  
  async findOne(ctx) {
    const response = await super.findOne(ctx);
    return response;
  }
}));
