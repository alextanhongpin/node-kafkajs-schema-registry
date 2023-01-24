import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
import { loadSchema } from "./schemas";
// To connect to Confluent Schema Registry
//const registry = new SchemaRegistry({ host: "http://localhost:8081" });

// To connect to Apicurio Schema Registry
const registry = new SchemaRegistry({
  host: "http://localhost:8080/apis/ccompat/v7",
});

// This is idempotent, no matter how many times we re-run this, it will only
// register once.
async function createSchema(version = 1) {
  // It is important to set the default, so that the fields can be added or
  // removed without breaking compatibility.
  const schemas = {
    1: await loadSchema("./schemas/avro/person_v1.avsc"),
    // Add new field age.
    2: await loadSchema("./schemas/avro/person_v2.avsc"),
    // Delete field fullName
    3: await loadSchema("./schemas/avro/person_v3.avsc"),
  };
  if (!(version in schemas)) {
    throw new Error("unknown schema version");
  }

  return schemas[version];
}

const schema = await createSchema(1);
const subject = "com.example.RandomTest";

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
const latestId = await registry.getLatestSchemaId(subject);
console.log({ latestId });

export { registry, schema, id };
