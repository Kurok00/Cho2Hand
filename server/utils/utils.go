package utils

import (
    "crypto/sha256"
    "encoding/hex"
    "mime/multipart"
    "io"
    "time"
)

func GetCurrentTimestamp() int64 {
    return time.Now().Unix()
}

// GenerateFileHash generates a SHA-256 hash for a given file
func GenerateFileHash(fileHeader *multipart.FileHeader) (string, error) {
    file, err := fileHeader.Open()
    if (err != nil) {
        return "", err
    }
    defer file.Close()

    hasher := sha256.New()
    if _, err := io.Copy(hasher, file); err != nil {
        return "", err
    }

    return hex.EncodeToString(hasher.Sum(nil)), nil
}