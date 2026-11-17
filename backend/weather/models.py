from django.db import models


class WeatherCache(models.Model):
    city = models.CharField(max_length=120, db_index=True)
    data = models.JSONField(default=dict)
    fetched_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Weather caches"

    def __str__(self):
        return self.city
