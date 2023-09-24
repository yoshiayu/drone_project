from django.contrib import admin
from .models import Flight, FlightRecord, MaintenanceRecord

@admin.register(Flight)
class FlightAdmin(admin.ModelAdmin):
    list_display = ['date', 'pilot', 'takeoff_time', 'landing_time',
        'takeoff_location', 'landing_location',
        'takeoff_location_lat', 'takeoff_location_lng',
        'landing_location_lat', 'landing_location_lng'
    ]

@admin.register(FlightRecord)
class FlightAdmin(admin.ModelAdmin):
    list_display = ['date', 'pilot', 'takeoff_time', 'landing_time',
        'takeoff_location', 'landing_location',
        'takeoff_location_lat', 'takeoff_location_lng',
        'landing_location_lat', 'landing_location_lng'
    ]

@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ['inspection_item', 'inspection_content', 'result', 'remarks', 'location', 'date', 'inspector']