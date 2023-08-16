from django.urls import path
from . import views

urlpatterns = [
    path('new_flight/', views.new_flight, name='new_flight'),
    path('export_csv/', views.export_flights_csv, name='export_csv'),
    path('flights/<int:flight_id>/', views.flight_detail, name='flight_detail'),
    # その他のURL設定
]
