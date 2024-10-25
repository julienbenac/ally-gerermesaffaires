/**
 * @julienbenac/ally-gerermesaffaires
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import type {
  AllyDriverContract,
  LiteralStringUnion,
  Oauth2DriverConfig,
} from '@adonisjs/ally/types'

export interface GererMesAffairesDriverContract
  extends AllyDriverContract<GererMesAffairesToken, GererMesAffairesScopes> {
  version: 'oauth2'
}

export interface GererMesAffairesDriverConfig extends Oauth2DriverConfig {
  env: 'production' | 'sandbox'
  scopes?: LiteralStringUnion<GererMesAffairesScopes>[]
}

export type GererMesAffairesToken = {
  /** The token value */
  token: string

  /** The token type */
  type: 'bearer'

  /** The refresh token */
  refreshToken: string

  /** The static time in seconds when the token will expire */
  expiresIn: number

  /** The timestamp at which the token expires */
  expiresAt: Date
}

export type GererMesAffairesScopes =
  | 'openid'
  | 'collaborator'
  | 'owner'
  | 'profile'
  | 'email'
  | 'address'
  | 'phone'
