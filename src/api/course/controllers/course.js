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
    // Prevent overriding it in the request
    if (ctx.request.body.data) {
      ctx.request.body.data.instructor = user.id;
    } else {
      ctx.request.body.data = { instructor: user.id };
    }

    const response = await super.create(ctx);
    return response;
  },

  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    // Fetch the existing course with its instructor
    const course = await strapi.entityService.findOne('api::course.course', id, {
      populate: ['instructor'],
    });

    if (!course) {
      return ctx.notFound('Course not found');
    }

    // Role check: if the user is an instructor, they must own the course
    const roleType = user.role?.type || user.role?.name;
    if (roleType === 'instructor') {
      if (!course.instructor || course.instructor.id !== user.id) {
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

    const course = await strapi.entityService.findOne('api::course.course', id, {
      populate: ['instructor'],
    });

    if (!course) {
      return ctx.notFound('Course not found');
    }

    const roleType = user.role?.type || user.role?.name;
    if (roleType === 'instructor') {
      if (!course.instructor || course.instructor.id !== user.id) {
        return ctx.forbidden('You do not have permission to delete this course');
      }
    }

    const response = await super.delete(ctx);
    return response;
  },
  
  async findOne(ctx) {
    const response = await super.findOne(ctx);
    // Extra guard: If accessing via API, instructor can only view their own detailed course?
    // The prompt says: "They must NOT be able to view, edit, or delete another instructor's course."
    // Let's enforce it on findOne as well.
    const user = ctx.state.user;
    if (user && response && response.data) {
      const roleType = user.role?.type || user.role?.name;
      if (roleType === 'instructor') {
        const course = await strapi.entityService.findOne('api::course.course', ctx.params.id, {
          populate: ['instructor']
        });
        if (course && (!course.instructor || course.instructor.id !== user.id)) {
          return ctx.forbidden('You do not have permission to view this course');
        }
      }
    }
    return response;
  }
}));
