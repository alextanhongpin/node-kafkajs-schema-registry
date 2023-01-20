import { Kafka } from "kafkajs";
import { registry, id, schema } from "./schema.js";

const kafka = new Kafka({ clientId: "my-app", brokers: ["localhost:9093"] });
const consumer = kafka.consumer({ groupId: "test-group" });
const producer = kafka.producer();

const TOPIC = "test-topic";

const run = async () => {
  await producer.connect();

  // Payload must adhere to AVRO schema.
  const payload = { fullName: "John Doe", age: 13 };
  await producer.send({
    topic: TOPIC,
    messages: [
      {
        // Key is not encoded, but could be encoded too.
        key: "test-key",
        // Encode the value. We need the id of the schema for encoding.
        value: await registry.encode(id, payload),
      },
    ],
  });

  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const decodedKey = message.key.toString();
      const decodedValue = await registry.decode(message.value);
      console.log({ topic, partition, message });
      console.log({ decodedKey, decodedValue });
    },
  });
};

run().catch(console.error);
