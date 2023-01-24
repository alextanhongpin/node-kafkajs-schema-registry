import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
import { loadSchema } from "./schemas";
const registry = new SchemaRegistry({ host: "http://localhost:8081" });

// This is idempotent, no matter how many times we re-run this, it will only
// register once.
async function createSchema(version = 1) {
  // It is important to set the default, so that the fields can be added or
  // removed without breaking compatibility.
  const schemas = {
    1: await loadSchema("./schemas/proto/person_v1.proto"),
    // Add field age.
    2: await loadSchema("./schemas/proto/person_v2.proto"),
    // Remove field fullName.
    3: await loadSchema("./schemas/proto/person_v3.proto"),
  };
  if (!(version in schemas)) {
    throw new Error("unknown schema version");
  }

  return schemas[version];
}

const schema = await createSchema(1);
const subject = "auth.Person.proto";

const { id } = await registry.register(
  {
    type: SchemaType.PROTOBUF,
    schema,
  },
  {
    compatibility: "BACKWARD", // Default
    subject,
  }
);

console.log("registered proto schema with id", { id });

// Encode using uploaded schema.
const payload = { fullName: "John Doe", age: 10 };
const encodedPayload = await registry.encode(id, payload);
const decodedPayload = await registry.decode(encodedPayload);
console.log({ encodedPayload, decodedPayload });

console.log(await registry.getSchema(id));
const latestId = await registry.getLatestSchemaId(subject);
console.log({ latestId });

export { registry, schema, id };
