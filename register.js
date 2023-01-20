import { schema, id, registry } from "./schema.js";

async function main() {
  // Encode using uploaded schema.
  const payload = { fullName: "John Doe" };
  const encodedPayload = await registry.encode(id, payload);
  const decodedPayload = await registry.decode(encodedPayload);
  console.log({ encodedPayload, decodedPayload });

  console.log(await registry.getSchema(id));
  console.log(await registry.getLatestSchemaId("examples.RandomTest"));
}

main().catch(console.error);
