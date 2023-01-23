up:
	@docker-compose up -d


down:
	@docker-compose down


schema:
	@curl localhost:8081/schemas | jq

apicurio:
	node schemas provider=apicurio type=avro data=schemas/avro/person_v1.avsc
	node schemas provider=apicurio type=avro data=schemas/avro/person_v2.avsc
	node schemas provider=apicurio type=avro data=schemas/avro/person_v3.avsc
	node schemas provider=apicurio type=json data=schemas/json/person_v1.json subject=Person.json
	node schemas provider=apicurio type=json data=schemas/json/person_v2.json subject=Person.json
	node schemas provider=apicurio type=json data=schemas/json/person_v3.json subject=Person.json
	node schemas provider=apicurio type=proto data=schemas/proto/person_v1.proto subject=Person.proto
	node schemas provider=apicurio type=proto data=schemas/proto/person_v2.proto subject=Person.proto
	node schemas provider=apicurio type=proto data=schemas/proto/person_v3.proto subject=Person.proto

confluent:
	node schemas provider=confluent type=avro data=schemas/avro/person_v1.avsc
	node schemas provider=confluent type=avro data=schemas/avro/person_v2.avsc
	node schemas provider=confluent type=avro data=schemas/avro/person_v3.avsc
	node schemas provider=confluent type=json data=schemas/json/person_v1.json subject=Person.json
	node schemas provider=confluent type=json data=schemas/json/person_v2.json subject=Person.json
	node schemas provider=confluent type=json data=schemas/json/person_v3.json subject=Person.json
	node schemas provider=confluent type=proto data=schemas/proto/person_v1.proto subject=Person.proto
	node schemas provider=confluent type=proto data=schemas/proto/person_v2.proto subject=Person.proto
	node schemas provider=confluent type=proto data=schemas/proto/person_v3.proto subject=Person.proto
