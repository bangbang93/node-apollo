import assert from 'assert'
import got from 'got'
import {
  getAllConfigFromApolloUri,
  getConfigFromCacheUri,
  getConfigSkipCacheUri,
  IPayload,
  mergeConfig,
  mergeConfigurations,
} from './helper'

interface IRemoteConfigService {
  configServerUrl: string
  appId: string
  clusterName: string
  apolloEnv: string
  token: string
}
// Apollo开放平台接入方式
export async function remoteConfigService(config: IRemoteConfigService): Promise<Record<string, string | undefined>> {
  const res = await got.get<IPayload[]>(getAllConfigFromApolloUri(config), {
    headers: {
      authorization: config.token,
    },
    rejectUnauthorized: true,
    responseType: 'json',
  })
  assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor')
  return mergeConfig(res.body)
}

export interface IRemoteConfigServiceFromCache {
  configServerUrl: string
  appId: string
  clusterName: string
  namespaceName: string | string[]
  releaseKey: string
  clientIp?: string
}
// 通过不带缓存的Http接口从Apollo读取配置
export async function remoteConfigServiceSkipCache(
  config: IRemoteConfigServiceFromCache,
): Promise<Record<string, string | undefined>> {
  const options = {
    rejectUnauthorized: true,
    responseType: 'json',
  } as const
  const uris: string[] = getConfigSkipCacheUri(config)
  const bundle = await Promise.all(uris.map((uri) => got.get(uri, options)))
  for (const res of bundle) {
    assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor')
  }
  return mergeConfigurations(bundle)
}

export interface IRemoteConfigServiceFromCache {
  configServerUrl: string
  appId: string
  clusterName: string
  namespaceName: string | string[]
  clientIp?: string
}
//通过带缓存的Http接口从Apollo读取配置
export async function remoteConfigServiceFromCache(
  config: IRemoteConfigServiceFromCache,
): Promise<Record<string, string | undefined>> {
  const options = {
    rejectUnauthorized: true,
    responseType: 'json',
  } as const
  const uris = getConfigFromCacheUri(config)
  const bundle = await Promise.all(uris.map((uri) => got.get(uri, options)))
  for (const res of bundle) {
    assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor')
  }
  return mergeConfigurations(bundle)
}
