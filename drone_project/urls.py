from django.contrib import admin
from django.urls import path, include
from drone_app import views as drone_app_views
from drone_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', drone_app_views.home, name='home'),
    path('', include('drone_app.urls')),
    path('save_record/', drone_app_views.save_record, name='save_record'),
    path('export_flights_csv/', drone_app_views.export_flights_csv, name='export_flights_csv'),
    path('export_data_to_excel/', views.export_data_to_excel, name='export_data_to_excel'),
    path('save_maintenance_record/', views.save_maintenance_record, name='save_maintenance_record'),
]

