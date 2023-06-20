'use strict';

import assert from 'assert'
import got from 'got'
import {
  getAllConfigFromApolloUri, getConfigFromCacheUri, getConfigSkipCacheUri, mergeConfig, mergeConfigurations,
} from './helper'

// Apollo开放平台接入方式
export async function remoteConfigService (config: any): Promise<Record<string, string>> {
  assert(config, 'param config is required');
  assert(config.token, 'param token is required');
  const res = await got.get<any[]>(getAllConfigFromApolloUri(config), {
    headers: {
      authorization: config.token,
    },
    rejectUnauthorized: true,
    responseType: 'json',
  });
  assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor');
  return mergeConfig(res.body);
}

// 通过不带缓存的Http接口从Apollo读取配置
export async function remoteConfigServiceSkipCache(config: any): Promise<Record<string, string>> {
  assert(config, 'param config is required');
  const options = {
    rejectUnauthorized: true,
    responseType: 'json',
  } as const
  const URIs: string[] = getConfigSkipCacheUri(config);
  const bundle = await Promise.all(URIs.map(uri => got.get(uri, options)));
  for (let res of bundle) {
    assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor');
  }
  return mergeConfigurations(bundle);
}

//通过带缓存的Http接口从Apollo读取配置
export async function remoteConfigServiceFromCache (config: any): Promise<Record<string, string>> {
  assert(config, 'param config is required');
  const options = {
    rejectUnauthorized: true,
    responseType: 'json'
  } as const
  const URIs = getConfigFromCacheUri(config);
  const bundle = await Promise.all(URIs.map(uri => got.get(uri, options)));
  for (let res of bundle) {
    assert(res.statusCode === 200, 'apollo host unavailable, please contact your administrtor');
  }
  return mergeConfigurations(bundle);
}
