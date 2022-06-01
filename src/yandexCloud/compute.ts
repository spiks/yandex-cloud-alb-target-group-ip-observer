import { logger } from '../logger';
import { cloudApi } from '@yandex-cloud/nodejs-sdk';
import { notUndefined } from '../utils';
import { computeClient } from './client';

export const getPrivateIpAddressesOfComputeInstance = async (instanceId: string): Promise<Array<string>> => {
  logger.debug(`Fetching compute instance with ID ${instanceId}...`);

  const response = await computeClient.get(
    cloudApi.compute.instance_service.GetInstanceRequest.fromPartial({
      instanceId: instanceId,
    }),
  );

  return response.networkInterfaces
    .map((networkInterface) => networkInterface.primaryV4Address?.address)
    .filter(notUndefined);
};
