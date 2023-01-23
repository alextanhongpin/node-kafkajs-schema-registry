# node-kafka-schema-registry

There are two options for Schema Registry, mainly
- Confluent Schema Registry
- Apicurio Schema Registry


Both works with the following:

- Avro (default)
- Protobuf
- JsonSchema

However, Confluent Schema Registry will store the schemas in Kafka while Apicurio Schema Registry has several options including in-memory and Postgresql.

If storage is an important consideration, then choose Apicurio.

## Confluent Schema Registry

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


# Apicurio Schema Registry

```
$ open http://localhost:8080/apis
```

For Confluent Schema Registry compatible APIs, use the host endpoint:

```
$ localhost:8080/apis/ccompat/v7
$ curl localhost:8080/apis/ccompat/v7/subjects
```

## References

- https://www.confluent.io/blog/schema-registry-for-beginners/
- https://docs.confluent.io/platform/current/schema-registry/avro.html#forward-compatibility
