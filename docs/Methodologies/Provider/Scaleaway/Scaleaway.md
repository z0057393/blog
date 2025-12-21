# Tips

## Login to container registry

```bash
docker login rg.fr-par.scw.cloud/<NAMESPACE> -u nologin --password-stdin <<< <API_KEY>
```

## Push to container registry

```bash
docker tag <IMAGE_NAME>:latest rg.fr-par.scw.cloud/<NAMESPACE>/<IMAGE_NAME>:v0.1
```

```bash
docker push rg.fr-par.scw.cloud/<NAMESPACE>/<IMAGE_NAME>:v0.1
```

## Download kubeconfig

```bash
scw k8s kubeconfig get cluster-id=<CLUSTER_ID> > ~/.kube/config-aial
```
