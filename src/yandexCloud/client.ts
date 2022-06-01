import { serviceClients, Session } from '@yandex-cloud/nodejs-sdk';
import { config } from '../config';
import { logger } from '../logger';
import { IamTokenService } from '@yandex-cloud/nodejs-sdk/dist/token-service/iam-token-service';

const ycSession = new Session({ serviceAccountJson: config.yandexCloud.serviceAccount });

const ycIamTokenService = new IamTokenService(config.yandexCloud.serviceAccount);

export const albTargetGroupClient = ycSession.client(serviceClients.AlbTargetGroupServiceClient);

export const computeClient = ycSession.client(serviceClients.InstanceServiceClient);

export const issueIamToken = async (): Promise<string> => {
  logger.debug('Issuing IAM token...');

  return ycIamTokenService.getToken();
};
