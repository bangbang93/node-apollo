import {config} from 'dotenv'
import {remoteConfigService, remoteConfigServiceFromCache, remoteConfigServiceSkipCache} from '../src/apollo'

config()

const configServerUrl = process.env.APOLLO_CONFIG_SERVER_URL!
const appId = process.env.APOLLO_CONFIG_APPID!
const clusterName = process.env.APOLLO_CONFIG_CLUSTER!
const namespaceName = process.env.APOLLO_CONFIG_NAMESPACES?.split(',') ?? ['default']

describe('#index', () => {
  it.skip('index.remoteConfigService', async () => {
    const eggConfig = {
      configServerUrl,
      appId,
      clusterName,
      namespaceName,
      apolloEnv: 'dev',
    }
    const result = await remoteConfigService(eggConfig)
    expect(result).not.toBe({})
  })
  // 通过带缓存的Http接口从Apollo读取配置
  it('index.remoteConfigServiceFromCache', async () => {
    const eggConfig = {
      configServerUrl,
      appId,
      clusterName,
      namespaceName,
    }
    const result = await remoteConfigServiceFromCache(eggConfig)

    expect(result).not.toBe({})
  })
  // 通过不带缓存的Http接口从Apollo读取配置
  it('index.remoteConfigServiceSikpCache', async () => {
    const eggConfig = {
      configServerUrl,
      appId,
      clusterName,
      namespaceName,
    }
    const result = await remoteConfigServiceSkipCache(eggConfig)

    expect(result).not.toBe({})
  })
})
