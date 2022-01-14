import jsonwebtoken from 'jsonwebtoken';
import fetch from 'node-fetch';
import { logger } from '../logger';

export const issueIamToken = async (serviceAccountKeyFile: string): Promise<string> => {
  logger.info('Issuing IAM token...');

  type ServiceAccountKeyFile = {
    id: string;
    private_key: string;
    service_account_id: string;
  };

  const isServiceAccountKeyFile = (value: unknown): value is ServiceAccountKeyFile => {
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    const isObject = (obj: unknown): obj is Partial<Record<keyof ServiceAccountKeyFile, unknown>> => {
      return typeof obj === 'object' && obj !== null;
    };

    return (
      isObject(value) &&
      typeof value.id === 'string' &&
      typeof value.private_key === 'string' &&
      typeof value.service_account_id === 'string'
    );
  };

  const buildJwt = (iamCredentials: {
    credentialsId: string;
    privateKey: string;
    serviceAccountId: string;
  }): string => {
    return jsonwebtoken.sign({}, iamCredentials.privateKey, {
      algorithm: 'PS256',
      expiresIn: 3600,
      issuer: iamCredentials.serviceAccountId,
      audience: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
      keyid: iamCredentials.credentialsId,
    });
  };

  const serviceAccountKeyKey = JSON.parse(serviceAccountKeyFile) as unknown;

  if (!isServiceAccountKeyFile(serviceAccountKeyKey)) {
    throw new Error(
      'Service account key file contains JSON in invalid format, see https://cloud.yandex.ru/docs/iam/operations/iam-token/create-for-sa',
    );
  }

  const issuedIamKeyResponse = await fetch('https://iam.api.cloud.yandex.net/iam/v1/tokens', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jwt: buildJwt({
        credentialsId: serviceAccountKeyKey.id,
        privateKey: serviceAccountKeyKey.private_key,
        serviceAccountId: serviceAccountKeyKey.service_account_id,
      }),
    }),
  });

  type IssuedIamKeyJson = {
    expiresAt: string;
    iamToken: string;
  };

  const isIssuedIamKeyJson = (value: unknown): value is IssuedIamKeyJson => {
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    const isObject = (obj: unknown): obj is Partial<Record<keyof IssuedIamKeyJson, unknown>> => {
      return typeof obj === 'object' && obj !== null;
    };

    return isObject(value) && typeof value.iamToken === 'string' && typeof value.expiresAt === 'string';
  };

  const issuedIamKeyJson = (await issuedIamKeyResponse.json()) as unknown;

  if (!isIssuedIamKeyJson(issuedIamKeyJson)) {
    throw new Error(
      `Yandex returned invalid response when trying to issue IAM key: ${JSON.stringify(issuedIamKeyJson)}`,
    );
  }

  return issuedIamKeyJson.iamToken;
};
