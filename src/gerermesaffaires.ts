/**
 * @julienbenac/ally-gerermesaffaires
 *
 * @author Julien Benac <contact@julienbenac.fr>
 * @license MIT
 */

import type { HttpContext } from '@adonisjs/core/http'
import type {
  AllyUserContract,
  ApiRequestContract,
  RedirectRequestContract,
} from '@adonisjs/ally/types'
import { Oauth2Driver } from '@adonisjs/ally'
import {
  GererMesAffairesDriverConfig,
  GererMesAffairesScopes,
  GererMesAffairesToken,
} from './types/main.js'

/**
 * GererMesAffaires driver to login user via GererMesAffaires
 */
export class GererMesAffairesDriver extends Oauth2Driver<
  GererMesAffairesToken,
  GererMesAffairesScopes
> {
  /**
   * The authorization URL for the OAuth provider.
   * The user will be redirected to this page to authorize the request.
   */
  protected authorizeUrl: string

  /** The URL to hit to get an access token */
  protected accessTokenUrl: string

  /** The URL to hit to get user details */
  protected userInfoUrl: string

  /** The cookie name for storing the CSRF token */
  protected stateCookieName = 'gerermesaffaires_oauth_state'

  /**
   * The parameter name in which to send the state to the OAuth provider.
   * The same input is used to retrieve the state post redirect as well.
   */
  protected stateParamName = 'state'

  /** The parameter name from which to fetch the authorization code */
  protected codeParamName = 'code'

  /** The parameter name from which to fetch the error message post redirect */
  protected errorParamName = 'error'

  /** The parameter name for defining the authorization scopes */
  protected scopeParamName = 'scope'

  /** The identifier for joining multiple scopes */
  protected scopesSeparator = ' '

  constructor(
    ctx: HttpContext,
    public config: GererMesAffairesDriverConfig
  ) {
    super(ctx, config)

    switch (config.env) {
      case 'production':
        this.authorizeUrl = 'https://gerermesaffaires.com/openid/v1/authorize'
        this.accessTokenUrl = 'https://gerermesaffaires.com/openid/v1/token'
        this.userInfoUrl = 'https://gerermesaffaires.com/openid/v1/userinfo'
        break
      case 'sandbox':
        this.authorizeUrl = 'https://sandbox.gerermesaffaires.com/openid/v1/authorize'
        this.accessTokenUrl = 'https://sandbox.gerermesaffaires.com/openid/v1/token'
        this.userInfoUrl = 'https://sandbox.gerermesaffaires.com/openid/v1/userinfo'
        break
    }

    this.loadState()
  }

  /**
   * Persists the state inside the cookie
   */
  #persistState(): string | undefined {
    if (this.isStateless) return

    const state = this.getState()
    this.ctx.response.encryptedCookie(this.stateCookieName, state, {
      sameSite: false,
      httpOnly: true,
    })

    return state
  }

  /**
   * Configuring the redirect request with defaults
   */
  protected configureRedirectRequest(request: RedirectRequestContract<GererMesAffairesScopes>) {
    // Define user defined scopes or the default one's
    request.scopes(this.config.scopes || ['openid', 'collaborator'])

    // Set "state" param except if stateless authentication
    const state = this.#persistState()
    state && request.param(this.stateParamName, state)

    // Set "response_type" param
    request.param('response_type', 'code')
  }

  /**
   * Redirects user for authentication
   */
  async redirect(
    callback?: (request: RedirectRequestContract<GererMesAffairesScopes>) => void
  ): Promise<void> {
    const url = await this.redirectUrl((request) => {
      if (typeof callback === 'function') {
        callback(request)
      }
    })

    this.ctx.response.redirect(url)
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(url: string, token: string) {
    const request = this.httpClient(url)

    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs('json')

    return request
  }

  /**
   * Fetches the user details
   */
  protected async getUserInfo(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<Omit<AllyUserContract<GererMesAffairesToken>, 'token'>> {
    const request = this.getAuthenticatedRequest(this.userInfoUrl, token)

    if (typeof callback === 'function') {
      callback(request)
    }

    const body = await request.get()

    return {
      id: body.sub,
      nickName: body.given_name,
      name: body.given_name,
      email: body.email,
      emailVerificationState: body.email_verified ? ('verified' as const) : ('unverified' as const),
      avatarUrl: body.picture,
      original: body,
    }
  }

  /**
   * Find if the current error message is access denied
   */
  accessDenied(): boolean {
    const error = this.getError()

    if (!error) return false

    return error === 'access_denied'
  }

  /**
   * Returns details of the authorized user
   */
  async user(
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<GererMesAffairesToken>> {
    const token = await this.accessToken(callback)
    const user = await this.getUserInfo(token.token, callback)

    return { ...user, token }
  }

  /**
   * Finds the user from access token
   */
  async userFromToken(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>> {
    const user = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }
}
