import { logger } from '../logger';
import fetch from 'node-fetch';
import { config } from '../config';
import { getPrivateIpAddressesOfComputeInstance } from './compute';
import { issueIamToken } from './client';

type ListNodesResponse = {
  nodes: Array<{
    cloudStatus: {
      id: string;
    };
  }>;
};

export const listPrivateIpAddressesOfKubernetesNodes = async (): Promise<Array<string>> => {
  logger.debug(`Fetching nodes of Kubernetes cluster with ID ${config.yandexCloud.kubernetesCluster.id}...`);

  const listNodesResponse = await fetch(
    `https://mks.api.cloud.yandex.net/managed-kubernetes/v1/clusters/${config.yandexCloud.kubernetesCluster.id}/nodes`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${await issueIamToken()}`,
      },
    },
  );

  const listNodesData: ListNodesResponse = await listNodesResponse.json();

  const ips = await Promise.all(
    listNodesData.nodes.map((node) => getPrivateIpAddressesOfComputeInstance(node.cloudStatus.id)),
  );

  // flattens array of arrays into one flat array of ips
  return Array.prototype.concat.apply([], ips);
};
