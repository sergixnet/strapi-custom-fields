import * as yup from 'yup';
import { prefixPluginTranslations } from '@strapi/helper-plugin';

import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';

const name = pluginPkg.strapi.name;

export default {
  register(app: any) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(/* webpackChunkName: "[request]" */ './pages/App');

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    const plugin = {
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    };

    app.registerPlugin(plugin);

    app.customFields.register({
      name: "color",
      pluginId: "my-fields", // the custom field is created by a my-fields plugin
      type: "string", // the color will be stored as a string
      intlLabel: {
        id: "my-fields.color.label",
        defaultMessage: "Color",
      },
      intlDescription: {
        id: "my-fields.color.description",
        defaultMessage: "Select any color",
      },
      icon: PluginIcon, // don't forget to create/import your icon component
      components: {
        Input: async () => import(/* webpackChunkName: "input-component" */ "./components/ColorPicker/ColorPickerInput"),
      },
      options: {
        base: [
          /*
            Declare settings to be added to the "Base settings" section
            of the field in the Content-Type Builder
          */
          {
            sectionTitle: { // Add a "Format" settings section
              id: 'my-fields.color.section.format',
              defaultMessage: 'Format',
            },
            items: [ // Add settings items to the section
              {
                /*
                  Add a "Color format" dropdown
                  to choose between 2 different format options
                  for the color value: hexadecimal or RGBA
                */
                intlLabel: {
                  id: 'my-fields.color.format.label',
                  defaultMessage: 'Color format',
                },
                name: 'options.format',
                type: 'select',
                value: 'hex', // option selected by default
                options: [ // List all available "Color format" options
                  {
                    key: 'hex',
                    value: 'hex',
                    metadatas: {
                      intlLabel: {
                        id: 'my-fields.color.format.hex',
                        defaultMessage: 'Hexadecimal',
                      },
                    },
                  },
                  {
                    key: 'rgba',
                    value: 'rgba',
                    metadatas: {
                      intlLabel: {
                        id: 'my-fields.color.format.rgba',
                        defaultMessage: 'RGBA',
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
        advanced: [
          /*
            Declare settings to be added to the "Advanced settings" section
            of the field in the Content-Type Builder
          */
        ],
        validator: args => ({
          format: yup.string().required({
            id: 'options.my-fields.format.error',
            defaultMessage: 'The color format is required',
          }),
        })
      },
    });

  },

  bootstrap(app: any) {},

  async registerTrads(app: any) {
    const { locales } = app;

    const importedTrads = await Promise.all(
      (locales as any[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
