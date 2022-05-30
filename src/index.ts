import { config } from './config';
import { getIpsUsedInTargetGroup, updateIpsInTargetGroup } from './yandexCloud/targetGroup';
import * as sentry from '@sentry/node';
import type { NodeOptions } from '@sentry/node/dist/types';
import { listPrivateIpAddressesOfKubernetesNodes } from './yandexCloud/managedKubernetes';
import { logger } from './logger';

const sleep = (ms: number): Promise<void> => new Promise<void>((resolve) => setTimeout(resolve, ms));

const areIpsSame = (ips1: Array<string>, ips2: Array<string>): boolean => {
  return JSON.stringify(ips1.sort()) === JSON.stringify(ips2.sort());
};

if (config.sentry.dsn !== undefined) {
  const sentryConfig: NodeOptions = {
    dsn: config.sentry.dsn,
  };

  if (config.sentry.release !== undefined) {
    sentryConfig.release = config.sentry.release;
  }

  if (config.sentry.environment !== undefined) {
    sentryConfig.environment = config.sentry.environment;
  }

  sentry.init(sentryConfig);
}

(async (): Promise<never> => {
  logger.info(
    `Waiting until IP desynchronization occurs in Kubernetes Nodes (cluster "${config.yandexCloud.kubernetesCluster.id}") and Application Load Balancer (target group "${config.yandexCloud.applicationLoadBalancer.targetGroup.id}"), checking every ${config.checkFrequency} ms...`,
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [kubernetesNodeIps, targetGroupIps] = await Promise.all([
      listPrivateIpAddressesOfKubernetesNodes(),
      getIpsUsedInTargetGroup(),
    ]);

    if (!areIpsSame(kubernetesNodeIps, targetGroupIps)) {
      await updateIpsInTargetGroup(kubernetesNodeIps);
    }

    await sleep(config.checkFrequency);
  }
})();
