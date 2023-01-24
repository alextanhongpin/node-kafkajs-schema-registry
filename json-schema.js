import { SchemaType, SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { loadSchema } from "./schemas";

const registry = new SchemaRegistry({ host: "http://localhost:8081" });

// NOTES
// 1. Read about the compatibility rules here: https://docs.confluent.io/platform/current/schema-registry/serdes-develop/serdes-json.html#primitive-type-compatibility
// 2. As well as here: https://yokota.blog/2021/03/29/understanding-json-schema-compatibility/
// 3. There is no need to specify  "additionalProperties": true
// 4. JSON Schema compatibility rules here: https://github.com/confluentinc/schema-registry/issues/2121

async function createSchema(version = 1) {
  // NOTE: Additional properties must be set to false to be able to add optional fields later.
  const schemas = {
    1: await loadSchema("./schemas/json/person_v1.json"),
    // Add field age.
    2: await loadSchema("./schemas/json/person_v2.json"),
    // Remove field fullName.
    3: await loadSchema("./schemas/json/person_v3.json"),
  };
  if (!(version in schemas)) {
    throw new Error("unknown schema version");
  }

  return schemas[version];
}

const schema = await createSchema(3);
const subject = "Person.json";

const { id } = await registry.register(
  {
    type: SchemaType.JSON,
    schema,
  },
  {
    // For JsonSchema and Proto, the subject must be specified.
    // Otherwise it will error with message "not implemented yet".
    //subject: "https://example.com/Person.schema.json",
    subject,
  }
);

console.log("registered json schema with id", { id });

// Encode using uploaded schema.
const payload = { fullName: "John Doe", age: 10 };
const encodedPayload = await registry.encode(id, payload);
const decodedPayload = await registry.decode(encodedPayload);
console.log({ encodedPayload, decodedPayload });

const jsonSchema = await registry.getSchema(id);
console.log(jsonSchema.validate(payload));

const latestId = await registry.getLatestSchemaId(subject);
console.log({ latestId });

export { registry, schema, id };
