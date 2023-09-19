from django.utils import timezone
from datetime import datetime
from django.shortcuts import get_object_or_404, render, redirect
from .models import Flight, FlightRecord, Maintenance
from .forms import FlightForm
import csv
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pandas as pd
import xml.etree.ElementTree as ET
import openpyxl
from wsgiref.util import FileWrapper
import os
from django.conf import settings
from django.http import FileResponse
import logging
from django.contrib import messages

logger = logging.getLogger(__name__)

def maintenance_view(request):
    # new_flightの最新のデータを取得
    last_flight = Flight.objects.latest('created_at')  # created_atは作成日時を保持するフィールドとして仮定
    context = {
        'coordinate_data': last_flight.coordinate_data,  # coordinate_dataはFlightモデルのフィールドとして仮定
        # 他のコンテキストデータもこちらに...
    }
    return render(request, 'path_to_your_template.html', context)

# def maintenance_record(request):
#     try:
#         last_flight = Flight.objects.latest('date')
#         takeoff_location = f"{last_flight.takeoff_location_lat}, {last_flight.takeoff_location_lng}"
#     except Flight.DoesNotExist:
#         takeoff_location = "No flight data available"

#     context = {
#         'takeoff_location': takeoff_location,
#     }
#     return render(request, 'Maintenance_record.html', context)

def maintenance_record(request):
    try:
        last_flight = Flight.objects.latest('date')
        if last_flight:
            takeoff_location = f"{last_flight.takeoff_location_lat}, {last_flight.takeoff_location_lng}"
        else:
            takeoff_location = "No flight data"
    except Flight.DoesNotExist:
        takeoff_location = "No flight data available"

    context = {
        'takeoff_location': takeoff_location,
        # 他のコンテキストデータもこちらに...
    }
    return render(request, 'Maintenance_record.html', context)

def im_record(request):
    return render(request, 'I&M_record.html')

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
        print(data)
        try:
            takeoff_location_str = "未知"  # または適切なデフォルト値を設定
            landing_location_str = "未知"  # または適切なデフォルト値を設定

            if data.get('takeoff_location'):
                takeoff_location_str = f"{data['takeoff_location']['x']}, {data['takeoff_location']['y']}"
                
            if data.get('landing_location'):
                landing_location_str = f"{data['landing_location']['x']}, {data['landing_location']['y']}"

        # try:
        #     takeoff_location_str = None
        #     landing_location_str = None

        #     if data.get('takeoff_location'):
        #         takeoff_location_str = f"{data['takeoff_location']['x']}, {data['takeoff_location']['y']}"
                
        #     if data.get('landing_location'):
        #         landing_location_str = f"{data['landing_location']['x']}, {data['landing_location']['y']}"

            record = FlightRecord(
                date=data['date'],
                pilot=data['pilot'],
                takeoff_time=data['takeoff_time'],
                landing_time=data['landing_time'],
                summary=data['summary'],
                takeoff_location=takeoff_location_str,
                landing_location=landing_location_str,
            )
            record.save()
            return JsonResponse({'success': True})
        except Exception as e:
            print("Error while saving record:", e)
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

# @csrf_exempt
# def save_record(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         print(data)

#         try:
#             # 座標情報を文字列として保存
#             takeoff_location_str = f"{data['takeoff_location']['x']}, {data['takeoff_location']['y']}"
#             landing_location_str = f"{data['landing_location']['x']}, {data['landing_location']['y']}"

#             record = FlightRecord(
#                 date=data['date'],
#                 pilot=data['pilot'],
#                 takeoff_time=data['takeoff_time'],
#                 landing_time=data['landing_time'],
#                 summary=data['summary'],
#                 takeoff_location=takeoff_location_str,
#                 landing_location=landing_location_str,
#             )
#             record.save()
#             return JsonResponse({'success': True})
#         except Exception as e:
#             print("Error while saving record:", e)
#             return JsonResponse({'success': False, 'error': str(e)})

#     return JsonResponse({'success': False, 'error': 'Invalid request'})

def export_data_to_excel(request):
    absolute_path = '/Users/yoshiayu/drone_project/static/飛行日誌.xlsx'
    # file_path = '飛行日誌.xlsx'
    try:
        data = pd.read_excel(absolute_path, engine='openpyxl')

        # data = pd.read_excel(file_path)
        
        # 一時的なファイル名を設定
        temp_file_path = 'temp_飛行日誌.xlsx'
        data.to_excel(temp_file_path, index=False, engine='openpyxl')

        # data.to_excel(file_path, index=False)
        wrapper = FileWrapper(open(temp_file_path, 'rb'))
        response = HttpResponse(wrapper, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename={os.path.basename(absolute_path)}'
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
            return render(request, 'new_flight.html', {'form': form, 'errors': form.errors})
    else:
        form = FlightForm()
        return render(request, 'new_flight.html', {'form': form})

# def new_flight(request):
#     if request.method == 'POST':
#         form = FlightForm(request.POST)
#         if form.is_valid():
#             flight = form.save()
#             flight.takeoff_time = timezone.now()
#             flight.save()
#             return redirect('flight_detail', flight_id=flight.id)
#         else:
#             messages.error(request, "データの保存に失敗しました。入力内容を再度確認してください。")
#             return render(request, 'new_flight.html', {'form': form})
#     else:
#         form = FlightForm()
#         return render(request, 'new_flight.html', {'form': form})

def import_data_from_excel(request):
    file_path = '飛行日誌.xlsx'
    data = pd.read_excel(file_path, engine='openpyxl')

    # ... 何らかのデータ操作 ...
    # データ操作が完了したら保存
    data.to_excel(file_path, index=False, engine='openpyxl')

    return JsonResponse({'success': True})

logger = logging.getLogger(__name__)

def get_excel_file(request):
    file_path = os.path.join(settings.STATICFILES_DIRS[0], '飛行日誌.xlsx')
    
    logger.error(f"Trying to access file at: {file_path}")
    
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'))
        return response
    else:
        # ファイルが存在しない場合の処理
        return JsonResponse({"success": False, "error": "File not found"})

# def new_flight(request):
#     if request.method == 'POST':
#         form = FlightForm(request.POST)
#         if form.is_valid():
#             flight = form.save()
#             flight.takeoff_time = timezone.now()
#             flight.save()
#             return redirect('flight_detail', flight_id=flight.id)
#         else:
#             return render(request, 'new_flight.html', {'form': form, 'errors': form.errors})
#     else:
#         form = FlightForm()
#         return render(request, 'new_flight.html', {'form': form})
