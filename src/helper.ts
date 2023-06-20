export interface IGetConfigSkipCacheUri {
  configServerUrl: string
  appId: string
  clusterName: string
  namespaceName: string | string[]
  releaseKey: string
  clientIp?: string
}
// 通过不带缓存的Http接口从Apollo读取配置
export function getConfigSkipCacheUri(config: IGetConfigSkipCacheUri): string[] {
  const { configServerUrl, appId, clusterName, namespaceName, releaseKey, clientIp } = config;
  if (Array.isArray(namespaceName)) {
    if (namespaceName.length === 0) return [url('application')];
    return namespaceName.map(n => url(n));
  } else {
    return [url(namespaceName)];
  }
  function url(namespace: string) {
    if (clientIp) {
      return `${configServerUrl}/configs/${appId}/${clusterName}/${namespace}?releaseKey=${releaseKey}&ip=${clientIp}`
    } else {
      return `${configServerUrl}/configs/${appId}/${clusterName}/${namespace}?releaseKey=${releaseKey}`
    }
  }
}
// https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
// 先判断是否是JSON String 格式，不是则直接返回原始string
function toJSON(str: string) {
  if (/^[\],:{}\s]*$/.test(str.replace(/\\["\\\/bfnrtu]/g, '@').
  replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
  replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
    return JSON.parse(str);
  } else {
    return str;
  }
}

interface IPayload {
  isPublic: boolean
  items: {
    key: string
    value: string
  }[]
}

// 合并配置
export function mergeConfig(payload: IPayload[]): Record<string, string> {
  const publicPayload = [];
  const privatePayload = [];
  for (let meta of payload) {
    if (meta.isPublic) {
      publicPayload.push(..._itemsPick(meta.items));
    } else {
      privatePayload.push(..._itemsPick(meta.items));
    }
  }
  // Apollo配置加载顺序如下，后加载的会覆盖前面的同名配置
  // -> 公开配置
  // -> 私有配置
  return Object.assign({}, ...privatePayload, ...publicPayload);
}

export function mergeConfigurations(payload: any[]) {
  // 从缓存和非缓存获取的response报文不一致
  const confs = payload.map(pl => pl.data.content ? JSON.parse(pl.data.content) : (pl.data.configurations || pl.data));
  return Object.assign({}, ...confs);
}

interface IGetAllConfigFromApolloUri {
  configServerUrl: string
  appId: string
  clusterName: string
  apolloEnv: string
}
// 获取集群下所有Namespace信息接口
export function getAllConfigFromApolloUri(config: IGetAllConfigFromApolloUri) {
  const { configServerUrl, appId, clusterName, apolloEnv } = config;
  return `${configServerUrl}/openapi/v1/envs/${apolloEnv}/apps/${appId}/clusters/${clusterName}/namespaces`;
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
  const { configServerUrl, appId, clusterName, namespaceName, clientIp } = config;
  if (Array.isArray(namespaceName)) {
    if (namespaceName.length === 0) return [url('application')];
    return namespaceName.map(n => url(n));
  } else {
    return [url(namespaceName)];
  }
  function url(namespace: string) {
    if (clientIp) {
      return `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespace}?ip=${clientIp}`
    } else {
      return `${configServerUrl}/configfiles/json/${appId}/${clusterName}/${namespace}`
    }
  }
}

function _itemsPick(items: { key: string, value: string }[]) {
  const ret = [];
  for (let item of items) {
    let obj: any = {};
    obj[item.key] = toJSON(item.value);
    ret.push(obj);
  }
  return ret;
}
