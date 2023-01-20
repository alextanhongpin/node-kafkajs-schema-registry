import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
const registry = new SchemaRegistry({ host: "http://localhost:8081" });

// This is idempotent, no matter how many times we re-run this, it will only
// register once.
const schema = `{
  "type": "record",
  "name": "RandomTest",
  "namespace": "examples",
  "fields": [{"type": "string", "name": "fullName"}]
}`;

const { id } = await registry.register({
  type: SchemaType.AVRO,
  schema,
});

console.log("registered schema with id", { id });

export { registry, schema, id };
