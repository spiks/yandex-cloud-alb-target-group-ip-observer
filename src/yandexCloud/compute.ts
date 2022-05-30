import { logger } from '../logger';
import { getComputeClient } from './client';
import { cloudApi } from '@yandex-cloud/nodejs-sdk';
import { notUndefined } from '../utils';

export const getPrivateIpAddressesOfComputeInstance = async (instanceId: string): Promise<Array<string>> => {
  logger.debug(`Fetching compute instance with ID ${instanceId}...`);

  const response = await getComputeClient().get(
    cloudApi.compute.instance_service.GetInstanceRequest.fromPartial({
      instanceId: instanceId,
    }),
  );

  return response.networkInterfaces
    .map((networkInterface) => networkInterface.primaryV4Address?.address)
    .filter(notUndefined);
};
