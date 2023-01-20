up:
	@docker-compose up -d


down:
	@docker-compose down


schema:
	@curl localhost:8081/schemas | jq
