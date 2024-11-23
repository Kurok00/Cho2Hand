FROM golang:1.23.3-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main .

# Verify the main executable is built
RUN ls -la /app

FROM alpine:3.18.3

WORKDIR /app

# Install tzdata for time zone support
RUN apk add --no-cache tzdata

COPY --from=builder /app/main .

# Verify the main executable and .env file are copied
RUN ls -la /app

EXPOSE 5000

CMD ["/app/main"]
