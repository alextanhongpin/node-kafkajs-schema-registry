import fsp from "node:fs/promises";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";

export async function run({ registry, provider, data, type, subject }) {
  //const registry = createRegistry(provider);
  const schema = await loadSchema(data);

  const { id } = await registry.register(
    {
      type: getType(type),
      schema,
    },
    {
      compatibility: "BACKWARD", // Default
      ...(subject && { subject }),
    }
  );

  console.log(`registered ${type} schema with id ${id}`);

  // Encode using uploaded schema.
  const payload = { fullName: "John Doe", age: 10 };
  const encodedPayload = await registry.encode(id, payload);
  const decodedPayload = await registry.decode(encodedPayload);
  console.log({
    id,
    provider,
    type,
    schema,
    encodedPayload: encodedPayload.toString("base64"),
    decodedPayload,
  });
}

if (process.argv.slice(2)) {
  const { provider, data, type, subject } = parseArgs();
  const registry = createRegistry(provider);
  run({ registry, provider, data, type, subject }).catch(console.error);
}

export function createRegistry(provider) {
  return new SchemaRegistry({ host: getHost(provider) });
}

export async function loadSchema(path) {
  const content = await fsp.readFile(path, "utf-8");
  return content;
}

function getType(type) {
  const types = {
    avro: SchemaType.AVRO,
    proto: SchemaType.PROTOBUF,
    json: SchemaType.JSON,
  };

  if (!(type in types)) {
    throw new Error(
      `unknown type: ${type}. Only ${allowedFlags.type.join(", ")} is supported`
    );
  }

  return types[type];
}

function getHost(provider) {
  const providers = {
    apicurio: "http://localhost:8080/apis/ccompat/v7",
    confluent: "http://localhost:8081",
  };
  if (!provider in providers) {
    throw new Error(`unknown provider: ${provider}`);
  }

  return providers[provider];
}

function parseArgs() {
  const allowedFlags = {
    // Schema Registry provider.
    provider: ["apicurio", "confluent"],
    type: ["avro", "proto", "json"],
  };

  const args = process.argv.slice(2);

  const flags = args.reduce(
    (flags, flag) => {
      const [key, value] = flag.split("=");
      if (key === "data" || key === "subject") {
        flags[key] = value;
        return flags;
      }

      const values = allowedFlags[key];
      if (!values) {
        throw new Error(
          `unknown flag: ${key}. Try node schema-cli provider=apicurio type=avro path=data.avro`
        );
      }

      if (!values.includes(value)) {
        throw new Error(`value for ${key} must be one of ${values.join(", ")}`);
      }

      flags[key] = value;
      return flags;
    },
    {
      provider: "confluent",
      type: "avro",
    }
  );

  if (flags.type !== "avro" && !flags.subject) {
    throw new Error("subject is required");
  }

  return flags;
}
