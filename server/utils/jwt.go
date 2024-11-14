package utils

import (
    "time"
    "github.com/golang-jwt/jwt"
)

var jwtSecret = []byte("your-secret-key") // Change this to a secure key

func GenerateToken(userId string) (string, error) {
    claims := jwt.MapClaims{
        "userId": userId,
        "exp":    time.Now().Add(time.Hour * 24).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(jwtSecret)
}

func ValidateToken(tokenString string) (string, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })

    if err != nil {
        return "", err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        userId := claims["userId"].(string)
        return userId, nil
    }

    return "", jwt.ErrInvalidToken
}