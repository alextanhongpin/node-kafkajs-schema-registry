import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
const registry = new SchemaRegistry({ host: "http://localhost:8081" });

// This is idempotent, no matter how many times we re-run this, it will only
// register once.
//const schema = `{
//"type": "record",
//"name": "RandomTest",
//"namespace": "examples",
//"fields": [{"type": "string", "name": "fullName"}]
//}`;

// Add new field age.
const schema = `{
  "type": "record",
  "name": "RandomTest",
  "namespace": "examples",
  "fields": [
    {"type": "string", "name": "fullName"},
    {"type": "int", "name": "age"}
  ]
}`;

// Change compatibility of the subject to forward first.
// curl -X PUT -H 'Content-Type: application/vnd.schemaregistry.v1+json' localhost:8081/config/examples\.RandomTest -d '{"compatibility": "FORWARD"}'
const { id } = await registry.register(
  {
    type: SchemaType.AVRO,
    schema,
  },
  {
    compatibility: "FORWARD",
  }
);

console.log("registered schema with id", { id });

export { registry, schema, id };
