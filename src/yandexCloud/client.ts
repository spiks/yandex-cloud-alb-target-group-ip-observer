import { serviceClients, Session } from '@yandex-cloud/nodejs-sdk';
import { config } from '../config';
import { logger } from '../logger';
import { IamTokenService } from '@yandex-cloud/nodejs-sdk/dist/token-service/iam-token-service';

const getSession = (): Session => {
  return new Session({ serviceAccountJson: config.yandexCloud.serviceAccount });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getAlbTargetGroupClient = () => {
  return getSession().client(serviceClients.AlbTargetGroupServiceClient);
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getComputeClient = () => {
  return getSession().client(serviceClients.InstanceServiceClient);
};

export const issueIamToken = async (): Promise<string> => {
  logger.debug('Issuing IAM token...');

  const iamTokenService = new IamTokenService(config.yandexCloud.serviceAccount);

  return iamTokenService.getToken();
};
