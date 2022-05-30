# Yandex Cloud ALB Target Group IP observer for Kubernetes

Daemon that maintains list of actual IPs in Yandex Cloud Target Group (Application Load Balancer) by constantly looking for changes of Kubernetes nodes' IP addresses.

## Motivation

If you use [Application Load Balancer](https://cloud.yandex.ru/services/application-load-balancer) in Yandex Cloud with [Yandex Managed Service for Kubernetes](https://cloud.yandex.ru/services/managed-kubernetes) that directs traffic using private network to node ports, eventually you may face strange issue: when your nodes reboot for any reason (maintenance, failure, manual reboot, doesn't matter), its private IP changes, but configuration of target group used by Application Load Balancer doesn't update - it keeps using old IP, which leads to 502 Bad Gateway errors. And it's impossible to configure it to follow IP changes which is a shame.

Official solution that Yandex suggests is [using their Ingress Controller](https://cloud.yandex.ru/docs/managed-kubernetes/solutions/alb-ingress-controller), but it has a lot of disadvantages:

- It's proprietary.
- It has poor documentation.
- It maintains all resources required for Application Load Balancer (HTTP routers, Backend Groups, Target Groups), so you can't configure it to maintain only Target Groups. This is a big problem because the Ingress Controller lacks huge amount of options that's possible to configure by yourself in ALB.
- You can't run `kubectl delete ingress my-ingress-name` on such Ingress resources because they will use [finalizer](https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/).
- When you delete Ingress resource or entire Kubernetes cluster, created by Ingress Controller ALB resources (HTTP routers, Backend Groups, Target Groups) won't be cleaned up automatically - you will have to remove them manually.

So it's nearly impossible to use this Ingress Controller with Terraform or any other similar IaC solution.

## Installation

This daemon uses Yandex Cloud API to fetch information about nodes used in Kubernetes cluster and Target Group used in Application Load Balancer. It does not utilize Kubernetes API, so it's not mandatory to deploy it within your Kubernetes cluster. You may deploy it anywhere. If you're planning to deploy it within Kubernetes cluster, deploying it as Deployment with 1 replica should be enough.

The daemon distributed as Docker image. [Check out Packages page of this repository to see all Docker image versions and information about how to install it](https://github.com/spiks/yandex-cloud-alb-target-group-ip-observer/pkgs/container/yandex-cloud-alb-target-group-ip-observer).

### Configuration

The daemon is only configurable via environment variables. For documentation, see [`.env.dist`](./.env.dist) file.
