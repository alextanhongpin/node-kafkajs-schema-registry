import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";
const registry = new SchemaRegistry({ host: "http://localhost:8081" });

// This is idempotent, no matter how many times we re-run this, it will only
// register once.
function createSchema(version = 1) {
  // It is important to set the default, so that the fields can be added or
  // removed without breaking compatibility.
  const schema1 = `syntax = "proto3";
package auth;

message Person {
  string full_name = 1;
}`;

  // Add new field age.
  const schema2 = `syntax = "proto3";
package auth;

message Person {
  string full_name = 1;
  int32 age = 2;
}`;

  // Deletes the field fullName
  const schema3 = `syntax = "proto3";
package auth;

message Person {
  int32 age = 2;
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

const schema = createSchema(3);

const { id } = await registry.register(
  {
    type: SchemaType.PROTOBUF,
    schema,
  },
  {
    compatibility: "BACKWARD", // Default
    subject: "auth.Person.proto",
  }
);

console.log("registered proto schema with id", { id });

// Encode using uploaded schema.
const payload = { fullName: "John Doe", age: 10 };
const encodedPayload = await registry.encode(id, payload);
const decodedPayload = await registry.decode(encodedPayload);
console.log({ encodedPayload, decodedPayload });

console.log(await registry.getSchema(id));
const latestId = await registry.getLatestSchemaId("auth.Person.proto");
console.log({ latestId });

export { registry, schema, id };
