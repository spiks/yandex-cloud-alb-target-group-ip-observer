import { config } from './config';
import { issueIamToken } from './yandexCloud/iam';
import { listPrivateIpAddressesOfKubernetesNodes } from './yandexCloud/ipResolver';
import { getIpsUsedInTargetGroup, updateIpsInTargetGroup } from './yandexCloud/applicationLoadBalancer';

const sleep = (ms: number): Promise<void> => new Promise<void>((resolve) => setTimeout(resolve, ms));

const areIpsSame = (ips1: Array<string>, ips2: Array<string>): boolean => {
  return JSON.stringify(ips1.sort()) === JSON.stringify(ips2.sort());
};

(async (): Promise<never> => {
  while (true) {
    const iamToken = await issueIamToken(config.yandexCloud.serviceAccountKeyFile);

    const [kubernetesNodeIps, targetGroupIps] = await Promise.all([
      listPrivateIpAddressesOfKubernetesNodes(iamToken, config.yandexCloud.kubernetesCluster.id),
      getIpsUsedInTargetGroup(iamToken, config.yandexCloud.applicationLoadBalancer.targetGroup.id),
    ]);

    if (!areIpsSame(kubernetesNodeIps, targetGroupIps)) {
      await updateIpsInTargetGroup(
        iamToken,
        config.yandexCloud.applicationLoadBalancer.targetGroup.id,
        kubernetesNodeIps,
      );
    }

    await sleep(config.checkFrequency);
  }
})();
