import fs from "fs";
import { SchemaRegistry, SchemaType } from "@kafkajs/confluent-schema-registry";

async function main() {
  const { provider, data, type, subject } = parseArgs();
  console.log(
    `Using ${provider} Schema Registry for serializing/deserializing ${type}`
  );

  const registry = createRegistry(provider);
  const schema = loadSchema(data);
  console.log("loaded");
  console.log(schema);

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
  console.log({ encodedPayload, decodedPayload });
}

main().catch(console.error);

function createRegistry(provider) {
  return new SchemaRegistry({ host: getHost(provider) });
}

function loadSchema(path) {
  const content = fs.readFileSync(path, "utf-8");
  return content;
}

function getType(type) {
  switch (type) {
    case "avro":
      return SchemaType.AVRO;
    case "proto":
      return SchemaType.PROTOBUF;
    case "json":
      return SchemaType.JSON;
    default:
      throw new Error(
        `unknown type: ${type}. Only ${allowedFlags.type.join(
          ", "
        )} is supported`
      );
  }
}

function getHost(provider) {
  switch (provider) {
    case "apicurio":
      return "http://localhost:8080/apis/ccompat/v7";
    case "confluent":
      return "http://localhost:8081";
    default:
      throw new Error(`unknown provider: ${provider}`);
  }
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
