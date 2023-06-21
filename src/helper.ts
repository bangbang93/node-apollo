import {get} from 'lodash'

export interface IGetConfigSkipCacheUri {
  configServerUrl: string
  appId: string
  clusterName: string
  namespaceName: string | string[]
  releaseKey?: string
  clientIp?: string
}
// 通过不带缓存的Http接口从Apollo读取配置
export function getConfigSkipCacheUri(config: IGetConfigSkipCacheUri): string[] {
  const {configServerUrl, appId, clusterName, namespaceName, clientIp} = config
  const releaseKey = config.releaseKey ?? ''
  if (Array.isArray(namespaceName)) {
    if (namespaceName.length === 0) return [url('application')]
    return namespaceName.map((n) => url(n))
  } else {
    return [url(namespaceName)]
  }
  function url(namespace: string): string {
    if (clientIp) {
      return `${configServerUrl}/configs/${appId}/${clusterName}/${namespace}?releaseKey=${releaseKey}&ip=${clientIp}`
    } else {
      return `${configServerUrl}/configs/${appId}/${clusterName}/${namespace}?releaseKey=${releaseKey}`
    }
  }
}

function toJSON(str: string): unknown {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

export interface IPayload {
  isPublic: boolean
  items: {
    key: string
    value: string
  }[]
}

// 合并配置
export function mergeConfig(payload: IPayload[]): Record<string, string | undefined> {
  const publicPayload: object[] = []
  const privatePayload: object[] = []
  for (const meta of payload) {
    if (meta.isPublic) {
      publicPayload.push(..._itemsPick(meta.items))
    } else {
      privatePayload.push(..._itemsPick(meta.items))
    }
  }
  // Apollo配置加载顺序如下，后加载的会覆盖前面的同名配置
  // -> 公开配置
  // -> 私有配置
  return Object.assign({}, ...privatePayload, ...publicPayload) as Record<string, string | undefined>
}

export function mergeConfigurations(payload: object[]): Record<string, string | undefined> {
  // 从缓存和非缓存获取的response报文不一致
  const ret = payload.map((pl): Record<string, string | undefined> => {
    const content = get(pl, 'data.content')
    if (content) return JSON.parse(content) as Record<string, string | undefined>
    const ret: unknown = get(pl, 'data.configurations') ?? get(pl, 'data')
    return ret as Record<string, string | undefined>
  })
  return Object.assign({}, ...ret) as Record<string, string | undefined>
}

interface IGetAllConfigFromApolloUri {
  configServerUrl: string
  appId: string
  clusterName: string
  apolloEnv: string
}
// 获取集群下所有Namespace信息接口
export function getAllConfigFromApolloUri(config: IGetAllConfigFromApolloUri) {
  const {configServerUrl, appId, clusterName, apolloEnv} = config
  return `${configServerUrl}/openapi/v1/envs/${apolloEnv}/apps/${appId}/clusters/${clusterName}/namespaces`
}

interface IGetConfigFromCacheUri {
  configServerUrl: string
  appId: string
  clusterName: string
  namespaceName: string | string[]
  clientIp?: string
}
// 通过带缓存的Http接口从Apollo读取配置
export function getConfigFromCacheUri(config: IGetConfigFromCacheUri) {
  const {configServerUrl, appId, clusterName, namespaceName, clientIp} = config
  if (Array.isArray(namespaceName)) {
    if (namespaceName.length === 0) return [url('application')]
    return namespaceName.map((n) => url(n))
  } else {
    return [url(namespaceName)]
  }
  function url(namespace: string) {
    if (clientIp) {
      return `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespace}?ip=${clientIp}`
    } else {
      return `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespace}`
    }
  }
}

function _itemsPick(items: {key: string; value: string}[]) {
  const ret: object[] = []
  for (const item of items) {
    ret.push({
      [item.key]: toJSON(item.value),
    })
  }
  return ret
}
