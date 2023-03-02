import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('my-fields')
      .service('myService')
      .getWelcomeMessage();
  },
});
