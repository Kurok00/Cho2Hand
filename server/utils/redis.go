package utils

import (
    "context"
    "encoding/json"
    "log"
    "time"
    "github.com/go-redis/redis/v8"
	"fmt"
)

var (
    redisClient *redis.Client
    ctx = context.Background()
)

type ImageCache struct {
    URL      string    `json:"url"`
    Hash     string    `json:"hash"`
    CreateAt time.Time `json:"create_at"`
}

const IMAGE_CACHE_DURATION = 168 * time.Hour // 7 days

func CheckRedisConnection() bool {
    if redisClient == nil {
        log.Println("Redis client chưa được khởi tạo")
        return false
    }

    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()

    _, err := redisClient.Ping(ctx).Result()
    if err != nil {
        log.Printf("Redis không phản hồi: %v", err)
        return false
    }

    return true
}

func InitRedis() error {
    log.Println("Đang khởi tạo kết nối Redis...")

    // Thử kết nối nhiều lần nếu thất bại
    maxRetries := 3
    for i := 0; i < maxRetries; i++ {
        // Kiểm tra kết nối hiện tại
        if (redisClient != nil) {
            log.Println("Redis client đã tồn tại, kiểm tra kết nối...")
            if CheckRedisConnection() {
                return nil
            }
            redisClient.Close()
            redisClient = nil
        }

        // Tạo kết nối mới
        redisClient = redis.NewClient(&redis.Options{
            Addr:        "localhost:6379",
            Password:    "",             // Không có mật khẩu
            DB:          0,              // Sử dụng database 0
            DialTimeout: 5 * time.Second,
            OnConnect: func(ctx context.Context, cn *redis.Conn) error {
                log.Println("Đang thử kết nối Redis...")
                return nil
            },
        })

        // Kiểm tra kết nối
        if CheckRedisConnection() {
            log.Println("Kết nối Redis thành công")
            return nil
        }

        log.Printf("Lần thử kết nối thứ %d thất bại, đợi 1 giây...", i+1)
        time.Sleep(time.Second)
    }

    return fmt.Errorf("không thể kết nối đến Redis server sau %d lần thử", maxRetries)
}

// SetImageCache lưu URL hình ảnh vào Redis cache
func SetImageCache(hash string, url string) error {
    imageCache := ImageCache{
        URL:      url,
        Hash:     hash,
        CreateAt: time.Now(),
    }
    
    data, err := json.Marshal(imageCache)
    if err != nil {
        return err
    }

    return redisClient.Set(ctx, "img:"+hash, data, IMAGE_CACHE_DURATION).Err()
}

// GetImageCache lấy URL hình ảnh từ Redis cache
func GetImageCache(hash string) (string, error) {
    data, err := redisClient.Get(ctx, "img:"+hash).Result()
    if err != nil {
        return "", err 
    }

    var imageCache ImageCache
    if err := json.Unmarshal([]byte(data), &imageCache); err != nil {
        return "", err
    }

    return imageCache.URL, nil
}

// DeleteImageCache xóa cache của một hình ảnh
func DeleteImageCache(hash string) error {
    return redisClient.Del(ctx, "img:"+hash).Err()
}