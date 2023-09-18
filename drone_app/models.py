from django.db import models
# from django.contrib.gis.db import models


class Flight(models.Model):
    date = models.DateField(verbose_name="飛行日")
    pilot = models.CharField(max_length=100, verbose_name="操縦者")
    summary = models.CharField(max_length=100, verbose_name="飛行概要", blank=True, null=True)
    takeoff_time = models.TimeField(verbose_name="離陸時間")
    landing_time = models.TimeField(verbose_name="着陸時間")
    # takeoff_location = models.PointField(verbose_name="離陸地点")
    # landing_location = models.PointField(verbose_name="着陸地点")
    takeoff_location = models.CharField(max_length=255, verbose_name="離陸地点")
    landing_location = models.CharField(max_length=255, verbose_name="着陸地点")
    takeoff_location_lat = models.FloatField(null=True, blank=True)
    takeoff_location_lng = models.FloatField(null=True, blank=True)
    landing_location_lat = models.FloatField(null=True, blank=True)
    landing_location_lng = models.FloatField(null=True, blank=True)

    def flight_duration(self):
        return self.landing_time - self.takeoff_time
    def flight_summary(self):
        duration = self.flight_duration()
        hours, remainder = divmod(duration.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{self.date} - 操縦者: {self.pilot} - 離陸: {self.takeoff_time.time()} - 着陸: {self.landing_time.time()} - 飛行時間: {hours}時間{minutes}分"

class FlightRecord(models.Model):
    date = models.DateField(verbose_name="飛行日")
    pilot = models.CharField(max_length=100, verbose_name="操縦者")
    summary = models.CharField(max_length=100, verbose_name="飛行概要", blank=True, null=True)
    takeoff_time = models.TimeField(verbose_name="離陸時間")
    landing_time = models.TimeField(verbose_name="着陸時間")
    # takeoff_location = models.PointField(verbose_name="離陸地点")
    # landing_location = models.PointField(verbose_name="着陸地点")
    takeoff_location = models.CharField(max_length=255, verbose_name="離陸地点")
    landing_location = models.CharField(max_length=255, verbose_name="着陸地点")
    takeoff_location_lat = models.FloatField(null=True, blank=True)
    takeoff_location_lng = models.FloatField(null=True, blank=True)
    landing_location_lat = models.FloatField(null=True, blank=True)
    landing_location_lng = models.FloatField(null=True, blank=True) 

    def flight_duration(self):
        return self.landing_time - self.takeoff_time
    def flight_summary(self):
        duration = self.flight_duration()
        hours, remainder = divmod(duration.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{self.date} - 操縦者: {self.pilot} - 離陸: {self.takeoff_time.time()} - 着陸: {self.landing_time.time()} - 飛行時間: {hours}時間{minutes}分"

class Maintenance(models.Model):
    coordinate_data = models.CharField(max_length=255, verbose_name="座標データ")
    flight_date = models.DateField(verbose_name="飛行日")
    pilot_data = models.CharField(max_length=100, verbose_name="操縦者")
    
    def __str__(self):
        return f"{self.flight_date} - {self.pilot_data}"