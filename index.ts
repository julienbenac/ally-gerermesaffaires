/**
 * @julienbenac/ally-gerermesaffaires
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import type { HttpContext } from '@adonisjs/core/http'

export { stubsRoot } from './stubs/main.js'
export { configure } from './configure.js'

import type { GererMesAffairesDriverConfig, GererMesAffairesToken } from './src/types/main.js'

import { GererMesAffairesDriver } from './src/gerermesaffaires.js'

export function gerermesaffaires(config: GererMesAffairesDriverConfig) {
  return (ctx: HttpContext) => new GererMesAffairesDriver(ctx, config)
}

export type { GererMesAffairesToken }
