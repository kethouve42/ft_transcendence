# Makefile - commandes pour Docker Compose

NAME=ft_transcendence

up:
	docker-compose up --build -d
	@echo "Containers are up and running"


down:
	docker-compose down

restart:
	docker-compose restart frontend
	@echo "frontend are restarted"
re: down up

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

exec-backend:
	docker exec -it $$(docker ps -qf "name=backend") sh

ps:
	docker-compose ps