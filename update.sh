#!/bin/bash
git stash
git pull
docker-compose up -d --build --remove-orphans
docker logs -f shroomlife.de.local
