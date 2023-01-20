# node-kafka-schema-registry

Confluent Schema Registry with AVRO.


## Start

```bash
$ make up
```

## Stop

```bash
$ make down
```

## APIs

Reference [here](https://docs.confluent.io/platform/current/schema-registry/develop/api.html#subjects).

```bash
# Get schemas.
$ curl localhost:8081/schemas | jq

# Get schema by id.
$ curl localhost:8081/schemas/ids/{id} | jq

# Get schema versions by id.
$ curl localhost:8081/schemas/ids/{id}/versions | jq

$ curl localhost:8081/schemas/types | jq

# Get subjects.
$ curl localhost:8081/subjects | jq


# Update compatibility for subject
$ curl -X PUT -H 'Content-Type: application/vnd.schemaregistry.v1+json' localhost:8081/config/examples\.RandomTest -d '{"compatibility": "FORWARD"}'
```
