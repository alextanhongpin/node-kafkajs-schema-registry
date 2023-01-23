import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
// To connect to Confluent Schema Registry
//const registry = new SchemaRegistry({ host: "http://localhost:8081" });

// To connect to Apicurio Schema Registry
const registry = new SchemaRegistry({
  host: "http://localhost:8080/apis/ccompat/v7",
});

// This is idempotent, no matter how many times we re-run this, it will only
// register once.
function createSchema(version = 1) {
  // It is important to set the default, so that the fields can be added or
  // removed without breaking compatibility.
  const schema1 = `{
    "type": "record",
    "name": "RandomTest",
    "namespace": "com.example",
    "fields": [
      {"type": "string", "name": "fullName", "default": ""}
    ]
  }`;

  // Add new field age.
  const schema2 = `{
    "type": "record",
    "name": "RandomTest",
    "namespace": "com.example",
    "fields": [
      {"type": "string", "name": "fullName", "default": ""},
      {"type": "int", "name": "age", "default": -1}
    ]
  }`;

  // Deletes the field fullName
  const schema3 = `{
    "type": "record",
    "name": "RandomTest",
    "namespace": "com.example",
    "fields": [
      {"type": "int", "name": "age", "default": -1}
    ]
  }`;

  switch (version) {
    case 1:
      return schema1;
    case 2:
      return schema2;
    case 3:
      return schema3;
    default:
      throw new Error("unknown schema version");
  }
}

const schema = createSchema(1);

const { id } = await registry.register(
  {
    type: SchemaType.AVRO,
    schema,
  },
  {
    compatibility: "BACKWARD", // Default
  }
);

console.log("registered avro schema with id", { id });

// Encode using uploaded schema.
const payload = { fullName: "John Doe", age: 10 };
const encodedPayload = await registry.encode(id, payload);
const decodedPayload = await registry.decode(encodedPayload);
console.log({ encodedPayload, decodedPayload });

console.log((await registry.getSchema(id)).name);
const latestId = await registry.getLatestSchemaId("com.example.RandomTest");
console.log({ latestId });

export { registry, schema, id };
