from django.utils import timezone
from datetime import datetime
from django.shortcuts import get_object_or_404, render, redirect
from .models import Flight
from .forms import FlightForm
from .models import FlightRecord
import csv
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pandas as pd
import xml.etree.ElementTree as ET
import openpyxl
from wsgiref.util import FileWrapper
import os

def flight_summaries(request):
    flights = Flight.objects.all()
    summaries = [flight.flight_summary() for flight in flights]
    return render(request, 'flight_summaries.html', {'summaries': summaries})
def parse_time(date_obj, time_str):
    if not time_str:
        return None

    try:
        time_obj = datetime.strptime(time_str, '%H:%M:%S').time()
        return timezone.make_aware(datetime.combine(date_obj, time_obj))
    except ValueError:
        return None
@csrf_exempt
def save_record(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        try:
            record = FlightRecord(
                date=data['date'],
                pilot=data['pilot'],
                takeoff_time=data['takeoff_time'],
                landing_time=data['landing_time'],
            )
            record.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})
def export_data_to_excel(request):
    file_path = '飛行日誌.xlsx'
    try:
        data = pd.read_excel(file_path)
        # ... 何らかのデータ操作 ...
        # 一時的なファイル名を設定
        temp_file_path = 'temp_飛行日誌.xlsx'
        data.to_excel(temp_file_path, index=False)
        # data.to_excel(file_path, index=False)
        # 
        wrapper = FileWrapper(open(temp_file_path, 'rb'))
        response = HttpResponse(wrapper, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename={os.path.basename(file_path)}'
        os.remove(temp_file_path)  # 一時ファイルを削除

        return response
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    
def home(request):
    return render(request, 'new_flight.html')

def flight_detail(request, flight_id):
    flight = get_object_or_404(Flight, pk=flight_id)
    return render(request, 'flight_detail.html', {'flight': flight})

def export_flights_csv(request):
    print("export_flights_csv view is triggered")
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="flights.csv"'
    response.write('\ufeff')

    writer = csv.writer(response)
    writer.writerow(['飛行日', '操縦者', '飛行概要', '離陸時間', '着陸時間', '総飛行時間', '離陸座標', '着陸座標'])

    for flight in Flight.objects.all():
        writer.writerow([flight.date, flight.pilot, flight.takeoff_time, flight.landing_time, flight.takeoff_location, flight.landing_location])

    return response

def new_flight(request):
    if request.method == 'POST':
        form = FlightForm(request.POST)
        if form.is_valid():
            flight = form.save()
            flight.takeoff_time = timezone.now()
            flight.save()
            return redirect('flight_detail', flight_id=flight.id)
        else:
            return render(request, 'new_flight.html', {'form': form})
    else:
        form = FlightForm()
        return render(request, 'new_flight.html', {'form': form})
    
def import_data_from_excel(request):
    file_path = '飛行日誌.xlsx'
    data = pd.read_excel(file_path)
    # ... 何らかのデータ操作 ...
    # データ操作が完了したら保存
    data.to_excel(file_path, index=False)
    return JsonResponse({'success': True})
