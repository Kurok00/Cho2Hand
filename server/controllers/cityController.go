package controllers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/mongo"
    "cho2hand/models"
)

type CityController struct {
    cityService *models.CityService
}

func NewCityController(db *mongo.Database) *CityController {
    return &CityController{
        cityService: models.NewCityService(db),
    }
}

func (cc *CityController) GetCities(c *gin.Context) {
    cities, err := cc.cityService.GetCities()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "status": "success",
        "data": cities,
    })
}