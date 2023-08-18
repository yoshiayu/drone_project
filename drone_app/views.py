# from django.utils import timezone
# from datetime import datetime
# from django.shortcuts import get_object_or_404, render, redirect
# from .models import Flight
# from .forms import FlightForm
# import csv
# from django.http import JsonResponse, HttpResponse
# from django.views.decorators.csrf import csrf_exempt
# from django.utils import timezone
# import json

# def parse_time(date_obj, time_str):
#     if not time_str:  # Check for empty string
#         return None

#     try:
#         time_obj = datetime.strptime(time_str, '%H:%M:%S').time()
#         return timezone.make_aware(datetime.combine(date_obj, time_obj))
#     except ValueError:
#         return None
# @csrf_exempt    
# def save_record(request):
#     data = {}  # <-- ここでdata変数を初期化
#     print("Request data:", data.get('data'))
    
#     # POSTリクエストであることを確認
#     if request.method != 'POST':
#         return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)
    
#     # JSONのデコードを試みる
#     try:
#         data = json.loads(request.body)  # <-- ここでdata変数に値を代入
#     except json.JSONDecodeError:
#         return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    
#     # 必要なフィールドがすべて存在することを確認
#     for field in ['date', 'pilot', 'takeoff_time', 'landing_time', 'takeoff_location', 'landing_location']:
#         if not data.get(field):
#             return JsonResponse({'success': False, 'error': f'{field} is required'}, status=400)
    
#     # 日付のパース
#     try:
#         date = datetime.strptime(data['date'], '%Y-%m-%d').date()
#     except ValueError as ve:
#         print("Value Error saving flight:", ve)
#         return JsonResponse({'success': False, 'error': 'Failed to save flight due to value error'}, status=500)


#     # 時間のパース
#     takeoff_time = parse_time(date, data.get('takeoff_time'))
#     landing_time = parse_time(date, data.get('landing_time'))

#     if takeoff_time is None or landing_time is None:
#         return JsonResponse({'success': False, 'error': 'Invalid time format'}, status=400)
    
#     # ここでFlightオブジェクトを保存を試みる
#     try:
#         flight = Flight(
#             date=date,
#             pilot=data['pilot'],
#             takeoff_time=takeoff_time,
#             landing_time=landing_time,
#             takeoff_location_lat=data['takeoff_location']['lat'],
#             takeoff_location_lng=data['takeoff_location']['lng'],
#             landing_location_lat=data['landing_location']['lat'],
#             landing_location_lng=data['landing_location']['lng'],
#         )
#         flight.save()
#         return JsonResponse({'success': True})

#     except Exception as e:
#         # ここで予期しないエラーをキャッチし、それをログに記録
#         print("Error saving flight:", e)
#         return JsonResponse({'success': False, 'error': 'Failed to save flight'}, status=500)

# def home(request):
#     return render(request, 'new_flight.html')

# def flight_detail(request, flight_id):
#     flight = get_object_or_404(Flight, pk=flight_id)
#     return render(request, 'flight_detail.html', {'flight': flight})
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
# @csrf_exempt
# def save_record(request):
#     if request.method != 'POST':
#         return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)
    
#     try:
#         data = json.loads(request.body)
#         print("Request data:", data)  # <-- 修正: ここで印刷
#     except json.JSONDecodeError:
#         return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    
#     for field in ['date', 'pilot', 'takeoff_time', 'landing_time', 'takeoff_location', 'landing_location']:
#         if not data.get(field):
#             return JsonResponse({'success': False, 'error': f'{field} is required'}, status=400)
    
#     try:
#         date = datetime.strptime(data['date'], '%Y-%m-%d').date()
#     except ValueError as ve:
#         print("Value Error saving flight:", ve)
#         return JsonResponse({'success': False, 'error': 'Failed to save flight due to value error'}, status=500)

#     takeoff_time = parse_time(date, data.get('takeoff_time'))
#     landing_time = parse_time(date, data.get('landing_time'))

#     if takeoff_time is None or landing_time is None:
#         return JsonResponse({'success': False, 'error': 'Invalid time format'}, status=400)

#     try:
#         flight = Flight(
#             date=date,
#             pilot=data['pilot'],
#             takeoff_time=takeoff_time,
#             landing_time=landing_time,
#             takeoff_location_lat=data['takeoff_location']['lat'],
#             takeoff_location_lng=data['takeoff_location']['lng'],
#             landing_location_lat=data['landing_location']['lat'],
#             landing_location_lng=data['landing_location']['lng'],
#         )
#         flight.save()
#         return JsonResponse({'success': True})

#     except Exception as e:
#         print("Error saving flight:", e)
#         return JsonResponse({'success': False, 'error': 'Failed to save flight'}, status=500)

def home(request):
    return render(request, 'new_flight.html')

def flight_detail(request, flight_id):
    flight = get_object_or_404(Flight, pk=flight_id)
    return render(request, 'flight_detail.html', {'flight': flight})

def new_flight(request):
    if request.method == 'POST':
        form = FlightForm(request.POST)
        if form.is_valid():
            flight = form.save()
            flight.takeoff_time = timezone.now()
            flight.save()
            return redirect('flight_detail', flight_id=flight.id)
        else:
            # form = FlightForm()
            return render(request, 'new_flight.html', {'form': form})

def export_flights_csv(request):
    print("export_flights_csv view is triggered")
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="flights.csv"'
    response.write('\ufeff')

    writer = csv.writer(response)
    writer.writerow(['飛行日', '操縦者', '離陸時間', '着陸時間', '離陸地点', '着陸地点'])

    for flight in Flight.objects.all():
        writer.writerow([flight.date, flight.pilot, flight.takeoff_time, flight.landing_time, flight.takeoff_location, flight.landing_location])

    return response