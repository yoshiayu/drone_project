from django.db import models

class Flight(models.Model):
    date = models.DateField(verbose_name="飛行日")
    pilot = models.CharField(max_length=100, verbose_name="操縦者")
    takeoff_time = models.DateTimeField(auto_now_add=True, verbose_name="着陸時間")
    landing_time = models.DateField(auto_now=True, verbose_name="離陸時間")
    takeoff_location = models.CharField(max_length=255, verbose_name="着陸地点")
    landing_location = models.CharField(max_length=255, verbose_name="離陸地点")

    def flight_duration(self):
        return self.landing_time - self.takeoff_time
