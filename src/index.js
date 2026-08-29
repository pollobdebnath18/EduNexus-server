'use strict';

const CUSTOM_ROLES = [
  { name: 'Student',         type: 'student',         description: 'A student user' },
  { name: 'Instructor',      type: 'instructor',      description: 'An instructor user' },
  { name: 'Content Manager', type: 'content_manager', description: 'A content manager user' },
];

const COMMON_AUTH_ACTIONS = [
  'plugin::users-permissions.user.me',
  'plugin::users-permissions.user.find',
  'plugin::users-permissions.user.findOne',
  'plugin::users-permissions.auth.callback',
  'api::auth-me.auth-me.me',
];

const INSTRUCTOR_ACTIONS = [
  ...COMMON_AUTH_ACTIONS,
  'api::course.course.find',
  'api::course.course.findOne',
  'api::course.course.create',
  'api::course.course.update',
  'api::course.course.delete',
  'api::lesson.lesson.find',
  'api::lesson.lesson.findOne',
  'api::lesson.lesson.create',
  'api::lesson.lesson.update',
  'api::lesson.lesson.delete',
  'api::quiz.quiz.find',
  'api::quiz.quiz.findOne',
  'api::quiz.quiz.create',
  'api::quiz.quiz.update',
  'api::quiz.quiz.delete',
  'api::quiz-question.quiz-question.find',
  'api::quiz-question.quiz-question.findOne',
  'api::quiz-question.quiz-question.create',
  'api::quiz-question.quiz-question.update',
  'api::quiz-question.quiz-question.delete',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
  'api::blog-post.blog-post.create',
  'api::blog-post.blog-post.update',
  'api::blog-post.blog-post.delete',
  'api::enrollment.enrollment.find',
  'api::enrollment.enrollment.findOne',
  'api::lesson-progress.lesson-progress.find',
  'api::lesson-progress.lesson-progress.findOne',
  'api::quiz-attempt.quiz-attempt.find',
  'api::quiz-attempt.quiz-attempt.findOne',
  'plugin::upload.content-api.upload',
];

const STUDENT_ACTIONS = [
  ...COMMON_AUTH_ACTIONS,
  'api::course.course.find',
  'api::course.course.findOne',
  'api::lesson.lesson.find',
  'api::lesson.lesson.findOne',
  'api::quiz.quiz.find',
  'api::quiz.quiz.findOne',
  'api::quiz-question.quiz-question.find',
  'api::quiz-question.quiz-question.findOne',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
  'api::enrollment.enrollment.find',
  'api::enrollment.enrollment.findOne',
  'api::enrollment.enrollment.create',
  'api::enrollment.enrollment.update',
  'api::enrollment.enrollment.delete',
  'api::lesson-progress.lesson-progress.find',
  'api::lesson-progress.lesson-progress.findOne',
  'api::lesson-progress.lesson-progress.create',
  'api::lesson-progress.lesson-progress.update',
  'api::lesson-progress.lesson-progress.delete',
  'api::quiz-attempt.quiz-attempt.find',
  'api::quiz-attempt.quiz-attempt.findOne',
  'api::quiz-attempt.quiz-attempt.create',
  'api::quiz-attempt.quiz-attempt.update',
  'api::quiz-attempt.quiz-attempt.delete',
];

const CONTENT_MANAGER_ACTIONS = [
  ...COMMON_AUTH_ACTIONS,
  'api::course.course.find',
  'api::course.course.findOne',
  'api::course.course.create',
  'api::course.course.update',
  'api::course.course.delete',
  'api::lesson.lesson.find',
  'api::lesson.lesson.findOne',
  'api::lesson.lesson.create',
  'api::lesson.lesson.update',
  'api::lesson.lesson.delete',
  'api::quiz.quiz.find',
  'api::quiz.quiz.findOne',
  'api::quiz.quiz.create',
  'api::quiz.quiz.update',
  'api::quiz.quiz.delete',
  'api::quiz-question.quiz-question.find',
  'api::quiz-question.quiz-question.findOne',
  'api::quiz-question.quiz-question.create',
  'api::quiz-question.quiz-question.update',
  'api::quiz-question.quiz-question.delete',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
  'api::blog-post.blog-post.create',
  'api::blog-post.blog-post.update',
  'api::blog-post.blog-post.delete',
  'api::enrollment.enrollment.find',
  'api::enrollment.enrollment.findOne',
  'api::enrollment.enrollment.create',
  'api::enrollment.enrollment.update',
  'api::enrollment.enrollment.delete',
  'api::lesson-progress.lesson-progress.find',
  'api::lesson-progress.lesson-progress.findOne',
  'api::lesson-progress.lesson-progress.create',
  'api::lesson-progress.lesson-progress.update',
  'api::lesson-progress.lesson-progress.delete',
  'api::quiz-attempt.quiz-attempt.find',
  'api::quiz-attempt.quiz-attempt.findOne',
  'api::quiz-attempt.quiz-attempt.create',
  'api::quiz-attempt.quiz-attempt.update',
  'api::quiz-attempt.quiz-attempt.delete',
  'plugin::upload.content-api.upload',
];

const PUBLIC_ACTIONS = [
  'api::registration.registration.register',
  'api::course.course.find',
  'api::course.course.findOne',
  'api::lesson.lesson.find',
  'api::lesson.lesson.findOne',
  'api::quiz.quiz.find',
  'api::quiz.quiz.findOne',
  'api::quiz-question.quiz-question.find',
  'api::quiz-question.quiz-question.findOne',
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
];

const ROLE_PERMISSIONS_MAP = {
  instructor: INSTRUCTOR_ACTIONS,
  student: STUDENT_ACTIONS,
  content_manager: CONTENT_MANAGER_ACTIONS,
  authenticated: COMMON_AUTH_ACTIONS,
  public: PUBLIC_ACTIONS,
};

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

    // ── 2. Grant permissions to each role ─────────────────────────────────
    for (const [roleType, actions] of Object.entries(ROLE_PERMISSIONS_MAP)) {
      const role = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: roleType },
      });
      if (!role) continue;

      for (const action of actions) {
        const exists = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: { action, role: role.id },
        });
        if (!exists) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action, role: role.id },
          });
        }
      }
      strapi.log.info(`[bootstrap] Synced permissions for role "${roleType}"`);
    }
  },
};
