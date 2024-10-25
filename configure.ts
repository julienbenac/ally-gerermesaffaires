/**
 * @julienbenac/ally-gerermesaffaires
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import Configure from '@adonisjs/core/commands/configure'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  await codemods.defineEnvVariables({
    GERERMESAFFAIRES_CLIENT_ID: '',
    GERERMESAFFAIRES_CLIENT_SECRET: '',
    GERERMESAFFAIRES_CALLBACK_URL: '',
    GERERMESAFFAIRES_ENV: '',
  })

  await codemods.defineEnvValidations({
    variables: {
      GERERMESAFFAIRES_CLIENT_ID: 'Env.schema.string()',
      GERERMESAFFAIRES_CLIENT_SECRET: 'Env.schema.string.optional()',
      GERERMESAFFAIRES_CALLBACK_URL: 'Env.schema.string()',
      GERERMESAFFAIRES_ENV: 'Env.schema.enum(["production", "sandbox"] as const)',
    },
    leadingComment: 'Variables for configuring @julienbenac/ally-gerermesaffaires',
  })
}
