from django import forms
from .models import Flight, FlightRecord

class FlightForm(forms.ModelForm):
    class Meta:
        model = Flight
        fields = ['date', 'pilot', 'takeoff_time', 'landing_time', 'takeoff_location',
            'landing_location', 'takeoff_location_lat', 'takeoff_location_lng',
            'landing_location_lat', 'landing_location_lng'
        ]

class FlightForm(forms.ModelForm):
    class Meta:
        model = FlightRecord
        fields = ['date', 'pilot', 'takeoff_time', 'landing_time', 'takeoff_location',
            'landing_location', 'takeoff_location_lat', 'takeoff_location_lng',
            'landing_location_lat', 'landing_location_lng'
        ]