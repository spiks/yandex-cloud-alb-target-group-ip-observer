import { logger } from '../logger';
import fetch from 'node-fetch';

type GetTargetGroupResponse = {
  targets: Array<{
    ipAddress: string;
  }>;
};

export const getIpsUsedInTargetGroup = async (iamToken: string, targetGroupId: string): Promise<Array<string>> => {
  logger.debug(`Fetching target group with ID ${targetGroupId}...`);

  const getTargetGroupResponse = await fetch(
    `https://alb.api.cloud.yandex.net/apploadbalancer/v1/targetGroups/${targetGroupId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${iamToken}`,
      },
    },
  );

  const getTargetGroupData: GetTargetGroupResponse = await getTargetGroupResponse.json();

  const ips = await Promise.all(getTargetGroupData.targets.map((target) => target.ipAddress));

  return ips;
};

export const updateIpsInTargetGroup = async (
  iamToken: string,
  targetGroupId: string,
  ips: Array<string>,
): Promise<void> => {
  logger.debug(`Updating target group with ID ${targetGroupId} with new IP addresses (${ips.join(', ')})...`);

  const getTargetGroupResponse = await fetch(
    `https://alb.api.cloud.yandex.net/apploadbalancer/v1/targetGroups/${targetGroupId}`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${iamToken}`,
      },
      body: JSON.stringify({
        updateMask: 'targets',
        targets: ips.map((ip) => ({
          ipAddress: ip,
          privateIpv4Address: true,
        })),
      }),
    },
  );

  if (getTargetGroupResponse.status === 200) {
    logger.notice(
      `Target group with ID ${targetGroupId} successfully updated with new IP addresses (${ips.join(', ')})!`,
    );
  } else {
    logger.error(`Failed to update target group with ID ${targetGroupId}: ${await getTargetGroupResponse.text()}`);
  }
};
