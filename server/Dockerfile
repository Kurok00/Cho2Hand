FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main .

# Verify the main executable is built
RUN ls -la /app

FROM alpine:3.18

WORKDIR /app
COPY --from=builder /app/main .
COPY .env .

# Verify the main executable is copied
RUN ls -la /app

EXPOSE 5000

CMD ["/app/main"]