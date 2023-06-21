import got from 'got'
import {getAllConfigFromApolloUri, getConfigFromCacheUri, getConfigSkipCacheUri, IPayload, mergeConfig} from './helper'

interface IRemoteConfigService {
  configServerUrl: string
  appId: string
  clusterName: string
  apolloEnv: string
  token?: string
}
// Apollo开放平台接入方式
export async function remoteConfigService(config: IRemoteConfigService): Promise<Record<string, string | undefined>> {
  const res = await got.get<IPayload[]>(getAllConfigFromApolloUri(config), {
    headers: {
      authorization: config.token,
    },
    responseType: 'json',
  })
  return mergeConfig(res.body)
}

export interface IRemoteConfigServiceSkipCache {
  configServerUrl: string
  appId: string
  clusterName: string
  namespaceName: string | string[]
  releaseKey?: string
  clientIp?: string
}
// 通过不带缓存的Http接口从Apollo读取配置
export async function remoteConfigServiceSkipCache(
  config: IRemoteConfigServiceSkipCache,
): Promise<Record<string, string | undefined>> {
  const options = {
    responseType: 'json',
  } as const
  const uris: string[] = getConfigSkipCacheUri(config)
  const responses = await Promise.all(uris.map((uri) => got.get(uri, options)))
  const ret = {}
  for (const response of responses) {
    Object.assign(ret, response.body)
  }
  return ret
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
    responseType: 'json',
  } as const
  const uris = getConfigFromCacheUri(config)
  const responses = await Promise.all(uris.map((uri) => got.get<object>(uri, options)))
  const ret = {}
  for (const response of responses) {
    Object.assign(ret, response.body)
  }
  return ret
}
