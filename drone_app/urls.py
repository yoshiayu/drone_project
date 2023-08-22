from django.urls import path
from . import views

urlpatterns = [
    path('new_flight/', views.new_flight, name='new_flight'),
    path('export_flights_csv/', views.export_flights_csv, name='export_flights_csv'),
    path('flights/<int:flight_id>/', views.flight_detail, name='flight_detail'),
    path('save_record/', views.save_record, name='save_record'),
    path('export_data_to_excel/', views.export_data_to_excel, name='export_data_to_excel'),
    path('flight-summaries/', views.flight_summaries, name='flight_summaries'),
    path('export_data_to_excel/', views.export_data_to_excel, name='export_data_to_excel'),
]
