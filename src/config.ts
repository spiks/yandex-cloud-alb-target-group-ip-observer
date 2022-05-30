import assert from 'assert';
import dotenv from 'dotenv';

dotenv.config();

assert(process.env['YC_KUBERNETES_CLUSTER_ID'], 'Environment variable YC_KUBERNETES_CLUSTER_ID should be defined');
assert(process.env['YC_ALB_TARGET_GROUP_ID'], 'Environment variable YC_ALB_TARGET_GROUP_ID should be defined');
assert(
  process.env['YC_SERVICE_ACCOUNT_KEY_FILE'],
  'Environment variable YC_SERVICE_ACCOUNT_KEY_FILE should be defined and it should contain valid IAM key for service account in JSON format, see https://cloud.yandex.ru/docs/iam/operations/iam-token/create-for-sa',
);

const parsedServiceAccountKeyFile = JSON.parse(process.env['YC_SERVICE_ACCOUNT_KEY_FILE']);

export const config = {
  yandexCloud: {
    serviceAccount: {
      serviceAccountId: parsedServiceAccountKeyFile.service_account_id,
      accessKeyId: parsedServiceAccountKeyFile.id,
      privateKey: parsedServiceAccountKeyFile.private_key,
    },
    kubernetesCluster: {
      id: process.env['YC_KUBERNETES_CLUSTER_ID'],
    },
    applicationLoadBalancer: {
      targetGroup: {
        id: process.env['YC_ALB_TARGET_GROUP_ID'],
      },
    },
  },
  checkFrequency: process.env['CHECK_FREQUENCY'] !== undefined ? parseInt(process.env['CHECK_FREQUENCY']) : 10000,
  sentry: {
    environment: process.env['SENTRY_ENVIRONMENT'],
    dsn: process.env['SENTRY_DSN'],
    release: process.env['APP_VERSION'],
  },
};
