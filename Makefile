# Makefile - commandes pour Docker Compose

NAME=ft_transcendence

up:
	docker-compose up --build

down:
	docker-compose down

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