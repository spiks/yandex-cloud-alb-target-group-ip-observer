import fetch from 'node-fetch';
import { logger } from '../logger';

type GetComputeInstanceResponse = {
  networkInterfaces: Array<{
    primaryV4Address: {
      address: string;
    };
  }>;
};

const getPrivateIpAddressesOfComputeInstance = async (iamToken: string, instanceId: string): Promise<Array<string>> => {
  logger.debug(`Fetching compute instance with ID ${instanceId}...`);

  const computeInstanceResponse = await fetch(
    `https://compute.api.cloud.yandex.net/compute/v1/instances/${instanceId}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${iamToken}`,
      },
    },
  );

  const computeInstanceData: GetComputeInstanceResponse = await computeInstanceResponse.json();

  return computeInstanceData.networkInterfaces.map((networkInterface) => networkInterface.primaryV4Address.address);
};

type ListNodesResponse = {
  nodes: Array<{
    cloudStatus: {
      id: string;
    };
  }>;
};

export const listPrivateIpAddressesOfKubernetesNodes = async (
  iamToken: string,
  clusterId: string,
): Promise<Array<string>> => {
  logger.debug(`Fetching nodes of Kubernetes cluster with ID ${clusterId}...`);

  const listNodesResponse = await fetch(
    `https://mks.api.cloud.yandex.net/managed-kubernetes/v1/clusters/${clusterId}/nodes`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${iamToken}`,
      },
    },
  );

  const listNodesData: ListNodesResponse = await listNodesResponse.json();

  const ips = await Promise.all(
    listNodesData.nodes.map((node) => getPrivateIpAddressesOfComputeInstance(iamToken, node.cloudStatus.id)),
  );

  // flattens array of arrays into one flat array of ips
  return Array.prototype.concat.apply([], ips);
};
