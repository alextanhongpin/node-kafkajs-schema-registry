import { schema, id, registry } from "./schema.js";

async function main() {
  // Encode using uploaded schema.
  const payload = { fullName: "John Doe", age: 10 };
  const encodedPayload = await registry.encode(id, payload);
  const decodedPayload = await registry.decode(encodedPayload);
  console.log({ encodedPayload, decodedPayload });

  console.log(await registry.getSchema(id));
  const latestId = await registry.getLatestSchemaId("examples.RandomTest");
  console.log({ latestId });
}

main().catch(console.error);
