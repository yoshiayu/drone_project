from django.contrib import admin
from django.urls import path
from drone_app import views as your_app_views
from drone_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', your_app_views.home, name='home'),
    path('save_record/', your_app_views.save_record, name='save_record'),
    path('export_flights_csv/', your_app_views.export_flights_csv, name='export_flights_csv'),
    path('export_data_to_excel/', views.export_data_to_excel, name='export_data_to_excel'),
]

