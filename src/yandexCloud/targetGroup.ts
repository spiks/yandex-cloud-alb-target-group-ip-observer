import { logger } from '../logger';
import { cloudApi } from '@yandex-cloud/nodejs-sdk';
import { config } from '../config';
import { notUndefined } from '../utils';
import { getAlbTargetGroupClient } from './client';

export const getIpsUsedInTargetGroup = async (): Promise<Array<string>> => {
  logger.debug(`Fetching target group with ID ${config.yandexCloud.applicationLoadBalancer.targetGroup.id}...`);

  const response = await getAlbTargetGroupClient().get(
    cloudApi.apploadbalancer.target_group_service.GetTargetGroupRequest.fromPartial({
      targetGroupId: config.yandexCloud.applicationLoadBalancer.targetGroup.id,
    }),
  );

  return response.targets.map((target) => target.ipAddress).filter(notUndefined);
};

export const updateIpsInTargetGroup = async (ips: Array<string>): Promise<void> => {
  logger.debug(
    `Updating target group with ID ${
      config.yandexCloud.applicationLoadBalancer.targetGroup.id
    } with new IP addresses (${ips.join(', ')})...`,
  );

  const response = await getAlbTargetGroupClient().update(
    cloudApi.apploadbalancer.target_group_service.UpdateTargetGroupRequest.fromPartial({
      targetGroupId: config.yandexCloud.applicationLoadBalancer.targetGroup.id,
      updateMask: {
        paths: ['targets'],
      },
      targets: ips.map((ip) => ({
        ipAddress: ip,
        privateIpv4Address: true,
      })),
    }),
  );

  if (response.error !== undefined) {
    logger.error(
      `Failed to update target group with ID ${config.yandexCloud.applicationLoadBalancer.targetGroup.id}: ${response.error.message}`,
    );

    return;
  }

  logger.notice(
    `Target group with ID ${
      config.yandexCloud.applicationLoadBalancer.targetGroup.id
    } successfully updated with new IP addresses (${ips.join(', ')})!`,
  );
};
