# Incident Simulation — MusicHub

## Incident 1: Song Service Crash

### 1. Simulate the incident
```bash
# Stop the song service to simulate a crash
docker stop musichub-songs
```

### 2. Observe the impact
- Open http://localhost/pages/index.html — songs page shows error
- Open http://localhost:9090 — song-service target shows DOWN
- Grafana dashboard shows Song Service stat turning red

### 3. Automatic recovery
Because docker-compose.yml has `restart: unless-stopped`, Docker automatically restarts the container within seconds.

### 4. Verify recovery
```bash
docker ps | grep musichub-songs
docker logs musichub-songs --tail 10
```

---

## Incident 2: MongoDB Outage

### 1. Simulate the incident
```bash
docker stop musichub-mongo
```

### 2. Observe the impact
- All 4 services lose database connection
- API calls return 500 errors
- All service targets in Prometheus may show degraded state

### 3. Manual recovery
```bash
docker start musichub-mongo
# Services auto-reconnect due to mongoose reconnect logic
```

---

## Incident 3: High Load (use load test)

### 1. Run the load test
```bash
node load-test.js
```

### 2. Observe in Grafana
- HTTP requests per second spike
- CPU and memory graphs climb
- If thresholds exceeded, alerts fire in Prometheus

### 3. Recovery
Load test ends naturally; metrics return to baseline within 1-2 minutes.

---

## Postmortem Template

| Field | Details |
|-------|---------|
| Incident | Song Service Crash |
| Duration | ~30 seconds (auto-recovered) |
| Impact | Songs page unavailable for all users |
| Root Cause | Container stopped (simulated OOM/crash) |
| Detection | Prometheus `up == 0` alert fired |
| Resolution | Docker restart policy recovered the service automatically |
| Prevention | Health checks + restart policies already in place |